import { STAGE } from "../domain/stage.js";
import type { TeamRating } from "../domain/team.js";
import type { TournamentFormat } from "../formats/strategy.js";
import { type MatchSimulator, PoissonMatchSimulator } from "./match-simulator.js";
import { createRng } from "./rng.js";

export interface SimulationOptions {
  iterations: number;
  /** Seed for reproducible runs. Defaults to a fixed value. */
  seed?: number;
  /** Match model; defaults to {@link PoissonMatchSimulator}. */
  matchSimulator?: MatchSimulator;
}

export interface TeamProbabilities {
  teamId: string;
  /** P(team finishes first). */
  champion: number;
  /** P(team reaches the final — i.e. champion or runner-up). */
  finalist: number;
  /** Mean finishing position (1 = best). */
  averageFinish: number;
  /** stageId → probability the team reached that stage. */
  reachedStage: Record<string, number>;
}

export interface SimulationResult {
  iterations: number;
  /** One row per team, sorted by championship probability (desc). */
  teams: TeamProbabilities[];
}

const DEFAULT_RATING = 1500;

interface Accumulator {
  champion: number;
  finalist: number;
  finishSum: number;
  stageCounts: Record<string, number>;
}

/**
 * Run a Monte Carlo simulation of any tournament. The engine is fully
 * format-agnostic: it injects ratings into a match model, hands a bound
 * `simulateMatch` to the format strategy, and aggregates outcomes over many
 * iterations into per-team probabilities.
 */
export function simulateTournament(params: {
  format: TournamentFormat;
  teamIds: string[];
  ratings: ReadonlyMap<string, TeamRating>;
  options: SimulationOptions;
}): SimulationResult {
  const { format, teamIds, ratings, options } = params;
  const iterations = Math.max(1, options.iterations);
  const model = options.matchSimulator ?? new PoissonMatchSimulator();
  const rng = createRng(options.seed ?? 0x9e3779b9);

  const ratingFor = (teamId: string): TeamRating =>
    ratings.get(teamId) ?? { teamId, rating: DEFAULT_RATING };

  const simulateMatch = (homeTeamId: string, awayTeamId: string, ctx: Parameters<typeof model.simulate>[2]) =>
    model.simulate(ratingFor(homeTeamId), ratingFor(awayTeamId), ctx, rng);

  const acc = new Map<string, Accumulator>();
  for (const id of teamIds) {
    acc.set(id, { champion: 0, finalist: 0, finishSum: 0, stageCounts: {} });
  }

  for (let i = 0; i < iterations; i++) {
    const { ranking, reachedStage } = format.play({ teamIds, simulateMatch, rng });

    ranking.forEach((teamId, index) => {
      const a = acc.get(teamId);
      if (a) a.finishSum += index + 1;
    });

    for (const [teamId, stage] of Object.entries(reachedStage)) {
      const a = acc.get(teamId);
      if (!a) continue;
      a.stageCounts[stage] = (a.stageCounts[stage] ?? 0) + 1;
      if (stage === STAGE.Winner) {
        a.champion++;
        a.finalist++;
      } else if (stage === STAGE.Final) {
        a.finalist++;
      }
    }
  }

  const teams: TeamProbabilities[] = teamIds.map((teamId) => {
    const a = acc.get(teamId)!;
    const reached: Record<string, number> = {};
    for (const [stage, count] of Object.entries(a.stageCounts)) {
      reached[stage] = count / iterations;
    }
    return {
      teamId,
      champion: a.champion / iterations,
      finalist: a.finalist / iterations,
      averageFinish: a.finishSum / iterations,
      reachedStage: reached,
    };
  });

  teams.sort((x, y) => y.champion - x.champion || x.averageFinish - y.averageFinish);
  return { iterations, teams };
}
