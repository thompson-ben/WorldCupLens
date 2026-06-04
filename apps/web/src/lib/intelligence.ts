import "server-only";

import { computeMatchInsights, type TeamLite } from "./match-insights";
import { confidenceCategory, matchConfidence, tournamentConfidence, type ConfidenceCategory } from "./confidence";
import { percent } from "./format";
import {
  getTeamPool,
  getWorldCupInsights,
  WORLD_CUP_SLUG,
  type WorldCupInsights,
} from "./wc-insights";

export type InsightType =
  | "tournament-favourite"
  | "shock-risk"
  | "dark-horse"
  | "most-likely-final"
  | "biggest-mover"
  | "biggest-faller"
  | "golden-boot"
  | "group-to-watch"
  | "underdog";

export interface Insight {
  id: string;
  type: InsightType;
  icon: string;
  kicker: string;
  title: string;
  summary: string;
  confidence: number;
  confidenceCategory: ConfidenceCategory;
  supportingData: string[];
  shareText: string;
  relatedTeam?: string;
  relatedMatch?: [string, string];
}

interface Ctx {
  wc: WorldCupInsights;
  byId: Map<string, TeamLite>;
  ratingRank: Map<string, number>;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pct0 = (x: number) => percent(x, 0);

// --- Individual generators (one source of truth, many destinations) ---------

export function generateTournamentFavourite(ctx: Ctx): Insight | null {
  const top = ctx.wc.winners[0];
  if (!top) return null;
  const reachSemi = ctx.wc.routeToFinal.steps.find((s) => s.stage === "semi-final")?.prob ?? 0;
  const conf = tournamentConfidence(reachSemi);
  return {
    id: "tournament-favourite",
    type: "tournament-favourite",
    icon: "👑",
    kicker: "Tournament Favourite",
    title: `${top.team.name} lead the field`,
    summary: `${top.team.name} win the World Cup in ${pct0(top.value)} of simulations — the most of any side.`,
    confidence: conf.pct,
    confidenceCategory: conf.category,
    supportingData: [
      `Title probability: ${pct0(top.value)}`,
      `Reaches the semi-finals in ${pct0(reachSemi)} of runs`,
      conf.reason,
    ],
    shareText: `${top.team.name} are the World Cup 2026 favourites at ${pct0(top.value)} to win it — simulated on WorldCupLens`,
    relatedTeam: top.team.id,
  };
}

export function generateMostLikelyFinal(ctx: Ctx): Insight | null {
  const [f0, f1] = ctx.wc.finalists;
  if (!f0 || !f1) return null;
  const conf = tournamentConfidence((f0.value + f1.value) / 2);
  return {
    id: "most-likely-final",
    type: "most-likely-final",
    icon: "🏆",
    kicker: "Most Likely Final",
    title: `${f0.team.name} vs ${f1.team.name}`,
    summary: `Our two most frequent finalists, reaching the final in ${pct0(f0.value)} and ${pct0(f1.value)} of simulations.`,
    confidence: conf.pct,
    confidenceCategory: conf.category,
    supportingData: [
      `${f0.team.name} reach the final: ${pct0(f0.value)}`,
      `${f1.team.name} reach the final: ${pct0(f1.value)}`,
    ],
    shareText: `Projected World Cup 2026 final: ${f0.team.name} vs ${f1.team.name} — via WorldCupLens`,
    relatedMatch: [f0.team.id, f1.team.id],
  };
}

export function generateBiggestMover(ctx: Ctx): Insight | null {
  const m = ctx.wc.movers.up[0];
  if (!m) return null;
  const pct = clamp(Math.round(52 + Math.abs(m.delta) * 350), 48, 90);
  return {
    id: "biggest-mover",
    type: "biggest-mover",
    icon: "📈",
    kicker: "Biggest Mover",
    title: `${m.team.name} trending up`,
    summary: `${m.team.name}'s title probability rose ${(m.delta * 100).toFixed(1)} points in the latest simulation batch, to ${pct0(m.champion)}.`,
    confidence: pct,
    confidenceCategory: confidenceCategory(pct),
    supportingData: [`Now ${pct0(m.champion)} to win`, `+${(m.delta * 100).toFixed(1)} pts vs previous batch`],
    shareText: `📈 ${m.team.name} are climbing — up ${(m.delta * 100).toFixed(1)} pts to ${pct0(m.champion)} to win the World Cup. Via WorldCupLens`,
    relatedTeam: m.team.id,
  };
}

export function generateBiggestFaller(ctx: Ctx): Insight | null {
  const m = ctx.wc.movers.down[0];
  if (!m) return null;
  const pct = clamp(Math.round(52 + Math.abs(m.delta) * 350), 48, 90);
  return {
    id: "biggest-faller",
    type: "biggest-faller",
    icon: "📉",
    kicker: "Biggest Faller",
    title: `${m.team.name} trending down`,
    summary: `${m.team.name}'s title probability fell ${Math.abs(m.delta * 100).toFixed(1)} points in the latest batch, to ${pct0(m.champion)}.`,
    confidence: pct,
    confidenceCategory: confidenceCategory(pct),
    supportingData: [`Now ${pct0(m.champion)} to win`, `${(m.delta * 100).toFixed(1)} pts vs previous batch`],
    shareText: `📉 ${m.team.name} are slipping — down ${Math.abs(m.delta * 100).toFixed(1)} pts to ${pct0(m.champion)} to win the World Cup. Via WorldCupLens`,
    relatedTeam: m.team.id,
  };
}

export function generateDarkHorseUpdate(ctx: Ctx): Insight | null {
  const dh = ctx.wc.darkHorses[0];
  if (!dh) return null;
  const from = (dh.value - (dh.delta ?? 0));
  const conf = tournamentConfidence(dh.value);
  const moved = dh.delta && Math.abs(dh.delta) > 0.002;
  return {
    id: "dark-horse",
    type: "dark-horse",
    icon: "🐎",
    kicker: "Dark Horse Watch",
    title: `${dh.team.name}`,
    summary: moved
      ? `Semi-final probability ${pct0(from)} → ${pct0(dh.value)} — ${dh.delta! > 0 ? "an improving" : "a softening"} projected route.`
      : `The standout outsider, reaching the semi-finals in ${pct0(dh.value)} of simulations.`,
    confidence: conf.pct,
    confidenceCategory: conf.category,
    supportingData: [`Semi-final probability: ${pct0(dh.value)}`, conf.reason],
    shareText: `🐎 Dark horse watch: ${dh.team.name} reach the World Cup semis in ${pct0(dh.value)} of simulations. Via WorldCupLens`,
    relatedTeam: dh.team.id,
  };
}

export function generateShockRisk(ctx: Ctx): Insight | null {
  const fav = ctx.wc.winners[0]?.team;
  const dog = ctx.wc.darkHorses[0]?.team ?? ctx.wc.winners[5]?.team;
  if (!fav || !dog) return null;
  const favTeam = fav.rating >= dog.rating ? fav : dog;
  const dogTeam = fav.rating >= dog.rating ? dog : fav;
  const m = computeMatchInsights(favTeam, dogTeam, { neutralVenue: true });
  const conf = matchConfidence(m);
  const underdogWin = Math.min(m.winA, m.winB);
  return {
    id: "shock-risk",
    type: "shock-risk",
    icon: "⚠️",
    kicker: "Shock Risk of the Day",
    title: `${dogTeam.name} can trouble ${favTeam.name}`,
    summary: `If these sides meet, ${dogTeam.name} win it ${pct0(underdogWin)} of the time — a real banana skin for ${favTeam.name}.`,
    confidence: conf.pct,
    confidenceCategory: conf.category,
    supportingData: [
      `${dogTeam.name} win chance: ${pct0(underdogWin)}`,
      `Draw: ${pct0(m.draw)}`,
      `Match tempo: ${m.tempo.label}`,
    ],
    shareText: m.shareText,
    relatedMatch: [favTeam.id, dogTeam.id],
  };
}

export function generateUnderdogWatch(ctx: Ctx): Insight | null {
  // Lower-seeded sides over-performing their rating in group qualification.
  const candidates = ctx.wc.groups
    .flatMap((g) => g.teams.map((t) => ({ ...t, group: g.name })))
    .filter((t) => (ctx.ratingRank.get(t.team.id) ?? 99) > 24)
    .sort((a, b) => b.qualify - a.qualify);
  const pick = candidates[0];
  if (!pick) return null;
  const pctv = clamp(Math.round(50 + pick.qualify * 40), 48, 88);
  return {
    id: "underdog",
    type: "underdog",
    icon: "🥊",
    kicker: "Most Dangerous Underdog",
    title: `${pick.team.name} are punching up`,
    summary: `Seeded among the outsiders, ${pick.team.name} still qualify from ${pick.group} in ${pct0(pick.qualify)} of simulations.`,
    confidence: pctv,
    confidenceCategory: confidenceCategory(pctv),
    supportingData: [`Qualification probability: ${pct0(pick.qualify)}`, `${pick.group}`],
    shareText: `🥊 Underdog watch: ${pick.team.name} qualify from their group in ${pct0(pick.qualify)} of simulations. Via WorldCupLens`,
    relatedTeam: pick.team.id,
  };
}

export function generateGroupToWatch(ctx: Ctx): Insight | null {
  // "Group of death": the group whose qualification race is tightest.
  let best: { group: (typeof ctx.wc.groups)[number]; tightness: number } | null = null;
  for (const g of ctx.wc.groups) {
    if (g.teams.length < 2) continue;
    const second = g.teams[1]!.qualify;
    const third = g.teams[2]?.qualify ?? 0;
    const tightness = second - third; // smaller = tighter race for the last spot
    if (!best || tightness < best.tightness) best = { group: g, tightness };
  }
  if (!best) return null;
  const g = best.group;
  const pctv = 72;
  return {
    id: "group-to-watch",
    type: "group-to-watch",
    icon: "💀",
    kicker: "Group to Watch",
    title: `${g.name} is the group of death`,
    summary: `The tightest qualification race — ${g.teams
      .slice(0, 3)
      .map((t) => `${t.team.name} ${pct0(t.qualify)}`)
      .join(", ")}.`,
    confidence: pctv,
    confidenceCategory: confidenceCategory(pctv),
    supportingData: g.teams.map((t) => `${t.team.name}: ${pct0(t.qualify)} to qualify`),
    shareText: `💀 ${g.name} is the World Cup group of death: ${g.teams
      .slice(0, 3)
      .map((t) => `${t.team.name} ${pct0(t.qualify)}`)
      .join(", ")}. Via WorldCupLens`,
  };
}

export function generateGoldenBootSummary(ctx: Ctx): Insight | null {
  const top = ctx.wc.goldenBoot[0];
  if (!top) return null;
  const pctv = clamp(Math.round(45 + top.goldenBootProb * 180), 45, 90);
  return {
    id: "golden-boot",
    type: "golden-boot",
    icon: "👟",
    kicker: "Golden Boot Watch",
    title: `${top.name} leads the scoring race`,
    summary: `${top.name} (${top.teamName}) projects for ${top.expectedGoals} goals — a ${pct0(top.goldenBootProb)} chance of the Golden Boot.`,
    confidence: pctv,
    confidenceCategory: confidenceCategory(pctv),
    supportingData: [`Expected goals: ${top.expectedGoals}`, `Golden Boot probability: ${pct0(top.goldenBootProb)}`],
    shareText: `👟 Golden Boot watch: ${top.name} projects for ${top.expectedGoals} goals (${pct0(top.goldenBootProb)} to win it). Via WorldCupLens`,
    relatedTeam: top.teamId,
  };
}

const GENERATORS = [
  generateBiggestMover,
  generateShockRisk,
  generateDarkHorseUpdate,
  generateMostLikelyFinal,
  generateGoldenBootSummary,
  generateBiggestFaller,
  generateGroupToWatch,
  generateUnderdogWatch,
  generateTournamentFavourite,
];

async function buildCtx(): Promise<Ctx | null> {
  const [wc, pool] = await Promise.all([getWorldCupInsights(), getTeamPool(WORLD_CUP_SLUG)]);
  if (!wc) return null;
  const byId = new Map(pool.map((t) => [t.id, t]));
  const ratingRank = new Map(
    [...pool].sort((a, b) => b.rating - a.rating).map((t, i) => [t.id, i + 1]),
  );
  return { wc, byId, ratingRank };
}

/** The full Daily Brief feed. */
export async function getIntelligenceFeed(): Promise<Insight[]> {
  const ctx = await buildCtx();
  if (!ctx) return [];
  return GENERATORS.map((g) => g(ctx)).filter((i): i is Insight => i !== null);
}

/** A curated subset for the homepage. */
export async function getHomeInsights(): Promise<Insight[]> {
  const feed = await getIntelligenceFeed();
  const order: InsightType[] = [
    "tournament-favourite",
    "shock-risk",
    "dark-horse",
    "most-likely-final",
    "biggest-mover",
    "golden-boot",
  ];
  return order
    .map((type) => feed.find((i) => i.type === type))
    .filter((i): i is Insight => i !== undefined);
}
