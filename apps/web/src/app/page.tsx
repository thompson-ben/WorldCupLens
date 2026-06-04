import Link from "next/link";
import { getDataProvider } from "@/lib/provider";
import { getHomeInsights } from "@/lib/intelligence";
import { TournamentCard } from "@/components/TournamentCard";
import { IntelInsightCard } from "@/components/cards/IntelInsightCard";

export const revalidate = 3600;

export default async function HomePage() {
  const [tournaments, insights] = await Promise.all([
    getDataProvider().listTournaments(),
    getHomeInsights(),
  ]);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">FIFA World Cup 2026 · powered by simulation</p>
        <h1 className="hero-title">
          Simulate the <em>World Cup</em> before it happens.
        </h1>
        <p className="hero-sub">
          Run thousands of match simulations, explore likely scorelines, shock risks, routes to the
          final and hidden match patterns.
        </p>
        <div className="cta-row">
          <Link className="btn" href="/simulator">
            ⚽ Run a Match Simulation
          </Link>
          <Link className="btn ghost" href="/world-cup">
            View Tournament Predictions
          </Link>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h2 className="section-title" style={{ marginTop: "1.6rem" }}>
              Today&apos;s lens
            </h2>
            <p className="section-sub">Fresh reads from the latest simulation batch — and why.</p>
          </div>
          <Link className="btn ghost sm" href="/daily-brief">
            Daily Brief →
          </Link>
        </div>
        <div className="grid grid-3">
          {insights.map((insight) => (
            <IntelInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Go deeper</h2>
        <div className="grid grid-3">
          <Link className="card" href="/route-comparison">
            <span className="tag">Viral tool</span>
            <h3>🧭 Route Comparison</h3>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              How much does the draw matter? Compare kind vs brutal knockout paths.
            </p>
          </Link>
          <Link className="card" href="/golden-boot">
            <span className="tag">Golden Boot</span>
            <h3>👟 Top scorer race</h3>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Projected goals and Golden Boot probability for the tournament&apos;s best.
            </p>
          </Link>
          <Link className="card" href="/methodology">
            <span className="tag">Transparency</span>
            <h3>🧠 How it works</h3>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Monte Carlo, Elo and expected goals — explained for football fans.
            </p>
          </Link>
        </div>
      </section>

      <hr className="divider" />

      <section>
        <h2 className="section-title">Explore tournaments</h2>
        <p className="section-sub">
          Choose a tournament to explore projections, likely outcomes and route-to-final scenarios.
        </p>
        <div className="grid grid-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </section>
    </>
  );
}
