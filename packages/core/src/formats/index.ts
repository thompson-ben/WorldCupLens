import type { FormatConfig } from "../domain/format.js";
import { GroupKnockoutFormat } from "./group-knockout.js";
import { KnockoutFormat } from "./knockout.js";
import { LeagueFormat } from "./league.js";
import { LeaguePhaseKnockoutFormat } from "./league-phase-knockout.js";
import type { TournamentFormat } from "./strategy.js";

/**
 * Build the strategy for a tournament's declared format. This is the only place
 * that maps config → behaviour; adding a new competition shape means adding a
 * case here and nothing else in the engine.
 */
export function createFormat(config: FormatConfig): TournamentFormat {
  switch (config.kind) {
    case "league":
      return new LeagueFormat(config);
    case "group-knockout":
      return new GroupKnockoutFormat(config);
    case "knockout":
      return new KnockoutFormat(config);
    case "league-phase-knockout":
      return new LeaguePhaseKnockoutFormat(config);
    default: {
      const exhaustive: never = config;
      throw new Error(`Unsupported format: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export { GroupKnockoutFormat } from "./group-knockout.js";
export { KnockoutFormat } from "./knockout.js";
export { LeagueFormat } from "./league.js";
export { LeaguePhaseKnockoutFormat } from "./league-phase-knockout.js";
export type {
  FormatPlayInput,
  SimulateMatch,
  TournamentFormat,
  TournamentResult,
} from "./strategy.js";
