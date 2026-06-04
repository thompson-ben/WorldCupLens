import type { Group, Tournament } from "@worldcuplens/core";

/**
 * Seed tournaments spanning every supported format. These are illustrative
 * (team pools are trimmed for brevity) but structurally faithful, and adding a
 * new competition is purely a data change here — no engine code is touched.
 */

function groupKnockoutTeamIds(groups: Group[]): string[] {
  return groups.flatMap((g) => g.teamIds);
}

// --- FIFA World Cup 2026 — group stage + knockout ---------------------------
const worldCupGroups: Group[] = [
  { id: "A", name: "Group A", teamIds: ["arg", "jpn", "tun", "can"] },
  { id: "B", name: "Group B", teamIds: ["fra", "sen", "mex", "ksa"] },
  { id: "C", name: "Group C", teamIds: ["esp", "cro", "kor", "gha"] },
  { id: "D", name: "Group D", teamIds: ["eng", "ned", "ecu", "nga"] },
  { id: "E", name: "Group E", teamIds: ["bra", "sui", "srb", "aus"] },
  { id: "F", name: "Group F", teamIds: ["por", "uru", "pol", "cmr"] },
  { id: "G", name: "Group G", teamIds: ["bel", "den", "col", "par"] },
  { id: "H", name: "Group H", teamIds: ["ita", "ger", "mar", "usa"] },
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
    advancePerGroup: 2,
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
