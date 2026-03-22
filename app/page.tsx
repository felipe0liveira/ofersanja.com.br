import Image from "next/image";
import { WhatsAppButton } from "./_components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-b from-blue-950 to-blue-600 px-6 pt-20 pb-20 md:gap-12 text-center md:text-left">
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
      </main>

      <footer className="bg-blue-950 text-blue-300 text-sm text-center py-4">
        © 2026 Ofersanja. Todos os direitos reservados.
      </footer>
    </>
  );
}
