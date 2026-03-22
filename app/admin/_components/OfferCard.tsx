import Image from "next/image";
import { useState } from "react";
import { Tag, Star, Clock, ExternalLink } from "lucide-react";
import type { Offer } from "@/lib/types/offer";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OfferCard({ offer }: { offer: Offer }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const discount = offer.old_price > 0
    ? Math.round(((offer.old_price - offer.price) / offer.old_price) * 100)
    : null;

  const finalPrice = offer.coupon ? offer.price_with_coupon : offer.price;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative h-48 bg-gray-50">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-2xl" />
        )}
        <Image
          src={offer.image}
          alt={offer.name}
          fill
          className={`object-contain p-4 transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          sizes="(max-width: 768px) 100vw, 33vw"
          onLoad={() => setImageLoaded(true)}
        />
        {discount !== null && discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {offer.time_limited && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Limitado
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {offer.name}
        </h3>

        <div className="flex flex-col gap-1">
          {offer.old_price > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatBRL(offer.old_price)}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">
            {formatBRL(offer.price)}
          </span>
          {offer.coupon && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 w-fit">
              <Tag className="w-3 h-3" />
              Com cupom: {formatBRL(finalPrice)}
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {offer.rating && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {offer.rating}
            </span>
          )}
          {offer.seller && (
            <span className="text-xs text-gray-400">{offer.seller}</span>
          )}
          <a
            href={offer.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-1 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-medium py-2 transition-colors"
          >
            Ver oferta <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
