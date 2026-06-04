import type { Metadata } from "next";
import { getTeamPool, WORLD_CUP_SLUG } from "@/lib/wc-insights";
import { SimulatorClient } from "@/components/SimulatorClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Match Simulator — Project any World Cup match-up",
  description:
    "Pick two teams and simulate the match: win probabilities, most likely scorelines, expected goals, shots, corners, cards, tempo and a plain-English match pattern.",
  alternates: { canonical: "/simulator" },
};

export default async function SimulatorPage() {
  const teams = await getTeamPool(WORLD_CUP_SLUG);

  if (teams.length < 2) {
    return (
      <>
        <h1 className="page-title">Match Simulator</h1>
        <p className="muted">No teams available to simulate right now.</p>
      </>
    );
  }

  const ids = new Set(teams.map((t) => t.id));
  const defaultA = ids.has("eng") ? "eng" : teams[0]!.id;
  const defaultB = ids.has("bra") ? "bra" : teams[1]!.id;

  return (
    <>
      <p className="eyebrow">Match Simulator</p>
      <h1 className="page-title">Simulate any match-up</h1>
      <p className="muted">
        Pick two teams to project win probabilities, likely scorelines and the full match pattern.
        Hit <strong>Run again</strong> for a fresh simulation, or copy the share text.
      </p>

      <SimulatorClient teams={teams} defaultA={defaultA} defaultB={defaultB} />

      <p className="faint" style={{ marginTop: "1.2rem", fontSize: "0.82rem" }}>
        Projections come from an Elo-based expected-goals model. For analysis and entertainment —
        not betting advice.
      </p>
    </>
  );
}
