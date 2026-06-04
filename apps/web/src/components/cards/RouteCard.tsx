import type { TeamLite } from "@/lib/match-insights";
import { flagEmoji, percent } from "@/lib/format";
import { ShareButton } from "../ui/ShareButton";

const ROUND_LABELS = ["R32", "R16", "QF", "SF", "Final"];

export interface RouteData {
  title: string;
  tone: "kind" | "median" | "tough";
  difficulty: string;
  opponents: TeamLite[];
  avgOpponent: number;
  finalProb: number;
  winnerProb: number;
  shareText?: string;
}

/** A single hypothetical knockout path with its difficulty + outcome chances. */
export function RouteCard({ route }: { route: RouteData }) {
  return (
    <div className="glass">
      <div className="ic-top">
        <span className="ic-kicker">{route.title}</span>
        <span className={`pill ${route.tone === "tough" ? "high" : route.tone === "kind" ? "low" : "medium"}`}>
          {route.difficulty}
        </span>
      </div>

      <div className="route-path">
        {route.opponents.map((o, i) => (
          <div className="route-step" key={`${o.id}-${i}`}>
            <span className="route-round">{ROUND_LABELS[i]}</span>
            <span className="route-flag" aria-hidden>
              {flagEmoji(o.countryCode)}
            </span>
            <span className="route-opp">{o.code ?? o.name}</span>
          </div>
        ))}
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "0.8rem" }}>
        <div className="metric">
          <div className="m-label">Reach final</div>
          <div className="m-val" style={{ color: "var(--blue)" }}>{percent(route.finalProb, 0)}</div>
        </div>
        <div className="metric">
          <div className="m-label">Win it</div>
          <div className="m-val" style={{ color: "var(--gold)" }}>{percent(route.winnerProb, 0)}</div>
        </div>
      </div>
      <div className="faint" style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>
        Avg. opponent strength {Math.round(route.avgOpponent)}
      </div>
      {route.shareText && (
        <div className="actions">
          <ShareButton text={route.shareText} card="route-comparison" label="Share route" className="btn ghost sm" />
        </div>
      )}
    </div>
  );
}
