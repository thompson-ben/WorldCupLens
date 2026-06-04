import type { QualificationStatus } from "@worldcuplens/data-providers";

const MAP: Record<QualificationStatus, { label: string; cls: string }> = {
  qualified: { label: "Qualified", cls: "qual-q" },
  host: { label: "Host", cls: "qual-h" },
  playoff: { label: "Play-off", cls: "qual-p" },
  eliminated: { label: "Eliminated", cls: "qual-e" },
  unknown: { label: "TBD", cls: "qual-u" },
};

/** Real World Cup qualification status badge. */
export function QualificationBadge({ status }: { status: QualificationStatus }) {
  const m = MAP[status] ?? MAP.unknown;
  return <span className={`qbadge ${m.cls}`}>{m.label}</span>;
}
