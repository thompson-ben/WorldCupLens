import { RATINGS } from "@worldcuplens/data-providers";

function fmt(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Data-freshness indicator shown across the site so users always know where the
 * numbers come from and how recent they are.
 */
export function DataFreshness({ variant = "line" }: { variant?: "line" | "card" }) {
  const updated = fmt(RATINGS.generatedAt);
  const ratingDate = fmt(RATINGS.ratingDate);

  if (variant === "card") {
    return (
      <div className="glass">
        <div className="ic-kicker">🛰️ Data freshness</div>
        <ul className="support-list" style={{ marginTop: "0.4rem" }}>
          <li>Source: {RATINGS.source}</li>
          <li>Rating date: {ratingDate} (latest match included)</li>
          <li>Last updated: {updated}</li>
          <li>{RATINGS.teamCount} national teams rated</li>
        </ul>
      </div>
    );
  }

  return (
    <p className="freshness">
      <span className="fresh-dot" aria-hidden /> Real Elo ratings · rating date{" "}
      <strong>{ratingDate}</strong> · updated {updated} ·{" "}
      <span className="faint">{RATINGS.source}</span>
    </p>
  );
}
