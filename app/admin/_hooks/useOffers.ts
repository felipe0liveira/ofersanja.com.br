"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Toast } from "../_components/ToastStack";
import type { Offer } from "@/lib/types/offer";

export function useOffers(idToken: string) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<{ done: true } | null>(null);
  const [errorJobDetails, setErrorJobDetails] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showAddModalRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreCallbackRef = useRef<() => void>(() => {});
  const lastStatusRef = useRef<string | null>(null);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleJobStarted = useCallback((jobId: string) => {
    setActiveJobId(jobId);
    lastStatusRef.current = null;
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

  // Page-level polling — continues even when the modal is closed
  useEffect(() => {
    if (!activeJobId || !idToken) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/offers/extract/${activeJobId}/status`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          if (res.status === 404) {
            clearInterval(interval);
            setActiveJobId(null);
            lastStatusRef.current = null;
            localStorage.removeItem("activeJobId");
          }
          return;
        }
        const data = await res.json();
        const status: string = data.status;

        // Fire toast only on status transitions
        if (status !== lastStatusRef.current) {
          lastStatusRef.current = status;
          if (status === "extracting") {
            addToast("info", "Acessando o produto no Mercado Livre...");
          } else if (status === "converting_link") {
            addToast("info", "Gerando link de afiliado...");
          }
        }

        if (status === "success") {
          clearInterval(interval);
          setActiveJobId(null);
          lastStatusRef.current = null;
          localStorage.removeItem("activeJobId");
          fetchOffers(1, "refresh");
          setExtractionResult({ done: true });
          addToast("success", "Oferta salva com sucesso!");
        } else if (status === "error") {
          clearInterval(interval);
          setActiveJobId(null);
          lastStatusRef.current = null;
          localStorage.removeItem("activeJobId");
          setErrorJobDetails(data.details ?? "Falha ao extrair produto.");
          setExtractionResult(null);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 5_000);
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

  const clearExtractionResult = useCallback(() => {
    setExtractionResult(null);
  }, []);

  const clearErrorJobDetails = useCallback(() => {
    setErrorJobDetails(null);
  }, []);

  return {
    offers,
    loadingOffers,
    loadingMore,
    refreshing,
    activeJobId,
    extractionResult,
    clearExtractionResult,
    errorJobDetails,
    clearErrorJobDetails,
    toasts,
    sentinelRef,
    showAddModalRef,
    dismissToast,
    handleJobStarted,
    handleRefresh,
    markOfferDispatched,
  };
}
