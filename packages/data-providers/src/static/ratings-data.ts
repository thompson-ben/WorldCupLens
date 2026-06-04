import ratingsJson from "./data/ratings.json";

export type QualificationStatus = "qualified" | "host" | "playoff" | "eliminated" | "unknown";

export interface RecentResult {
  date: string;
  opponent: string;
  score: string;
  result: "W" | "D" | "L";
}

export interface TeamRatingMeta {
  name: string;
  rating: number;
  previousRating: number;
  /** Rating change vs ~12 months ago (Elo points). */
  movement: number;
  /** Recent-form score 0–100 from the last ~10 results. */
  formScore: number;
  qualification: QualificationStatus;
  lastMatchDate: string | null;
  recent: RecentResult[];
}

export interface RatingsSnapshot {
  /** When the snapshot was generated. */
  generatedAt: string;
  /** Date of the most recent match included. */
  ratingDate: string;
  source: string;
  method: string;
  teamCount: number;
  teams: Record<string, TeamRatingMeta>;
}

/**
 * Real, data-derived team ratings — see scripts/ingest-football-data.mts.
 * Covers the national teams we track; club ratings remain illustrative.
 */
export const RATINGS = ratingsJson as RatingsSnapshot;

export function getRatingMeta(teamId: string): TeamRatingMeta | undefined {
  return RATINGS.teams[teamId];
}
