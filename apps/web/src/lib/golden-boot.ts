import type { TeamLite } from "./match-insights";

/**
 * Top-scorer projections. Player data is illustrative/mock for now but shaped
 * to swap for a live feed later. Expected goals scale with a player's finishing
 * rating, their team's attacking strength and how many matches their team is
 * projected to play (from the tournament simulation).
 */
export interface PlayerSeed {
  name: string;
  teamId: string;
  /** Finishing/threat rating, 0–100. */
  finishing: number;
}

export interface GoldenBootEntry {
  name: string;
  teamId: string;
  teamName: string;
  countryCode?: string;
  expectedGoals: number;
  goldenBootProb: number;
}

const PLAYERS: PlayerSeed[] = [
  { name: "Kylian Mbappé", teamId: "fra", finishing: 93 },
  { name: "Erling Haaland", teamId: "nor", finishing: 92 },
  { name: "Harry Kane", teamId: "eng", finishing: 90 },
  { name: "Vinícius Jr", teamId: "bra", finishing: 88 },
  { name: "Julián Álvarez", teamId: "arg", finishing: 85 },
  { name: "Lamine Yamal", teamId: "esp", finishing: 84 },
  { name: "Jude Bellingham", teamId: "eng", finishing: 84 },
  { name: "Rodrygo", teamId: "bra", finishing: 82 },
  { name: "Lautaro Martínez", teamId: "arg", finishing: 86 },
  { name: "Cristiano Ronaldo", teamId: "por", finishing: 83 },
  { name: "Rafael Leão", teamId: "por", finishing: 81 },
  { name: "Florian Wirtz", teamId: "ger", finishing: 82 },
  { name: "Jamal Musiala", teamId: "ger", finishing: 83 },
  { name: "Cody Gakpo", teamId: "ned", finishing: 81 },
  { name: "Romelu Lukaku", teamId: "bel", finishing: 82 },
  { name: "Darwin Núñez", teamId: "uru", finishing: 80 },
  { name: "Luis Díaz", teamId: "col", finishing: 82 },
  { name: "Christian Pulisic", teamId: "usa", finishing: 78 },
  { name: "Son Heung-min", teamId: "kor", finishing: 82 },
  { name: "Victor Osimhen", teamId: "nga", finishing: 85 },
  { name: "Dušan Vlahović", teamId: "srb", finishing: 81 },
  { name: "Rasmus Højlund", teamId: "den", finishing: 79 },
  { name: "Takefusa Kubo", teamId: "jpn", finishing: 78 },
  { name: "Achraf Hakimi", teamId: "mar", finishing: 76 },
];

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

/** Expected matches a team plays: 3 group games + each knockout round reached. */
function expectedMatches(reached: Record<string, number>): number {
  const knockout = ["round-of-32", "round-of-16", "quarter-final", "semi-final", "final"];
  return 3 + knockout.reduce((sum, s) => sum + reachAtLeast(reached, s), 0);
}

export function computeGoldenBoot(
  teams: Array<{ teamId: string; reachedStage: Record<string, number> }>,
  teamsById: Map<string, TeamLite>,
): GoldenBootEntry[] {
  const reachedById = new Map(teams.map((t) => [t.teamId, t.reachedStage]));

  const raw = PLAYERS.flatMap((p) => {
    const team = teamsById.get(p.teamId);
    const reached = reachedById.get(p.teamId);
    if (!team || !reached) return [];
    const attackFactor = 0.9 + (team.rating - 1500) / 600; // ~0.7–1.9
    const perMatch = 0.42 * (p.finishing / 80) * Math.max(0.6, attackFactor);
    const expectedGoals = perMatch * expectedMatches(reached);
    return [{ player: p, team, expectedGoals }];
  });

  // Golden Boot probability via softmax over expected goals.
  const T = 1.4;
  const weights = raw.map((r) => Math.exp(r.expectedGoals / T));
  const totalW = weights.reduce((a, b) => a + b, 0) || 1;

  return raw
    .map((r, idx) => ({
      name: r.player.name,
      teamId: r.team.id,
      teamName: r.team.name,
      ...(r.team.countryCode ? { countryCode: r.team.countryCode } : {}),
      expectedGoals: Math.round(r.expectedGoals * 10) / 10,
      goldenBootProb: weights[idx]! / totalW,
    }))
    .sort((a, b) => b.goldenBootProb - a.goldenBootProb);
}
