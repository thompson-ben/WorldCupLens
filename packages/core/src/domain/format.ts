/**
 * Declarative descriptions of how a tournament is structured. These are *data*
 * (stored per-tournament, sourced from any provider); the matching *behaviour*
 * lives in `../formats`. New competition shapes are added by extending this
 * union and registering a strategy — the simulation engine itself never changes.
 */

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

interface PointsConfig {
  pointsForWin: number;
  pointsForDraw: number;
}

/** Round-robin league, e.g. the Premier League. */
export interface LeagueFormatConfig extends PointsConfig {
  kind: "league";
  /** 1 = single round robin, 2 = home & away. */
  legs: 1 | 2;
}

/** Groups followed by a single-elimination bracket, e.g. World Cup, Euros, Copa América. */
export interface GroupKnockoutFormatConfig extends PointsConfig {
  kind: "group-knockout";
  groups: Group[];
  /** Teams advancing from each group into the knockout bracket. */
  advancePerGroup: number;
  /**
   * Extra qualifiers drawn from the best teams finishing one place below the
   * automatic cut, ranked across all groups (e.g. the 8 best third-placed
   * teams at the 48-team World Cup). Defaults to 0.
   */
  bestThirdsAdvance?: number;
  /** Legs played within the group stage. */
  groupLegs: 1 | 2;
  /** Legs played in each knockout tie. */
  knockoutLegs: 1 | 2;
}

/** Pure single-elimination bracket. */
export interface KnockoutFormatConfig {
  kind: "knockout";
  /** Seeded bracket order; falls back to the tournament team list. */
  seededTeamIds?: string[];
  legs: 1 | 2;
}

/** Single league phase then a knockout bracket, e.g. the post-2024 Champions League. */
export interface LeaguePhaseKnockoutFormatConfig extends PointsConfig {
  kind: "league-phase-knockout";
  /** Matches each team plays in the league phase. */
  matchesPerTeam: number;
  /** Top N of the single table advance to the knockout phase. */
  knockoutQualifiers: number;
  knockoutLegs: 1 | 2;
}

export type FormatConfig =
  | LeagueFormatConfig
  | GroupKnockoutFormatConfig
  | KnockoutFormatConfig
  | LeaguePhaseKnockoutFormatConfig;

export type FormatKind = FormatConfig["kind"];
