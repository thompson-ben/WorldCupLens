import Link from "next/link";
import type { TournamentSummary } from "@worldcuplens/data-providers";

export function TournamentCard({ tournament }: { tournament: TournamentSummary }) {
  return (
    <Link href={`/tournaments/${tournament.slug}`} className="card">
      <span className="tag">{tournament.competition}</span>
      <h3>{tournament.name}</h3>
      <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
        {tournament.season} · {tournament.teamCount} teams
      </p>
    </Link>
  );
}
