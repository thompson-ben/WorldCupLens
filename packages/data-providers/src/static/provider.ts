import type { Match, Team, TeamRating, Tournament } from "@worldcuplens/core";
import type { DataProvider, TournamentSummary } from "../provider.js";
import { ratingById, teamById } from "./registry.js";
import { SEED_TOURNAMENTS } from "./seed/tournaments.js";

/**
 * In-memory provider backed by the seed data. Ideal for local development,
 * tests and demos. Implements the same async contract as remote providers so
 * it can be swapped for {@link SupabaseDataProvider} with no call-site changes.
 *
 * Pre-scheduled fixtures are not seeded yet — `getMatches` returns an empty
 * list, and the simulation engine generates fixtures it needs on the fly.
 */
export class StaticDataProvider implements DataProvider {
  private readonly tournaments: Tournament[];

  constructor(tournaments: Tournament[] = SEED_TOURNAMENTS) {
    this.tournaments = tournaments;
  }

  private find(tournamentId: string): Tournament | undefined {
    return this.tournaments.find((t) => t.id === tournamentId);
  }

  async listTournaments(): Promise<TournamentSummary[]> {
    return this.tournaments.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      competition: t.competition,
      season: t.season,
      sport: t.sport,
      teamCount: t.teamIds.length,
    }));
  }

  async getTournament(slug: string): Promise<Tournament | null> {
    return this.tournaments.find((t) => t.slug === slug) ?? null;
  }

  async getTeams(tournamentId: string): Promise<Team[]> {
    const tournament = this.find(tournamentId);
    if (!tournament) return [];
    return tournament.teamIds.map(teamById);
  }

  async getRatings(tournamentId: string): Promise<TeamRating[]> {
    const tournament = this.find(tournamentId);
    if (!tournament) return [];
    return tournament.teamIds.map(ratingById);
  }

  async getMatches(_tournamentId: string): Promise<Match[]> {
    return [];
  }
}
