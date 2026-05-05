"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";

import { CONTRACTS, positionManagerAbi, priceOracleAbi } from "@/lib/contracts";
import { sepolia } from "wagmi/chains";

export function PositionCard() {
  const { address, isConnected } = useAccount();
  const contracts = CONTRACTS.sepolia;

  const { data: pos, isLoading: loadingPos } = useReadContract({
    address: contracts.positionManager,
    abi: positionManagerAbi,
    functionName: "getPosition",
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: { enabled: Boolean(address), refetchInterval: 5000 }
  });

  const { data: price } = useReadContract({
    address: contracts.priceOracle,
    abi: priceOracleAbi,
    functionName: "getLatestPrice",
    chainId: sepolia.id,
    query: { refetchInterval: 5000 }
  });

  const view = useMemo(() => {
    if (!pos) return null;
    const tuple = pos as readonly [boolean, boolean, bigint, bigint, bigint, bigint];
    const [isOpen, isLong, collateralUsdc, entryPrice1e8, positionSize, leverage] = tuple;
    return {
      isOpen,
      side: isLong ? "Long" : "Short",
      collateral: Number(collateralUsdc) / 1e6,
      entry: Number(entryPrice1e8) / 1e8,
      size: Number(positionSize) / 1e6,
      lev: Number(leverage) / 1e18
    };
  }, [pos]);

  const priceNum = price ? Number(price) / 1e8 : null;

  // PnL for display only (MVP): using placeholder plaintext size.
  const pnl = useMemo(() => {
    if (!view?.isOpen || priceNum == null) return null;
    const delta = priceNum - view.entry;
    const raw = delta * view.size;
    return view.side === "Long" ? raw : -raw;
  }, [priceNum, view]);

  return (
    <section className="rounded-2xl border border-border bg-panel/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Your position</div>
          <div className="text-lg font-semibold">Account</div>
        </div>
        <div className="text-xs text-slate-400">{priceNum != null ? `ETH/USD ${priceNum.toFixed(2)}` : "—"}</div>
      </div>

      <div className="mt-4">
        {!isConnected ? (
          <div className="text-sm text-slate-400">Connect wallet to view your position.</div>
        ) : loadingPos ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : !view?.isOpen ? (
          <div className="text-sm text-slate-400">No open position.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Side" value={view.side} />
            <Stat label="Collateral" value={`${view.collateral.toFixed(2)} USDC`} />
            <Stat label="Entry" value={`${view.entry.toFixed(2)} USD`} />
            <Stat label="Size (decrypted)" value={`${view.size.toFixed(2)} USD`} />
            <Stat label="Leverage (decrypted)" value={`${view.lev.toFixed(2)}x`} />
            <Stat label="PnL (UI est.)" value={pnl == null ? "—" : `${pnl.toFixed(2)} USD`} />
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500">
        “Decrypted” fields are currently plaintext placeholders until the Solidity ABI is updated to accept external
        ciphertext handles + proof (Zama relayer flow). The encryption module is prepared in `lib/encryption.ts`.
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel2 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

