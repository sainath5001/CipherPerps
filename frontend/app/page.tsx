import Image from "next/image";

import LandingNavbar from "@/components/ui/navigation-menu-4";
import { HeroSection } from "@/components/ui/hero-odyssey";
import { FAQ } from "@/components/ui/faq-tabs";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { TestimonialsSection } from "@/components/ui/testimonials-columns-1";

export default function HomePage() {
  const categories = {
    basics: "Basics",
    privacy: "Privacy & FHE",
    oracle: "Oracle & pricing",
    risk: "Risk & liquidation",
  };

  const faqData = {
    basics: [
      {
        question: "What is CipherPerps?",
        answer:
          "CipherPerps is a hackathon MVP for confidential perpetual futures (ETH/USDC). It separates a landing page from a simple trading terminal under /app.",
      },
      {
        question: "Which network is the demo on?",
        answer:
          "The current demo targets Sepolia for fast iteration. The UI and deployment flow are set up to work with Sepolia contract addresses.",
      },
      {
        question: "How do I try it?",
        answer:
          "Open the terminal at /app, connect a wallet, deposit collateral, and open/close a position. If you’re on the wrong chain, switch to Sepolia in your wallet.",
      },
    ],
    privacy: [
      {
        question: "What is encrypted in CipherPerps?",
        answer:
          "The protocol is designed so position size and leverage can be encrypted (Zama FHE). In this MVP, those fields are still placeholders until the ABI evolves to pass ciphertext handles + proof.",
      },
      {
        question: "Is this fully private today?",
        answer:
          "Not end-to-end yet. The repo includes the frontend encryption scaffolding, but the deployed Solidity ABI is still the MVP placeholder version.",
      },
      {
        question: "Why use FHE for perps?",
        answer:
          "It allows users to express sensitive trade parameters without exposing them publicly, while the protocol can still enforce rules like health checks and liquidation conditions.",
      },
    ],
    oracle: [
      {
        question: "Where does the price come from?",
        answer:
          "The demo uses Chainlink’s ETH/USD price feed on Sepolia via a simple onchain oracle adapter. Prices are read with 8 decimals (1e8).",
      },
      {
        question: "Why ETH/USD instead of ETH/USDC?",
        answer:
          "For the MVP, the oracle feed is ETH/USD. Collateral is USDC-like units, and pricing is mapped to USD for simplicity and credibility.",
      },
    ],
    risk: [
      {
        question: "How do liquidations work in the MVP?",
        answer:
          "A liquidation engine can close undercollateralized positions based on the oracle price. The liquidation pathway is intentionally simple so the core flow is easy to verify.",
      },
      {
        question: "Does liquidation still work with encrypted parameters?",
        answer:
          "That’s part of the design goal: keep parameters private while maintaining enforceable risk checks. The MVP demonstrates the shape; full FHE integration requires the ciphertext/proof ABI update.",
      },
    ],
  };

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

        <div id="faq" className="mt-16 rounded-2xl border border-border bg-panel/20 backdrop-blur">
          <FAQ
            title="Frequently Asked Questions"
            subtitle="Let’s answer the important ones"
            categories={categories}
            faqData={faqData}
            className="rounded-2xl bg-transparent"
          />
        </div>

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

