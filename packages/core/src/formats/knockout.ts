import type { KnockoutFormatConfig } from "../domain/format.js";
import { runKnockout } from "./helpers.js";
import type { FormatPlayInput, TournamentFormat, TournamentResult } from "./strategy.js";

/** Pure single-elimination bracket. */
export class KnockoutFormat implements TournamentFormat {
  readonly kind = "knockout";

  constructor(private readonly config: KnockoutFormatConfig) {}

  play({ teamIds, simulateMatch }: FormatPlayInput): TournamentResult {
    const seeded = this.config.seededTeamIds ?? teamIds;
    const { ranking, reachedStage } = runKnockout(seeded, {
      legs: this.config.legs,
      neutralVenue: false,
      simulateMatch,
    });
    return { ranking, reachedStage };
  }
}
