import "server-only";

import {
  createFormat,
  simulateTournament,
  type SimulationResult,
  type Team,
  type TeamRating,
  type Tournament,
} from "@worldcuplens/core";
import { getDataProvider } from "./provider";
import type { TeamLite } from "./match-insights";

export const WORLD_CUP_SLUG = "world-cup-2026";

const STAGE_ORDER = [
  "group",
  "round-of-32",
  "round-of-16",
  "quarter-final",
  "semi-final",
  "final",
  "winner",
] as const;

function reachAtLeast(reached: Record<string, number>, stage: string): number {
  const idx = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);
  if (idx < 0) return 0;
  let sum = 0;
  for (let i = idx; i < STAGE_ORDER.length; i++) sum += reached[STAGE_ORDER[i]!] ?? 0;
  return sum;
}

function toLite(team: Team, rating: number): TeamLite {
  return {
    id: team.id,
    name: team.name,
    rating,
    ...(team.code ? { code: team.code } : {}),
    ...(team.countryCode ? { countryCode: team.countryCode } : {}),
  };
}

export interface RankedTeam {
  team: TeamLite;
  /** The probability this ranking is about (0–1). */
  value: number;
}

export interface GroupQualification {
  id: string;
  name: string;
  teams: Array<{ team: TeamLite; qualify: number }>;
}

export interface StageStep {
  stage: string;
  label: string;
  prob: number;
}

export interface Mover {
  team: TeamLite;
  delta: number;
  champion: number;
}

export interface WorldCupInsights {
  slug: string;
  name: string;
  competition: string;
  season: string;
  teamCount: number;
  iterations: number;
  winners: RankedTeam[];
  finalists: RankedTeam[];
  semifinalists: RankedTeam[];
  darkHorses: RankedTeam[];
  overrated: { team: TeamLite; champion: number; ratingRank: number; championRank: number };
  groups: GroupQualification[];
  routeToFinal: { team: TeamLite; steps: StageStep[] };
  movers: { up: Mover[]; down: Mover[] };
}

interface TournamentSim {
  tournament: Tournament;
  teamsById: Map<string, TeamLite>;
  result: SimulationResult;
}

const simCache = new Map<string, TournamentSim>();
let cachedInsights: WorldCupInsights | undefined;

async function runSim(slug: string, seed: number, iterations: number): Promise<TournamentSim | null> {
  const key = `${slug}:${seed}:${iterations}`;
  const hit = simCache.get(key);
  if (hit) return hit;

  const provider = getDataProvider();
  const tournament = await provider.getTournament(slug);
  if (!tournament) return null;

  const [teams, ratings] = await Promise.all([
    provider.getTeams(tournament.id),
    provider.getRatings(tournament.id),
  ]);
  const ratingMap = new Map<string, TeamRating>(ratings.map((r) => [r.teamId, r]));
  const teamsById = new Map<string, TeamLite>(
    teams.map((t) => [t.id, toLite(t, ratingMap.get(t.id)?.rating ?? 1500)]),
  );

  const result = simulateTournament({
    format: createFormat(tournament.format),
    teamIds: tournament.teamIds,
    ratings: ratingMap,
    options: { iterations, seed },
  });

  const sim: TournamentSim = { tournament, teamsById, result };
  simCache.set(key, sim);
  return sim;
}

/** Team pool (with ratings) for the simulator's selectors. */
export async function getTeamPool(slug: string): Promise<TeamLite[]> {
  const sim = await runSim(slug, 0xc0ffee, 1);
  if (!sim) return [];
  return [...sim.teamsById.values()].sort((a, b) => b.rating - a.rating);
}

