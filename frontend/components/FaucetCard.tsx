"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertCircle, CheckCircle2, Copy, Droplets, Info, Loader2 } from "lucide-react";
import { parseUnits } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlowCard } from "@/components/ui/spotlight-card";
import { CONTRACTS, mockUsdcAbi } from "@/lib/contracts";

const MINT_AMOUNT = parseUnits("10000", 6);

type ActivityKind = "mint" | "approve";

type Activity = {
  hash: string;
  kind: ActivityKind;
  timestamp: number;
};

function formatAddressShort(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function formatTimeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

export function FaucetCard() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: sepolia.id,
  });

  const pendingKindRef = useRef<ActivityKind | null>(null);
  const [pendingAction, setPendingAction] = useState<ActivityKind | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

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

  useEffect(() => {
    if (error) setPendingAction(null);
  }, [error]);

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    const kind = pendingKindRef.current ?? "mint";
    pendingKindRef.current = null;
    setPendingAction(null);
    setActivities((prev) => {
      if (prev.some((a) => a.hash === txHash)) return prev;
      return [{ hash: txHash, kind, timestamp: Date.now() }, ...prev].slice(0, 15);
    });
  }, [isSuccess, txHash]);

  const status = useMemo(() => {
    if (isPending) return "Confirm in wallet…";
    if (isConfirming) return "Transaction pending…";
    if (isSuccess) return "Success";
    if (error) return (error as { shortMessage?: string }).shortMessage ?? error.message;
    return null;
  }, [error, isConfirming, isPending, isSuccess]);

  const balanceNum = balance ? Number(balance) / 1e6 : 0;
  const allowanceNum = allowance ? Number(allowance) / 1e6 : 0;

  function onMint() {
    if (!address) return;
    pendingKindRef.current = "mint";
    setPendingAction("mint");
    writeContract({
      address: usdc,
      abi: mockUsdcAbi,
      functionName: "mint",
      args: [address, MINT_AMOUNT],
      chainId: sepolia.id,
    });
  }

  function onApprove() {
    pendingKindRef.current = "approve";
    setPendingAction("approve");
    writeContract({
      address: usdc,
      abi: mockUsdcAbi,
      functionName: "approve",
      args: [spender, MINT_AMOUNT],
      chainId: sepolia.id,
    });
  }

  const busy = isPending || isConfirming;

  return (
    <GlowCard glowColor="blue" customSize fluid className="mx-auto w-full max-w-6xl shadow-black/40">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/15 p-4 ring-1 ring-primary/25">
            <Droplets className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Testnet Faucet</h1>
        <p className="text-lg text-muted-foreground">
          Mint free MockUSDC on Sepolia and approve the app so you can try CipherPerps.
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg shadow-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Droplets className="h-5 w-5 text-primary" />
              Mint test USDC
            </CardTitle>
            <CardDescription>
              Your connected wallet receives <strong className="text-foreground">10,000</strong> test USDC per mint.
              Connect Sepolia, then mint and approve for trading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faucet-wallet">Connected wallet</Label>
              <div className="flex gap-2">
                <Input
                  id="faucet-wallet"
                  readOnly
                  value={isConnected && address ? address : ""}
                  placeholder="Not connected — use the button below or the header"
                  className="font-mono text-xs md:text-sm"
                />
                {address ? (
                  <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => copyText(address)}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy address</span>
                  </Button>
                ) : null}
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground/90">
                <span className="font-medium text-foreground">See balance in MetaMask</span>
                <p className="mt-1 text-muted-foreground">
                  On <strong className="text-foreground">Sepolia</strong>, use{" "}
                  <strong className="text-foreground">Assets → Import tokens</strong> and paste the MockUSDC contract
                  address (<strong className="text-foreground">mUSDC</strong>,{" "}
                  <strong className="text-foreground">6</strong> decimals).
                </p>
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/80 p-3">
                <div className="text-xs text-muted-foreground">Wallet balance</div>
                <div className="mt-1 text-sm font-semibold">{isConnected ? `${balanceNum.toFixed(2)} USDC` : "—"}</div>
              </div>
              <div className="rounded-lg bg-muted/80 p-3">
                <div className="text-xs text-muted-foreground">Allowance (PositionManager)</div>
                <div className="mt-1 text-sm font-semibold">{isConnected ? `${allowanceNum.toFixed(2)} USDC` : "—"}</div>
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            ) : null}

            {!error && status && status !== "Success" ? (
              <p className="text-sm text-muted-foreground">{status}</p>
            ) : null}
          </CardContent>
          <CardFooter className="flex-col gap-3">
            {!isConnected ? (
              <div className="flex w-full justify-center [&_button]:min-h-11 [&_button]:rounded-md">
                <ConnectButton chainStatus="icon" showBalance={false} />
              </div>
            ) : (
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <Button className="w-full gap-2" size="lg" onClick={onMint} disabled={busy}>
                  {busy && pendingAction === "mint" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Droplets className="h-4 w-4" />
                      Mint 10,000 USDC
                    </>
                  )}
                </Button>
                <Button className="w-full gap-2" size="lg" variant="outline" onClick={onApprove} disabled={busy}>
                  {busy && pendingAction === "approve" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    "Approve for trading"
                  )}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>

        <Card className="shadow-lg shadow-black/20">
          <CardHeader>
            <CardTitle className="text-xl">Faucet information</CardTitle>
            <CardDescription>MockUSDC on Sepolia — test tokens only, no real value.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/80 p-3">
                <span className="text-sm font-medium">Amount per mint</span>
                <Badge variant="secondary">10,000 mUSDC</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/80 p-3">
                <span className="text-sm font-medium">Cooldown</span>
                <Badge variant="secondary">None</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/80 p-3">
                <span className="text-sm font-medium">Network</span>
                <Badge variant="secondary">Sepolia</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/80 p-3">
                <span className="text-sm font-medium">Daily limit</span>
                <Badge variant="secondary">Unlimited</Badge>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3 text-xs text-muted-foreground">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-foreground">MockUSDC</span>
                <Button variant="ghost" size="sm" className="h-7 shrink-0 gap-1 px-2 text-xs" onClick={() => copyText(usdc)}>
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <a className="break-all font-mono underline underline-offset-2 hover:text-foreground" href={`https://sepolia.etherscan.io/address/${usdc}`} target="_blank" rel="noreferrer">
                {usdc}
              </a>
              <div className="pt-2">
                <span className="font-medium text-foreground">PositionManager</span>
                <a
                  className="mt-1 block break-all font-mono underline underline-offset-2 hover:text-foreground"
                  href={`https://sepolia.etherscan.io/address/${spender}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {spender}
                </a>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              After approving, open{" "}
              <Link href="/app" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90">
                /app
              </Link>{" "}
              to deposit collateral.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg shadow-black/20">
        <CardHeader>
          <CardTitle className="text-xl">Recent activity</CardTitle>
          <CardDescription>Mint and approve transactions from this browser session.</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No activity yet. Mint or approve to see transactions here.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((tx) => (
                <div
                  key={tx.hash}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/15 p-2 ring-1 ring-primary/20">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          className="font-mono text-sm font-medium text-primary underline-offset-4 hover:underline"
                          href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {formatAddressShort(tx.hash)}
                        </a>
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => copyText(tx.hash)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatTimeAgo(tx.timestamp)}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="font-semibold text-primary">{tx.kind === "mint" ? "+10,000 mUSDC" : "Approve"}</div>
                    <Badge variant={tx.kind === "mint" ? "default" : "secondary"} className="capitalize">
                      {tx.kind}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </GlowCard>
  );
}
