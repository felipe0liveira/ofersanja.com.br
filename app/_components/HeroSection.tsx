"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { WhatsAppButton } from "./WhatsAppButton";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut", delay: 0.2 } },
};

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <div className="relative min-h-[90vh] flex flex-col md:flex-row items-center gap-10 max-w-6xl mx-auto px-6 py-20">
      {/* Left — text (order-2 on mobile so avatar shows first) */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="order-2 md:order-1 flex-1 flex flex-col items-center md:items-start gap-6 text-center md:text-left"
      >
        <motion.div variants={item}>
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-emerald-100">
            100% gratuito · direto no WhatsApp
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-700 leading-tight max-w-xl"
        >
          As <span className="text-emerald-600">melhores ofertas</span> da internet no seu WhatsApp 📲
        </motion.h1>

        <motion.p
          variants={item}
          className="text-slate-500 text-lg max-w-md leading-relaxed"
        >
          Nossa equipe garimpeia promoções e cupons exclusivos todos os dias. Você recebe os avisos direto no grupo — é só aproveitar.
        </motion.p>

        <motion.div variants={item}>
          <WhatsAppButton />
        </motion.div>

        <motion.div
          variants={item}
          className="flex items-center gap-6 text-sm text-slate-400 font-medium"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            1.000+ membros
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            10.000+ ofertas divulgadas
          </span>
        </motion.div>
      </motion.div>

      {/* Right — avatar (order-1 on mobile so it renders above text) */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="order-1 md:order-2 shrink-0 w-full max-w-[260px] md:max-w-sm lg:max-w-md overflow-hidden"
      >
        <Image
          src="/ofersanja-avatar-squared.png"
          alt="Ofersanja"
          width={480}
          height={480}
          className="object-cover w-full h-auto scale-[1.3]"
          priority
        />
      </motion.div>

      {/* Scroll arrow */}
      <a
        href="#ofertas"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors animate-bounce"
        aria-label="Ver ofertas"
      >
        <span className="text-xs font-semibold tracking-widest uppercase">Ver ofertas</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
      </div>
    </section>
  );
}
