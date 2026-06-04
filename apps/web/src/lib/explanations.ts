import type { MatchInsights } from "./match-insights";
import { attr, type RatingProfile } from "./team-ratings";
import { percent } from "./format";

export interface Explanation {
  reasons: string[];
  risks: string[];
}

/**
 * Plain-English reasons behind a team's title probability, built from its
 * rating profile and simulated route. Tied to real numbers so it reads as
 * evidence, not flavour text.
 */
export function winnerExplanation(input: {
  profile: RatingProfile;
  groupQualify: number;
  reachQF: number;
  reachSemi: number;
  toughestRival?: string;
  depthRival?: string;
}): Explanation {
  const { profile } = input;
  const reasons: string[] = [];
  const risks: string[] = [];

  if (profile.overallPercentile >= 80) reasons.push("Elite overall team rating");
  else if (profile.overallPercentile >= 60) reasons.push("Strong overall team rating");

  const attack = attr(profile, "attack");
  if (attack.percentile >= 80) reasons.push(`Top-tier attack rating (${attack.value})`);

  const setPiece = attr(profile, "setPiece");
  if (setPiece.percentile >= 75) reasons.push("Dangerous from set pieces");

  reasons.push(`Favourable group — ${percent(input.groupQualify, 0)} projected to qualify`);

  if (input.reachSemi >= 0.25) {
    reasons.push(`Clear route to the latter stages (${percent(input.reachSemi, 0)} to reach the semis)`);
  } else if (input.reachQF >= 0.4) {
    reasons.push(`Solid route through the early knockouts (${percent(input.reachQF, 0)} to reach the quarters)`);
  }

  const experience = attr(profile, "experience");
  if (experience.percentile >= 75) reasons.push("Strong tournament experience");

  // Risks — the weakest part of the profile + draw-based threats.
  const weakest = [...profile.attributes].sort((a, b) => a.percentile - b.percentile)[0]!;
  risks.push(`${weakest.label} below the elite tier (${weakest.value})`);
  if (input.toughestRival) risks.push(`Tough projected matchup if drawn against ${input.toughestRival}`);
  if (input.depthRival) risks.push(`Lower squad depth than ${input.depthRival}`);

  return { reasons, risks };
}

/**
 * Reasons behind a single match projection, derived from the match insights
 * (and optionally each side's rating profile).
 */
export function matchExplanation(
  i: MatchInsights,
  opts: { profileA?: RatingProfile; profileB?: RatingProfile; pathAdvantageFor?: "A" | "B" } = {},
): string[] {
  const a = i.teamA.name;
  const b = i.teamB.name;
  const reasons: string[] = [];

  const setPieceTeam = i.cornersA >= i.cornersB ? a : b;
  const openPlayTeam = i.xgA >= i.xgB ? a : b;
  reasons.push(`${setPieceTeam} are stronger on set pieces`);
  reasons.push(`${openPlayTeam} are stronger in open play`);

  const ratingGap = Math.abs(i.teamA.rating - i.teamB.rating);
  if (ratingGap < 60) reasons.push("Similar defensive ratings keep it tight");
  else reasons.push(`${i.teamA.rating > i.teamB.rating ? a : b} carry the clear ratings edge`);

  if (opts.profileA && opts.profileB) {
    const fA = attr(opts.profileA, "form");
    const fB = attr(opts.profileB, "form");
    if (Math.abs(fA.value - fB.value) >= 6) {
      reasons.push(`${fA.value > fB.value ? a : b} arrive in better form`);
    }
  }

  if (opts.pathAdvantageFor) {
    reasons.push(`${opts.pathAdvantageFor === "A" ? a : b} receive a small tournament-path advantage`);
  }
  return reasons;
}
