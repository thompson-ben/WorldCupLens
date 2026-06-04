import type { TeamLite } from "./match-insights";

/**
 * Component ratings shown on the transparency pages. NOTE: these are currently
 * *derived* from each team's overall strength rating plus a stable per-attribute
 * offset — a transparent placeholder breakdown until granular per-skill data is
 * sourced. The derivation is deterministic, so a team always shows the same
 * profile. The methodology page discloses this.
 */
export const RATING_ATTRIBUTES = [
  { key: "attack", label: "Attack" },
  { key: "defence", label: "Defence" },
  { key: "form", label: "Form" },
  { key: "squadDepth", label: "Squad Depth" },
  { key: "experience", label: "Experience" },
  { key: "setPiece", label: "Set-Piece Threat" },
  { key: "pressResistance", label: "Press Resistance" },
  { key: "transition", label: "Transition Threat" },
  { key: "discipline", label: "Discipline" },
] as const;

export type RatingAttributeKey = (typeof RATING_ATTRIBUTES)[number]["key"];

export interface AttributeScore {
  key: RatingAttributeKey;
  label: string;
  value: number;
  percentile: number;
}

export interface RatingProfile {
  team: TeamLite;
  overall: number;
  overallPercentile: number;
  attributes: AttributeScore[];
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Map an Elo-style rating to a 0–100 overall score. */
export function overallFromRating(rating: number): number {
  return clamp(Math.round(55 + ((rating - 1450) / 700) * 40), 45, 99);
}

function attributeValue(
  team: TeamLite,
  overall: number,
  key: string,
  formById?: Map<string, number>,
): number {
  // Use the real recent-form score when available; other components remain a
  // transparent, derived breakdown of the overall rating (disclosed on-site).
  if (key === "form" && formById?.has(team.id)) {
    return clamp(Math.round(formById.get(team.id)!), 1, 99);
  }
  const offset = (hash(`${team.id}:${key}`) % 1700) / 100 - 8.5; // −8.5 … +8.49
  return clamp(Math.round(overall + offset), 40, 99);
}

function percentileOf(value: number, all: number[]): number {
  const below = all.filter((v) => v < value).length;
  return Math.round((below / Math.max(1, all.length - 1)) * 100);
}

/**
 * Build rating profiles for a whole pool so percentiles are comparable. Pass
 * the same pool you derived ratings from.
 */
export function buildRatingProfiles(
  pool: TeamLite[],
  opts: { formById?: Map<string, number> } = {},
): Map<string, RatingProfile> {
  const overalls = pool.map((t) => overallFromRating(t.rating));
  const valuesByKey = new Map<string, number[]>();
  for (const attr of RATING_ATTRIBUTES) {
    valuesByKey.set(
      attr.key,
      pool.map((t) => attributeValue(t, overallFromRating(t.rating), attr.key, opts.formById)),
    );
  }

  const profiles = new Map<string, RatingProfile>();
  pool.forEach((team) => {
    const overall = overallFromRating(team.rating);
    const attributes: AttributeScore[] = RATING_ATTRIBUTES.map((attr) => {
      const value = attributeValue(team, overall, attr.key, opts.formById);
      return {
        key: attr.key,
        label: attr.label,
        value,
        percentile: percentileOf(value, valuesByKey.get(attr.key)!),
      };
    });
    profiles.set(team.id, {
      team,
      overall,
      overallPercentile: percentileOf(overall, overalls),
      attributes,
    });
  });
  return profiles;
}

export function attr(profile: RatingProfile, key: RatingAttributeKey): AttributeScore {
  return profile.attributes.find((a) => a.key === key)!;
}
