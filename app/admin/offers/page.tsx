"use client";

import { useMemo, useState } from "react";
import { Plus, ShoppingBag, Loader2, RefreshCw, ArrowUpDown } from "lucide-react";
import { useAdminAuth } from "../_hooks/useAdminAuth";
import { useOffers } from "../_hooks/useOffers";
import { AdminHeader } from "../_components/AdminHeader";
import { OfferCard } from "../_components/OfferCard";
import { AddOfferModal } from "../_components/AddOfferModal";
import { ToastStack } from "../_components/ToastStack";
import { ExtractionErrorModal } from "../_components/ExtractionErrorModal";
import type { Offer } from "@/lib/types/offer";

type SortBy = "default" | "price_asc" | "price_desc" | "discount_desc" | "discount_asc";

export default function OffersPage() {
  const { user, idToken, roles, checking } = useAdminAuth();
  const {
    offers,
    loadingOffers,
    loadingMore,
    refreshing,
    activeJobId,
    extractionResult,
    clearExtractionResult,
    errorJobDetails,
    clearErrorJobDetails,
    toasts,
    sentinelRef,
    showAddModalRef,
    dismissToast,
    handleJobStarted,
    handleRefresh,
    markOfferDispatched,
  } = useOffers(idToken);

  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [showDispatched, setShowDispatched] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | null>(null);

  // Let the hook's polling effect know whether the modal is open
  showAddModalRef.current = showAddModal;

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

      {/* Sub-navbar */}
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          {/* Title + count */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <ShoppingBag className="w-4 h-4 text-blue-950 shrink-0" />
            <span className="font-semibold text-gray-800 text-sm">Ofertas</span>
            {!loadingOffers && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
                {displayedOffers.length}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loadingOffers}
              title="Atualizar listagem"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={() => {
                clearExtractionResult();
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
                  <span className="hidden sm:inline">Extraindo...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Adicionar oferta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium uppercase tracking-wide mr-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Filtros
          </div>
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

        {loadingOffers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedOffers.map((offer) => (
                <div
                  key={offer.id}
                  id={`offer-${offer.id}`}
                  className={`rounded-2xl transition-all duration-700 ${
                    highlightedOfferId === offer.id
                      ? "ring-2 ring-amber-400 shadow-lg shadow-amber-100"
                      : ""
                  }`}
                >
                  <OfferCard
                    offer={offer}
                    idToken={idToken}
                    onDispatched={markOfferDispatched}
                  />
                </div>
              ))}
            </div>
            {loadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />
                ))}
              </div>
            )}
          </>
        )}

        {/* Scroll sentinel — triggers next page load */}
        <div ref={sentinelRef} className="h-1" />
      </main>

      {showAddModal && idToken && (
        <AddOfferModal
          idToken={idToken}
          onClose={() => setShowAddModal(false)}
          onJobStarted={handleJobStarted}
          extractionResult={extractionResult}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {errorJobDetails && (
        <ExtractionErrorModal details={errorJobDetails} onClose={clearErrorJobDetails} />
      )}
    </div>
  );
}
