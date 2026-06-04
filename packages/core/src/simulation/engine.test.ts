import assert from "node:assert/strict";
import { test } from "node:test";

import type { TeamRating } from "../domain/team.js";
import { createFormat } from "../formats/index.js";
import { simulateTournament } from "./tournament-simulator.js";

function ratings(map: Record<string, number>): Map<string, TeamRating> {
  return new Map(Object.entries(map).map(([teamId, rating]) => [teamId, { teamId, rating }]));
}

test("league: every team is ranked and champion probabilities sum to 1", () => {
  const teamIds = ["a", "b", "c", "d"];
  const format = createFormat({ kind: "league", legs: 2, pointsForWin: 3, pointsForDraw: 1 });
  const result = simulateTournament({
    format,
    teamIds,
    ratings: ratings({ a: 1700, b: 1600, c: 1500, d: 1400 }),
    options: { iterations: 2000, seed: 1 },
  });

  assert.equal(result.teams.length, teamIds.length);
  const totalChampion = result.teams.reduce((sum, t) => sum + t.champion, 0);
  assert.ok(Math.abs(totalChampion - 1) < 1e-9, "champion probabilities should sum to 1");
});

test("stronger teams win more often", () => {
  const teamIds = ["fav", "mid", "weak"];
  const format = createFormat({ kind: "league", legs: 2, pointsForWin: 3, pointsForDraw: 1 });
  const result = simulateTournament({
    format,
    teamIds,
    ratings: ratings({ fav: 1900, mid: 1500, weak: 1200 }),
    options: { iterations: 3000, seed: 7 },
  });

  const byId = new Map(result.teams.map((t) => [t.teamId, t]));
  assert.ok(byId.get("fav")!.champion > byId.get("mid")!.champion);
  assert.ok(byId.get("mid")!.champion > byId.get("weak")!.champion);
});

test("group-knockout produces exactly one champion per run", () => {
  const teamIds = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const format = createFormat({
    kind: "group-knockout",
    groups: [
      { id: "A", name: "A", teamIds: ["a", "b", "c", "d"] },
      { id: "B", name: "B", teamIds: ["e", "f", "g", "h"] },
    ],
    advancePerGroup: 2,
    groupLegs: 1,
    knockoutLegs: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
  });
  const result = simulateTournament({
    format,
    teamIds,
    ratings: ratings({ a: 1800, b: 1500, c: 1500, d: 1500, e: 1600, f: 1500, g: 1500, h: 1500 }),
    options: { iterations: 1500, seed: 42 },
  });

  const totalChampion = result.teams.reduce((sum, t) => sum + t.champion, 0);
  assert.ok(Math.abs(totalChampion - 1) < 1e-9);
  // The strongest team should be the favourite.
  assert.equal(result.teams[0]!.teamId, "a");
});
