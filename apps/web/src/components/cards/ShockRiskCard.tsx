import type { TeamLite } from "@/lib/match-insights";
import { flagEmoji } from "@/lib/format";
import { Pill } from "../ui/Pill";
import { ShareButton } from "../ui/ShareButton";

/** Highlights a match with notable upset potential — a prime shareable. */
export function ShockRiskCard({
  favorite,
  underdog,
  upsetPct,
  level,
  summary,
  shareText,
}: {
  favorite: TeamLite;
  underdog: TeamLite;
  upsetPct: number;
  level: "Low" | "Medium" | "High";
  summary: string;
  shareText?: string;
}) {
  return (
    <div className="glass insight">
      <div className="ic-top">
        <span className="ic-kicker">⚠️ Shock Risk</span>
        <Pill level={level}>{level}</Pill>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
        <span className="st-value gold">{upsetPct}%</span>
        <span className="st-label">upset chance</span>
      </div>
      <h3 className="ic-title" style={{ margin: 0 }}>
        {flagEmoji(underdog.countryCode)} {underdog.name} vs {favorite.name}{" "}
        {flagEmoji(favorite.countryCode)}
      </h3>
      <p className="ic-summary">{summary}</p>
      {shareText && (
        <div className="ic-foot">
          <span className="ic-meta">Projected matchup</span>
          <ShareButton text={shareText} label="Share" className="btn ghost sm" />
        </div>
      )}
    </div>
  );
}
