import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { runTournamentSimulation } from "@/lib/simulate";
import { SimulationRunner } from "@/components/SimulationRunner";

export const revalidate = 3600;

interface Params {
  params: { slug: string };
}

export async function generateStaticParams() {
  // Reuse the parent route's params by deferring to the provider.
  const { getDataProvider } = await import("@/lib/provider");
  const tournaments = await getDataProvider().listTournaments();
  return tournaments.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { getDataProvider } = await import("@/lib/provider");
  const tournament = await getDataProvider().getTournament(params.slug);
  if (!tournament) return { title: "Simulation not found" };
  const title = `${tournament.name} — Win probabilities`;
  return {
    title,
    description: `Monte Carlo championship odds for every team in ${tournament.name}.`,
    alternates: { canonical: `/tournaments/${tournament.slug}/simulate` },
  };
}

export default async function SimulatePage({ params }: Params) {
  const sim = await runTournamentSimulation(params.slug);
  if (!sim) notFound();

  const { tournament, teamsById, result } = sim;

  return (
    <>
      <nav className="crumbs">
        <Link href="/tournaments">Tournaments</Link> /{" "}
        <Link href={`/tournaments/${tournament.slug}`}>{tournament.name}</Link> / Simulation
      </nav>

      <p className="eyebrow">{tournament.competition}</p>
      <h1 className="page-title">{tournament.name} — Win probabilities</h1>
      <p className="muted">
        Based on {result.iterations.toLocaleString()} simulated tournaments using
        Elo-derived team strengths. Re-run for a fresh set of draws.
      </p>

      <SimulationRunner
        slug={tournament.slug}
        teams={[...teamsById.values()]}
        initialResult={result}
      />

      <div className="actions">
        <Link className="btn secondary" href={`/tournaments/${tournament.slug}`}>
          ← Back to overview
        </Link>
      </div>
    </>
  );
}
