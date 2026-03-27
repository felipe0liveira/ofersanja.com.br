"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  Link2,
  ShoppingBag,
  AlertTriangle,
  Zap,
  PackageCheck,
  PackageX,
  Globe,
  CheckCheck,
} from "lucide-react";
import type { JobEvent, JobEventType } from "@/lib/types/job-event";

export const DRAWER_WIDTH = 400;

// ── Event metadata ────────────────────────────────────────────────────────────

type EventMeta = {
  label: string;
  icon: React.ReactNode;
  color: string; // text + dot color class
};

const EVENT_META: Record<JobEventType, EventMeta> = {
  scrape_started: {
    label: "Iniciando raspagem",
    icon: <Globe className="w-3.5 h-3.5" />,
    color: "text-blue-500",
  },
  scrape_completed: {
    label: "Página capturada",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-emerald-500",
  },
  scrape_failed: {
    label: "Falha na raspagem",
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-red-500",
  },
  screenshot_saved: {
    label: "Captura de tela salva",
    icon: <Camera className="w-3.5 h-3.5" />,
    color: "text-violet-500",
  },
  validation_failed: {
    label: "Validação falhou",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-amber-500",
  },
  affiliate_link_started: {
    label: "Gerando link de afiliado",
    icon: <Link2 className="w-3.5 h-3.5" />,
    color: "text-blue-500",
  },
  affiliate_link_completed: {
    label: "Link de afiliado gerado",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-emerald-500",
  },
  offer_saved: {
    label: "Oferta salva",
    icon: <PackageCheck className="w-3.5 h-3.5" />,
    color: "text-emerald-500",
  },
  offer_save_failed: {
    label: "Falha ao salvar oferta",
    icon: <PackageX className="w-3.5 h-3.5" />,
    color: "text-red-500",
  },
  completed: {
    label: "Concluído",
    icon: <CheckCheck className="w-3.5 h-3.5" />,
    color: "text-emerald-600",
  },
  short_link_resolve_started: {
    label: "Resolvendo link encurtado",
    icon: <Link2 className="w-3.5 h-3.5" />,
    color: "text-blue-500",
  },
  short_link_resolve_completed: {
    label: "Link encurtado resolvido",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-emerald-500",
  },
  short_link_resolve_failed: {
    label: "Falha ao resolver link encurtado",
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-red-500",
  },
};

// ── Status label/color ────────────────────────────────────────────────────────

