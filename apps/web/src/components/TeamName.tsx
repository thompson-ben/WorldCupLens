import type { Team } from "@worldcuplens/core";
import { flagEmoji } from "@/lib/format";

/** Renders a team's flag + name, falling back to the id if it's unknown. */
export function TeamName({ team, id }: { team: Team | undefined; id: string }) {
  if (!team) return <span>{id}</span>;
  const flag = flagEmoji(team.countryCode);
  return (
    <span>
      {flag && <span aria-hidden>{flag} </span>}
      {team.name}
    </span>
  );
}
