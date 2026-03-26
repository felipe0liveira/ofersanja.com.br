"use client";

import { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, RefreshCw } from "lucide-react";
import { useAdminAuth } from "../_hooks/useAdminAuth";
import { AdminHeader } from "../_components/AdminHeader";
import type { ExtractionJob } from "@/lib/types/extraction-job";

const STATUS_LABEL: Record<string, string> = {
  "checking-affiliate-link": "Verificando link",
  extracting: "Extraindo",
  success: "Concluído",
  error: "Erro",
};

const STATUS_COLOR: Record<string, string> = {
  "checking-affiliate-link": "bg-yellow-100 text-yellow-800",
  extracting: "bg-blue-100 text-blue-800",
  success: "bg-emerald-100 text-emerald-800",
  error: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const color = STATUS_COLOR[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobsPage() {
  const { user, idToken, roles, checking } = useAdminAuth();
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = roles.includes("admin");

  const fetchJobs = useCallback(
    async (setLoadingFn: (v: boolean) => void) => {
      if (!idToken) return;
      setLoadingFn(true);
      try {
        const res = await fetch("/api/admin/jobs", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setJobs(data.jobs ?? []);
      } finally {
        setLoadingFn(false);
      }
    },
    [idToken]
  );

  useEffect(() => {
    if (!idToken || !isAdmin) return;
    fetchJobs(setLoading);
  }, [idToken, isAdmin, fetchJobs]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    fetchJobs(setRefreshing);
  }, [refreshing, fetchJobs]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-400 text-sm">Verificando acesso...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-400 text-sm">Acesso restrito.</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user!} roles={roles} />

      {/* Sub-navbar */}
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <BriefcaseBusiness className="w-4 h-4 text-blue-950 shrink-0" />
            <span className="font-semibold text-gray-800 text-sm">Jobs</span>
            {!loading && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
                {jobs.length}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Atualizar listagem"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <BriefcaseBusiness className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhum job encontrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                {/* ID + slug */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-400 truncate">{job.id}</p>
                  {job.slug && (
                    <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{job.slug}</p>
                  )}
                  {job.details && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.details}</p>
                  )}
                </div>

                {/* Status + date */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-gray-400">{formatDate(job.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
