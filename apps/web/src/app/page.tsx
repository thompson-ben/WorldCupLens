import Link from "next/link";
import { getDataProvider } from "@/lib/provider";
import { getWorldCupInsights } from "@/lib/wc-insights";
import { computeMatchInsights } from "@/lib/match-insights";
import { percent } from "@/lib/format";
import { TournamentCard } from "@/components/TournamentCard";
import { InsightCard } from "@/components/InsightCard";
import { ShockRiskCard } from "@/components/cards/ShockRiskCard";
import { TournamentWinnerCard } from "@/components/cards/TournamentWinnerCard";
import { RouteToFinalCard } from "@/components/cards/RouteToFinalCard";

export const revalidate = 3600;

export default async function HomePage() {
  const [tournaments, wc] = await Promise.all([
    getDataProvider().listTournaments(),
    getWorldCupInsights(),
  ]);

  // Featured "shock risk": the favourite against the strongest dark horse.
  let shock: React.ReactNode = null;
  let finalCard: React.ReactNode = null;
  let darkHorseCard: React.ReactNode = null;
  let routeCard: React.ReactNode = null;

  if (wc) {
    const fav = wc.winners[0]!.team;
    const dh = wc.darkHorses[0]?.team ?? wc.winners[5]!.team;
    const favTeam = fav.rating >= dh.rating ? fav : dh;
    const dogTeam = fav.rating >= dh.rating ? dh : fav;
    const m = computeMatchInsights(favTeam, dogTeam, { neutralVenue: true });
    shock = (
      <ShockRiskCard
        favorite={favTeam}
        underdog={dogTeam}
        upsetPct={m.upsetRisk.pct}
        level={m.upsetRisk.label}
        summary={m.narrative}
        shareText={m.shareText}
      />
    );

    const f0 = wc.finalists[0]!;
    const f1 = wc.finalists[1]!;
    finalCard = (
      <InsightCard
        data={{
          icon: "🏆",
          kicker: "Most Likely Final",
          title: `${f0.team.name} vs ${f1.team.name}`,
          summary: `Our most frequent finalists — reaching the final in ${percent(f0.value, 0)} and ${percent(
            f1.value,
            0,
          )} of simulations.`,
          meta: `${wc.name}`,
          shareText: `Projected ${wc.name} final: ${f0.team.name} vs ${f1.team.name} — simulated on WorldCupLens`,
        }}
      />
    );

    darkHorseCard = (
      <TournamentWinnerCard
        icon="🐎"
        kicker="Dark Horse Watch"
        title="Outsiders built for a deep run"
        variant="green"
        entries={wc.darkHorses}
        shareText={`Dark horses to watch at the ${wc.name}: ${wc.darkHorses
          .map((d) => d.team.name)
          .join(", ")} — via WorldCupLens`}
      />
    );

    routeCard = (
      <RouteToFinalCard
        team={wc.routeToFinal.team}
        steps={wc.routeToFinal.steps}
        shareText={`${wc.routeToFinal.team.name}'s route to the ${wc.name} final — via WorldCupLens`}
      />
    );
  }

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
        <h2 className="section-title">Today&apos;s lens</h2>
        <p className="section-sub">Fresh reads from the latest simulation batch.</p>
        <div className="grid grid-3">
          {shock}
          {finalCard}
          {darkHorseCard}
          {routeCard}
          <InsightCard
            data={{
              icon: "👟",
              kicker: "Golden Boot Lens",
              title: "Top-scorer projections",
              summary:
                "Projected Golden Boot race with per-player goal distributions — landing in an upcoming release.",
              meta: "In development",
            }}
          />
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
