import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "CipherPerps",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_WC_PROJECT_ID",
  chains: [sepolia],
  ssr: true
});

