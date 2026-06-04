export { createRng, type Rng } from "./rng.js";
export {
  PoissonMatchSimulator,
  expectedGoals,
  eloWinProbability,
  HOME_ADVANTAGE,
  type MatchSimulator,
  type MatchContext,
  type ExpectedGoals,
} from "./match-simulator.js";
export {
  simulateTournament,
  type SimulationOptions,
  type SimulationResult,
  type TeamProbabilities,
} from "./tournament-simulator.js";
