import LandingNavbar from "@/components/ui/navigation-menu-4";
import FeaturedSectionStats from "@/components/ui/featured-section-stats";
import { HeroSection } from "@/components/ui/hero-odyssey";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { TestimonialsSection } from "@/components/ui/testimonials-columns-1";
import { CryptoScroller } from "@/components/ui/crypto-scroller";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <LandingNavbar />

      <HeroSection />

      <div className="relative z-10 mx-auto max-w-6xl rounded-b-3xl border-b border-border bg-background px-4 py-6 shadow-[0_40px_90px_-35px_rgba(0,0,0,0.85)]">
        <section id="why" className="mt-10">
          <FeaturedSectionStats />
        </section>

        <section id="roadmap" className="mt-16">
          <CryptoScroller />
        </section>

        <TestimonialsSection className="pb-2" />
      </div>

      <CinematicFooter />
    </main>
  );
}
