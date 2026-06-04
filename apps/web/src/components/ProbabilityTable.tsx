import type { Team, SimulationResult } from "@worldcuplens/core";
import { percent } from "@/lib/format";
import { TeamName } from "./TeamName";

/**
 * Per-team championship projections. The leading column doubles as a visual
 * bar so the table reads at a glance on mobile.
 */
export function ProbabilityTable({
  result,
  teamsById,
}: {
  result: SimulationResult;
  teamsById: Map<string, Team>;
}) {
  const max = result.teams[0]?.champion ?? 1;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th className="num">Win</th>
            <th>Chance</th>
            <th className="num">Final</th>
            <th className="num">Avg. finish</th>
          </tr>
        </thead>
        <tbody>
          {result.teams.map((row, index) => (
            <tr key={row.teamId}>
              <td className="num muted">{index + 1}</td>
              <td>
                <TeamName team={teamsById.get(row.teamId)} id={row.teamId} />
              </td>
              <td className="num">{percent(row.champion)}</td>
              <td>
                <div className="bar" aria-hidden>
                  <span style={{ width: `${max > 0 ? (row.champion / max) * 100 : 0}%` }} />
                </div>
              </td>
              <td className="num">{percent(row.finalist)}</td>
              <td className="num">{row.averageFinish.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
