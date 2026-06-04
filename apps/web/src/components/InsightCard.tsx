import { ShareButton } from "./ui/ShareButton";

export interface InsightCardData {
  kicker: string;
  title: string;
  summary: string;
  /** 0–100. */
  confidence?: number;
  meta?: string;
  shareText?: string;
  icon?: string;
}

/**
 * Reusable fan-facing insight card: a kicker, a punchy headline, a one-line
 * read, an optional confidence %, and a share action. The building block for
 * "Shock Risk", "Dark Horse Watch", "Most Likely Final" and friends.
 */
export function InsightCard({ data }: { data: InsightCardData }) {
  return (
    <div className="glass insight">
      <div className="ic-top">
        <span className="ic-kicker">
          {data.icon ? `${data.icon} ` : ""}
          {data.kicker}
        </span>
        {data.confidence !== undefined && (
          <span className="tag">{Math.round(data.confidence)}% confidence</span>
        )}
      </div>
      <h3 className="ic-title">{data.title}</h3>
      <p className="ic-summary">{data.summary}</p>
      <div className="ic-foot">
        <span className="ic-meta">{data.meta}</span>
        {data.shareText && <ShareButton text={data.shareText} label="Share" className="btn ghost sm" />}
      </div>
    </div>
  );
}
