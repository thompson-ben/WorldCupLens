/**
 * @worldcuplens/data-providers — pluggable data access.
 *
 * Everything depends on the {@link DataProvider} interface, never a concrete
 * source, so static seed data, Supabase, or a third-party stats API are
 * interchangeable.
 */
export type { DataProvider, TournamentSummary } from "./provider.js";
export { StaticDataProvider } from "./static/provider.js";
export { SupabaseDataProvider } from "./supabase/provider.js";
export { SEED_TOURNAMENTS } from "./static/seed/tournaments.js";
export { teamById, ratingById, type RegistryEntry } from "./static/registry.js";
export {
  RATINGS,
  getRatingMeta,
  type RatingsSnapshot,
  type TeamRatingMeta,
  type RecentResult,
  type QualificationStatus,
} from "./static/ratings-data.js";
export { WC_FIXTURES, type WorldCupFixture, type FixturesSnapshot } from "./static/fixtures-data.js";
