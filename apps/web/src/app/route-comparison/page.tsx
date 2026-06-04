import type { Metadata } from "next";
import { getTeamPool, WORLD_CUP_SLUG } from "@/lib/wc-insights";
import { RouteComparisonClient } from "@/components/RouteComparisonClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Route Comparison — How much does the draw matter?",
  description:
    "Compare a team's World Cup chances across a kind, median and tough hypothetical knockout path. See how dramatically the draw changes the route to the final.",
  alternates: { canonical: "/route-comparison" },
};

export default async function RouteComparisonPage() {
  const teams = await getTeamPool(WORLD_CUP_SLUG);
  if (teams.length < 6) {
    return (
      <>
        <h1 className="page-title">Route Comparison</h1>
        <p className="muted">Not enough teams to compare routes right now.</p>
      </>
    );
  }
  const ids = new Set(teams.map((t) => t.id));
  const defaultTeam = ids.has("eng") ? "eng" : teams[0]!.id;

  return (
    <>
      <p className="eyebrow">Viral tool</p>
      <h1 className="page-title">How much does the draw matter?</h1>
      <p className="muted" style={{ maxWidth: "54ch" }}>
        Pick a team and compare three hypothetical knockout paths. The opponents are illustrative,
        but the gap between a kind and a brutal route shows just how much the draw can swing a
        team&apos;s chances.
      </p>

      <RouteComparisonClient teams={teams} defaultTeam={defaultTeam} />

      <p className="faint" style={{ marginTop: "1.2rem", fontSize: "0.82rem" }}>
        Paths are hypothetical scenarios, not the official bracket. Advance chances come from the
        match model with knockout draws settled like a shootout.
      </p>
    </>
  );
}
