"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { auth } from "@/lib/firebase";
import { OfferCard } from "../_components/OfferCard";
import type { Offer } from "@/lib/types/offer";

type SortBy = "default" | "price_asc" | "price_desc" | "discount_desc" | "discount_asc";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [checking, setChecking] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [showDispatched, setShowDispatched] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/admin";
        return;
      }
      setUser(currentUser);
      setChecking(false);

      setLoadingOffers(true);
      try {
        const token = await currentUser.getIdToken();
        setIdToken(token);
        const res = await fetch("/api/admin/offers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOffers(data.offers ?? []);
      } finally {
        setLoadingOffers(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <span className="font-bold text-gray-800">Ofersanja Admin</span>
        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "Avatar"}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-gray-200"
            />
          )}
          <span className="text-sm text-gray-600 hidden sm:block">{user?.displayName}</span>
          <button
            onClick={() => signOut(auth).then(() => { window.location.href = "/admin"; })}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-950" />
            <h2 className="text-lg font-bold text-gray-800">Ofertas de hoje</h2>
            {!loadingOffers && (
              <span className="text-sm text-gray-400">({displayedOffers.length})</span>
            )}
          </div>
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
    </div>
  );
}
