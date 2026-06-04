import Link from "next/link";
import type { Insight } from "@/lib/intelligence";
import { ConfidenceBadge } from "../ui/ConfidenceBadge";
import { ShareButton } from "../ui/ShareButton";

/** Renders a generated {@link Insight} — used on the homepage and Daily Brief. */
export function IntelInsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="glass insight">
      <div className="ic-top">
        <span className="ic-kicker">
          {insight.icon} {insight.kicker}
        </span>
        <ConfidenceBadge pct={insight.confidence} category={insight.confidenceCategory} />
      </div>
      <h3 className="ic-title">{insight.title}</h3>
      <p className="ic-summary">{insight.summary}</p>
      {insight.supportingData.length > 0 && (
        <ul className="support-list">
          {insight.supportingData.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      <div className="ic-foot">
        {insight.relatedTeam ? (
          <Link className="ic-meta" href={`/teams/${insight.relatedTeam}/ratings`}>
            Rating breakdown →
          </Link>
        ) : (
          <span className="ic-meta" />
        )}
        <ShareButton text={insight.shareText} card={insight.type} label="Share" className="btn ghost sm" />
      </div>
    </div>
  );
}