type StatusMeta = { label: string; color: string };
const STATUS_META: Record<string, StatusMeta> = {
  pending:               { label: "Aguardando",         color: "bg-gray-100 text-gray-600" },
  extracting:            { label: "Extraindo",           color: "bg-blue-100 text-blue-700" },
  "checking-affiliate-link": { label: "Verificando link", color: "bg-yellow-100 text-yellow-700" },
  converting_link:       { label: "Gerando link",        color: "bg-yellow-100 text-yellow-700" },
  success:               { label: "Concluído",           color: "bg-emerald-100 text-emerald-700" },
  error:                 { label: "Erro",                color: "bg-red-100 text-red-700" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string | null }) {
  if (!status) return null;
  const meta = STATUS_META[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  const isRunning = status !== "success" && status !== "error";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
      {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
      {meta.label}
    </span>
  );
}

function TimelineEvent({ event, isLast }: { event: JobEvent; isLast: boolean }) {
  const meta = EVENT_META[event.type] ?? {
    label: event.type,
    icon: <Zap className="w-3.5 h-3.5" />,
    color: "text-gray-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3"
    >
      {/* Left: dot + line */}
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 ${meta.color.replace("text-", "border-")} shrink-0`}>
          <span className={meta.color}>{meta.icon}</span>
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-100 mt-1" />}
      </div>
      {/* Right: content */}
      <div className={`pb-4 flex-1 min-w-0 ${isLast ? "" : ""}`}>
        <p className={`text-sm font-medium ${meta.color}`}>{meta.label}</p>
        {event.details && (
          <p className="text-xs text-gray-500 mt-0.5 break-words leading-relaxed">{event.details}</p>
        )}
        <p className="text-xs text-gray-300 mt-0.5">
          {new Date(event.occurred_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

function PendingPulse() {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 shrink-0">
          <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
        </div>
      </div>
      <div className="pb-4 flex-1">
        <div className="flex gap-1 items-center">
          <span className="text-xs text-gray-300">Aguardando próximo evento</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ExtractionDrawer({
  isOpen,
  idToken,
  activeJobId,
  jobStatus,
  jobEvents,
  onClose,
}: {
  isOpen: boolean;
  idToken: string;
  activeJobId: string | null;
  jobStatus: string | null;
  jobEvents: JobEvent[];
  onClose: () => void;
}) {
  const isDone = jobStatus === "success" || jobStatus === "error";
  const isError = jobStatus === "error";
  const isSuccess = jobStatus === "success";

  // Screenshot for error state
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Extract error details from events
  useEffect(() => {
    if (!isError) return;
    const failedEvent = [...jobEvents]
      .reverse()
      .find((e) => e.type === "scrape_failed" || e.type === "offer_save_failed" || e.type === "validation_failed");
    setErrorDetails(failedEvent?.details ?? null);
  }, [isError, jobEvents]);

  // Fetch screenshot when error + job has screenshot event
  useEffect(() => {
    if (!isError || !activeJobId) return;
    const hasScreenshot = jobEvents.some((e) => e.type === "screenshot_saved");
    if (!hasScreenshot) return;

    let objectUrl: string | null = null;
    setLoadingScreenshot(true);
    fetch(`/api/admin/jobs/${activeJobId}/screenshot`, {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setScreenshotUrl(objectUrl);
      })
      .catch(() => {})
      .finally(() => setLoadingScreenshot(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, activeJobId, idToken]);

  // Reset screenshot state when a new job starts
  useEffect(() => {
    if (activeJobId) {
      setScreenshotUrl(null);
      setErrorDetails(null);
    }
  }, [activeJobId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — darkens page content, closes on click */}
          <motion.div
            key="extraction-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 cursor-pointer"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="extraction-drawer"
            initial={{ x: DRAWER_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: DRAWER_WIDTH }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            style={{ width: DRAWER_WIDTH }}
            className="fixed top-0 right-0 h-screen z-40 bg-white border-l border-gray-100 shadow-2xl flex flex-col"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-blue-950" />
              <span className="font-bold text-gray-800 text-sm">Extração de oferta</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status row */}
          <div className="px-5 py-3 border-b border-gray-50 shrink-0">
            <StatusPill status={jobStatus} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* Timeline */}
            {jobEvents.length > 0 && (
              <div className="mb-4">
                {jobEvents.map((event, i) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    isLast={i === jobEvents.length - 1 && isDone}
                  />
                ))}
                {!isDone && <PendingPulse />}
              </div>
            )}

            {/* Empty / waiting state */}
            {jobEvents.length === 0 && !isDone && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin text-blue-200" />
                <p className="text-sm">Aguardando eventos...</p>
              </div>
            )}

            {/* ── Success result ── */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-5 flex flex-col items-center gap-2 text-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="font-semibold text-emerald-800 text-sm">Oferta salva com sucesso!</p>
                <p className="text-xs text-emerald-600">A oferta já está disponível na lista.</p>
              </motion.div>
            )}

            {/* ── Error result ── */}
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                {errorDetails && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-sm font-semibold text-red-700">Falha na extração</p>
                    </div>
                    <p className="text-xs text-red-600 leading-relaxed break-words">{errorDetails}</p>
                  </div>
                )}

                {/* Screenshot */}
                {loadingScreenshot && (
                  <div className="flex items-center justify-center h-32 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 text-xs gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando captura...
                  </div>
                )}
                {screenshotUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                    <div className="max-h-80 overflow-y-auto">
                      <img
                        src={screenshotUrl}
                        alt="Captura de tela do erro"
                        className="w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
