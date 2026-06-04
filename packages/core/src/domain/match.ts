export type MatchStatus = "scheduled" | "live" | "completed";

export interface MatchScore {
  home: number;
  away: number;
  /** True when the result was settled in extra time. */
  afterExtraTime?: boolean;
  /** Shootout result, when a knockout tie went to penalties. */
  penalties?: { home: number; away: number };
}

export type MatchResultType = "home" | "away" | "draw";

export interface Match {
  id: string;
  tournamentId: string;
  stageId: string;
  homeTeamId: string;
  awayTeamId: string;
  /** ISO 8601 datetime. */
  kickoff?: string;
  status: MatchStatus;
  score?: MatchScore;
}

/** Who won, accounting for a penalty shootout if present. */
export function resultType(score: MatchScore): MatchResultType {
  if (score.home > score.away) return "home";
  if (score.away > score.home) return "away";
  if (score.penalties) {
    return score.penalties.home > score.penalties.away ? "home" : "away";
  }
  return "draw";
}
