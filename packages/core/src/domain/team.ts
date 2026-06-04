/**
 * A competitor. Deliberately generic: works for national teams (with a
 * `countryCode`) and for clubs (without one). Strength/ratings live separately
 * in {@link TeamRating} so identity data stays decoupled from model inputs.
 */
export interface Team {
  id: string;
  name: string;
  shortName?: string;
  /** Tricode/abbreviation, e.g. "BRA", "MCI". */
  code?: string;
  /** ISO 3166-1 code for national teams; omitted for clubs. */
  countryCode?: string;
  crestUrl?: string;
}

/**
 * Model inputs describing a team's strength on an Elo-like scale. Decoupled
 * from {@link Team} so ratings can come from any provider or be recomputed
 * without disturbing identity records.
 */
export interface TeamRating {
  teamId: string;
  /** Overall strength; higher is stronger. Even contest ≈ equal ratings. */
  rating: number;
}
