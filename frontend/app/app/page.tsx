import { Header } from "@/components/Header";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { TradingPanel } from "@/components/TradingPanel";
import { PositionCard } from "@/components/PositionCard";

export default function AppPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Header variant="app" />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-panel/60 p-3 backdrop-blur">
              <div className="flex items-center justify-between px-2 py-2">
                <div>
                  <div className="text-sm text-slate-400">Market</div>
                  <div className="text-lg font-semibold">ETH / USD</div>
                </div>
                <div className="text-xs text-slate-400">Sepolia • Chainlink ETH/USD</div>
              </div>
              <div className="h-[420px] overflow-hidden rounded-xl border border-border">
                <TradingViewWidget />
              </div>
            </div>

            <div className="mt-4">
              <PositionCard />
            </div>
          </div>

          <div className="lg:col-span-1">
            <TradingPanel />
          </div>
        </div>
      </div>
    </main>
  );
}

