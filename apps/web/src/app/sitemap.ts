import type { MetadataRoute } from "next";
import { getDataProvider } from "@/lib/provider";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const tournaments = await getDataProvider().listTournaments();

  const tournamentRoutes = tournaments.flatMap((t) => [
    { url: `${base}/tournaments/${t.slug}`, changeFrequency: "daily" as const, priority: 0.8 },
    {
      url: `${base}/tournaments/${t.slug}/simulate`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]);

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/tournaments`, changeFrequency: "daily", priority: 0.9 },
    ...tournamentRoutes,
  ];
}
