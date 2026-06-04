"use client";

/**
 * Fire-and-forget event tracking. Events POST to /api/track, which is a no-op
 * sink today but the single seam where a real analytics store (Supabase table,
 * PostHog, GA, …) plugs in later. Tracked events are designed to answer:
 * most-simulated matches, most-viewed teams, most-shared cards, most-viewed
 * tournaments/routes, and Daily Brief views.
 */
export type AnalyticsEvent =
  | { type: "share"; card: string; ref?: string }
  | { type: "simulate_match"; teamA: string; teamB: string }
  | { type: "view_team"; team: string }
  | { type: "view_route"; team: string; route: string }
  | { type: "view_tournament"; slug: string }
  | { type: "view_daily_brief" };

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ ...event, t: Date.now() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", body);
    } else {
      void fetch("/api/track", { method: "POST", body, keepalive: true });
    }
  } catch {
    /* analytics must never break the UI */
  }
}
