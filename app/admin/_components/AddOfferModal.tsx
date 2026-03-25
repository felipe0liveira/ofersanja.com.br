"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Link, Loader2, AlertCircle, Tag, Star, PackageSearch } from "lucide-react";
import type { Offer } from "@/lib/types/offer";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Step = "input" | "submitting" | "extracting" | "result" | "error" | "conflict";

export function AddOfferModal({
  idToken,
  onClose,
  onJobStarted,
  extractionResult,
  onScrollToOffer,
}: {
  idToken: string;
  onClose: () => void;
  onJobStarted: (jobId: string) => void;
  extractionResult?: { offer: Offer } | { error: string } | { conflict: Offer } | null;
  onScrollToOffer: (offerId: string) => void;
}) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // React to extraction result coming from the parent (page-level polling)
  useEffect(() => {
    if (!extractionResult || step !== "extracting") return;
    if ("offer" in extractionResult) {
      setOffer(extractionResult.offer);
      setStep("result");
    } else if ("conflict" in extractionResult) {
      setOffer(extractionResult.conflict);
      setStep("conflict");
    } else {
      setErrorMsg(extractionResult.error);
      setStep("error");
    }
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
    setOffer(null);
    setErrorMsg("");
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

          {/* ── Conflict step ── */}
          {step === "conflict" && offer && (
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 flex flex-col items-center gap-2 text-center">
                <PackageSearch className="w-8 h-8 text-amber-500" />
                <p className="text-sm font-semibold text-amber-800">Produto já está na lista!</p>
                <p className="text-xs text-amber-600">Este produto já foi adicionado às ofertas de hoje.</p>
              </div>
              <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{offer.name}</p>
                  <p className="text-sm font-bold text-gray-900">{formatBRL(offer.price)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Adicionar outro
                </button>
                <button
                  onClick={() => onScrollToOffer(offer.id)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Ver produto
                </button>
              </div>
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
