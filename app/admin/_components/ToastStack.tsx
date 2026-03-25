"use client";

import { useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export type Toast = {
  id: string;
  type: "success" | "warning" | "error";
  message: string;
};

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />,
  warning: <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />,
  error: <XCircle className="w-5 h-5 shrink-0 text-red-500" />,
};

const STYLES = {
  success: "border-green-400 bg-green-50 text-green-900",
  warning: "border-amber-400 bg-amber-50 text-amber-900",
  error: "border-red-400 bg-red-50 text-red-900",
};

const AUTO_DISMISS_MS = 5000;

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
      className={`flex items-start gap-3 rounded-lg border-l-4 px-4 py-3 shadow-md min-w-64 max-w-sm animate-fade-in ${STYLES[toast.type]}`}
    >
      {ICONS[toast.type]}
      <span className="flex-1 text-sm font-medium leading-5">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
