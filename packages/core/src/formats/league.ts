import type { LeagueFormatConfig } from "../domain/format.js";
import { buildStandings, rankStandings } from "../domain/standings.js";
import { STAGE } from "../domain/stage.js";
import { playFixtures, roundRobin } from "./helpers.js";
import type { FormatPlayInput, TournamentFormat, TournamentResult } from "./strategy.js";

/** Round-robin league (e.g. Premier League): the table order is the result. */
export class LeagueFormat implements TournamentFormat {
  readonly kind = "league";

  constructor(private readonly config: LeagueFormatConfig) {}

  play({ teamIds, simulateMatch, rng }: FormatPlayInput): TournamentResult {
    const fixtures = roundRobin(teamIds, this.config.legs);
    const played = playFixtures(fixtures, STAGE.League, "league", false, simulateMatch);
    const standings = buildStandings(teamIds, played, this.config);
    const ranking = rankStandings(standings, () => rng.next() - 0.5).map((r) => r.teamId);

    const reachedStage: Record<string, string> = {};
    for (const id of teamIds) reachedStage[id] = STAGE.League;
    if (ranking[0]) reachedStage[ranking[0]] = STAGE.Winner;

    return { ranking, reachedStage };
  }
}
