"use client";

import { useMemo } from "react";
import { sepolia } from "wagmi/chains";
import { CONTRACTS } from "@/lib/contracts";

export function useContracts() {
  return useMemo(() => CONTRACTS[sepolia.name.toLowerCase() as "sepolia"], []);
}

