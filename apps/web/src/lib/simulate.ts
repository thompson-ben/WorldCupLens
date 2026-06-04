import "server-only";

import {
  createFormat,
  simulateTournament,
  type Team,
  type TeamRating,
  type SimulationResult,
  type Tournament,
} from "@worldcuplens/core";
import { getDataProvider } from "./provider";

export interface TournamentSimulation {
  tournament: Tournament;
  teamsById: Map<string, Team>;
  result: SimulationResult;
}

/**
 * Load a tournament's teams + ratings from the active data provider and run a
 * Monte Carlo simulation. Fully generic — works for any seeded tournament
 * because the format strategy is built from the tournament's own config.
 */
export async function runTournamentSimulation(
  slug: string,
  iterations = 10_000,
): Promise<TournamentSimulation | null> {
  const provider = getDataProvider();
  const tournament = await provider.getTournament(slug);
  if (!tournament) return null;

  const [teams, ratings] = await Promise.all([
    provider.getTeams(tournament.id),
    provider.getRatings(tournament.id),
  ]);

  const ratingMap = new Map<string, TeamRating>(ratings.map((r) => [r.teamId, r]));
  const result = simulateTournament({
    format: createFormat(tournament.format),
    teamIds: tournament.teamIds,
    ratings: ratingMap,
    options: { iterations, seed: 0xc0ffee },
  });

  const teamsById = new Map(teams.map((t) => [t.id, t]));
  return { tournament, teamsById, result };
}
