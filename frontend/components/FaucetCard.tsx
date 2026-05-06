"use client";

import Link from "next/link";
import { useMemo } from "react";
import { parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from "wagmi/chains";

import { Button } from "@/components/ui/button";
import { CONTRACTS, mockUsdcAbi } from "@/lib/contracts";

const MINT_AMOUNT = parseUnits("10000", 6);

export function FaucetCard() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: sepolia.id,
  });

  const usdc = CONTRACTS.sepolia.usdc;
  const spender = CONTRACTS.sepolia.positionManager;

  const { data: balance } = useReadContract({
    address: usdc,
    abi: mockUsdcAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: { enabled: Boolean(address), refetchInterval: 4000 },
  });

  const { data: allowance } = useReadContract({
    address: usdc,
    abi: mockUsdcAbi,
    functionName: "allowance",
    args: address ? [address, spender] : undefined,
    chainId: sepolia.id,
    query: { enabled: Boolean(address), refetchInterval: 4000 },
  });

  const status = useMemo(() => {
    if (isPending) return "Confirm in wallet…";
    if (isConfirming) return "Transaction pending…";
    if (isSuccess) return "Success";
    if (error) return (error as any).shortMessage ?? error.message;
    return null;
  }, [error, isConfirming, isPending, isSuccess]);

  const balanceNum = balance ? Number(balance) / 1e6 : 0;
  const allowanceNum = allowance ? Number(allowance) / 1e6 : 0;

  function onMint() {
    if (!address) return;
    writeContract({
      address: usdc,
      abi: mockUsdcAbi,
      functionName: "mint",
      args: [address, MINT_AMOUNT],
      chainId: sepolia.id,
    });
  }

  function onApprove() {
    writeContract({
      address: usdc,
      abi: mockUsdcAbi,
      functionName: "approve",
      args: [spender, MINT_AMOUNT],
      chainId: sepolia.id,
    });
  }

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-panel/30 p-6 backdrop-blur">
      <div className="text-center">
        <div className="text-2xl font-semibold">Test USDC</div>
        <div className="mt-1 text-sm text-muted-foreground">MockUSDC on Sepolia</div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-panel2 p-4">
        <div className="text-sm text-slate-300">
          Mint <span className="font-semibold text-slate-100">10,000 USDC</span> to your wallet. This is a test token
          with no real value — mint as many times as you need.
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-panel/40 p-3">
            <div className="text-xs text-muted-foreground">Wallet balance</div>
            <div className="mt-1 text-sm font-semibold">{isConnected ? `${balanceNum.toFixed(2)} USDC` : "—"}</div>
          </div>
          <div className="rounded-xl border border-border bg-panel/40 p-3">
            <div className="text-xs text-muted-foreground">Allowance to PositionManager</div>
            <div className="mt-1 text-sm font-semibold">{isConnected ? `${allowanceNum.toFixed(2)} USDC` : "—"}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1 rounded-2xl" onClick={onMint} disabled={!isConnected || isPending || isConfirming}>
            Mint 10,000 USDC
          </Button>
          <Button
            className="flex-1 rounded-2xl"
            variant="outline"
            onClick={onApprove}
            disabled={!isConnected || isPending || isConfirming}
          >
            Approve for trading
          </Button>
        </div>

        {status ? <div className="mt-3 text-xs text-muted-foreground">{status}</div> : null}
      </div>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        After approving, go to{" "}
        <Link href="/app" className="text-foreground underline underline-offset-4">
          /app
        </Link>{" "}
        and deposit collateral.
      </div>

      <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
        <div>
          <span className="font-medium text-slate-300">MockUSDC:</span>{" "}
          <a
            className="underline underline-offset-4"
            href={`https://sepolia.etherscan.io/address/${usdc}`}
            target="_blank"
            rel="noreferrer"
          >
            {usdc}
          </a>
        </div>
        <div>
          <span className="font-medium text-slate-300">PositionManager:</span>{" "}
          <a
            className="underline underline-offset-4"
            href={`https://sepolia.etherscan.io/address/${spender}`}
            target="_blank"
            rel="noreferrer"
          >
            {spender}
          </a>
        </div>
      </div>
    </section>
  );
}

