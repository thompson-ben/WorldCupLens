import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorldCupInsights } from "@/lib/wc-insights";
import { flagEmoji, percent } from "@/lib/format";
import { ProbRow } from "@/components/ui/ProbRow";
import { InsightCard } from "@/components/InsightCard";
import { TournamentWinnerCard } from "@/components/cards/TournamentWinnerCard";
import { RouteToFinalCard } from "@/components/cards/RouteToFinalCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "World Cup 2026 — Prediction Dashboard",
  description:
    "Live simulation dashboard for the FIFA World Cup 2026: winner probabilities, projected finalists, dark horses, group qualification chances and routes to the final.",
  alternates: { canonical: "/world-cup" },
};

export default async function WorldCupDashboard() {
  const wc = await getWorldCupInsights();
  if (!wc) notFound();

  return (
    <>
      <p className="eyebrow">{wc.competition} · {wc.season}</p>
      <h1 className="page-title">World Cup 2026 — Prediction Dashboard</h1>
      <p className="muted">
        {wc.teamCount} teams · {wc.iterations.toLocaleString()} tournament simulations. Projections
        update as ratings and results change.
      </p>
      <div className="actions">
        <Link className="btn" href="/simulator">
          ⚽ Open Match Simulator
        </Link>
        <Link className="btn ghost" href="/tournaments/world-cup-2026/simulate">
          Full probability table
        </Link>
      </div>

      <div className="grid grid-2">
        <TournamentWinnerCard
          icon="🏆"
          kicker="Tournament Winner"
          title="Title probabilities"
          variant="gold"
          entries={wc.winners}
          shareText={`${wc.name} title race: ${wc.winners
            .slice(0, 3)
            .map((w) => `${w.team.name} ${percent(w.value, 0)}`)
            .join(", ")} — via WorldCupLens`}
        />
        <RouteToFinalCard
          team={wc.routeToFinal.team}
          steps={wc.routeToFinal.steps}
          shareText={`${wc.routeToFinal.team.name}'s route to the ${wc.name} final — via WorldCupLens`}
        />
      </div>

      <div className="grid grid-2">
        <TournamentWinnerCard
          icon="🥈"
          kicker="Finalists"
          title="Most likely to reach the final"
          variant="blue"
          entries={wc.finalists}
        />
        <TournamentWinnerCard
          icon="🎯"
          kicker="Semi-finalists"
          title="Most likely to reach the last four"
          variant="blue"
          entries={wc.semifinalists}
        />
      </div>

      <div className="grid grid-3">
        <TournamentWinnerCard
          icon="🐎"
          kicker="Dark Horses"
          title="Outsiders built for a deep run"
          variant="green"
          entries={wc.darkHorses}
        />
        <InsightCard
          data={{
            icon: "🔍",
            kicker: "Reality Check",
            title: `Most overrated: ${wc.overrated.team.name}`,
            summary: `Ranked #${wc.overrated.ratingRank} on paper, but only the #${wc.overrated.championRank} likeliest champion (${percent(
              wc.overrated.champion,
            )}). The draw and depth work against them.`,
            meta: "Rating vs simulated outcome",
            shareText: `Reality check: ${wc.overrated.team.name} look overrated for the ${wc.name} — strong on paper, #${wc.overrated.championRank} to actually win it. Via WorldCupLens`,
          }}
        />
        <MoversPanel up={wc.movers.up} down={wc.movers.down} />
      </div>

      <h2 className="section-title">Group qualification probabilities</h2>
      <p className="section-sub">Chance each team advances from its group to the knockout stage.</p>
      <div className="grid grid-3">
        {wc.groups.map((g) => (
          <div className="glass" key={g.id}>
            <div className="ic-kicker">{g.name}</div>
            <div style={{ marginTop: "0.3rem" }}>
              {g.teams.map((t) => (
                <ProbRow key={t.team.id} team={t.team} value={t.qualify} max={1} variant="blue" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MoversPanel({
  up,
  down,
}: {
  up: { team: { id: string; name: string; countryCode?: string }; delta: number }[];
  down: { team: { id: string; name: string; countryCode?: string }; delta: number }[];
}) {
  const Row = ({
    team,
    delta,
    dir,
  }: {
    team: { id: string; name: string; countryCode?: string };
    delta: number;
    dir: "up" | "down";
  }) => (
    <div className="probrow" style={{ gridTemplateColumns: "1fr auto" }}>
      <div className="prob-name">
        <span aria-hidden>{flagEmoji(team.countryCode)}</span>
        <span className="nm">{team.name}</span>
      </div>
      <div className="prob-val" style={{ color: dir === "up" ? "var(--green)" : "var(--red)" }}>
        {dir === "up" ? "▲" : "▼"} {Math.abs(delta * 100).toFixed(1)}
      </div>
    </div>
  );

  return (
    <div className="glass">
      <div className="ic-kicker">🔄 What changed?</div>
      <h3 className="ic-title" style={{ marginBottom: "0.1rem" }}>
        Latest simulation shifts
      </h3>
      <p className="ic-summary" style={{ marginBottom: "0.3rem" }}>
        Title-probability change vs the previous batch (points).
      </p>
      {up.map((m) => (
        <Row key={m.team.id} team={m.team} delta={m.delta} dir="up" />
      ))}
      {down.map((m) => (
        <Row key={m.team.id} team={m.team} delta={m.delta} dir="down" />
      ))}
    </div>
  );
}
