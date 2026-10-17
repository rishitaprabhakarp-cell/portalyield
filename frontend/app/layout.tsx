import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PortalYield — RWA Yield Protocol on Portaldot",
  description: "Tokenize Real World Assets. Earn on-chain yield. Powered by Portaldot Network V3.0.",
  openGraph: {
    title: "PortalYield",
    description: "RWA Yield Protocol on Portaldot Network V3.0",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
