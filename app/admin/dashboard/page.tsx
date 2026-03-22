"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { auth } from "@/lib/firebase";
import { OfferCard } from "../_components/OfferCard";
import type { Offer } from "@/lib/types/offer";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [checking, setChecking] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

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
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="w-5 h-5 text-blue-950" />
          <h2 className="text-lg font-bold text-gray-800">Ofertas de hoje</h2>
          {!loadingOffers && (
            <span className="text-sm text-gray-400">({offers.length})</span>
          )}
        </div>

        {loadingOffers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingBag className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma oferta encontrada hoje.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                idToken={idToken}
                onDispatched={(id) => setOffers((prev) => prev.filter((o) => o.id !== id))}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
