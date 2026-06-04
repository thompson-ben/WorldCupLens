import type { MatchInsights } from "./match-insights";

export type ConfidenceCategory = "Low" | "Medium" | "High" | "Very High";

export interface ConfidenceResult {
  pct: number;
  category: ConfidenceCategory;
  reason: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function confidenceCategory(pct: number): ConfidenceCategory {
  if (pct >= 85) return "Very High";
  if (pct >= 70) return "High";
  if (pct >= 55) return "Medium";
  return "Low";
}

/**
 * How decisive a match projection is. A clear rating gap → a confident call;
 * evenly matched sides → a wider range of plausible outcomes.
 */
export function matchConfidence(insights: MatchInsights): ConfidenceResult {
  const favWin = Math.max(insights.winA, insights.winB);
  const pct = clamp(Math.round(favWin * 100 + 22), 45, 96);
  const close = Math.abs(insights.winA - insights.winB) < 0.12;
  const reason = close
    ? "Teams are closely matched, creating a wider range of outcomes."
    : "A clear rating edge makes this projection more decisive.";
  return { pct, category: confidenceCategory(pct), reason };
}

/**
 * How reliable a tournament outcome is, driven by how consistently a team
 * reaches the latter stages across simulations.
 */
export function tournamentConfidence(reachSemiFinal: number): ConfidenceResult {
  const pct = clamp(Math.round(45 + reachSemiFinal * 60), 45, 95);
  const reason =
    reachSemiFinal >= 0.4
      ? "Consistently progresses deep into simulations."
      : reachSemiFinal >= 0.2
        ? "Often reaches the latter stages, but outcomes vary."
        : "Outcomes vary widely across simulations.";
  return { pct, category: confidenceCategory(pct), reason };
}
