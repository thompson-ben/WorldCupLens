import type { LeaguePhaseKnockoutFormatConfig } from "../domain/format.js";
import { buildStandings, rankStandings } from "../domain/standings.js";
import { STAGE } from "../domain/stage.js";
import type { Rng } from "../simulation/rng.js";
import { type Fixture, playFixtures, runKnockout } from "./helpers.js";
import type { FormatPlayInput, TournamentFormat, TournamentResult } from "./strategy.js";

function shuffle<T>(items: T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Single league phase across one combined table, then a knockout bracket for
 * the top qualifiers — the post-2024 Champions League shape. Composes the
 * round-robin and knockout primitives rather than reimplementing them.
 *
 * The league phase uses the circle method and keeps the first `matchesPerTeam`
 * rounds, so each team plays that many distinct opponents from a single table.
 */
export class LeaguePhaseKnockoutFormat implements TournamentFormat {
  readonly kind = "league-phase-knockout";

  constructor(private readonly config: LeaguePhaseKnockoutFormatConfig) {}

  private leaguePhaseFixtures(teamIds: string[], rng: Rng): Fixture[] {
    const teams = shuffle(teamIds, rng);
    if (teams.length % 2 === 1) teams.push("__bye__");
    const n = teams.length;
    const rounds = Math.min(this.config.matchesPerTeam, n - 1);
    const fixtures: Fixture[] = [];

    const rotation = [...teams];
    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < n / 2; i++) {
        const home = rotation[i]!;
        const away = rotation[n - 1 - i]!;
        if (home !== "__bye__" && away !== "__bye__") {
          fixtures.push({ homeTeamId: home, awayTeamId: away });
        }
      }
      // Rotate all but the first entry (standard circle method).
      rotation.splice(1, 0, rotation.pop()!);
    }
    return fixtures;
  }

  play({ teamIds, simulateMatch, rng }: FormatPlayInput): TournamentResult {
    const reachedStage: Record<string, string> = {};
    for (const id of teamIds) reachedStage[id] = STAGE.LeaguePhase;

    const fixtures = this.leaguePhaseFixtures(teamIds, rng);
    const played = playFixtures(fixtures, STAGE.LeaguePhase, "league", false, simulateMatch);
    const table = rankStandings(
      buildStandings(teamIds, played, this.config),
      () => rng.next() - 0.5,
    ).map((r) => r.teamId);

    const qualifiers = table.slice(0, this.config.knockoutQualifiers);
    const missed = table.slice(this.config.knockoutQualifiers);

    const knockout = runKnockout(qualifiers, {
      legs: this.config.knockoutLegs,
      neutralVenue: false,
      simulateMatch,
    });

    Object.assign(reachedStage, knockout.reachedStage);
    return { ranking: [...knockout.ranking, ...missed], reachedStage };
  }
}
