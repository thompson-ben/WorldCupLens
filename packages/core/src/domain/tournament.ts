import type { FormatConfig } from "./format.js";
import type { Sport } from "./sport.js";

/**
 * A single edition of a competition. Everything tournament-specific (which
 * teams, which format, which season) lives here as data, so the rest of the
 * platform stays generic across World Cups, continental cups and leagues.
 */
export interface Tournament {
  id: string;
  /** URL-safe identifier used for SEO-friendly routing, e.g. "world-cup-2026". */
  slug: string;
  name: string;
  sport: Sport;
  /** Competition family, e.g. "FIFA World Cup", "UEFA Champions League". */
  competition: string;
  /** Season label, e.g. "2026" or "2024-25". */
  season: string;
  startDate?: string;
  endDate?: string;
  /** Host country/countries for national-team tournaments. */
  hosts?: string[];
  format: FormatConfig;
  teamIds: string[];
}
