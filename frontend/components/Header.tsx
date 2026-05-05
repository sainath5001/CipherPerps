/* eslint-disable @next/next/no-img-element */
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Header({ variant = "landing" }: { variant?: "landing" | "app" }) {
  return (
    <header className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-panel/40 p-4 backdrop-blur sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl border border-border bg-panel2">
          <span className="text-sm font-semibold">CP</span>
        </div>
        <div>
          <div className="text-lg font-semibold leading-tight">CipherPerps</div>
          <div className="text-sm text-slate-400">Confidential perpetuals • Zama FHE-ready</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {variant === "landing" ? (
          <Link
            href="/app"
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Open App
          </Link>
        ) : (
          <Link
            href="/"
            className="rounded-xl border border-border bg-panel2 px-4 py-2 text-sm font-semibold"
          >
            Back
          </Link>
        )}

        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>
    </header>
  );
}

