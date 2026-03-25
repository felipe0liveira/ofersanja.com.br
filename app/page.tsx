import { Navbar } from "./_components/Navbar";
import { HeroSection } from "./_components/HeroSection";
import { StatsBar } from "./_components/StatsBar";
import { HowItWorks } from "./_components/HowItWorks";
import { OfferCarousel } from "./_components/OfferCarousel";
import { FinalCTA } from "./_components/FinalCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <StatsBar />
        <OfferCarousel />
        <FinalCTA />
      </main>
      <footer className="bg-slate-900 text-slate-500 text-sm text-center py-5">
        © 2026 Ofersanja. Todos os direitos reservados.
      </footer>
    </>
  );
}
