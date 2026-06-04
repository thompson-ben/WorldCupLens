import type { TeamLite } from "@/lib/match-insights";
import { flagEmoji } from "@/lib/format";
import { ProbRow } from "../ui/ProbRow";
import { ShareButton } from "../ui/ShareButton";

export interface RouteStep {
  label: string;
  prob: number;
}

/** A team's projected path to the final as a stage-by-stage funnel. */
export function RouteToFinalCard({
  team,
  steps,
  shareText,
}: {
  team: TeamLite;
  steps: RouteStep[];
  shareText?: string;
}) {
  const flag = flagEmoji(team.countryCode);
  return (
    <div className="glass">
      <div className="ic-top">
        <span className="ic-kicker">🧭 Route to the Final</span>
        {shareText && <ShareButton text={shareText} label="Share" className="btn ghost sm" />}
      </div>
      <h3 className="ic-title" style={{ marginBottom: "0.1rem" }}>
        {flag && <span aria-hidden>{flag} </span>}
        {team.name}
      </h3>
      <p className="ic-summary" style={{ marginBottom: "0.4rem" }}>
        Projected chance of reaching each stage.
      </p>
      <div>
        {steps.map((s) => (
          <ProbRow key={s.label} label={s.label} value={s.prob} max={1} variant="green" />
        ))}
      </div>
    </div>
  );
}
