"use client";

import { useEffect, useMemo, useState } from "react";
import { computeMatchInsights, type TeamLite } from "@/lib/match-insights";
import { track } from "@/lib/analytics";
import { percent } from "@/lib/format";
import { RouteCard, type RouteData } from "./cards/RouteCard";

function difficultyLabel(avg: number): string {
  if (avg >= 1950) return "Brutal";
  if (avg >= 1850) return "Hard";
  if (avg >= 1750) return "Moderate";
  return "Kind";
}

function buildRoute(
  team: TeamLite,
  opponents: TeamLite[],
  meta: { title: string; tone: RouteData["tone"] },
): RouteData {
  // Knockout advance probability vs each opponent (draws settled ~50/50).
  const advances = opponents.map((o) => {
    const m = computeMatchInsights(team, o, { neutralVenue: true });
    return m.winA + 0.5 * m.draw;
  });
  const reachFinal = advances.slice(0, 4).reduce((a, b) => a * b, 1);
  const winnerProb = reachFinal * (advances[4] ?? 0);
  const avgOpponent = opponents.reduce((s, o) => s + o.rating, 0) / opponents.length;
  return {
    title: meta.title,
    tone: meta.tone,
    difficulty: difficultyLabel(avgOpponent),
    opponents,
    avgOpponent,
    finalProb: reachFinal,
    winnerProb,
  };
}

/**
 * "What if the draw fell differently?" — compares a team's chances across a
 * kind, median and tough hypothetical knockout path. Designed to be debated
 * and shared.
 */
export function RouteComparisonClient({ teams, defaultTeam }: { teams: TeamLite[]; defaultTeam: string }) {
  const byId = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const sorted = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
  const [teamId, setTeamId] = useState(defaultTeam);
  const team = byId.get(teamId) ?? teams[0]!;

  useEffect(() => {
    track({ type: "view_route", team: teamId, route: "comparison" });
  }, [teamId]);

  const routes = useMemo(() => {
    const others = teams.filter((t) => t.id !== team.id).sort((a, b) => b.rating - a.rating);
    const n = others.length;
    const take = (start: number) => others.slice(start, start + 5);
    const tough = buildRoute(team, take(0), { title: "Toughest plausible route", tone: "tough" });
    const median = buildRoute(team, take(Math.floor(n * 0.4)), { title: "Median route", tone: "median" });
    const kind = buildRoute(team, take(Math.floor(n * 0.62)), { title: "Kindest plausible route", tone: "kind" });
    // share text per route
    const withShare = (r: RouteData): RouteData => ({
      ...r,
      shareText: `${team.name} — ${r.title}: ${percent(r.finalProb, 0)} to reach the final, ${percent(
        r.winnerProb,
        0,
      )} to win it. Via WorldCupLens`,
    });
    return { kind: withShare(kind), median: withShare(median), tough: withShare(tough) };
  }, [team, teams]);

  const ratio = routes.tough.finalProb > 0 ? routes.kind.finalProb / routes.tough.finalProb : 0;

  return (
    <>
      <div className="glass" style={{ marginTop: "1rem" }}>
        <label className="field-label" htmlFor="route-team">
          Pick a team
        </label>
        <select id="route-team" className="select" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          {sorted.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {ratio >= 1.2 && (
        <p className="callout" style={{ marginTop: "1rem" }}>
          {team.name}&apos;s chance of reaching the final is roughly <strong>{ratio.toFixed(1)}×</strong>{" "}
          higher on the kindest plausible route than the toughest — the draw matters enormously.
        </p>
      )}

      <div className="grid grid-3">
        <RouteCard route={routes.kind} />
        <RouteCard route={routes.median} />
        <RouteCard route={routes.tough} />
      </div>
    </>
  );
}
