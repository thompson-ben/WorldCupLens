import { getDataProvider } from "@/lib/provider";
import { TournamentCard } from "@/components/TournamentCard";

// Seed data is static; revalidate hourly so a live provider stays fresh.
export const revalidate = 3600;

export default async function HomePage() {
  const tournaments = await getDataProvider().listTournaments();

  return (
    <>
      <section style={{ marginTop: "1.5rem" }}>
        <p className="eyebrow">Sports analytics</p>
        <h1 className="page-title">Simulate any tournament. See who really wins.</h1>
        <p className="muted" style={{ maxWidth: "42rem" }}>
          WorldCupLens runs Monte Carlo simulations on a tournament-agnostic
          engine — group stages, league phases and knockout brackets alike —
          to project championship odds for every team.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginTop: "2rem" }}>Featured tournaments</h2>
        <div className="grid grid-3">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </section>
    </>
  );
}
