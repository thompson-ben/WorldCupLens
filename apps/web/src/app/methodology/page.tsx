import type { Metadata } from "next";
import Link from "next/link";
import { DataFreshness } from "@/components/DataFreshness";

export const metadata: Metadata = {
  title: "Methodology — How WorldCupLens works",
  description:
    "How WorldCupLens projects football tournaments: Monte Carlo simulation, Elo ratings, expected goals, what probabilities mean, model limitations and FAQs.",
  alternates: { canonical: "/methodology" },
};

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="glass" style={{ marginBottom: "0.85rem" }}>
      <h3 className="ic-title" style={{ marginBottom: "0.35rem" }}>
        {q}
      </h3>
      <p className="ic-summary">{children}</p>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <p className="eyebrow">Transparency</p>
      <h1 className="page-title">How WorldCupLens works</h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        Every number on this site comes from simulation, not opinion. Here&apos;s exactly how it works
        — in plain English.
      </p>

      <h2 className="section-title">We simulate the tournament thousands of times</h2>
      <div className="glass">
        <p style={{ margin: 0 }}>
          We run thousands of simulated tournaments. Each simulation plays out every match using team
          ratings, match probabilities and the real tournament structure. The percentages you see
          represent <strong>how often a team achieves an outcome</strong> across all those
          simulations. If a team wins the trophy in 1,240 of 10,000 simulations, that&apos;s a 12.4%
          title probability.
        </p>
      </div>

      <h2 className="section-title">The building blocks</h2>
      <div className="grid grid-2">
        <div className="glass">
          <div className="ic-kicker">🎲 Monte Carlo simulation</div>
          <h3 className="ic-title">Playing the future many times</h3>
          <p className="ic-summary">
            Rather than predict one outcome, we play the whole tournament thousands of times with a
            bit of randomness in every match. Counting how often each result happens gives a
            probability — the same idea weather forecasters use.
          </p>
        </div>
        <div className="glass">
          <div className="ic-kicker">📈 Elo ratings</div>
          <h3 className="ic-title">A single strength number</h3>
          <p className="ic-summary">
            Each team has a strength rating. The gap between two teams&apos; ratings sets how likely
            each is to win. Beating strong teams raises a rating; losing to weaker ones lowers it.
          </p>
        </div>
        <div className="glass">
          <div className="ic-kicker">⚽ Expected goals</div>
          <h3 className="ic-title">How many goals to expect</h3>
          <p className="ic-summary">
            We turn the rating gap into an expected number of goals for each side, then simulate
            realistic scorelines from it. That drives win/draw/win, likely scores and the match
            stats you see in the simulator.
          </p>
        </div>
        <div className="glass">
          <div className="ic-kicker">📊 Projections &amp; probability</div>
          <h3 className="ic-title">What the % actually means</h3>
          <p className="ic-summary">
            A 20% chance is not a prediction that something will happen — it means it happens in
            about 1 of every 5 simulated futures. Underdogs winning is expected sometimes; that&apos;s
            the point.
          </p>
        </div>
      </div>

      <h2 className="section-title">Where our ratings come from</h2>
      <div className="glass">
        <p style={{ marginTop: 0 }}>
          National-team strength is a <strong>World Football Elo rating computed from real
          international results</strong> — every full international in the open{" "}
          <a href="https://github.com/martj42/international_results" className="link">
            martj42/international_results
          </a>{" "}
          dataset, processed with the standard Elo method:
        </p>
        <ul className="reason-list">
          <li className="reason ok">
            Match importance weighting (K): World Cup 60, continental finals 50, qualifiers &amp;
            Nations League 40, friendlies 20.
          </li>
          <li className="reason ok">Goal-difference multiplier — bigger wins move ratings more.</li>
          <li className="reason ok">Home advantage applied (≈100 Elo) except at neutral venues.</li>
          <li className="reason ok">
            Recent <strong>form</strong> and 12-month <strong>movement</strong> come from the same
            results history.
          </li>
        </ul>
        <p style={{ marginBottom: 0 }}>
          <strong>Why Elo over the FIFA ranking?</strong> Elo updates after every match, accounts for
          opponent strength, margin of victory and venue, and is fully reproducible from public data.
          The FIFA ranking is a useful cross-check but is slower to react and harder to audit. A
          blended model is on the roadmap.
        </p>
      </div>

      <h2 className="section-title">Freshness &amp; refresh</h2>
      <div className="grid grid-2">
        <DataFreshness variant="card" />
        <div className="glass">
          <div className="ic-kicker">🔄 Refresh frequency</div>
          <p className="ic-summary" style={{ marginTop: "0.4rem" }}>
            Ratings refresh automatically on a schedule from the latest results, then redeploy. Real
            World Cup 2026 fixtures (dates &amp; venues) and qualification status are pulled from the
            same source. Club ratings (Premier League, Champions League) remain illustrative for now —
            the international dataset doesn&apos;t cover clubs.
          </p>
        </div>
      </div>

      <h2 className="section-title">Per-skill breakdown</h2>
      <div className="glass">
        <p style={{ margin: 0 }}>
          On team pages we also break a rating into Attack, Defence, Set-Piece Threat and more. Recent
          <strong> form</strong> there is real; the other components are currently{" "}
          <strong>derived from the overall rating</strong> as a transparent placeholder breakdown,
          pending granular per-skill data. The headline win probabilities come from full simulation on
          the real Elo ratings.
        </p>
      </div>

      <h2 className="section-title">Model limitations</h2>
      <div className="glass">
        <ul className="reason-list">
          <li className="reason risk">Injuries and suspensions are not currently modelled.</li>
          <li className="reason risk">Live, in-tournament form is not yet included.</li>
          <li className="reason risk">Ratings are updated periodically, not in real time.</li>
          <li className="reason risk">Component ratings are derived, not yet from granular data.</li>
          <li className="reason risk">Projections are estimates, not guarantees.</li>
        </ul>
      </div>

      <h2 className="section-title">FAQ</h2>
      <QA q="Why did my team's probability drop?">
        Each batch re-simulates from current ratings. Small rating changes, or simply the randomness
        across thousands of runs, can shift probabilities a few points between batches.
      </QA>
      <QA q="How often are ratings updated?">
        Periodically — between rounds and as results come in. They are not updated live during a
        match.
      </QA>
      <QA q="Why do bookmakers disagree with you?">
        Bookmakers blend models with market money and a built-in margin. We show pure
        simulation-based probability with no margin, so small differences are normal.
      </QA>
      <QA q="Can the simulations be wrong?">
        Any single result can differ from the most likely outcome — that&apos;s expected. The value is
        in the distribution across many simulations, not in any one prediction.
      </QA>

      <div className="actions">
        <Link className="btn" href="/world-cup">
          See the projections →
        </Link>
        <Link className="btn ghost" href="/simulator">
          Try the match simulator
        </Link>
      </div>
    </>
  );
}
