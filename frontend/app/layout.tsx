import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { Metadata } from "next";
import { Providers } from "./providers";
import BlackBackground from "@/components/ui/black-background";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CipherPerps",
  description: "Confidential perpetuals on Sepolia (Zama FHE-ready).",
  openGraph: {
    title: "CipherPerps",
    description: "Confidential perpetuals on Sepolia (Zama FHE-ready).",
    url: "/",
    siteName: "CipherPerps",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CipherPerps",
    description: "Confidential perpetuals on Sepolia (Zama FHE-ready).",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BlackBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

