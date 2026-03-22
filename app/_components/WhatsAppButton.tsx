"use client";

import { sendGAEvent } from "@next/third-parties/google";

export function WhatsAppButton() {
  return (
    <a
      href="https://chat.whatsapp.com/DwZqHODvLErBOpJpleiHEc?mode=gi_t"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white/90 font-bold text-lg px-10 py-4 rounded-full shadow-lg transition-colors duration-200"
      onClick={() =>
        sendGAEvent("event", "whatsapp_group_click", {
          event_category: "engagement",
          event_label: "hero_cta",
        })
      }
    >
      🚀 Entre no grupo VIP de ofertas
    </a>
  );
}
