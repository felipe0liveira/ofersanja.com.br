"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Link, Loader2, AlertCircle, Tag, Star } from "lucide-react";
import type { Offer } from "@/lib/types/offer";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Step = "input" | "submitting" | "extracting" | "result" | "error";

export function AddOfferModal({
  idToken,
  onClose,
  onAdded,
}: {
  idToken: string;
  onClose: () => void;
  onAdded: (offer: Offer) => void;
}) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start polling when jobId is set
  useEffect(() => {
    if (!jobId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/offers/extract/${jobId}/status`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "done") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setOffer(data.offer as Offer);
          setStep("result");
          onAdded(data.offer as Offer);
        } else if (data.status === "error") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setErrorMsg(data.error ?? "Falha ao extrair produto.");
          setStep("error");
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 5_000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [jobId, idToken, onAdded]);

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
      setJobId(data.jobId);
      setStep("extracting");
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStep("error");
    }
  }

  function handleReset() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setUrl("");
    setOffer(null);
    setErrorMsg("");
    setJobId(null);
    setStep("input");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const discount =
    offer && offer.old_price > 0 && offer.old_price > offer.price
      ? Math.round(((offer.old_price - offer.price) / offer.old_price) * 100)
      : null;
  const finalPrice =
    offer && offer.coupon && offer.price_with_coupon > 0
      ? offer.price_with_coupon
      : offer?.price;

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

          {/* ── Extracting step (polling) ── */}
          {step === "extracting" && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-950" />
              <p className="text-sm font-medium">Acessando o produto...</p>
              <p className="text-xs text-gray-400 text-center">Isso pode levar alguns segundos</p>
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
          {step === "result" && offer && (
            <div className="flex flex-col gap-4">
              {/* Product card */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Image */}
                <div className="relative h-48 bg-gray-50 flex items-center justify-center">
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    className="object-contain p-4"
                    sizes="448px"
                    unoptimized
                  />
                  {discount !== null && discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{discount}%
                    </span>
                  )}
                  {offer.coupon && (
                    <span className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                      🏷️ Cupom
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-3 leading-snug">
                    {offer.name}
                  </p>

                  <div className="flex flex-col gap-0.5">
                    {offer.old_price > 0 && offer.old_price > offer.price && (
                      <span className="text-xs text-gray-400 line-through">{formatBRL(offer.old_price)}</span>
                    )}
                    <span className="text-lg font-bold text-gray-900">{formatBRL(finalPrice!)}</span>
                    {offer.coupon && offer.price_with_coupon > 0 && (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {offer.coupon_description || "Cupom disponível"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    {offer.seller && (
                      <span>🏪 <span className="font-medium">{offer.seller}</span></span>
                    )}
                    {offer.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {offer.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
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
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
