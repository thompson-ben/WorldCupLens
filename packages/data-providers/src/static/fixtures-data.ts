import fixturesJson from "./data/fixtures.json";

export interface WorldCupFixture {
  date: string;
  venue: string;
  home: string;
  away: string;
  /** Our team id when the side is one we track, else null. */
  homeId: string | null;
  awayId: string | null;
  status: "scheduled" | "completed";
  score: string | null;
}

export interface FixturesSnapshot {
  generatedAt: string;
  source: string;
  competition: string;
  fixtureCount: number;
  fixtures: WorldCupFixture[];
}

/** Real World Cup 2026 fixtures (dates + venues) from the results dataset. */
export const WC_FIXTURES = fixturesJson as FixturesSnapshot;
