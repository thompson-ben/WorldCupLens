interface Axis {
  label: string;
  value: number; // 0–100
}

/** Lightweight SVG radar chart — no charting dependency. */
export function RadarChart({ axes, size = 300 }: { axes: Axis[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 52;
  const n = axes.length;

  const point = (i: number, frac: number): [number, number] => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(angle) * r * frac, cy + Math.sin(angle) * r * frac];
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = axes.map((a, i) => point(i, Math.max(0.04, a.value / 100)));
  const dataPath = dataPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" role="img" aria-label="Rating radar">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, i) => point(i, ring).map((v) => v.toFixed(1)).join(",")).join(" ")}
          fill="none"
          stroke="rgba(134,153,196,0.18)"
          strokeWidth={1}
        />
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1);
        return <line key={a.label} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(134,153,196,0.18)" />;
      })}
      <polygon points={dataPath} fill="rgba(56,189,248,0.22)" stroke="#38bdf8" strokeWidth={2} />
      {dataPoints.map(([x, y], i) => (
        <circle key={axes[i]!.label} cx={x} cy={y} r={3} fill="#38bdf8" />
      ))}
      {axes.map((a, i) => {
        const [x, y] = point(i, 1.16);
        const anchor = x < cx - 5 ? "end" : x > cx + 5 ? "start" : "middle";
        return (
          <text
            key={a.label}
            x={x}
            y={y}
            fontSize={9}
            fill="#93a3c0"
            textAnchor={anchor}
            dominantBaseline="middle"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
