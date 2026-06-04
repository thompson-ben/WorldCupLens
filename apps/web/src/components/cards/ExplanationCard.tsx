/**
 * Reusable "Why this prediction?" card. Lists the supporting reasons and, where
 * relevant, the risks — turning a bare probability into something a fan can
 * understand and trust.
 */
export function ExplanationCard({
  title = "Why this prediction?",
  reasons,
  risks,
}: {
  title?: string;
  reasons: string[];
  risks?: string[];
}) {
  return (
    <div className="glass">
      <div className="ic-kicker">🧠 Explanation</div>
      <h3 className="ic-title" style={{ marginBottom: "0.5rem" }}>
        {title}
      </h3>
      <ul className="reason-list">
        {reasons.map((r) => (
          <li key={r} className="reason ok">
            {r}
          </li>
        ))}
      </ul>
      {risks && risks.length > 0 && (
        <>
          <div className="st-label" style={{ marginTop: "0.7rem" }}>
            Risks
          </div>
          <ul className="reason-list">
            {risks.map((r) => (
              <li key={r} className="reason risk">
                {r}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
