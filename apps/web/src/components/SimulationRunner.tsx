"use client";

import { useMemo, useState } from "react";
import type { SimulationResult, Team } from "@worldcuplens/core";
import { ProbabilityTable } from "./ProbabilityTable";

/**
 * Interactive wrapper around the projections table. Renders the server-computed
 * result first, then lets the user re-run the simulation: each run hits the API
 * with a fresh random seed, so figures shift slightly but stay consistent
 * (same engine, same ~10k iterations).
 */
export function SimulationRunner({
  slug,
  teams,
  initialResult,
}: {
  slug: string;
  teams: Team[];
  initialResult: SimulationResult;
}) {
  const [result, setResult] = useState<SimulationResult>(initialResult);
  const [runs, setRuns] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  async function reRun() {
    setLoading(true);
    setError(null);
    try {
      const seed = Math.floor(Math.random() * 0x7fffffff);
      const res = await fetch(
        `/api/simulate?slug=${encodeURIComponent(slug)}&seed=${seed}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const next = (await res.json()) as SimulationResult;
      setResult(next);
      setRuns((n) => n + 1);
    } catch {
      setError("Couldn't re-run the simulation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="actions">
        <button type="button" className="btn" onClick={reRun} disabled={loading}>
          {loading ? "Simulating…" : "Re-run simulation"}
        </button>
        <span className="muted" style={{ alignSelf: "center", fontSize: "0.85rem" }}>
          {result.iterations.toLocaleString()} iterations · run #{runs}
        </span>
      </div>

      {error && (
        <p className="muted" role="alert" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}

      <ProbabilityTable result={result} teamsById={teamsById} />
    </>
  );
}
