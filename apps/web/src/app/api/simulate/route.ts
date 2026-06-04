import { NextResponse } from "next/server";
import { runTournamentSimulation } from "@/lib/simulate";

// Each request re-runs the Monte Carlo simulation with the supplied seed.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing 'slug'" }, { status: 400 });
  }

  const seedParam = Number(searchParams.get("seed"));
  const seed = Number.isFinite(seedParam) ? seedParam : Date.now();

  const sim = await runTournamentSimulation(slug, { seed });
  if (!sim) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  // Team metadata is already on the client; return only the fresh result.
  return NextResponse.json(sim.result);
}
