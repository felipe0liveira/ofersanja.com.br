"use client";

import { useEffect, useState } from "react";

type Stats = { totalToday: number; dispatchedToday: number };

export function useStats(idToken: string) {
  const [stats, setStats] = useState<Stats>({ totalToday: 0, dispatchedToday: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setLoading(false));
  }, [idToken]);

  return { stats, loading };
}
