import type { TeamLite } from "@/lib/match-insights";
import { ProbRow } from "../ui/ProbRow";
import { ShareButton } from "../ui/ShareButton";

export interface RankedEntry {
  team: TeamLite;
  value: number;
}

/** A ranked leaderboard card (winners, finalists, dark horses, …). */
export function TournamentWinnerCard({
  kicker,
  title,
  entries,
  variant = "gold",
  shareText,
  icon,
}: {
  kicker: string;
  title: string;
  entries: RankedEntry[];
  variant?: "blue" | "gold" | "green";
  shareText?: string;
  icon?: string;
}) {
  const max = entries[0]?.value ?? 1;
  return (
    <div className="glass">
      <div className="ic-top">
        <span className="ic-kicker">
          {icon ? `${icon} ` : ""}
          {kicker}
        </span>
        {shareText && <ShareButton text={shareText} label="Share" className="btn ghost sm" />}
      </div>
      <h3 className="ic-title" style={{ marginBottom: "0.4rem" }}>
        {title}
      </h3>
      <div>
        {entries.map((e) => (
          <ProbRow key={e.team.id} team={e.team} value={e.value} max={max} variant={variant} />
        ))}
      </div>
    </div>
  );
}
