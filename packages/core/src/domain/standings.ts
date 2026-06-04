import { resultType, type MatchScore } from "./match.js";

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  goalDifference: number;
}

export interface PointsRules {
  pointsForWin: number;
  pointsForDraw: number;
}

interface PlayedMatch {
  homeTeamId: string;
  awayTeamId: string;
  score: MatchScore;
}

function emptyRow(teamId: string): StandingRow {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    goalDifference: 0,
  };
}

/**
 * Build a points table from completed matches. Pure and reusable across the
 * league, group and league-phase formats.
 */
export function buildStandings(
  teamIds: string[],
  matches: readonly PlayedMatch[],
  rules: PointsRules,
): StandingRow[] {
  const table = new Map<string, StandingRow>();
  for (const id of teamIds) table.set(id, emptyRow(id));

  for (const { homeTeamId, awayTeamId, score } of matches) {
    const home = table.get(homeTeamId);
    const away = table.get(awayTeamId);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += score.home;
    home.goalsAgainst += score.away;
    away.goalsFor += score.away;
    away.goalsAgainst += score.home;

    const outcome = resultType({ home: score.home, away: score.away });
    if (outcome === "home") {
      home.won++;
      away.lost++;
      home.points += rules.pointsForWin;
    } else if (outcome === "away") {
      away.won++;
      home.lost++;
      away.points += rules.pointsForWin;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += rules.pointsForDraw;
      away.points += rules.pointsForDraw;
    }
  }

  for (const row of table.values()) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }
  return [...table.values()];
}

/**
 * Order a table by points, then goal difference, then goals for. Remaining
 * ties are broken by the supplied deterministic comparator (e.g. seeded RNG),
 * keeping simulations reproducible.
 */
export function rankStandings(
  rows: StandingRow[],
  breakTie: (a: StandingRow, b: StandingRow) => number,
): StandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return breakTie(a, b);
  });
}
