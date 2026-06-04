/** Rating movement arrow (vs ~12 months ago), in Elo points. */
export function TrendIndicator({ movement }: { movement: number }) {
  if (movement > 1) return <span style={{ color: "var(--green)", fontWeight: 700 }}>▲ {movement}</span>;
  if (movement < -1) return <span style={{ color: "var(--red)", fontWeight: 700 }}>▼ {Math.abs(movement)}</span>;
  return <span className="faint">▬ stable</span>;
}
