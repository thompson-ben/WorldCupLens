import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const siteName = "WorldCupLens";
const description =
  "Simulations, odds and analytics for football tournaments — World Cup, Euros, Champions League, Premier League and more.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${siteName} — Tournament simulations & analytics`,
    template: `%s · ${siteName}`,
  },
  description,
  applicationName: siteName,
  openGraph: { title: siteName, description, type: "website", siteName },
  twitter: { card: "summary_large_image", title: siteName, description },
};

// Mobile-first: correct scaling on phones, themed browser chrome.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1120",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              World<span>Cup</span>Lens
            </Link>
            <Link href="/tournaments" className="muted">
              Tournaments
            </Link>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            Monte Carlo projections from a tournament-agnostic simulation engine.
            Figures are illustrative.
          </div>
        </footer>
      </body>
    </html>
  );
}
