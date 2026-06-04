import type { RatingProfile } from "@/lib/team-ratings";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}

/** Per-attribute progress bars with value + percentile ranking. */
export function RatingBars({ profile }: { profile: RatingProfile }) {
  return (
    <div className="glass">
      <div className="ic-kicker">📊 Rating breakdown</div>
      <div style={{ marginTop: "0.5rem" }}>
        {profile.attributes.map((a) => (
          <div key={a.key} className="rating-row">
            <div className="rating-head">
              <span className="rating-label">{a.label}</span>
              <span className="rating-val">
                {a.value}
                <span className="faint" style={{ fontWeight: 500 }}>
                  {" "}
                  · {ordinal(a.percentile)} pct
                </span>
              </span>
            </div>
            <div className="track">
              <span style={{ width: `${a.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
