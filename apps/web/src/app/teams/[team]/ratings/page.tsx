import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRatingMeta, RATINGS } from "@worldcuplens/data-providers";
import { getTeamPool, WORLD_CUP_SLUG } from "@/lib/wc-insights";
import { buildRatingProfiles } from "@/lib/team-ratings";
import { flagEmoji } from "@/lib/format";
import { RadarChart } from "@/components/RadarChart";
import { RatingBars } from "@/components/RatingBars";
import { QualificationBadge } from "@/components/ui/QualificationBadge";
import { TrendIndicator } from "@/components/ui/TrendIndicator";
import { DataFreshness } from "@/components/DataFreshness";
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
    description: `How ${team.name} are rated: real Elo, recent form, qualification status and a per-skill breakdown with percentile rankings.`,
    alternates: { canonical: `/teams/${team.id}/ratings` },
  };
}

export default async function TeamRatingsPage({ params }: Params) {
  const teams = await getTeamPool(WORLD_CUP_SLUG);
  const formById = new Map(
    teams.flatMap((t) => {
      const m = getRatingMeta(t.id);
      return m ? [[t.id, m.formScore] as [string, number]] : [];
    }),
  );
  const profiles = buildRatingProfiles(teams, { formById });
  const profile = profiles.get(params.team);
  if (!profile) notFound();

  const { team } = profile;
  const meta = getRatingMeta(team.id);

  return (
    <>
      <TrackView event={{ type: "view_team", team: team.id }} />
      <nav className="crumbs">
        <Link href="/world-cup">World Cup 2026</Link> / {team.name}
      </nav>

      <p className="eyebrow">Rating transparency</p>
      <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
        {flagEmoji(team.countryCode)} {team.name}
        {meta && <QualificationBadge status={meta.qualification} />}
      </h1>

      {meta && (
        <div className="metric-grid" style={{ marginTop: "0.5rem" }}>
          <div className="metric">
            <div className="m-label">Elo rating</div>
            <div className="m-val" style={{ color: "var(--blue)" }}>{meta.rating}</div>
          </div>
          <div className="metric">
            <div className="m-label">12-month trend</div>
            <div className="m-val">
              <TrendIndicator movement={meta.movement} />
            </div>
          </div>
          <div className="metric">
            <div className="m-label">Recent form</div>
            <div className="m-val">{meta.formScore}/100</div>
          </div>
          <div className="metric">
            <div className="m-label">Last match</div>
            <div className="m-val" style={{ fontSize: "0.9rem" }}>{meta.lastMatchDate ?? "—"}</div>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="glass" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="stat-tile">
            <span className="st-label">Overall (0–100 scale)</span>
            <span className="st-value accent">{profile.overall}</span>
            <span className="st-sub">{profile.overallPercentile}th percentile of the field</span>
          </div>
          <RadarChart axes={profile.attributes.map((a) => ({ label: a.label, value: a.value }))} />
        </div>
        <RatingBars profile={profile} />
      </div>

      {meta && meta.recent.length > 0 && (
        <>
          <h2 className="section-title">Recent results</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Opponent</th>
                  <th className="num">Score</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {meta.recent.map((r, i) => (
                  <tr key={`${r.date}-${i}`}>
                    <td className="muted">{r.date}</td>
                    <td>{r.opponent}</td>
                    <td className="num">{r.score}</td>
                    <td>
                      <span className={`pill ${r.result === "W" ? "low" : r.result === "D" ? "medium" : "high"}`}>
                        {r.result === "W" ? "Win" : r.result === "D" ? "Draw" : "Loss"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="glass" style={{ marginTop: "1rem" }}>
        <div className="ic-kicker">🧠 How this rating is calculated</div>
        <p className="ic-summary" style={{ marginTop: "0.4rem" }}>
          The <strong>Elo rating</strong> and <strong>recent form</strong> are computed from real
          international results ({RATINGS.source}). The per-skill components below (attack, defence,
          set-piece threat, etc.) are currently derived from the overall rating as a transparent
          placeholder breakdown, pending granular data. Percentiles compare against the{" "}
          {teams.length}-team field.
        </p>
        <div style={{ marginTop: "0.6rem" }}>
          <DataFreshness />
        </div>
        <div className="actions">
          <Link className="btn ghost sm" href="/methodology">
            Full methodology →
          </Link>
        </div>
      </div>
    </>
  );
}
