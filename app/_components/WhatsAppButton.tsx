"use client";

import { sendGAEvent } from "@next/third-parties/google";

interface Props {
  size?: "default" | "lg";
  label?: string;
}

export function WhatsAppButton({ size = "default", label = "🚀 Entre no grupo VIP de ofertas" }: Props) {
  const cls =
    size === "lg"
      ? "bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xl px-12 py-5 rounded-full shadow-xl transition-colors duration-200 inline-block"
      : "bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg transition-colors duration-200 inline-block";
  return (
    <a
      href="https://chat.whatsapp.com/DwZqHODvLErBOpJpleiHEc?mode=gi_t"
      target="_blank"
      rel="noopener noreferrer"
      className={cls}
      onClick={() =>
        sendGAEvent("event", "whatsapp_group_click", {
          event_category: "engagement",
          event_label: "hero_cta",
        })
      }
    >
      {label}
    </a>
  );
}
