"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Jan", value: 20 },
  { name: "Feb", value: 40 },
  { name: "Mar", value: 60 },
  { name: "Apr", value: 80 },
  { name: "May", value: 100 },
  { name: "Jun", value: 130 },
  { name: "Jul", value: 160 },
];

export default function FeaturedSectionStats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto text-left py-20 md:py-28">
      <div className="px-4">
        <h3 className="mb-10 text-lg font-medium text-foreground sm:text-xl lg:text-4xl">
          Built for confidential onchain trading.{" "}
          <span className="text-sm text-muted-foreground sm:text-base lg:text-4xl">
            CipherPerps combines oracle pricing, liquidation-aware risk checks, and a Zama FHE-ready path for private
            position parameters.
          </span>
        </h3>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-medium text-foreground sm:text-3xl">1</p>
            <p className="text-sm text-muted-foreground">Market (ETH/USD)</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground sm:text-3xl">1e8</p>
            <p className="text-sm text-muted-foreground">Oracle decimals</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground sm:text-3xl">Sepolia</p>
            <p className="text-sm text-muted-foreground">Demo network</p>
          </div>
          <div>
            <p className="text-2xl font-medium text-foreground sm:text-3xl">FHE-ready</p>
            <p className="text-sm text-muted-foreground">Encrypted parameters</p>
          </div>
        </div>
      </div>

      <div className="mt-10 h-48 w-full px-4">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="cipherBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={false}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cipherBlue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full rounded-xl border border-border bg-panel/30" />
        )}
      </div>
    </section>
  );
}

