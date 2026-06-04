/**
 * WorldCupLens — football data ingest.
 *
 * Pulls real international match results from the open `martj42/international_results`
 * dataset and derives, for the national teams we track:
 *   - a World Football Elo rating (computed from the full match history),
 *   - the rating ~12 months ago + movement,
 *   - a recent-form score and the last few results,
 *   - World Cup 2026 qualification status, and the real WC 2026 fixtures.
 *
 * Output is written as JSON snapshots under data-providers, which become the
 * app's source of truth. Re-runnable on a schedule (see refresh-data workflow).
 *
 * Run: npx tsx scripts/ingest-football-data.mts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RESULTS_URL =
  "https://raw.githubusercontent.com/martj42/international_results/master/results.csv";

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../packages/data-providers/src/static/data",
);

/** National teams we track: [our id, dataset name]. */
const TEAMS: Array<[string, string]> = [
  ["arg", "Argentina"], ["fra", "France"], ["esp", "Spain"], ["eng", "England"],
  ["bra", "Brazil"], ["por", "Portugal"], ["ned", "Netherlands"], ["bel", "Belgium"],
  ["ita", "Italy"], ["ger", "Germany"], ["cro", "Croatia"], ["uru", "Uruguay"],
  ["col", "Colombia"], ["mar", "Morocco"], ["usa", "United States"], ["mex", "Mexico"],
  ["sui", "Switzerland"], ["den", "Denmark"], ["jpn", "Japan"], ["sen", "Senegal"],
  ["per", "Peru"], ["kor", "South Korea"], ["ecu", "Ecuador"], ["pol", "Poland"],
  ["aut", "Austria"], ["wal", "Wales"], ["chi", "Chile"], ["srb", "Serbia"],
  ["tun", "Tunisia"], ["cmr", "Cameroon"], ["gha", "Ghana"], ["nga", "Nigeria"],
  ["aus", "Australia"], ["cze", "Czech Republic"], ["sco", "Scotland"], ["par", "Paraguay"],
  ["can", "Canada"], ["tur", "Turkey"], ["ksa", "Saudi Arabia"], ["qat", "Qatar"],
  ["nor", "Norway"], ["ukr", "Ukraine"], ["alg", "Algeria"], ["irn", "Iran"],
  ["egy", "Egypt"], ["civ", "Ivory Coast"], ["rsa", "South Africa"], ["ven", "Venezuela"],
  ["cri", "Costa Rica"], ["pan", "Panama"], ["uzb", "Uzbekistan"], ["jor", "Jordan"],
  ["nzl", "New Zealand"],
];

const HOSTS = new Set(["United States", "Canada", "Mexico"]);
const idByName = new Map(TEAMS.map(([id, name]) => [name, id]));

interface Row {
  date: string;
  home: string;
  away: string;
  hs: number | null;
  as: number | null;
  tournament: string;
  city: string;
  country: string;
  neutral: boolean;
}

