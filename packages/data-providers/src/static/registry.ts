import type { Team, TeamRating } from "@worldcuplens/core";
import { RATINGS } from "./ratings-data.js";

/**
 * A shared pool of teams referenced by the seed tournaments. Teams are defined
 * once and reused across competitions (a nation appears in both a World Cup and
 * a Euro), keeping the data normalised. Ratings are approximate Elo values.
 */
export interface RegistryEntry {
  team: Team;
  rating: number;
}

type NationTuple = [id: string, name: string, code: string, countryCode: string, rating: number];

const NATIONS: NationTuple[] = [
  ["arg", "Argentina", "ARG", "AR", 2105],
  ["fra", "France", "FRA", "FR", 2055],
  ["esp", "Spain", "ESP", "ES", 2045],
  ["eng", "England", "ENG", "GB", 2030],
  ["bra", "Brazil", "BRA", "BR", 2025],
  ["por", "Portugal", "POR", "PT", 2010],
  ["ned", "Netherlands", "NED", "NL", 1990],
  ["bel", "Belgium", "BEL", "BE", 1975],
  ["ita", "Italy", "ITA", "IT", 1970],
  ["ger", "Germany", "GER", "DE", 1965],
  ["cro", "Croatia", "CRO", "HR", 1945],
  ["uru", "Uruguay", "URU", "UY", 1940],
  ["col", "Colombia", "COL", "CO", 1925],
  ["mar", "Morocco", "MAR", "MA", 1915],
  ["usa", "United States", "USA", "US", 1875],
  ["mex", "Mexico", "MEX", "MX", 1870],
  ["sui", "Switzerland", "SUI", "CH", 1865],
  ["den", "Denmark", "DEN", "DK", 1860],
  ["jpn", "Japan", "JPN", "JP", 1850],
  ["sen", "Senegal", "SEN", "SN", 1840],
  ["per", "Peru", "PER", "PE", 1815],
  ["kor", "South Korea", "KOR", "KR", 1810],
  ["ecu", "Ecuador", "ECU", "EC", 1805],
  ["pol", "Poland", "POL", "PL", 1800],
  ["aut", "Austria", "AUT", "AT", 1795],
  ["wal", "Wales", "WAL", "GB", 1785],
  ["chi", "Chile", "CHI", "CL", 1780],
  ["srb", "Serbia", "SRB", "RS", 1775],
  ["tun", "Tunisia", "TUN", "TN", 1760],
  ["cmr", "Cameroon", "CMR", "CM", 1755],
  ["gha", "Ghana", "GHA", "GH", 1745],
  ["nga", "Nigeria", "NGA", "NG", 1740],
  ["aus", "Australia", "AUS", "AU", 1735],
  ["cze", "Czechia", "CZE", "CZ", 1730],
  ["sco", "Scotland", "SCO", "GB", 1720],
  ["par", "Paraguay", "PAR", "PY", 1710],
  ["can", "Canada", "CAN", "CA", 1705],
  ["tur", "Turkey", "TUR", "TR", 1700],
  ["ksa", "Saudi Arabia", "KSA", "SA", 1660],
  ["qat", "Qatar", "QAT", "QA", 1620],
  // Additional likely qualifiers / placeholders for the 48-team World Cup.
  // Swap ids freely as qualification is confirmed — nothing else depends on them.
  ["nor", "Norway", "NOR", "NO", 1765],
  ["ukr", "Ukraine", "UKR", "UA", 1735],
  ["alg", "Algeria", "ALG", "DZ", 1705],
  ["irn", "Iran", "IRN", "IR", 1700],
  ["egy", "Egypt", "EGY", "EG", 1690],
  ["civ", "Côte d'Ivoire", "CIV", "CI", 1680],
  ["rsa", "South Africa", "RSA", "ZA", 1660],
  ["ven", "Venezuela", "VEN", "VE", 1650],
  ["cri", "Costa Rica", "CRC", "CR", 1640],
  ["pan", "Panama", "PAN", "PA", 1630],
  ["uzb", "Uzbekistan", "UZB", "UZ", 1620],
  ["jor", "Jordan", "JOR", "JO", 1560],
  ["nzl", "New Zealand", "NZL", "NZ", 1500],
];

type ClubTuple = [id: string, name: string, code: string, countryCode: string, rating: number];

const CLUBS: ClubTuple[] = [
  ["mci", "Manchester City", "MCI", "GB", 2010],
  ["rma", "Real Madrid", "RMA", "ES", 2005],
  ["bay", "Bayern Munich", "BAY", "DE", 1985],
  ["liv", "Liverpool", "LIV", "GB", 1975],
  ["ars", "Arsenal", "ARS", "GB", 1965],
  ["bar", "Barcelona", "BAR", "ES", 1960],
  ["psg", "Paris Saint-Germain", "PSG", "FR", 1950],
  ["int", "Inter Milan", "INT", "IT", 1935],
  ["che", "Chelsea", "CHE", "GB", 1910],
  ["atm", "Atlético Madrid", "ATM", "ES", 1905],
  ["dor", "Borussia Dortmund", "DOR", "DE", 1885],
  ["juv", "Juventus", "JUV", "IT", 1880],
  ["mun", "Manchester United", "MUN", "GB", 1870],
  ["tot", "Tottenham Hotspur", "TOT", "GB", 1860],
  ["nap", "Napoli", "NAP", "IT", 1855],
  ["mil", "AC Milan", "MIL", "IT", 1845],
  ["new", "Newcastle United", "NEW", "GB", 1830],
  ["lei", "Bayer Leverkusen", "LEV", "DE", 1865],
  ["avl", "Aston Villa", "AVL", "GB", 1815],
  ["whu", "West Ham United", "WHU", "GB", 1780],
  ["bha", "Brighton", "BHA", "GB", 1775],
  ["ben", "Benfica", "BEN", "PT", 1820],
  ["spo", "Sporting CP", "SPO", "PT", 1810],
  ["psv", "PSV Eindhoven", "PSV", "NL", 1795],
];

function toEntries(tuples: Array<[string, string, string, string, number]>): RegistryEntry[] {
  return tuples.map(([id, name, code, countryCode, rating]) => ({
    team: { id, name, code, countryCode },
    rating,
  }));
}

const ENTRIES: RegistryEntry[] = [...toEntries(NATIONS), ...toEntries(CLUBS)];

const BY_ID = new Map(ENTRIES.map((e) => [e.team.id, e]));

export function teamById(id: string): Team {
  const entry = BY_ID.get(id);
  if (!entry) throw new Error(`Unknown team id in seed data: ${id}`);
  return entry.team;
}

export function ratingById(id: string): TeamRating {
  // Prefer the real, data-derived Elo rating; fall back to the illustrative
  // seed value (e.g. for clubs, which aren't in the international dataset).
  const real = RATINGS.teams[id];
  if (real) return { teamId: id, rating: real.rating };
  const entry = BY_ID.get(id);
  if (!entry) throw new Error(`Unknown team id in seed data: ${id}`);
  return { teamId: id, rating: entry.rating };
}
