import type { MatchScore } from "../domain/match.js";
import type { MatchContext } from "../simulation/match-simulator.js";
import type { Rng } from "../simulation/rng.js";

/** A bound match simulator: the engine injects ratings + model behind this. */
export type SimulateMatch = (
  homeTeamId: string,
  awayTeamId: string,
  ctx: Omit<MatchContext, "stageId"> & { stageId: string },
) => MatchScore;

export interface FormatPlayInput {
  teamIds: string[];
  simulateMatch: SimulateMatch;
  rng: Rng;
}

export interface TournamentResult {
  /** Team ids ordered best → worst; index 0 is the champion. */
  ranking: string[];
  /** Deepest stage each team reached, keyed by team id (see STAGE ids). */
  reachedStage: Record<string, string>;
}

/**
 * The single seam every competition shape implements. The Monte Carlo engine
 * only knows this interface, so adding a new tournament structure never
 * requires changing the engine — only registering a new strategy.
 */
export interface TournamentFormat {
  readonly kind: string;
  play(input: FormatPlayInput): TournamentResult;
}
