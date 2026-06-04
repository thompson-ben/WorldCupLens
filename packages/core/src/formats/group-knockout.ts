import type { GroupKnockoutFormatConfig } from "../domain/format.js";
import { buildStandings, rankStandings, type StandingRow } from "../domain/standings.js";
import { STAGE } from "../domain/stage.js";
import { playFixtures, roundRobin, runKnockout } from "./helpers.js";
import type { FormatPlayInput, TournamentFormat, TournamentResult } from "./strategy.js";

/**
 * Group stage followed by a single-elimination bracket — the World Cup, Euros
 * and Copa América shape. The number of groups, group size, qualifiers per
 * group and best-placed extra qualifiers are all driven by config, so any
 * variant (incl. the 48-team World Cup) works without code changes.
 */
export class GroupKnockoutFormat implements TournamentFormat {
  readonly kind = "group-knockout";

  constructor(private readonly config: GroupKnockoutFormatConfig) {}

  play({ teamIds, simulateMatch, rng }: FormatPlayInput): TournamentResult {
    const reachedStage: Record<string, string> = {};
    for (const id of teamIds) reachedStage[id] = STAGE.Group;

    const bestThirdsAdvance = this.config.bestThirdsAdvance ?? 0;

    // Each group plays a round robin; collect qualifiers by finishing position.
    const qualifiersByPosition: string[][] = Array.from(
      { length: this.config.advancePerGroup },
      () => [],
    );
    // Teams one place below the automatic cut, compared across groups.
    const thirdCandidates: StandingRow[] = [];
    const eliminated: string[] = [];

    for (const group of this.config.groups) {
      const fixtures = roundRobin(group.teamIds, this.config.groupLegs);
      const played = playFixtures(fixtures, STAGE.Group, "group", true, simulateMatch);
      const ranked = rankStandings(
        buildStandings(group.teamIds, played, this.config),
        () => rng.next() - 0.5,
      );

      ranked.forEach((row, position) => {
        if (position < this.config.advancePerGroup) {
          qualifiersByPosition[position]!.push(row.teamId);
        } else if (bestThirdsAdvance > 0 && position === this.config.advancePerGroup) {
          thirdCandidates.push(row);
        } else {
          eliminated.push(row.teamId);
        }
      });
    }

    // Rank the cut-line finishers against each other and take the best N.
    const rankedThirds = rankStandings(thirdCandidates, () => rng.next() - 0.5);
    const advancingThirds = rankedThirds.slice(0, bestThirdsAdvance).map((r) => r.teamId);
    eliminated.push(...rankedThirds.slice(bestThirdsAdvance).map((r) => r.teamId));

    // Seed the bracket position-by-position (all winners, then all runners-up,
    // then the best thirds) so same-group qualifiers start on opposite sides.
    const seeded = [...qualifiersByPosition.flat(), ...advancingThirds];
    const knockout = runKnockout(seeded, {
      legs: this.config.knockoutLegs,
      neutralVenue: true,
      simulateMatch,
    });

    Object.assign(reachedStage, knockout.reachedStage);
    return { ranking: [...knockout.ranking, ...eliminated.reverse()], reachedStage };
  }
}
