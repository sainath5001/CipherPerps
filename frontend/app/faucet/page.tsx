import { FaucetCard } from "@/components/FaucetCard";

export default function FaucetPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-center text-3xl font-semibold tracking-tight">Testnet Faucet</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Mint free test USDC on Sepolia to try CipherPerps.
        </p>

        <div className="mt-10">
          <FaucetCard />
        </div>
      </div>
    </main>
  );
}

