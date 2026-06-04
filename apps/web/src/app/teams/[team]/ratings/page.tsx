import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamPool, WORLD_CUP_SLUG } from "@/lib/wc-insights";
import { buildRatingProfiles } from "@/lib/team-ratings";
import { flagEmoji } from "@/lib/format";
import { RadarChart } from "@/components/RadarChart";
import { RatingBars } from "@/components/RatingBars";
import { TrackView } from "@/components/TrackView";

export const revalidate = 3600;

interface Params {
  params: { team: string };
}

export async function generateStaticParams() {
  const teams = await getTeamPool(WORLD_CUP_SLUG);
  return teams.map((t) => ({ team: t.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const teams = await getTeamPool(WORLD_CUP_SLUG);
  const team = teams.find((t) => t.id === params.team);
  if (!team) return { title: "Team not found" };
  return {
    title: `${team.name} — Rating breakdown`,
    description: `How ${team.name} are rated: attack, defence, form, squad depth, experience and more, with percentile rankings.`,
    alternates: { canonical: `/teams/${team.id}/ratings` },
  };
}

export default async function TeamRatingsPage({ params }: Params) {
  const teams = await getTeamPool(WORLD_CUP_SLUG);
  const profiles = buildRatingProfiles(teams);
  const profile = profiles.get(params.team);
  if (!profile) notFound();

  const { team } = profile;

  return (
    <>
      <TrackView event={{ type: "view_team", team: team.id }} />
      <nav className="crumbs">
        <Link href="/world-cup">World Cup 2026</Link> / {team.name}
      </nav>

      <p className="eyebrow">Rating transparency</p>
      <h1 className="page-title">
        {flagEmoji(team.countryCode)} {team.name}
      </h1>

      <div className="grid grid-2">
        <div className="glass" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="stat-tile">
            <span className="st-label">Overall rating</span>
            <span className="st-value accent">{profile.overall}</span>
            <span className="st-sub">{profile.overallPercentile}th percentile of the field</span>
          </div>
          <RadarChart axes={profile.attributes.map((a) => ({ label: a.label, value: a.value }))} />
        </div>
        <RatingBars profile={profile} />
      </div>

      <div className="glass" style={{ marginTop: "1rem" }}>
        <div className="ic-kicker">🧠 How this rating is calculated</div>
        <p className="ic-summary" style={{ marginTop: "0.4rem" }}>
          The <strong>overall rating</strong> reflects each team&apos;s strength on the same scale the
          simulation uses to play matches. The component ratings shown here are currently derived
          from that overall rating as a transparent placeholder breakdown — directionally useful, and
          on the roadmap to be replaced with granular per-skill data. Percentiles compare each team
          against the rest of the {teams.length}-team field.
        </p>
        <div className="actions">
          <Link className="btn ghost sm" href="/methodology">
            Full methodology →
          </Link>
        </div>
      </div>
    </>
  );
}
