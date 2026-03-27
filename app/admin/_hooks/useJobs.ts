"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExtractionJob } from "@/lib/types/extraction-job";

export function useJobs(idToken: string, isAdmin: boolean) {
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreCallbackRef = useRef<() => void>(() => {});

  const fetchJobs = useCallback(
    async (page: number, mode: "initial" | "more" | "refresh") => {
      if (!idToken) return;
      if (mode === "initial") setLoading(true);
      else if (mode === "more") setLoadingMore(true);
      else setRefreshing(true);
      try {
        const res = await fetch(`/api/admin/jobs?page=${page}&limit=20`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const incoming: ExtractionJob[] = data.jobs ?? [];
        setJobs((prev) => (mode === "more" ? [...prev, ...incoming] : incoming));
        setCurrentPage(page);
        setHasMore(data.pagination?.hasNextPage ?? false);
      } finally {
        if (mode === "initial") setLoading(false);
        else if (mode === "more") setLoadingMore(false);
        else setRefreshing(false);
      }
    },
    [idToken]
  );

  useEffect(() => {
    if (!idToken || !isAdmin) return;
    fetchJobs(1, "initial");
  }, [idToken, isAdmin, fetchJobs]);

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
    if (hasMore && !loadingMore && !loading) fetchJobs(currentPage + 1, "more");
  };

  const handleRefresh = useCallback(() => {
    if (refreshing || loading) return;
    fetchJobs(1, "refresh");
  }, [fetchJobs, refreshing, loading]);

  return {
    jobs,
    loading,
    loadingMore,
    refreshing,
    sentinelRef,
    handleRefresh,
  };
}
