import { confidenceCategory, type ConfidenceCategory } from "@/lib/confidence";

const CLASS: Record<ConfidenceCategory, string> = {
  Low: "conf-low",
  Medium: "conf-medium",
  High: "conf-high",
  "Very High": "conf-vhigh",
};

/** Reusable confidence indicator: a % plus a Low/Medium/High/Very High label. */
export function ConfidenceBadge({
  pct,
  category,
  title,
}: {
  pct: number;
  category?: ConfidenceCategory;
  title?: string;
}) {
  const cat = category ?? confidenceCategory(pct);
  return (
    <span className={`conf ${CLASS[cat]}`} title={title}>
      <span className="conf-dot" aria-hidden />
      {pct}% · {cat}
    </span>
  );
}
