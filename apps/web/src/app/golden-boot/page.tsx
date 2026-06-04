import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorldCupInsights } from "@/lib/wc-insights";
import { flagEmoji, percent } from "@/lib/format";
import { GoldenBootTable } from "@/components/cards/GoldenBootTable";
import { ShareButton } from "@/components/ui/ShareButton";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Golden Boot Lens — Top scorer projections",
  description:
    "Projected World Cup 2026 Golden Boot race: expected goals and win probability for the tournament's leading marksmen, from the latest simulations.",
  alternates: { canonical: "/golden-boot" },
};

export default async function GoldenBootPage() {
  const wc = await getWorldCupInsights();
  if (!wc) notFound();
  const top = wc.goldenBoot[0];

  return (
    <>
      <p className="eyebrow">Golden Boot Lens</p>
      <h1 className="page-title">Top scorer projections</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        Who finishes the World Cup as top scorer? Expected goals scale with a player&apos;s finishing,
        their team&apos;s attack and how far they&apos;re projected to go.
      </p>

      {top && (
        <div className="glass" style={{ marginTop: "1rem" }}>
          <div className="ic-top">
            <span className="ic-kicker">👟 Projected leader</span>
            <ShareButton
              card="golden-boot"
              label="Share"
              className="btn ghost sm"
              text={`👟 Golden Boot watch: ${top.name} projects for ${top.expectedGoals} goals (${percent(
                top.goldenBootProb,
                0,
              )} to win it). Via WorldCupLens`}
            />
          </div>
          <div className="scoreboard" style={{ gridTemplateColumns: "1fr" }}>
            <div className="sb-team">
              <span className="sb-flag" aria-hidden>
                {flagEmoji(top.countryCode)}
              </span>
              <span className="sb-name" style={{ fontSize: "1.1rem" }}>
                {top.name}
              </span>
              <span className="sb-prob b">{percent(top.goldenBootProb, 0)}</span>
              <span className="faint" style={{ fontSize: "0.8rem" }}>
                {top.expectedGoals} expected goals · {top.teamName}
              </span>
            </div>
          </div>
        </div>
      )}

      <h2 className="section-title">The race</h2>
      <GoldenBootTable entries={wc.goldenBoot} />

      <div className="glass" style={{ marginTop: "1rem" }}>
        <div className="ic-kicker">🧠 How this is calculated</div>
        <p className="ic-summary" style={{ marginTop: "0.4rem" }}>
          Each player&apos;s expected goals combine a finishing rating, their team&apos;s attacking
          strength and the number of matches their team is projected to play across all simulations.
          Golden Boot probability is the share of that scoring expectation across the field. Player
          data is illustrative for now and structured to swap for a live feed.
        </p>
      </div>

      <div className="actions">
        <Link className="btn ghost" href="/world-cup">
          ← World Cup dashboard
        </Link>
      </div>
    </>
  );
}
