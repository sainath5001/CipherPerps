import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CipherPerps",
  description: "Confidential perpetuals on Sepolia (Zama FHE-ready).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

