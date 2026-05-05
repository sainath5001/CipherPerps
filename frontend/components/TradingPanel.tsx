"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";

import { CONTRACTS, positionManagerAbi } from "@/lib/contracts";
import { sepolia } from "wagmi/chains";

type Side = "long" | "short";

export function TradingPanel() {
  const { address, isConnected } = useAccount();
  const [side, setSide] = useState<Side>("long");
  const [size, setSize] = useState<string>("1000"); // USD notional (MVP placeholder units)
  const [leverage, setLeverage] = useState<string>("5");
  const [collateral, setCollateral] = useState<string>("100");

  const contracts = CONTRACTS.sepolia;
  const { data: freeCollateral } = useReadContract({
    address: contracts.positionManager,
    abi: positionManagerAbi,
    functionName: "collateralBalance",
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: { enabled: Boolean(address) }
  });

  const { writeContract, data: txHash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: sepolia.id
  });

  const status = useMemo(() => {
    if (isPending) return "Confirm in wallet…";
    if (isConfirming) return "Transaction pending…";
    if (isSuccess) return "Success";
    if (error) return (error as any).shortMessage ?? error.message;
    return null;
  }, [error, isConfirming, isPending, isSuccess]);

  function onDeposit() {
    if (!address) return;
    writeContract({
      address: contracts.positionManager,
      abi: positionManagerAbi,
      functionName: "depositCollateral",
      args: [parseUnits(collateral, 6)]
    });
  }

  function onOpen() {
    if (!address) return;

    // NOTE: For real Zama encryption, this call must be updated to pass ciphertext handles + proof.
    // Our deployed MVP contract takes uint256 placeholders for euint256.
    const size1e6 = parseUnits(size, 6);
    const levE18 = parseUnits(leverage, 18);

    writeContract({
      address: contracts.positionManager,
      abi: positionManagerAbi,
      functionName: "openPosition",
      args: [size1e6, levE18, side === "long"]
    });
  }

  function onClose() {
    if (!address) return;
    writeContract({
      address: contracts.positionManager,
      abi: positionManagerAbi,
      functionName: "closePosition",
      args: []
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-panel/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">Trade</div>
          <div className="text-lg font-semibold">Perpetual</div>
        </div>
        <div className="rounded-full border border-border bg-panel2 px-3 py-1 text-xs text-slate-300">Sepolia</div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              side === "long" ? "border-cyan-400/60 bg-cyan-400/10" : "border-border bg-panel2"
            }`}
            onClick={() => setSide("long")}
          >
            Long
          </button>
          <button
            className={`rounded-xl border px-3 py-2 text-sm ${
              side === "short" ? "border-fuchsia-400/60 bg-fuchsia-400/10" : "border-border bg-panel2"
            }`}
            onClick={() => setSide("short")}
          >
            Short
          </button>
        </div>

        <Field label="Collateral (USDC)" value={collateral} onChange={setCollateral} placeholder="100" />
        <Field label="Position Size (USD)" value={size} onChange={setSize} placeholder="1000" />
        <Field label="Leverage (x)" value={leverage} onChange={setLeverage} placeholder="5" />

        <div className="rounded-xl border border-border bg-panel2 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Free collateral</span>
            <span className="font-medium">{freeCollateral ? `${Number(freeCollateral) / 1e6} USDC` : "—"}</span>
          </div>
        </div>

        <div className="mt-1 grid gap-2">
          <button
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
            disabled={!isConnected || isPending || isConfirming}
            onClick={onDeposit}
          >
            Deposit collateral
          </button>
          <button
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
            disabled={!isConnected || isPending || isConfirming}
            onClick={onOpen}
          >
            Open position
          </button>
          <button
            className="rounded-xl border border-border bg-panel2 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            disabled={!isConnected || isPending || isConfirming}
            onClick={onClose}
          >
            Close position
          </button>
        </div>

        {status ? <div className="text-xs text-slate-400">{status}</div> : null}

        {!isConnected ? (
          <div className="mt-2 text-xs text-slate-500">Connect your wallet to trade.</div>
        ) : (
          <div className="mt-2 text-xs text-slate-500">
            Note: deployed Sepolia contracts currently accept placeholder encrypted inputs. Zama relayer encryption is
            wired under `lib/encryption.ts` for the next Solidity iteration.
          </div>
        )}
      </div>
    </section>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-slate-400">{props.label}</span>
      <input
        className="rounded-xl border border-border bg-panel2 px-3 py-2 text-sm outline-none ring-0 focus:border-slate-500"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        inputMode="decimal"
      />
    </label>
  );
}

