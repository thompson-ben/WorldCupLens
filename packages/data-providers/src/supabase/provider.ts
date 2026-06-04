import type {
  FormatConfig,
  Match,
  MatchStatus,
  Team,
  TeamRating,
  Tournament,
} from "@worldcuplens/core";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DataProvider, TournamentSummary } from "../provider.js";

/** Row shapes as stored in Postgres (see schema.sql). */
interface TournamentRow {
  id: string;
  slug: string;
  name: string;
  sport: Tournament["sport"];
  competition: string;
  season: string;
  start_date: string | null;
  end_date: string | null;
  hosts: string[] | null;
  format: FormatConfig;
}

interface TeamRow {
  id: string;
  name: string;
  short_name: string | null;
  code: string | null;
  country_code: string | null;
  crest_url: string | null;
}

interface MatchRow {
  id: string;
  tournament_id: string;
  stage_id: string;
  home_team_id: string;
  away_team_id: string;
  kickoff: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
}

/** Keep only non-null props, narrowing each value to its NonNullable type. */
function nullableProps<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T]?: NonNullable<T[K]> } {
  const out: { [K in keyof T]?: NonNullable<T[K]> } = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      out[key as keyof T] = value as NonNullable<T[keyof T]>;
    }
  }
  return out;
}

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    ...nullableProps({
      shortName: row.short_name,
      code: row.code,
      countryCode: row.country_code,
      crestUrl: row.crest_url,
    }),
  };
}

/**
 * Supabase/Postgres-backed provider. Construct it with an existing
 * `SupabaseClient` (created in the app's server layer) so this package never
 * owns credentials and `@supabase/supabase-js` stays an optional peer.
 *
 * Expects the schema in `schema.sql`.
 */
export class SupabaseDataProvider implements DataProvider {
  constructor(private readonly client: SupabaseClient) {}

  async listTournaments(): Promise<TournamentSummary[]> {
    const { data, error } = await this.client
      .from("tournaments")
      .select("id, slug, name, competition, season, sport, tournament_teams(count)");
    if (error) throw new Error(`listTournaments failed: ${error.message}`);

    return (data ?? []).map((row) => {
      const counts = row.tournament_teams as unknown as Array<{ count: number }> | null;
      return {
        id: row.id as string,
        slug: row.slug as string,
        name: row.name as string,
        competition: row.competition as string,
        season: row.season as string,
        sport: row.sport as Tournament["sport"],
        teamCount: counts?.[0]?.count ?? 0,
      };
    });
  }

  async getTournament(slug: string): Promise<Tournament | null> {
    const { data, error } = await this.client
      .from("tournaments")
      .select("*")
      .eq("slug", slug)
      .maybeSingle<TournamentRow>();
    if (error) throw new Error(`getTournament failed: ${error.message}`);
    if (!data) return null;

    const teamIds = await this.teamIdsFor(data.id);
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      sport: data.sport,
      competition: data.competition,
      season: data.season,
      format: data.format,
      teamIds,
      ...nullableProps({
        startDate: data.start_date,
        endDate: data.end_date,
        hosts: data.hosts,
      }),
    };
  }

  private async teamIdsFor(tournamentId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("tournament_teams")
      .select("team_id")
      .eq("tournament_id", tournamentId);
    if (error) throw new Error(`teamIdsFor failed: ${error.message}`);
    return (data ?? []).map((row) => row.team_id as string);
  }

  async getTeams(tournamentId: string): Promise<Team[]> {
    const { data, error } = await this.client
      .from("tournament_teams")
      .select("teams(*)")
      .eq("tournament_id", tournamentId);
    if (error) throw new Error(`getTeams failed: ${error.message}`);
    return (data ?? [])
      .map((row) => row.teams as unknown as TeamRow | null)
      .filter((t): t is TeamRow => t !== null)
      .map(toTeam);
  }

  async getRatings(tournamentId: string): Promise<TeamRating[]> {
    const { data, error } = await this.client
      .from("tournament_teams")
      .select("team_id, rating")
      .eq("tournament_id", tournamentId);
    if (error) throw new Error(`getRatings failed: ${error.message}`);
    return (data ?? []).map((row) => ({
      teamId: row.team_id as string,
      rating: Number(row.rating),
    }));
  }

  async getMatches(tournamentId: string): Promise<Match[]> {
    const { data, error } = await this.client
      .from("matches")
      .select("*")
      .eq("tournament_id", tournamentId)
      .order("kickoff", { ascending: true });
    if (error) throw new Error(`getMatches failed: ${error.message}`);

    return (data ?? []).map((row: MatchRow) => {
      const match: Match = {
        id: row.id,
        tournamentId: row.tournament_id,
        stageId: row.stage_id,
        homeTeamId: row.home_team_id,
        awayTeamId: row.away_team_id,
        status: row.status,
        ...nullableProps({ kickoff: row.kickoff }),
      };
      if (row.home_score !== null && row.away_score !== null) {
        match.score = { home: row.home_score, away: row.away_score };
      }
      return match;
    });
  }
}
