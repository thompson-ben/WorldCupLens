import type { Metadata } from "next";
import { getDataProvider } from "@/lib/provider";
import { TournamentCard } from "@/components/TournamentCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tournaments",
  description: "Browse every tournament available to simulate on WorldCupLens.",
};

export default async function TournamentsPage() {
  const tournaments = await getDataProvider().listTournaments();

  return (
    <>
      <h1 className="page-title">Tournaments</h1>
      <p className="muted">
        Choose a tournament to explore projections, likely outcomes and route-to-final scenarios.
      </p>
      <div className="grid grid-3">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    </>
  );
}
