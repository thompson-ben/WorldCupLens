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
/** Home advantage in Elo points (removed at neutral venues). */
export const HOME_ADVANTAGE = 65;
const MIN_LAMBDA = 0.35;
const GOAL_SPREAD = 2.6;

/** Logistic Elo expectation: probability `a` beats `b` (draws excluded). */
export function eloWinProbability(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export interface ExpectedGoals {
  home: number;
  away: number;
}

/**
 * Each side's expected goals (Poisson means) from their ratings — the same
 * math the match model samples from. Exposed so presentation/analytics layers
 * can derive scoreline distributions, xG and related metrics without
 * re-running the simulation or reimplementing the model.
 */
export function expectedGoals(
  homeRating: number,
  awayRating: number,
  opts: { neutralVenue?: boolean } = {},
): ExpectedGoals {
  const adjustedHome = homeRating + (opts.neutralVenue ? 0 : HOME_ADVANTAGE);
  const homeWinProb = eloWinProbability(adjustedHome, awayRating);
  return {
    home: MIN_LAMBDA + GOAL_SPREAD * homeWinProb,
    away: MIN_LAMBDA + GOAL_SPREAD * (1 - homeWinProb),
  };
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
    const lambdas = expectedGoals(home.rating ?? DEFAULT_RATING, away.rating ?? DEFAULT_RATING, {
      neutralVenue: ctx.neutralVenue,
    });

    const score: MatchScore = {
      home: samplePoisson(lambdas.home, rng),
      away: samplePoisson(lambdas.away, rng),
    };

    if (ctx.mustHaveWinner && score.home === score.away) {
      score.afterExtraTime = true;
      // Shootout: lean slightly toward the stronger side, but keep it close.
      const edge = 0.5 + (eloWinProbability(home.rating, away.rating) - 0.5) * 0.5;
      const homeWins = rng.next() < edge;
      score.penalties = homeWins ? { home: 1, away: 0 } : { home: 0, away: 1 };
    }
    return score;
  }
}
