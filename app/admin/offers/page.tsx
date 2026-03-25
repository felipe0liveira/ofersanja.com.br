"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useAdminAuth } from "../_hooks/useAdminAuth";
import { AdminHeader } from "../_components/AdminHeader";
import { OfferCard } from "../_components/OfferCard";
import { AddOfferModal } from "../_components/AddOfferModal";
import type { Offer } from "@/lib/types/offer";

type SortBy = "default" | "price_asc" | "price_desc" | "discount_desc" | "discount_asc";

export default function OffersPage() {
  const { user, idToken, roles, checking } = useAdminAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [showDispatched, setShowDispatched] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<{ offer: Offer } | { error: string } | null>(null);

  // Page-level polling — continues even when the modal is closed
  useEffect(() => {
    if (!activeJobId || !idToken) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/offers/extract/${activeJobId}/status`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "done") {
          clearInterval(interval);
          const newOffer = data.offer as Offer;
          setOffers((prev) =>
            prev.some((o) => o.id === newOffer.id)
              ? prev.map((o) => (o.id === newOffer.id ? newOffer : o))
              : [newOffer, ...prev]
          );
          setExtractionResult({ offer: newOffer });
          setActiveJobId(null);
        } else if (data.status === "error") {
          clearInterval(interval);
          setExtractionResult({ error: data.error ?? "Falha ao extrair produto." });
          setActiveJobId(null);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 5_000);
    return () => clearInterval(interval);
  }, [activeJobId, idToken]);

  useEffect(() => {
    if (!idToken) return;
    setLoadingOffers(true);
    fetch("/api/admin/offers", {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((r) => r.json())
      .then((d) => setOffers(d.offers ?? []))
      .finally(() => setLoadingOffers(false));
  }, [idToken]);

  const dispatchedCount = offers.filter((o) => o.dispatched_at).length;

  const displayedOffers = useMemo(() => {
    const filtered = showDispatched
      ? offers.filter((o) => o.dispatched_at)
      : offers.filter((o) => !o.dispatched_at);
    if (sortBy === "default") return filtered;
    const getDiscount = (o: Offer) =>
      o.old_price > 0 ? (o.old_price - o.price) / o.old_price : 0;
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "discount_desc": return getDiscount(b) - getDiscount(a);
        case "discount_asc": return getDiscount(a) - getDiscount(b);
        default: return 0;
      }
    });
  }, [offers, showDispatched, sortBy]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-gray-400 text-sm">Verificando acesso...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={user!} roles={roles} />

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-950" />
            <h2 className="text-lg font-bold text-gray-800">Ofertas de hoje</h2>
            {!loadingOffers && (
              <span className="text-sm text-gray-400">({displayedOffers.length})</span>
            )}
          </div>
          <button
            onClick={() => {
              setExtractionResult(null);
              setShowAddModal(true);
            }}
            disabled={!!activeJobId}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeJobId
                ? "bg-blue-900 text-white opacity-80 cursor-not-allowed"
                : "bg-blue-950 hover:bg-blue-900 text-white"
            }`}
          >
            {activeJobId ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extraindo...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar oferta
              </>
            )}
          </button>
          {!loadingOffers && (
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer"
              >
                <option value="default">Mais recente</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="discount_desc">Maior desconto</option>
                <option value="discount_asc">Menor desconto</option>
              </select>
              <button
                onClick={() => setShowDispatched((v) => !v)}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
                    showDispatched ? "bg-blue-950" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      showDispatched ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </span>
                {showDispatched
                  ? `Disparadas (${dispatchedCount})`
                  : `Pendentes (${offers.length - dispatchedCount})`}
              </button>
            </div>
          )}
        </div>

        {loadingOffers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : displayedOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingBag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">
              {offers.length === 0
                ? "Nenhuma oferta encontrada hoje."
                : "Nenhuma oferta para exibir com os filtros atuais."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                idToken={idToken}
                onDispatched={(id) =>
                  setOffers((prev) =>
                    prev.map((o) =>
                      o.id === id ? { ...o, dispatched_at: new Date().toISOString() } : o
                    )
                  )
                }
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && idToken && (
        <AddOfferModal
          idToken={idToken}
          onClose={() => setShowAddModal(false)}
          onJobStarted={(jobId) => setActiveJobId(jobId)}
          extractionResult={extractionResult}
        />
      )}
    </div>
  );
}
