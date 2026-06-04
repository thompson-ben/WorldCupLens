import type { GoldenBootEntry } from "@/lib/golden-boot";
import { flagEmoji, percent } from "@/lib/format";

/** Top-scorer projection leaderboard. */
export function GoldenBootTable({ entries }: { entries: GoldenBootEntry[] }) {
  const max = entries[0]?.goldenBootProb ?? 1;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Team</th>
            <th className="num">xG</th>
            <th className="num">Golden Boot</th>
            <th>Chance</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 15).map((e, i) => (
            <tr key={e.name}>
              <td className="num muted">{i + 1}</td>
              <td style={{ fontWeight: 600 }}>{e.name}</td>
              <td className="muted">
                {flagEmoji(e.countryCode)} {e.teamName}
              </td>
              <td className="num">{e.expectedGoals.toFixed(1)}</td>
              <td className="num">{percent(e.goldenBootProb, 0)}</td>
              <td>
                <div className="bar" aria-hidden>
                  <span style={{ width: `${max > 0 ? (e.goldenBootProb / max) * 100 : 0}%` }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
