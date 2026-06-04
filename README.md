# WorldCupLens

A sports-analytics platform that simulates football tournaments and projects
championship odds. Built tournament-agnostic from the ground up: the World Cup,
Euros, Copa América, Champions League and Premier League are all just **data**
fed into one simulation engine.

## Why it's structured this way

The guiding constraint is that **no competition is special**. A tournament is
described declaratively (which teams, which format) and simulated by a generic
engine. Adding the next competition is a data change, not an engine change.

```
worldcuplens/
├── packages/
│   ├── core/            # Tournament-agnostic domain model + simulation engine
│   └── data-providers/  # DataProvider interface + Static and Supabase impls
└── apps/
    └── web/             # Next.js (App Router) — SEO routing, mobile-first UI
```

### `@worldcuplens/core`

The brain, with zero knowledge of any specific competition:

- **`domain/`** — generic types (`Team`, `Tournament`, `Match`, `FormatConfig`,
  standings). A tournament's shape is captured by a `FormatConfig` union.
- **`formats/`** — one strategy per competition *shape*, all implementing the
  same `TournamentFormat` interface:
  - `LeagueFormat` — round-robin (Premier League)
  - `GroupKnockoutFormat` — groups + bracket (World Cup, Euros, Copa América)
  - `KnockoutFormat` — single elimination
  - `LeaguePhaseKnockoutFormat` — league phase + bracket (Champions League),
    composed from the round-robin and knockout primitives
- **`simulation/`** — a seedable Monte Carlo engine. It injects team ratings
  into a pluggable `MatchSimulator` (default: Poisson scorelines from Elo
  expectations) and aggregates thousands of runs into per-team probabilities.
  The engine only knows the `TournamentFormat` interface, so new formats never
  require touching it.

Adding a new competition shape = add a `FormatConfig` variant + a strategy +
one line in `createFormat()`. Nothing downstream changes.

### `@worldcuplens/data-providers`

Everything depends on the `DataProvider` interface, never a concrete source:

- `StaticDataProvider` — in-memory seed data (great for dev, tests, demos).
- `SupabaseDataProvider` — Postgres-backed, injected with a `SupabaseClient`.
  See [`schema.sql`](packages/data-providers/src/supabase/schema.sql).

Swapping the backend is a one-line change in the app.

### `apps/web`

Next.js App Router, **mobile-first** CSS, and **SEO-friendly routing**:

- Clean, human-readable routes: `/tournaments/[slug]` and
  `/tournaments/[slug]/simulate`.
- `generateStaticParams` + `generateMetadata` for pre-rendered, indexable pages.
- `sitemap.xml` and `robots.txt` generated from the active data provider.

The app picks its data source automatically: **Supabase if configured**
(`SUPABASE_URL` + `SUPABASE_ANON_KEY`), otherwise the static seed data.

## Getting started

```bash
npm install
npm run dev          # Next.js dev server on http://localhost:3000
```

Other scripts (run from the repo root):

```bash
npm run build        # build all workspaces
npm run typecheck    # type-check every package
npm run test         # run engine tests
```

To use Supabase, copy `apps/web/.env.example` to `apps/web/.env.local`, run the
schema, and set the two env vars.

## Adding a tournament

For seed data, add an entry to
[`packages/data-providers/src/static/seed/tournaments.ts`](packages/data-providers/src/static/seed/tournaments.ts)
referencing team ids from the registry. Pick any existing `FormatConfig` — no
code changes required.

## Roadmap

- Persisted fixtures + live results in the providers
- Per-stage advancement probabilities in the UI
- Calibrated, sport-specific match models
- Additional sports (the engine is already sport-agnostic)

## License

MIT — see [LICENSE](LICENSE).
