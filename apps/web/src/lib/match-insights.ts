import { createRng, expectedGoals } from "@worldcuplens/core";

/** Minimal team shape the product UI passes around. */
export interface TeamLite {
  id: string;
  name: string;
  code?: string;
  countryCode?: string;
  rating: number;
}

export interface Scoreline {
  home: number;
  away: number;
  prob: number;
}

export interface MatchInsights {
  teamA: TeamLite;
  teamB: TeamLite;
  /** Outcome probabilities (0–1). */
  winA: number;
  draw: number;
  winB: number;
  xgA: number;
  xgB: number;
  mostLikelyScore: { home: number; away: number };
  topScorelines: Scoreline[];
  shotsA: number;
  shotsB: number;
  sotA: number;
  sotB: number;
  cornersA: number;
  cornersB: number;
  cardsTotal: number;
  tempo: { score: number; label: string };
  upsetRisk: { pct: number; label: RiskLabel };
  confidence: { pct: number; label: ConfidenceLabel };
  favorite: "A" | "B" | "even";
  narrative: string;
  shareText: string;
}

export type RiskLabel = "Low" | "Medium" | "High";
export type ConfidenceLabel = "Low" | "Medium" | "High";

const MAX_GOALS = 9;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pct = (x: number) => Math.round(x * 100);

const FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800];
function poissonPmf(k: number, lambda: number): number {
  return (Math.exp(-lambda) * lambda ** k) / (FACTORIALS[k] ?? Infinity);
}

/**
 * Derive a full match preview from two teams' ratings: outcome probabilities,
 * a scoreline distribution, expected goals and a set of fan-friendly secondary
 * metrics (shots, corners, cards, tempo, upset risk) plus a plain-English read.
 *
 * Uses the engine's own expected-goals model, then computes the scoreline
 * distribution analytically (two independent Poissons). A `seed` adds a small,
 * reproducible wobble so "Run again" feels alive without changing the story.
 */
export function computeMatchInsights(
  teamA: TeamLite,
  teamB: TeamLite,
  opts: { neutralVenue?: boolean; seed?: number } = {},
): MatchInsights {
  const neutralVenue = opts.neutralVenue ?? true;
  let { home: xgA, away: xgB } = expectedGoals(teamA.rating, teamB.rating, { neutralVenue });

  // Small reproducible wobble for "Run again".
  if (opts.seed !== undefined) {
    const rng = createRng(opts.seed);
    xgA *= 0.94 + rng.next() * 0.12;
    xgB *= 0.94 + rng.next() * 0.12;
  }

  // Scoreline distribution from two independent Poissons.
  let winA = 0;
  let draw = 0;
  let winB = 0;
  const scorelines: Scoreline[] = [];
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const prob = poissonPmf(h, xgA) * poissonPmf(a, xgB);
      if (h > a) winA += prob;
      else if (h < a) winB += prob;
      else draw += prob;
      scorelines.push({ home: h, away: a, prob });
    }
  }
  const total = winA + draw + winB || 1;
  winA /= total;
  draw /= total;
  winB /= total;

  scorelines.sort((x, y) => y.prob - x.prob);
  const topScorelines = scorelines.slice(0, 4);
  const mostLikelyScore = { home: topScorelines[0]!.home, away: topScorelines[0]!.away };

  // Secondary metrics — transparent heuristics from xG + match shape.
  const shotsFromXg = (xg: number) => clamp(Math.round(xg / 0.13 + 2.5), 5, 22);
  const shotsA = shotsFromXg(xgA);
  const shotsB = shotsFromXg(xgB);
  const sotA = clamp(Math.round(shotsA * 0.35), 2, 11);
  const sotB = clamp(Math.round(shotsB * 0.35), 2, 11);
  const cornersA = clamp(Math.round(shotsA * 0.42), 2, 12);
  const cornersB = clamp(Math.round(shotsB * 0.42), 2, 12);

  const closeness = 1 - Math.abs(winA - winB);
  const cardsTotal = clamp(Math.round(3 + closeness * 2.5), 2, 7);

  const totalXg = xgA + xgB;
  const tempoScore = clamp(Math.round(totalXg / 0.42), 1, 10);
  const tempoLabel =
    tempoScore >= 8 ? "End-to-end" : tempoScore >= 6 ? "Open" : tempoScore >= 4 ? "Balanced" : "Controlled";

  const favWin = Math.max(winA, winB);
  const ratingGap = Math.abs(teamA.rating - teamB.rating);
  const favorite: MatchInsights["favorite"] =
    ratingGap < 25 || Math.abs(winA - winB) < 0.05 ? "even" : winA > winB ? "A" : "B";

  const underdogWin = Math.min(winA, winB);
  const upsetPct = pct(underdogWin);
  const upsetLabel: RiskLabel =
    favorite === "even" ? "Medium" : upsetPct >= 30 ? "High" : upsetPct >= 17 ? "Medium" : "Low";

  const confidencePct = pct(favWin);
  const confidenceLabel: ConfidenceLabel =
    confidencePct >= 55 ? "High" : confidencePct >= 44 ? "Medium" : "Low";

  const narrative = buildNarrative({
    teamA,
    teamB,
    winA,
    winB,
    draw,
    totalXg,
    favorite,
    upsetLabel,
    cornersA,
    cornersB,
    xgA,
    xgB,
  });

  const shareText = buildShareText(teamA, teamB, winA, draw, winB, mostLikelyScore, tempoLabel, upsetLabel);

  return {
    teamA,
    teamB,
    winA,
    draw,
    winB,
    xgA,
    xgB,
    mostLikelyScore,
    topScorelines,
    shotsA,
    shotsB,
    sotA,
    sotB,
    cornersA,
    cornersB,
    cardsTotal,
    tempo: { score: tempoScore, label: tempoLabel },
    upsetRisk: { pct: upsetPct, label: upsetLabel },
    confidence: { pct: confidencePct, label: confidenceLabel },
    favorite,
    narrative,
    shareText,
  };
}

