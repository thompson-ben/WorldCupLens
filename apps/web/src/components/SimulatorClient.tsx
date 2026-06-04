"use client";

import { useMemo, useState } from "react";
import { computeMatchInsights, type TeamLite } from "@/lib/match-insights";
import { MatchPredictionCard } from "./cards/MatchPredictionCard";
import { ShareButton } from "./ui/ShareButton";

/**
 * The viral hook: pick two teams, get a full scoreboard-style projection, and
 * re-roll or share it. Everything computes client-side for instant feedback.
 */
export function SimulatorClient({
  teams,
  defaultA,
  defaultB,
}: {
  teams: TeamLite[];
  defaultA: string;
  defaultB: string;
}) {
  const byId = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const sorted = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);

  const [aId, setAId] = useState(defaultA);
  const [bId, setBId] = useState(defaultB);
  const [seed, setSeed] = useState(0);

  const teamA = byId.get(aId) ?? teams[0]!;
  const teamB = byId.get(bId) ?? teams[1]!;

  const insights = useMemo(
    () =>
      computeMatchInsights(
        teamA,
        teamB,
        seed === 0 ? { neutralVenue: true } : { neutralVenue: true, seed },
      ),
    [teamA, teamB, seed],
  );

  function swap() {
    setAId(bId);
    setBId(aId);
    setSeed(0);
  }

  return (
    <>
      <div className="glass" style={{ marginTop: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0.6rem", alignItems: "end" }}>
          <div>
            <label className="field-label" htmlFor="team-a">
              Team A
            </label>
            <select
              id="team-a"
              className="select"
              value={aId}
              onChange={(e) => {
                setAId(e.target.value);
                setSeed(0);
              }}
            >
              {sorted.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn ghost" onClick={swap} aria-label="Swap teams" title="Swap">
            ⇄
          </button>
          <div>
            <label className="field-label" htmlFor="team-b">
              Team B
            </label>
            <select
              id="team-b"
              className="select"
              value={bId}
              onChange={(e) => {
                setBId(e.target.value);
                setSeed(0);
              }}
            >
              {sorted.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <MatchPredictionCard
          insights={insights}
          footer={
            <>
              <button
                type="button"
                className="btn"
                onClick={() => setSeed(Math.floor(Math.random() * 0x7fffffff) + 1)}
              >
                ↻ Run again
              </button>
              <ShareButton text={insights.shareText} label="Copy share text" className="btn gold sm" />
            </>
          }
        />
      </div>
    </>
  );
}
