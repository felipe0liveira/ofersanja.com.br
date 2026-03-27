"use client";

import { useEffect, useRef, useState } from "react";
import { X, Link, Loader2, AlertCircle, CheckCircle } from "lucide-react";

type Step = "input" | "submitting" | "extracting" | "result" | "error";

export function AddOfferModal({
  idToken,
  onClose,
  onJobStarted,
  extractionResult,
}: {
  idToken: string;
  onClose: () => void;
  onJobStarted: (jobId: string) => void;
  extractionResult?: { done: true } | null;
}) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // React to extraction result coming from the parent (page-level polling)
  useEffect(() => {
    if (!extractionResult || step !== "extracting") return;
    setStep("result");
  }, [extractionResult, step]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setStep("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/offers/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error ?? "Erro ao iniciar extração.");
        setStep("error");
        return;
      }
      onJobStarted(data.jobId);
      setStep("extracting");
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStep("error");
    }
  }

  function handleReset() {
    setUrl("");
    setErrorMsg("");
    setStep("input");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">Adicionar oferta manualmente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">

          {/* ── Input step ── */}
          {step === "input" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">Link do produto (Mercado Livre)</span>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                  <Link className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="url"
                    autoFocus
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.mercadolivre.com.br/..."
                    className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                    required
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={!url.trim()}
                className="w-full bg-blue-950 hover:bg-blue-900 disabled:opacity-40 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                Extrair produto
              </button>
            </form>
          )}

          {/* ── Submitting step ── */}
          {step === "submitting" && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-950" />
              <p className="text-sm font-medium">Enviando...</p>
            </div>
          )}

          {/* ── Extracting step (polling runs in page) ── */}
          {step === "extracting" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-950" />
              <p className="text-sm font-medium text-gray-700">Acessando o produto...</p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center">
                <p className="text-xs text-blue-700 font-medium">Você pode fechar este modal.</p>
                <p className="text-xs text-blue-500 mt-0.5">
                  A oferta será adicionada automaticamente quando a extração terminar.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          {/* ── Error step ── */}
          {step === "error" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-gray-700 font-medium">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="text-sm text-blue-700 underline hover:text-blue-900"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* ── Result step ── */}
          {step === "result" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Oferta adicionada!</p>
                <p className="text-xs text-gray-500 mt-1">A oferta foi extraída e está na lista.</p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleReset}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Adicionar outra
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-950 hover:bg-blue-900 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
