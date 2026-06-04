/** Colour-coded risk/confidence pill. */
export function Pill({ level, children }: { level: "Low" | "Medium" | "High"; children: React.ReactNode }) {
  return <span className={`pill ${level.toLowerCase()}`}>{children}</span>;
}
