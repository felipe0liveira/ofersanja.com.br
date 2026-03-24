"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

type PublicOffer = {
  id: string;
  name: string;
  image: string;
  link: string;
  price: number;
  old_price: number;
  coupon: boolean;
  price_with_coupon: number;
  scrapped_at: string | null;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OfferCarousel() {
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);
  const [offset, setOffset] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const cursorRef = useRef<string | null>(null);

  useEffect(() => {
    const update = () => setVisibleCount(window.innerWidth >= 768 ? 3 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fetchMore = useCallback(async () => {
    if (fetchingRef.current || !hasMoreRef.current) return;
    fetchingRef.current = true;
    try {
      const url = cursorRef.current
        ? `/api/offers?cursor=${encodeURIComponent(cursorRef.current)}`
        : "/api/offers";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setOffers((prev) => [...prev, ...(data.offers ?? [])]);
      hasMoreRef.current = data.hasMore;
      setHasMore(data.hasMore);
      const last: PublicOffer | undefined = data.offers?.[data.offers.length - 1];
      if (last?.scrapped_at) cursorRef.current = last.scrapped_at;
    } finally {
      fetchingRef.current = false;
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchMore();
  }, [fetchMore]);

  // Recompute pixel offset after DOM layout
  useEffect(() => {
    if (!containerRef.current) return;
    const cardWidth = containerRef.current.clientWidth / visibleCount;
    setOffset(currentIndex * cardWidth);
  }, [currentIndex, visibleCount]);

  // Prefetch next page when approaching the end
  useEffect(() => {
    if (hasMore && offers.length > 0 && currentIndex + visibleCount + 3 >= offers.length) {
      fetchMore();
    }
  }, [currentIndex, offers.length, hasMore, visibleCount, fetchMore]);

  // Auto-advance every 5 s
  useEffect(() => {
    if (offers.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = offers.length - visibleCount;
        if (maxIndex <= 0) return 0;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [offers.length, visibleCount]);

  if (!loaded) {
    return (
      <section id="ofertas" className="py-12 px-6 bg-blue-950">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">🔥 Ofertas de hoje</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/10 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (offers.length === 0) return null;

  return (
    <section id="ofertas" className="py-12 px-6 bg-blue-950">
      <h2 className="text-white text-2xl font-bold mb-6 text-center">🔥 Ofertas de hoje</h2>
      <div ref={containerRef} className="overflow-hidden max-w-5xl mx-auto">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${offset}px)` }}
        >
          {offers.map((offer) => {
            const discount =
              offer.old_price > 0 && offer.old_price > offer.price
                ? Math.round(((offer.old_price - offer.price) / offer.old_price) * 100)
                : null;
            const finalPrice = offer.coupon && offer.price_with_coupon > 0
              ? offer.price_with_coupon
              : offer.price;

            return (
              <div
                key={offer.id}
                style={{ width: `${100 / visibleCount}%`, flexShrink: 0 }}
                className="px-2"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col h-full">
                  <div className="relative h-44 bg-gray-50">
                    <Image
                      src={offer.image}
                      alt={offer.name}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 33vw"
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
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                      {offer.name}
                    </p>
                    <div className="mt-auto flex flex-col gap-1">
                      {offer.old_price > 0 && offer.old_price > offer.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatBRL(offer.old_price)}
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-900">
                        {formatBRL(finalPrice)}
                      </span>
                    </div>
                    <a
                      href={offer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 mt-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver oferta
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
