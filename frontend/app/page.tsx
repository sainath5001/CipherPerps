import LandingNavbar from "@/components/ui/navigation-menu-4";
import FeaturedSectionStats from "@/components/ui/featured-section-stats";
import { HeroSection } from "@/components/ui/hero-odyssey";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { TestimonialsSection } from "@/components/ui/testimonials-columns-1";

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
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">Roadmap</div>
              <div className="text-2xl font-semibold">From MVP → encrypted perps</div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Feature title="v0 MVP" body="Single market, Chainlink pricing, basic liquidation path (Sepolia)." />
            <Feature title="v1 FHE ABI" body="Accept ciphertext handles + proofs for encrypted position parameters." />
            <Feature title="v2 Hardening" body="More markets, improved risk model, monitoring, audits, and mainnet readiness." />
          </div>
        </section>

        <TestimonialsSection className="pb-2" />
      </div>

      <CinematicFooter />
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel/40 p-4 backdrop-blur">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-400">{body}</div>
    </div>
  );
}

