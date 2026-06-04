import type { ReactNode } from "react";
import type { MatchInsights, TeamLite } from "@/lib/match-insights";
import { flagEmoji, percent } from "@/lib/format";
import { Pill } from "../ui/Pill";

function TeamHead({ team, side, prob }: { team: TeamLite; side: "a" | "b"; prob: number }) {
  const flag = flagEmoji(team.countryCode);
  return (
    <div className="sb-team">
      {flag && <span className="sb-flag" aria-hidden>{flag}</span>}
      <span className="sb-name">{team.name}</span>
      <span className={`sb-prob ${side}`}>{percent(prob, 0)}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="m-label">{label}</div>
      <div className="m-val">{value}</div>
    </div>
  );
}

/**
 * Scoreboard-style match prediction — the product's screenshot/share centrepiece.
 * Shows W/D/W, the most likely scoreline, projected match stats, match shape
 * pills and a plain-English read.
 */
export function MatchPredictionCard({
  insights,
  footer,
}: {
  insights: MatchInsights;
  footer?: ReactNode;
}) {
  const i = insights;
  return (
    <div className="glass">
      <div className="scoreboard">
        <TeamHead team={i.teamA} side="a" prob={i.winA} />
        <div className="sb-mid">
          <span className="sb-draw-label">Draw</span>
          <span className="sb-draw">{percent(i.draw, 0)}</span>
          <span className="sb-score">
            {i.mostLikelyScore.home}-{i.mostLikelyScore.away}
          </span>
          <span className="faint" style={{ fontSize: "0.62rem", letterSpacing: "0.08em" }}>
            MOST LIKELY
          </span>
        </div>
        <TeamHead team={i.teamB} side="b" prob={i.winB} />
      </div>

      <div className="split-bar" aria-hidden>
        <i className="a" style={{ width: `${i.winA * 100}%` }} />
        <i className="d" style={{ width: `${i.draw * 100}%` }} />
        <i className="b" style={{ width: `${i.winB * 100}%` }} />
      </div>

      <div className="metric-grid" style={{ marginTop: "0.9rem" }}>
        <Metric label="Expected goals" value={`${i.xgA.toFixed(1)} – ${i.xgB.toFixed(1)}`} />
        <Metric label="Shots" value={`${i.shotsA} – ${i.shotsB}`} />
        <Metric label="On target" value={`${i.sotA} – ${i.sotB}`} />
        <Metric label="Corners" value={`${i.cornersA} – ${i.cornersB}`} />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          alignItems: "center",
          margin: "0.85rem 0",
        }}
      >
        <span className="tag">Tempo · {i.tempo.label}</span>
        <span className="tag">~{i.cardsTotal} cards</span>
        <span className="faint" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.74rem" }}>
          Upset <Pill level={i.upsetRisk.label}>{i.upsetRisk.label}</Pill>
        </span>
        <span className="faint" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.74rem" }}>
          Confidence <Pill level={i.confidence.label}>{i.confidence.label}</Pill>
        </span>
      </div>

      <p className="callout">{i.narrative}</p>

      <div className="faint" style={{ fontSize: "0.8rem", marginTop: "0.6rem" }}>
        Likely scores:{" "}
        {i.topScorelines
          .slice(0, 3)
          .map((s) => `${s.home}-${s.away} (${percent(s.prob, 0)})`)
          .join("  ·  ")}
      </div>

      {footer && <div className="actions">{footer}</div>}
    </div>
  );
}
