/**
 * Canonical stage identifiers used by the simulation engine when reporting how
 * far a team progressed. Knockout rounds are named by the number of teams
 * remaining so the same labels apply to any tournament size.
 */
export const STAGE = {
  League: "league",
  LeaguePhase: "league-phase",
  Group: "group",
  RoundOf64: "round-of-64",
  RoundOf32: "round-of-32",
  RoundOf16: "round-of-16",
  QuarterFinal: "quarter-final",
  SemiFinal: "semi-final",
  Final: "final",
  Winner: "winner",
} as const;

export type StageId = (typeof STAGE)[keyof typeof STAGE];

export type StageKind = "league" | "group" | "knockout";

/** Maps a knockout round (by teams remaining) to its canonical stage id. */
export function knockoutStageId(teamsRemaining: number): StageId {
  switch (teamsRemaining) {
    case 2:
      return STAGE.Final;
    case 4:
      return STAGE.SemiFinal;
    case 8:
      return STAGE.QuarterFinal;
    case 16:
      return STAGE.RoundOf16;
    case 32:
      return STAGE.RoundOf32;
    case 64:
      return STAGE.RoundOf64;
    default:
      return `round-of-${teamsRemaining}` as StageId;
  }
}

/** Human-readable label for a stage id. */
export function stageLabel(stageId: string): string {
  if (stageId in STAGE_LABELS) return STAGE_LABELS[stageId]!;
  const match = /^round-of-(\d+)$/.exec(stageId);
  if (match) return `Round of ${match[1]}`;
  return stageId;
}

const STAGE_LABELS: Record<string, string> = {
  [STAGE.League]: "League",
  [STAGE.LeaguePhase]: "League Phase",
  [STAGE.Group]: "Group Stage",
  [STAGE.RoundOf16]: "Round of 16",
  [STAGE.QuarterFinal]: "Quarter-final",
  [STAGE.SemiFinal]: "Semi-final",
  [STAGE.Final]: "Final",
  [STAGE.Winner]: "Champion",
};
