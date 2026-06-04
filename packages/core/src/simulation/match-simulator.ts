import type { MatchScore } from "../domain/match.js";
import type { StageKind } from "../domain/stage.js";
import type { TeamRating } from "../domain/team.js";
import type { Rng } from "./rng.js";

/** Context a format passes down for each simulated match. */
export interface MatchContext {
  stageId: string;
  stageKind: StageKind;
  /** Knockout ties must resolve to a winner (extra time + penalties). */
  mustHaveWinner: boolean;
  /** Neutral venue (e.g. World Cup) removes home advantage. */
  neutralVenue: boolean;
}

/**
 * Strategy that turns two teams' ratings into a scoreline. Implementations are
 * sport-agnostic; swap in a different model (xG-based, basketball, etc.)
 * without touching the tournament engine.
 */
export interface MatchSimulator {
  simulate(home: TeamRating, away: TeamRating, ctx: MatchContext, rng: Rng): MatchScore;
}

const DEFAULT_RATING = 1500;
const HOME_ADVANTAGE = 65; // Elo points
const MIN_LAMBDA = 0.35;
const GOAL_SPREAD = 2.6;

/** Logistic Elo expectation: probability `a` beats `b` (draws excluded). */
function eloExpectation(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

function samplePoisson(lambda: number, rng: Rng): number {
  // Knuth's algorithm — fine for the small means seen in sports scorelines.
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng.next();
  } while (p > limit);
  return k - 1;
}

/**
 * Default model: derive each side's expected goals from the Elo expectation,
 * sample independent Poisson scorelines, and resolve knockout draws via a
 * rating-weighted shootout.
 */
export class PoissonMatchSimulator implements MatchSimulator {
  simulate(home: TeamRating, away: TeamRating, ctx: MatchContext, rng: Rng): MatchScore {
    const homeRating = (home.rating ?? DEFAULT_RATING) + (ctx.neutralVenue ? 0 : HOME_ADVANTAGE);
    const awayRating = away.rating ?? DEFAULT_RATING;

    const homeWinProb = eloExpectation(homeRating, awayRating);
    const homeLambda = MIN_LAMBDA + GOAL_SPREAD * homeWinProb;
    const awayLambda = MIN_LAMBDA + GOAL_SPREAD * (1 - homeWinProb);

    const score: MatchScore = {
      home: samplePoisson(homeLambda, rng),
      away: samplePoisson(awayLambda, rng),
    };

    if (ctx.mustHaveWinner && score.home === score.away) {
      score.afterExtraTime = true;
      // Shootout: lean slightly toward the stronger side, but keep it close.
      const edge = 0.5 + (eloExpectation(home.rating, away.rating) - 0.5) * 0.5;
      const homeWins = rng.next() < edge;
      score.penalties = homeWins ? { home: 1, away: 0 } : { home: 0, away: 1 };
    }
    return score;
  }
}
