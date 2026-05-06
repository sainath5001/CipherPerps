import Image from "next/image";
import Link from "next/link";

import LandingNavbar from "@/components/ui/navigation-menu-4";
import { HeroSection } from "@/components/ui/hero-odyssey";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { TestimonialsSection } from "@/components/ui/testimonials-columns-1";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <LandingNavbar />

      <HeroSection />

      <div className="relative z-10 mx-auto max-w-6xl rounded-b-3xl border-b border-border bg-background px-4 py-6 shadow-[0_40px_90px_-35px_rgba(0,0,0,0.85)]">
        <section id="why" className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel/40 px-3 py-1 text-xs text-slate-300">
              Sepolia demo • Chainlink ETH/USD • Zama FHE-ready
            </div>
            <p className="mt-5 text-lg font-medium text-slate-200">Product snapshot</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              The hero above previews the directional beam; this section summarizes how the MVP is wired (privacy intent,
              oracle pricing, liquidation path).
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Card title="Privacy-first" body="Size & leverage are designed to stay encrypted end-to-end." />
              <Card title="Verifiable" body="Health checks & liquidation remain enforceable onchain." />
              <Card title="Minimal MVP" body="Single market (ETH/USD), one position per user." />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/40 p-3 backdrop-blur">
            <div className="overflow-hidden rounded-xl border border-border">
              <Image
                src="/images/gmx-hero.png"
                alt="Reference UI inspiration"
                width={1400}
                height={900}
                className="h-auto w-full"
                priority
              />
            </div>
            <div className="px-2 pt-3 text-xs text-slate-400">
              UI inspiration: GMX-style landing. Your trading terminal is available under <span className="text-slate-200">/app</span>.
            </div>
          </div>
        </section>

        <section id="features" className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">Why CipherPerps</div>
              <div className="text-2xl font-semibold">Built for confidential onchain finance</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Feature title="Encrypted positions" body="Store encrypted trading parameters onchain." />
            <Feature title="Live oracle pricing" body="Uses Chainlink ETH/USD on Sepolia for credibility." />
            <Feature title="Liquidation ready" body="Health factor checks allow permissionless liquidation." />
          </div>
        </section>

        <section id="faq-roadmap" className="mt-16 grid gap-6 lg:grid-cols-2">
          <div id="faq" className="rounded-2xl border border-border bg-panel/40 p-4 backdrop-blur">
            <div className="text-sm text-slate-400">FAQ style section</div>
            <div className="mt-2 text-xl font-semibold">Questions users actually ask</div>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <Image src="/images/gmx-faq.png" alt="FAQ reference" width={1400} height={900} className="h-auto w-full" />
            </div>
          </div>

          <div id="roadmap" className="rounded-2xl border border-border bg-panel/40 p-4 backdrop-blur">
            <div className="text-sm text-slate-400">Roadmap style section</div>
            <div className="mt-2 text-xl font-semibold">From MVP to mainnet-grade</div>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <Image
                src="/images/gmx-roadmap.png"
                alt="Roadmap reference"
                width={1400}
                height={900}
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        <TestimonialsSection className="pb-2" />
      </div>

      <CinematicFooter />
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-panel/40 p-4 backdrop-blur">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-400">{body}</div>
    </div>
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

