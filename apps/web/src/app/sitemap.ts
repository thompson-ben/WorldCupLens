import type { MetadataRoute } from "next";
import { getDataProvider } from "@/lib/provider";
import { getTeamPool, WORLD_CUP_SLUG } from "@/lib/wc-insights";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const [tournaments, teams] = await Promise.all([
    getDataProvider().listTournaments(),
    getTeamPool(WORLD_CUP_SLUG),
  ]);

  const tournamentRoutes = tournaments.flatMap((t) => [
    { url: `${base}/tournaments/${t.slug}`, changeFrequency: "daily" as const, priority: 0.8 },
    {
      url: `${base}/tournaments/${t.slug}/simulate`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]);

  const teamRoutes = teams.map((t) => ({
    url: `${base}/teams/${t.id}/ratings`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/world-cup`, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/daily-brief`, changeFrequency: "daily", priority: 0.92 },
    { url: `${base}/simulator`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/route-comparison`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/golden-boot`, changeFrequency: "daily", priority: 0.82 },
    { url: `${base}/methodology`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/tournaments`, changeFrequency: "daily", priority: 0.8 },
    ...tournamentRoutes,
    ...teamRoutes,
  ];
}
