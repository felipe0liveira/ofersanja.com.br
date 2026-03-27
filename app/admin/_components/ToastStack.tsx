"use client";

import { useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export type Toast = {
  id: string;
  type: "success" | "warning" | "error" | "info";
  message: string;
};

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
  error: <XCircle className="w-4 h-4 shrink-0" />,
  info: <Info className="w-4 h-4 shrink-0" />,
};

const STYLES = {
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-900 text-white",
};

const AUTO_DISMISS_MS = 4000;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 shadow-lg text-sm font-medium animate-fade-in ${STYLES[toast.type]}`}
    >
      {ICONS[toast.type]}
      <span>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fechar notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
