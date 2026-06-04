import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { FormatConfig } from "@worldcuplens/core";
import { getDataProvider } from "@/lib/provider";
import { TeamName } from "@/components/TeamName";

export const revalidate = 3600;

interface Params {
  params: { slug: string };
}

// Pre-render every known tournament for SEO + speed.
export async function generateStaticParams() {
  const tournaments = await getDataProvider().listTournaments();
  return tournaments.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const tournament = await getDataProvider().getTournament(params.slug);
  if (!tournament) return { title: "Tournament not found" };

  const title = `${tournament.name} — Simulation & odds`;
  const description = `Championship projections and team-by-team odds for ${tournament.name}, powered by Monte Carlo simulation.`;
  return {
    title,
    description,
    alternates: { canonical: `/tournaments/${tournament.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

function describeFormat(format: FormatConfig): string {
  switch (format.kind) {
    case "league":
      return `Round-robin league (${format.legs === 2 ? "home & away" : "single round"})`;
    case "group-knockout":
      return `${format.groups.length} groups, top ${format.advancePerGroup} advance to a knockout bracket`;
    case "knockout":
      return "Single-elimination knockout";
    case "league-phase-knockout":
      return `League phase (${format.matchesPerTeam} games each), top ${format.knockoutQualifiers} reach the knockout phase`;
  }
}

export default async function TournamentPage({ params }: Params) {
  const provider = getDataProvider();
  const tournament = await provider.getTournament(params.slug);
  if (!tournament) notFound();

  const teams = await provider.getTeams(tournament.id);
  const teamsById = new Map(teams.map((t) => [t.id, t]));
  const format = tournament.format;

  return (
    <>
      <nav className="crumbs">
        <Link href="/tournaments">Tournaments</Link> / {tournament.name}
      </nav>

      <p className="eyebrow">{tournament.competition}</p>
      <h1 className="page-title">{tournament.name}</h1>
      <p className="muted">
        {tournament.season}
        {tournament.hosts?.length ? ` · Hosted in ${tournament.hosts.join(", ")}` : ""} ·{" "}
        {describeFormat(format)}
      </p>

      <div className="actions">
        <Link className="btn" href={`/tournaments/${tournament.slug}/simulate`}>
          Run simulation →
        </Link>
      </div>

      {format.kind === "group-knockout" ? (
        <section>
          <h2 style={{ fontSize: "1.1rem", marginTop: "2rem" }}>Groups</h2>
          <div className="grid grid-3">
            {format.groups.map((group) => (
              <div className="card" key={group.id}>
                <h3>{group.name}</h3>
                <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                  {group.teamIds.map((id) => (
                    <li key={id}>
                      <TeamName team={teamsById.get(id)} id={id} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <h2 style={{ fontSize: "1.1rem", marginTop: "2rem" }}>
            Teams ({teams.length})
          </h2>
          <div className="grid grid-3">
            {teams.map((team) => (
              <div className="card" key={team.id}>
                <TeamName team={team} id={team.id} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
