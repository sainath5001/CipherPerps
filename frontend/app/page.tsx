import Image from "next/image";
import Link from "next/link";

import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Header variant="landing" />

        <section className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel/40 px-3 py-1 text-xs text-slate-300">
              Sepolia demo • Chainlink ETH/USD • Zama FHE-ready
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              Confidential perpetuals
              <span className="text-slate-300"> built for public chains.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              CipherPerps lets traders open ETH perpetual positions while keeping sensitive parameters private.
              Position size and leverage are designed to be encrypted with Zama FHE.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                Open App
              </Link>
              <a
                className="rounded-xl border border-border bg-panel2 px-5 py-3 text-sm font-semibold"
                href="https://sepolia.etherscan.io/address/0xFe97B52dC4219979e5524D244B8D8C0A39879B5F"
                target="_blank"
                rel="noreferrer"
              >
                View contracts
              </a>
            </div>

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

        <section className="mt-16">
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

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-panel/40 p-4 backdrop-blur">
            <div className="text-sm text-slate-400">FAQ style section</div>
            <div className="mt-2 text-xl font-semibold">Questions users actually ask</div>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <Image src="/images/gmx-faq.png" alt="FAQ reference" width={1400} height={900} className="h-auto w-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-panel/40 p-4 backdrop-blur">
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

        <footer className="mt-16 rounded-2xl border border-border bg-panel/30 p-6 text-sm text-slate-400 backdrop-blur">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="font-semibold text-slate-200">CipherPerps</div>
              <div className="mt-1">Hackathon MVP • Sepolia demo</div>
            </div>
            <Link href="/app" className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">
              Open App
            </Link>
          </div>
        </footer>
      </div>
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

