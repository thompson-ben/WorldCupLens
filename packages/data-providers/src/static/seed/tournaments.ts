import type { Group, Tournament } from "@worldcuplens/core";

/**
 * Seed tournaments spanning every supported format. These are illustrative
 * (team pools are trimmed for brevity) but structurally faithful, and adding a
 * new competition is purely a data change here — no engine code is touched.
 */

function groupKnockoutTeamIds(groups: Group[]): string[] {
  return groups.flatMap((g) => g.teamIds);
}

// --- FIFA World Cup 2026 — 12 groups of 4, group stage + knockout -----------
// PLACEHOLDER FIELD: the 3 hosts plus likely qualifiers. Each group draws one
// team from each notional pot. To finalise the field once qualification is
// confirmed, just swap team ids below — no other code changes are required.
const worldCupGroups: Group[] = [
  { id: "A", name: "Group A", teamIds: ["arg", "cro", "ecu", "civ"] },
  { id: "B", name: "Group B", teamIds: ["fra", "uru", "aut", "rsa"] },
  { id: "C", name: "Group C", teamIds: ["esp", "col", "pol", "alg"] },
  { id: "D", name: "Group D", teamIds: ["eng", "mar", "wal", "uzb"] },
  { id: "E", name: "Group E", teamIds: ["bra", "sui", "srb", "jor"] },
  { id: "F", name: "Group F", teamIds: ["por", "den", "tun", "cri"] },
  { id: "G", name: "Group G", teamIds: ["ned", "jpn", "cmr", "pan"] },
  { id: "H", name: "Group H", teamIds: ["bel", "sen", "gha", "nzl"] },
  { id: "I", name: "Group I", teamIds: ["ger", "kor", "nga", "par"] },
  { id: "J", name: "Group J", teamIds: ["usa", "ita", "aus", "ksa"] },
  { id: "K", name: "Group K", teamIds: ["mex", "ukr", "irn", "qat"] },
  { id: "L", name: "Group L", teamIds: ["can", "nor", "egy", "ven"] },
];

const worldCup2026: Tournament = {
  id: "world-cup-2026",
  slug: "world-cup-2026",
  name: "FIFA World Cup 2026",
  sport: "football",
  competition: "FIFA World Cup",
  season: "2026",
  hosts: ["US", "CA", "MX"],
  format: {
    kind: "group-knockout",
    groups: worldCupGroups,
    // Top 2 of each group (24) + 8 best third-placed teams = 32-team knockout.
    advancePerGroup: 2,
    bestThirdsAdvance: 8,
    groupLegs: 1,
    knockoutLegs: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
  },
  teamIds: groupKnockoutTeamIds(worldCupGroups),
};

// --- UEFA Euro 2024 — group stage + knockout --------------------------------
const euroGroups: Group[] = [
  { id: "A", name: "Group A", teamIds: ["fra", "aut", "pol", "wal"] },
  { id: "B", name: "Group B", teamIds: ["esp", "ita", "cro", "srb"] },
  { id: "C", name: "Group C", teamIds: ["eng", "den", "sui", "tur"] },
  { id: "D", name: "Group D", teamIds: ["por", "ned", "bel", "ger"] },
];

const euro2024: Tournament = {
  id: "euro-2024",
  slug: "euro-2024",
  name: "UEFA Euro 2024",
  sport: "football",
  competition: "UEFA European Championship",
  season: "2024",
  hosts: ["DE"],
  format: {
    kind: "group-knockout",
    groups: euroGroups,
    advancePerGroup: 2,
    groupLegs: 1,
    knockoutLegs: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
  },
  teamIds: groupKnockoutTeamIds(euroGroups),
};

// --- Copa América 2024 — group stage + knockout -----------------------------
const copaGroups: Group[] = [
  { id: "A", name: "Group A", teamIds: ["arg", "bra", "uru", "col"] },
  { id: "B", name: "Group B", teamIds: ["usa", "mex", "per", "ecu"] },
];

const copaAmerica2024: Tournament = {
  id: "copa-america-2024",
  slug: "copa-america-2024",
  name: "Copa América 2024",
  sport: "football",
  competition: "CONMEBOL Copa América",
  season: "2024",
  hosts: ["US"],
  format: {
    kind: "group-knockout",
    groups: copaGroups,
    advancePerGroup: 2,
    groupLegs: 1,
    knockoutLegs: 1,
    pointsForWin: 3,
    pointsForDraw: 1,
  },
  teamIds: groupKnockoutTeamIds(copaGroups),
};

// --- Premier League 2025-26 — double round-robin league ---------------------
const premierLeague2526: Tournament = {
  id: "premier-league-2025-26",
  slug: "premier-league-2025-26",
  name: "Premier League 2025-26",
  sport: "football",
  competition: "Premier League",
  season: "2025-26",
  hosts: ["GB"],
  format: { kind: "league", legs: 2, pointsForWin: 3, pointsForDraw: 1 },
  teamIds: ["mci", "liv", "ars", "che", "mun", "tot", "new", "avl", "whu", "bha"],
};

// --- UEFA Champions League 2025-26 — league phase + knockout ----------------
const championsLeague2526: Tournament = {
  id: "champions-league-2025-26",
  slug: "champions-league-2025-26",
  name: "UEFA Champions League 2025-26",
  sport: "football",
  competition: "UEFA Champions League",
  season: "2025-26",
  format: {
    kind: "league-phase-knockout",
    matchesPerTeam: 8,
    knockoutQualifiers: 16,
    knockoutLegs: 2,
    pointsForWin: 3,
    pointsForDraw: 1,
  },
  teamIds: [
    "mci", "rma", "bay", "liv", "ars", "bar", "psg", "int",
    "che", "atm", "dor", "juv", "mun", "tot", "nap", "mil",
    "new", "lei", "avl", "whu", "bha", "ben", "spo", "psv",
  ],
};

export const SEED_TOURNAMENTS: Tournament[] = [
  worldCup2026,
  euro2024,
  copaAmerica2024,
  championsLeague2526,
  premierLeague2526,
];
