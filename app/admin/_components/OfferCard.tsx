import Image from "next/image";
import { useState } from "react";
import { Tag, Star, Clock, Copy, Check, Send } from "lucide-react";
import type { Offer } from "@/lib/types/offer";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildWhatsAppText(offer: Offer): string {
  const finalPrice = offer.coupon ? offer.price_with_coupon : offer.price;
  const lines: string[] = [];

  lines.push(`🔥 *${offer.name}*`);
  lines.push("");

  if (offer.old_price > 0 && offer.old_price > offer.price) {
    lines.push(`🤑 ~~De ${formatBRL(offer.old_price)}~~ Por *${formatBRL(offer.price)}*`);
  }
  // lines.push(`💰 Por apenas *${formatBRL(offer.price)}*`);

  // if (offer.coupon) {
  //   lines.push(`🏷️ Com cupom: *${formatBRL(finalPrice)}*`);
  // }

  // if (offer.rating) lines.push(`⭐ ${offer.rating}`);
  // if (offer.seller) lines.push(`🏪 ${offer.seller}`);

  // if (offer.time_limited) lines.push("⏳ Oferta por tempo limitado!");

  lines.push("");
  lines.push(`🔗 ${offer.link}`);

  return lines.join("\n");
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L0 24l6.335-1.502A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.502-5.19-1.38l-.372-.22-3.862.915.977-3.77-.242-.387A9.934 9.934 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export function OfferCard({
  offer,
  idToken,
  onDispatched,
}: {
  offer: Offer;
  idToken: string;
  onDispatched: (id: string) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dispatchStep, setDispatchStep] = useState<"idle" | "confirm" | "loading">("idle");
  const [imageOverlay, setImageOverlay] = useState<"hidden" | "visible" | "copying" | "done">("hidden");

  async function handleImageCopy() {
    if (imageOverlay === "hidden") {
      // Mobile: first tap reveals overlay
      setImageOverlay("visible");
      return;
    }
    if (imageOverlay === "copying" || imageOverlay === "done") return;
    setImageOverlay("copying");
    try {
      const res = await fetch(`/api/admin/proxy-image?url=${encodeURIComponent(offer.image)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("proxy failed");

      const blob = await res.blob();

      // Browsers only support image/png in ClipboardItem — convert via canvas
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d")!.drawImage(img, 0, 0);
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png");
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });

      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setImageOverlay("done");
      setTimeout(() => setImageOverlay("hidden"), 1500);
    } catch {
      setImageOverlay("visible");
    }
  }

  const discount =
    offer.old_price > 0
      ? Math.round(((offer.old_price - offer.price) / offer.old_price) * 100)
      : null;

  const finalPrice = offer.coupon ? offer.price_with_coupon : offer.price;

  function handleCopy() {
    navigator.clipboard.writeText(buildWhatsAppText(offer));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDispatch() {
    if (dispatchStep === "idle") {
      setDispatchStep("confirm");
      return;
    }
    setDispatchStep("loading");
    await fetch(`/api/admin/offers/${offer.id}/dispatch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    onDispatched(offer.id);
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col ${offer.dispatched_at ? "border-green-200 opacity-70" : "border-gray-100"}`}>
      <div
        className="relative h-48 bg-gray-50 group cursor-pointer"
        onClick={handleImageCopy}
        onMouseEnter={() => setImageOverlay((v) => v === "hidden" ? "visible" : v)}
        onMouseLeave={() => setImageOverlay((v) => v === "visible" ? "hidden" : v)}
      >
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
        {/* Copy overlay */}
        {imageLoaded && imageOverlay !== "hidden" && (
          <div className="absolute inset-0 bg-black/40 rounded-t-2xl flex items-center justify-center transition-opacity">
            {imageOverlay === "done" ? (
              <Check className="w-8 h-8 text-white" />
            ) : imageOverlay === "copying" ? (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Copy className="w-8 h-8 text-white" />
            )}
          </div>
        )}
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
        {offer.trigger === "manual" && (
          <span className="absolute bottom-2 left-2 bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Manual
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

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 mt-1 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium py-2 transition-colors"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5" /> Copiado!</>
            ) : (
              <><WhatsAppIcon /> Copiar criativo</>
            )}
          </button>

          {offer.dispatched_at ? (
            <button
              disabled
              className="flex items-center justify-center gap-2 rounded-xl text-sm font-medium py-2 bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              Já disparado
            </button>
          ) : (
            <button
              onClick={handleDispatch}
              disabled={dispatchStep === "loading"}
              onBlur={() => { if (dispatchStep === "confirm") setDispatchStep("idle"); }}
              className={`flex items-center justify-center gap-2 rounded-xl text-sm font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                dispatchStep === "confirm"
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-blue-950 hover:bg-blue-900 text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              {dispatchStep === "confirm"
                ? "Confirmar disparo?"
                : dispatchStep === "loading"
                ? "Disparando..."
                : "Marcar como disparado"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
