import type { TeamLite } from "@/lib/match-insights";
import { flagEmoji, percent } from "@/lib/format";

/** A team name + probability with an inline bar. `max` scales the bar fill. */
export function ProbRow({
  team,
  label,
  value,
  max = 1,
  variant = "blue",
}: {
  team?: TeamLite;
  label?: string;
  value: number;
  max?: number;
  variant?: "blue" | "gold" | "green";
}) {
  const flag = team ? flagEmoji(team.countryCode) : "";
  const name = label ?? team?.name ?? team?.id ?? "—";
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="probrow">
      <div className="prob-name">
        {flag && <span aria-hidden>{flag}</span>}
        <span className="nm">{name}</span>
      </div>
      <div className="prob-val">{percent(value)}</div>
      <div className={`track ${variant === "blue" ? "" : variant}`}>
        <span style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
