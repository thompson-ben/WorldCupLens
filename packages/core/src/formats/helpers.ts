import { resultType, type MatchScore } from "../domain/match.js";
import { knockoutStageId, STAGE, type StageKind } from "../domain/stage.js";
import type { SimulateMatch } from "./strategy.js";

export interface Fixture {
  homeTeamId: string;
  awayTeamId: string;
}

/**
 * Round-robin schedule. `legs: 1` plays each pair once; `legs: 2` adds the
 * reverse fixture so both teams host once.
 */
export function roundRobin(teamIds: string[], legs: 1 | 2): Fixture[] {
  const fixtures: Fixture[] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      fixtures.push({ homeTeamId: teamIds[i]!, awayTeamId: teamIds[j]! });
      if (legs === 2) {
        fixtures.push({ homeTeamId: teamIds[j]!, awayTeamId: teamIds[i]! });
      }
    }
  }
  return fixtures;
}

export interface PlayedFixture extends Fixture {
  score: MatchScore;
}

/** Simulate every fixture in a league/group phase. */
export function playFixtures(
  fixtures: Fixture[],
  stageId: string,
  stageKind: StageKind,
  neutralVenue: boolean,
  simulateMatch: SimulateMatch,
): PlayedFixture[] {
  return fixtures.map((f) => ({
    ...f,
    score: simulateMatch(f.homeTeamId, f.awayTeamId, {
      stageId,
      stageKind,
      mustHaveWinner: false,
      neutralVenue,
    }),
  }));
}

const BYE = "__bye__";

interface KnockoutOptions {
  legs: 1 | 2;
  neutralVenue: boolean;
  simulateMatch: SimulateMatch;
}

export interface KnockoutResult {
  /** Champion first, then runner-up, then losers in reverse round order. */
  ranking: string[];
  reachedStage: Record<string, string>;
}

/** Resolve a single tie (one or two legs) into a winner/loser. */
function playTie(
  teamA: string,
  teamB: string,
  remaining: number,
  opts: KnockoutOptions,
): { winner: string; loser: string } {
  const stageId = knockoutStageId(remaining);

  if (opts.legs === 1) {
    const score = opts.simulateMatch(teamA, teamB, {
      stageId,
      stageKind: "knockout",
      mustHaveWinner: true,
      neutralVenue: opts.neutralVenue,
    });
    const winnerIsHome = resultType(score) === "home";
    return winnerIsHome ? { winner: teamA, loser: teamB } : { winner: teamB, loser: teamA };
  }

  // Two legs: each team hosts once; aggregate goals, decider settles a tie.
  const leg1 = opts.simulateMatch(teamA, teamB, {
    stageId,
    stageKind: "knockout",
    mustHaveWinner: false,
    neutralVenue: false,
  });
  const leg2 = opts.simulateMatch(teamB, teamA, {
    stageId,
    stageKind: "knockout",
    mustHaveWinner: false,
    neutralVenue: false,
  });
  const aggA = leg1.home + leg2.away;
  const aggB = leg1.away + leg2.home;
  if (aggA > aggB) return { winner: teamA, loser: teamB };
  if (aggB > aggA) return { winner: teamB, loser: teamA };

  const decider = opts.simulateMatch(teamA, teamB, {
    stageId,
    stageKind: "knockout",
    mustHaveWinner: true,
    neutralVenue: false,
  });
  return resultType(decider) === "home"
    ? { winner: teamA, loser: teamB }
    : { winner: teamB, loser: teamA };
}

/**
 * Run a single-elimination bracket from a seeded order (strongest first).
 * The field is padded to a power of two with byes that the top seeds receive,
 * and ties are folded (1 v N, 2 v N-1) so seeds meet as late as possible.
 */
export function runKnockout(seededTeamIds: string[], opts: KnockoutOptions): KnockoutResult {
  const reachedStage: Record<string, string> = {};
  const eliminatedByRound: string[][] = [];

  let size = 1;
  while (size < seededTeamIds.length) size *= 2;
  const padded = [...seededTeamIds];
  while (padded.length < size) padded.push(BYE);

  // Fold the seeds into bracket order: 1, N, 2, N-1, ...
  let bracket: string[] = [];
  for (let i = 0; i < padded.length / 2; i++) {
    bracket.push(padded[i]!, padded[padded.length - 1 - i]!);
  }

  while (bracket.length > 1) {
    const remaining = bracket.length;
    const losers: string[] = [];
    const advancing: string[] = [];
    for (let i = 0; i < bracket.length; i += 2) {
      const a = bracket[i]!;
      const b = bracket[i + 1]!;
      if (a === BYE) {
        advancing.push(b);
        continue;
      }
      if (b === BYE) {
        advancing.push(a);
        continue;
      }
      const { winner, loser } = playTie(a, b, remaining, opts);
      advancing.push(winner);
      reachedStage[loser] = knockoutStageId(remaining);
      losers.push(loser);
    }
    eliminatedByRound.push(losers);
    bracket = advancing;
  }

  const champion = bracket[0]!;
  reachedStage[champion] = STAGE.Winner;

  // Champion, then losers from latest round (final) back to the first round.
  const ranking = [champion];
  for (let r = eliminatedByRound.length - 1; r >= 0; r--) {
    ranking.push(...eliminatedByRound[r]!);
  }
  return { ranking, reachedStage };
}
