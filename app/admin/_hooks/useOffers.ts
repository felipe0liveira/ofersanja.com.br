"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Toast } from "../_components/ToastStack";
import type { Offer } from "@/lib/types/offer";
import type { JobEvent } from "@/lib/types/job-event";

export function useOffers(idToken: string) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobEvents, setJobEvents] = useState<JobEvent[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showAddModalRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreCallbackRef = useRef<() => void>(() => {});
  const seenEventIdsRef = useRef<Set<string>>(new Set());

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleJobStarted = useCallback((jobId: string) => {
    setActiveJobId(jobId);
    setJobStatus("extracting");
    setJobEvents([]);
    seenEventIdsRef.current = new Set();
    localStorage.setItem("activeJobId", jobId);
    addToast("info", "Processo de extração iniciado");
  }, [addToast]);

  const fetchOffers = useCallback(
    async (page: number, mode: "initial" | "more" | "refresh") => {
      if (mode === "initial") setLoadingOffers(true);
      else if (mode === "more") setLoadingMore(true);
      else setRefreshing(true);
      try {
        const res = await fetch(`/api/admin/offers?page=${page}&limit=12`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const incoming: Offer[] = data.offers ?? [];
        setOffers((prev) => (mode === "more" ? [...prev, ...incoming] : incoming));
        setCurrentPage(page);
        setHasMore(data.pagination?.hasNextPage ?? false);
      } finally {
        if (mode === "initial") setLoadingOffers(false);
        else if (mode === "more") setLoadingMore(false);
        else setRefreshing(false);
      }
    },
    [idToken]
  );

  // Events polling — appends only new events, derives terminal state
  const TERMINAL_ERROR_EVENTS = new Set([
    "scrape_failed",
    "offer_save_failed",
    "short_link_resolve_failed",
  ]);

  useEffect(() => {
    if (!activeJobId || !idToken) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/jobs/${activeJobId}/events`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data: JobEvent[] = await res.json();
        const newEvents = data.filter((e) => !seenEventIdsRef.current.has(e.id));
        if (newEvents.length === 0) return;

        newEvents.forEach((e) => seenEventIdsRef.current.add(e.id));
        setJobEvents((prev) => {
          const merged = [...prev, ...newEvents];
          merged.sort((a, b) =>
            new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
          );
          return merged;
        });

        const isCompleted = newEvents.some((e) => e.type === "completed");
        const isError = newEvents.some((e) => TERMINAL_ERROR_EVENTS.has(e.type));

        if (isCompleted) {
          clearInterval(interval);
          setActiveJobId(null);
          setJobStatus("success");
          localStorage.removeItem("activeJobId");
          fetchOffers(1, "refresh");
          addToast("success", "Oferta salva com sucesso!");
        } else if (isError) {
          clearInterval(interval);
          setActiveJobId(null);
          setJobStatus("error");
          localStorage.removeItem("activeJobId");
        }
      } catch {
        // ignore
      }
    }, 1_000);
    return () => clearInterval(interval);
  }, [activeJobId, idToken, fetchOffers, addToast]);

  // Recover any in-progress extraction job from localStorage on mount
  useEffect(() => {
    if (!idToken) return;
    const savedJobId = localStorage.getItem("activeJobId");
    if (savedJobId) setActiveJobId(savedJobId);
  }, [idToken]);

  // Initial load
  useEffect(() => {
    if (!idToken) return;
    fetchOffers(1, "initial");
  }, [idToken, fetchOffers]);

  // Infinite scroll observer — set up once, reads current callback via ref
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreCallbackRef.current();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Keep loadMore callback fresh on every render without rebuilding the observer
  loadMoreCallbackRef.current = () => {
    if (hasMore && !loadingMore && !loadingOffers) fetchOffers(currentPage + 1, "more");
  };

  const handleRefresh = useCallback(() => {
    if (refreshing || loadingOffers) return;
    fetchOffers(1, "refresh");
  }, [fetchOffers, refreshing, loadingOffers]);

  const markOfferDispatched = useCallback((id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, dispatched_at: new Date().toISOString() } : o))
    );
  }, []);

  return {
    offers,
    loadingOffers,
    loadingMore,
    refreshing,
    activeJobId,
    jobStatus,
    jobEvents,
    toasts,
    sentinelRef,
    showAddModalRef,
    dismissToast,
    handleJobStarted,
    handleRefresh,
    markOfferDispatched,
  };
}

