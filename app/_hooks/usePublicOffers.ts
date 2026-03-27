"use client";

import { useCallback, useRef, useState } from "react";

type PublicOffer = {
  id: string;
  name: string;
  image: string;
  link: string | null;
  product_link: string;
  price: number;
  old_price: number;
  coupon: boolean;
  price_with_coupon: number;
  scrapped_at: string | null;
};

export function usePublicOffers() {
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const cursorRef = useRef<string | null>(null);

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

  return { offers, loaded, hasMore, fetchMore };
}
