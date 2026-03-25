"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const STATS = [
  { value: 1000, suffix: "+", label: "membros no grupo" },
  { value: 10000, suffix: "+", label: "ofertas divulgadas" },
  { value: 100, suffix: "%", label: "gratuito" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-extrabold text-emerald-600 tabular-nums">
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="bg-slate-50 border-y border-gray-100 py-14 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <Counter value={stat.value} suffix={stat.suffix} />
            <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