function buildNarrative(d: {
  teamA: TeamLite;
  teamB: TeamLite;
  winA: number;
  winB: number;
  draw: number;
  totalXg: number;
  favorite: MatchInsights["favorite"];
  upsetLabel: RiskLabel;
  cornersA: number;
  cornersB: number;
  xgA: number;
  xgB: number;
}): string {
  const a = d.teamA.name;
  const b = d.teamB.name;
  const fav = d.favorite === "A" ? a : d.favorite === "B" ? b : null;
  const dog = d.favorite === "A" ? b : d.favorite === "B" ? a : null;

  const parts: string[] = [];
  if (!fav) {
    parts.push(`Too close to call — a genuine coin-flip between ${a} and ${b}.`);
  } else if (d.upsetLabel === "High") {
    parts.push(`${fav} start as favourites, but ${dog} carry a real upset threat.`);
  } else if (d.upsetLabel === "Low") {
    parts.push(`${fav} are clear favourites and should control the game.`);
  } else {
    parts.push(`${fav} edge the matchup, though ${dog} can make it uncomfortable.`);
  }

  if (d.totalXg >= 3) parts.push("Expect chances at both ends — this projects as an open game.");
  else if (d.totalXg <= 2.1) parts.push("Likely a tight, low-scoring, tactical affair.");
  else parts.push("A balanced contest with moments of quality deciding it.");

  const setPiece = d.cornersA >= d.cornersB ? a : b;
  const openPlay = d.xgA >= d.xgB ? a : b;
  if (setPiece !== openPlay) {
    parts.push(`${setPiece} should edge set pieces, while ${openPlay} create more from open play.`);
  }
  return parts.join(" ");
}

function buildShareText(
  teamA: TeamLite,
  teamB: TeamLite,
  winA: number,
  draw: number,
  winB: number,
  score: { home: number; away: number },
  tempoLabel: string,
  upsetLabel: string,
): string {
  return [
    `${teamA.name} ${pct(winA)}% · Draw ${pct(draw)}% · ${teamB.name} ${pct(winB)}%`,
    `Most likely score: ${score.home}-${score.away}`,
    `${tempoLabel} game · Upset risk: ${upsetLabel}`,
    `— simulated on WorldCupLens`,
  ].join("\n");
}
