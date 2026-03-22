import Image from "next/image";
import { WhatsAppButton } from "./_components/WhatsAppButton";
import { OfferCarousel } from "./_components/OfferCarousel";

export default function Home() {
  return (
    <>
      <main className="relative min-h-screen flex flex-col md:flex-row items-center justify-center bg-linear-to-b from-blue-950 to-blue-700 px-6 pt-20 pb-20 md:gap-12 text-center md:text-left">
        <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg shrink-0">
          <Image
            src="/ofersanja-avatar-squared.png"
            alt="Ofersanja"
            width={800}
            height={800}
            className="w-full h-auto object-cover brightness-75"
            priority
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-8 -mt-10 md:mt-0 relative z-10">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight max-w-xl drop-shadow-lg">
            As <span className="text-amber-300/80 animate-pulse">MELHORES ofertas</span> da internet direto no seu WhatsApp!
          </h1>

          <WhatsAppButton />
        </div>

        <a
          href="#ofertas"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors animate-bounce"
          aria-label="Ver ofertas"
        >
          <span className="text-sm font-semibold tracking-widest uppercase animate-pulse">
            Ver ofertas
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </main>

      <OfferCarousel />

      <footer className="bg-blue-950 text-blue-300 text-sm text-center py-4">
        © 2026 Ofersanja. Todos os direitos reservados.
      </footer>
    </>
  );
}
