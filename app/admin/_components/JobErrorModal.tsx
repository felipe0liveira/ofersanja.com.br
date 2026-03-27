"use client";

import { useEffect, useState } from "react";
import { XCircle, X } from "lucide-react";
import type { ExtractionJob } from "@/lib/types/extraction-job";

export function JobErrorModal({
  job,
  idToken,
  onClose,
}: {
  job: ExtractionJob;
  idToken: string;
  onClose: () => void;
}) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);

  useEffect(() => {
    if (!job.screenshot) return;
    let objectUrl: string | null = null;
    setLoadingScreenshot(true);
    fetch(`/api/admin/jobs/${job.id}/screenshot`, {
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
  }, [job.id, job.screenshot, idToken]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
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
        <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto">
          {job.details && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-sm text-red-700 leading-relaxed break-words">{job.details}</p>
            </div>
          )}

          {job.screenshot && (
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
              {loadingScreenshot ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  Carregando captura de tela...
                </div>
              ) : screenshotUrl ? (
                <div className="max-h-96 overflow-y-auto">
                  <img
                    src={screenshotUrl}
                    alt="Captura de tela do erro"
                    className="w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                  Captura não disponível
                </div>
              )}
            </div>
          )}

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
