"use client";

import { motion } from "framer-motion";
import { WhatsAppButton } from "./WhatsAppButton";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 px-6 text-center">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/person-shopping-online.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900/90" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6"
      >
        <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10">
          é gratuito
        </span>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
          Não fique de fora das <span className="text-emerald-400">melhores ofertas</span> 🔥
        </h2>

        <p className="text-slate-300 text-lg max-w-md leading-relaxed">
          Mais de 1.000 pessoas já estão economizando todos os dias. Junte-se ao grupo agora — é grátis e você pode sair quando quiser.
        </p>

        <WhatsAppButton size="lg" label="🚀 Quero entrar no grupo VIP" />

        <p className="text-slate-500 text-xs">Sem spam. Só ofertas de verdade.</p>
      </motion.div>
    </section>
  );
}
