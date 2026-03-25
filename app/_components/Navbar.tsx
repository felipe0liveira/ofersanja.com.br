"use client";

import { useEffect, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center font-extrabold text-xl text-slate-900 tracking-tight">
          Ofer<span className="text-emerald-600">sanja</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2" />
        </a>

        {/* CTA */}
        <a
          href="https://chat.whatsapp.com/DwZqHODvLErBOpJpleiHEc?mode=gi_t"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
          onClick={() =>
            sendGAEvent("event", "whatsapp_group_click", {
              event_category: "engagement",
              event_label: "navbar_cta",
            })
          }
        >
          Entrar no grupo
        </a>
      </div>
    </header>
  );
}
