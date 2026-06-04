import type { GroupKnockoutFormatConfig } from "../domain/format.js";
import { buildStandings, rankStandings } from "../domain/standings.js";
import { STAGE } from "../domain/stage.js";
import { playFixtures, roundRobin, runKnockout } from "./helpers.js";
import type { FormatPlayInput, TournamentFormat, TournamentResult } from "./strategy.js";

/**
 * Group stage followed by a single-elimination bracket — the World Cup, Euros
 * and Copa América shape. The number of groups, group size and qualifiers are
 * all driven by config, so any variant works without code changes.
 */
export class GroupKnockoutFormat implements TournamentFormat {
  readonly kind = "group-knockout";

  constructor(private readonly config: GroupKnockoutFormatConfig) {}

  play({ teamIds, simulateMatch, rng }: FormatPlayInput): TournamentResult {
    const reachedStage: Record<string, string> = {};
    for (const id of teamIds) reachedStage[id] = STAGE.Group;

    // Each group plays a round robin; collect qualifiers by finishing position.
    const qualifiersByPosition: string[][] = Array.from(
      { length: this.config.advancePerGroup },
      () => [],
    );
    const eliminated: string[] = [];

    for (const group of this.config.groups) {
      const fixtures = roundRobin(group.teamIds, this.config.groupLegs);
      const played = playFixtures(fixtures, STAGE.Group, "group", true, simulateMatch);
      const ranked = rankStandings(
        buildStandings(group.teamIds, played, this.config),
        () => rng.next() - 0.5,
      ).map((r) => r.teamId);

      ranked.forEach((teamId, position) => {
        if (position < this.config.advancePerGroup) {
          qualifiersByPosition[position]!.push(teamId);
        } else {
          eliminated.push(teamId);
        }
      });
    }

    // Seed the bracket position-by-position (all winners, then all runners-up,
    // …) so same-group qualifiers start on opposite sides.
    const seeded = qualifiersByPosition.flat();
    const knockout = runKnockout(seeded, {
      legs: this.config.knockoutLegs,
      neutralVenue: true,
      simulateMatch,
    });

    Object.assign(reachedStage, knockout.reachedStage);
    return { ranking: [...knockout.ranking, ...eliminated.reverse()], reachedStage };
  }
}
