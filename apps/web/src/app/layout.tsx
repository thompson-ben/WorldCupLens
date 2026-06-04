import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const siteName = "WorldCupLens";
const description =
  "Run thousands of match simulations and explore win probabilities, likely scorelines, shock risks and routes to the final — for the World Cup, Euros, Champions League and more.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "WorldCupLens — Simulate the World Cup before it happens",
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
  themeColor: "#06090f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand" aria-label="WorldCupLens home">
              <span className="dot" aria-hidden />
              World<span>Cup</span>Lens
            </Link>
            <nav className="nav-links">
              <Link href="/daily-brief">Daily Brief</Link>
              <Link href="/world-cup">World Cup 2026</Link>
              <Link href="/golden-boot">Golden Boot</Link>
              <Link href="/route-comparison">Routes</Link>
              <Link href="/methodology">Methodology</Link>
              <Link href="/simulator" className="primary">
                Simulator
              </Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            Monte Carlo projections from a tournament-agnostic simulation engine.
            Figures are model-based projections, not betting advice.
          </div>
        </footer>
      </body>
    </html>
  );
}
