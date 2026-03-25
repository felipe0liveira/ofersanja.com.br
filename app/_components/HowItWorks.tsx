"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Bell, BadgePercent } from "lucide-react";

const STEPS = [
  {
    icon: Users,
    title: "Acesse o grupo",
    description: "Entre no nosso grupo gratuito do WhatsApp em segundos. Sem cadastro, sem taxas.",
    image: "/person-shopping.jpg",
    alt: "Pessoa fazendo compras online",
  },
  {
    icon: Bell,
    title: "Receba alertas em tempo real",
    description: "Nossa equipe monitora as melhores promoções e envia alertas direto no grupo.",
    image: "/person-smartphone-shopping.jpg",
    alt: "Pessoa usando smartphone para ver ofertas",
  },
  {
    icon: BadgePercent,
    title: "Aproveite as promoções",
    description: "Clique na oferta, aplique o cupom e economize. É simples assim.",
    image: "/real-group-screenshot.png",
    alt: "Print do grupo WhatsApp com oferta",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-emerald-100 mb-4">
            simples e rápido
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Como funciona?</h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            Em 3 passos você começa a economizar todos os dias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.15 }}
              className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-slate-50 overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Step number badge */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 font-bold text-xs w-7 h-7 rounded-full flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-3 flex-1">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