/** Run + derive every World Cup dashboard panel (memoised per process). */
export async function getWorldCupInsights(): Promise<WorldCupInsights | null> {
  if (cachedInsights) return cachedInsights;

  const iterations = 8000;
  const [current, previous] = await Promise.all([
    runSim(WORLD_CUP_SLUG, 0xc0ffee, iterations),
    runSim(WORLD_CUP_SLUG, 0x1234abcd, iterations),
  ]);
  if (!current || !previous) return null;

  const { tournament, teamsById, result } = current;
  const lite = (id: string): TeamLite => teamsById.get(id) ?? { id, name: id, rating: 1500 };

  const byChampion = [...result.teams].sort((a, b) => b.champion - a.champion);
  const ratingRank = new Map(
    [...teamsById.values()].sort((a, b) => b.rating - a.rating).map((t, i) => [t.id, i + 1]),
  );
  const championRank = new Map(byChampion.map((t, i) => [t.teamId, i + 1]));

  const winners: RankedTeam[] = byChampion.slice(0, 8).map((t) => ({ team: lite(t.teamId), value: t.champion }));

  const finalists: RankedTeam[] = [...result.teams]
    .sort((a, b) => b.finalist - a.finalist)
    .slice(0, 6)
    .map((t) => ({ team: lite(t.teamId), value: t.finalist }));

  const withSemi = result.teams.map((t) => ({
    teamId: t.teamId,
    semi: reachAtLeast(t.reachedStage, "semi-final"),
  }));
  const semifinalists: RankedTeam[] = [...withSemi]
    .sort((a, b) => b.semi - a.semi)
    .slice(0, 6)
    .map((t) => ({ team: lite(t.teamId), value: t.semi }));

  // Dark horses: lower-rated sides (outside the top 12 by rating) with the
  // strongest deep-run probability.
  const darkHorses: RankedTeam[] = [...withSemi]
    .filter((t) => (ratingRank.get(t.teamId) ?? 99) > 12)
    .sort((a, b) => b.semi - a.semi)
    .slice(0, 3)
    .map((t) => ({ team: lite(t.teamId), value: t.semi }));

  // Most "overrated": among the 10 strongest on paper, the biggest drop from
  // rating rank to championship rank.
  let overrated = { teamId: byChampion[0]!.teamId, drop: -Infinity, champion: 0 };
  for (const t of result.teams) {
    const rr = ratingRank.get(t.teamId) ?? 99;
    const cr = championRank.get(t.teamId) ?? 99;
    if (rr <= 10 && cr - rr > overrated.drop) {
      overrated = { teamId: t.teamId, drop: cr - rr, champion: t.champion };
    }
  }

  const groups: GroupQualification[] =
    tournament.format.kind === "group-knockout"
      ? tournament.format.groups.map((g) => ({
          id: g.id,
          name: g.name,
          teams: g.teamIds
            .map((id) => {
              const t = result.teams.find((x) => x.teamId === id);
              const qualify = t ? 1 - (t.reachedStage["group"] ?? 0) : 0;
              return { team: lite(id), qualify };
            })
            .sort((a, b) => b.qualify - a.qualify),
        }))
      : [];

  const favorite = byChampion[0]!;
  const favReached = favorite.reachedStage;
  const routeToFinal = {
    team: lite(favorite.teamId),
    steps: [
      { stage: "round-of-16", label: "Reach R16", prob: reachAtLeast(favReached, "round-of-16") },
      { stage: "quarter-final", label: "Reach QF", prob: reachAtLeast(favReached, "quarter-final") },
      { stage: "semi-final", label: "Reach SF", prob: reachAtLeast(favReached, "semi-final") },
      { stage: "final", label: "Reach Final", prob: reachAtLeast(favReached, "final") },
      { stage: "winner", label: "Lift the trophy", prob: favorite.champion },
    ],
  };

  // "What changed?" — deltas vs the previous simulation batch.
  const prevChampion = new Map(previous.result.teams.map((t) => [t.teamId, t.champion]));
  const deltas = result.teams
    .map((t) => ({
      teamId: t.teamId,
      champion: t.champion,
      delta: t.champion - (prevChampion.get(t.teamId) ?? 0),
    }))
    .filter((d) => Math.abs(d.delta) > 0.002);
  const up = [...deltas]
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)
    .map((d) => ({ team: lite(d.teamId), delta: d.delta, champion: d.champion }));
  const down = [...deltas]
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3)
    .map((d) => ({ team: lite(d.teamId), delta: d.delta, champion: d.champion }));

  cachedInsights = {
    slug: tournament.slug,
    name: tournament.name,
    competition: tournament.competition,
    season: tournament.season,
    teamCount: tournament.teamIds.length,
    iterations: result.iterations,
    winners,
    finalists,
    semifinalists,
    darkHorses,
    overrated: {
      team: lite(overrated.teamId),
      champion: overrated.champion,
      ratingRank: ratingRank.get(overrated.teamId) ?? 0,
      championRank: championRank.get(overrated.teamId) ?? 0,
    },
    groups,
    routeToFinal,
    movers: { up, down },
  };
  return cachedInsights;
}
