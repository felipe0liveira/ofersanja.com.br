"use client";

import { XCircle, X } from "lucide-react";

export function ExtractionErrorModal({
  details,
  onClose,
}: {
  details: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-gray-800 text-base">Falha na extração</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700 leading-relaxed break-words">{details}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
