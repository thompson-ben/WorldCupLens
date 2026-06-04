import type { Match, Team, TeamRating, Tournament } from "@worldcuplens/core";

/** Lightweight tournament listing for index pages. */
export interface TournamentSummary {
  id: string;
  slug: string;
  name: string;
  competition: string;
  season: string;
  sport: Tournament["sport"];
  teamCount: number;
}

/**
 * The seam between the platform and any data source. Swap implementations
 * (static seed, Supabase, a third-party stats API) without touching the UI or
 * the simulation engine. All methods are async so remote providers fit the
 * same contract as in-memory ones.
 */
export interface DataProvider {
  listTournaments(): Promise<TournamentSummary[]>;
  getTournament(slug: string): Promise<Tournament | null>;
  getTeams(tournamentId: string): Promise<Team[]>;
  getRatings(tournamentId: string): Promise<TeamRating[]>;
  getMatches(tournamentId: string): Promise<Match[]>;
}