function parseCsv(text: string): Row[] {
  const lines = text.split("\n");
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const f = splitCsvLine(line);
    if (f.length < 9) continue;
    rows.push({
      date: f[0]!,
      home: f[1]!,
      away: f[2]!,
      hs: f[3] === "NA" || f[3] === "" ? null : Number(f[3]),
      as: f[4] === "NA" || f[4] === "" ? null : Number(f[4]),
      tournament: f[5]!,
      city: f[6]!,
      country: f[7]!,
      neutral: f[8]!.trim().toUpperCase() === "TRUE",
    });
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** K-factor by competition importance (World Football Elo convention). */
function kFactor(tournament: string): number {
  const t = tournament.toLowerCase();
  if (t.includes("friendly")) return 20;
  if (t.includes("qualification") || t.includes("qualifier")) return 40;
  if (t.includes("fifa world cup")) return 60;
  if (t.includes("confederations")) return 50;
  if (t.includes("nations league")) return 40;
  const finals = [
    "uefa euro", "copa am", "african cup of nations", "afc asian cup", "gold cup",
    "concacaf championship", "oceania nations", "african nations championship",
  ];
  if (finals.some((f) => t.includes(f))) return 50;
  return 30;
}

/** Goal-difference multiplier. */
function goalMultiplier(diff: number): number {
  const d = Math.abs(diff);
  if (d <= 1) return 1;
  if (d === 2) return 1.5;
  return (11 + d) / 8;
}

interface RecentResult {
  date: string;
  opponent: string;
  gf: number;
  ga: number;
  result: "W" | "D" | "L";
}

async function main() {
  console.log("Fetching results.csv …");
  const res = await fetch(RESULTS_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const rows = parseCsv(await res.text());
  const played = rows.filter((r) => r.hs !== null && r.as !== null);
  console.log(`Parsed ${rows.length} rows (${played.length} played).`);

  const ratingDate = played.reduce((m, r) => (r.date > m ? r.date : m), "0000-00-00");
  const cutoff = new Date(ratingDate);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const rating = new Map<string, number>();
  const prevRating = new Map<string, number>();
  const recent = new Map<string, RecentResult[]>();
  const lastMatch = new Map<string, string>();
  const get = (t: string) => rating.get(t) ?? 1500;

  for (const r of played) {
    const rh = get(r.home);
    const ra = get(r.away);
    const dr = rh - ra + (r.neutral ? 0 : 100);
    const we = 1 / (10 ** (-dr / 400) + 1);
    const wHome = r.hs! > r.as! ? 1 : r.hs! === r.as! ? 0.5 : 0;
    const k = kFactor(r.tournament);
    const g = goalMultiplier(r.hs! - r.as!);
    const delta = k * g * (wHome - we);
    rating.set(r.home, rh + delta);
    rating.set(r.away, ra - delta);

    if (r.date < cutoffStr) {
      prevRating.set(r.home, rating.get(r.home)!);
      prevRating.set(r.away, rating.get(r.away)!);
    }
    for (const [team, opp, gf, ga] of [
      [r.home, r.away, r.hs!, r.as!],
      [r.away, r.home, r.as!, r.hs!],
    ] as Array<[string, string, number, number]>) {
      const list = recent.get(team) ?? [];
      list.push({ date: r.date, opponent: opp, gf, ga, result: gf > ga ? "W" : gf === ga ? "D" : "L" });
      recent.set(team, list);
      lastMatch.set(team, r.date);
    }
  }

  // Qualification + fixtures from the 2026 World Cup rows.
  const wc2026 = rows.filter((r) => r.tournament === "FIFA World Cup" && r.date.startsWith("2026"));
  const qualifiedNames = new Set<string>();
  for (const r of wc2026) {
    qualifiedNames.add(r.home);
    qualifiedNames.add(r.away);
  }

  const teams: Record<string, unknown> = {};
  const missing: string[] = [];
  for (const [id, name] of TEAMS) {
    const cur = rating.get(name);
    if (cur === undefined) {
      missing.push(`${id} (${name})`);
      continue;
    }
    const prev = prevRating.get(name) ?? cur;
    const recentList = (recent.get(name) ?? []).slice(-10);
    const last8 = recentList.slice(-8).reverse().map((x) => ({
      date: x.date,
      opponent: x.opponent,
      score: `${x.gf}-${x.ga}`,
      result: x.result,
    }));
    const points = recentList.reduce((s, x) => s + (x.result === "W" ? 3 : x.result === "D" ? 1 : 0), 0);
    const formScore = recentList.length ? Math.round((points / (recentList.length * 3)) * 100) : 50;

    const status = HOSTS.has(name) ? "host" : qualifiedNames.has(name) ? "qualified" : "unknown";

    teams[id] = {
      name,
      rating: Math.round(cur),
      previousRating: Math.round(prev),
      movement: Math.round(cur - prev),
      formScore,
      qualification: status,
      lastMatchDate: lastMatch.get(name) ?? null,
      recent: last8,
    };
  }

  const ratingsSnapshot = {
    generatedAt: new Date().toISOString(),
    ratingDate,
    source: "International match results (github.com/martj42/international_results)",
    method:
      "World Football Elo: K by competition (WC 60, continental finals 50, qualifiers/Nations League 40, friendlies 20), goal-difference and home-advantage adjusted.",
    teamCount: Object.keys(teams).length,
    teams,
  };

  const fixtures = wc2026
    .map((r) => ({
      date: r.date,
      venue: [r.city, r.country].filter(Boolean).join(", "),
      home: r.home,
      away: r.away,
      homeId: idByName.get(r.home) ?? null,
      awayId: idByName.get(r.away) ?? null,
      status: r.hs === null ? "scheduled" : "completed",
      score: r.hs === null ? null : `${r.hs}-${r.as}`,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const fixturesSnapshot = {
    generatedAt: new Date().toISOString(),
    source: "github.com/martj42/international_results",
    competition: "FIFA World Cup 2026",
    fixtureCount: fixtures.length,
    fixtures,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "ratings.json"), JSON.stringify(ratingsSnapshot, null, 2) + "\n");
  writeFileSync(join(OUT_DIR, "fixtures.json"), JSON.stringify(fixturesSnapshot, null, 2) + "\n");

  console.log(`\nRating date: ${ratingDate}`);
  console.log(`Teams resolved: ${Object.keys(teams).length}/${TEAMS.length}`);
  if (missing.length) console.log(`MISSING: ${missing.join(", ")}`);
  console.log(`WC2026 fixtures: ${fixtures.length}`);
  const sample = ["arg", "bra", "fra", "eng", "esp", "usa", "mar", "civ", "nor"];
  for (const id of sample) {
    const t = teams[id] as { rating: number; movement: number; formScore: number; qualification: string } | undefined;
    if (t) console.log(`  ${id}: ${t.rating} (${t.movement >= 0 ? "+" : ""}${t.movement}) form ${t.formScore} · ${t.qualification}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
