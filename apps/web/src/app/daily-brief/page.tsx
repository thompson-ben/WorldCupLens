import type { Metadata } from "next";
import Link from "next/link";
import { getIntelligenceFeed } from "@/lib/intelligence";
import { IntelInsightCard } from "@/components/cards/IntelInsightCard";
import { TrackView } from "@/components/TrackView";

// Refresh a few times a day so the brief stays current.
export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Daily World Cup Brief",
  description:
    "Your daily World Cup 2026 intelligence: biggest movers, shock risks, dark horses, the most likely final, Golden Boot watch and the group of death — all from the latest simulations.",
  alternates: { canonical: "/daily-brief" },
};

export default async function DailyBriefPage() {
  const insights = await getIntelligenceFeed();
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <TrackView event={{ type: "view_daily_brief" }} />
      <p className="eyebrow">Daily Brief · {today}</p>
      <h1 className="page-title">Today&apos;s World Cup intelligence</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        The story of the tournament from our latest simulation batch — movers, shocks, dark horses
        and more. Updated through the day.
      </p>

      {insights.length === 0 ? (
        <p className="muted">The brief is being generated — check back shortly.</p>
      ) : (
        <div className="grid grid-3">
          {insights.map((insight) => (
            <IntelInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      <div className="actions">
        <Link className="btn" href="/world-cup">
          Full dashboard →
        </Link>
        <Link className="btn ghost" href="/methodology">
          How these are calculated
        </Link>
      </div>
    </>
  );
}
