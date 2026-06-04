import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Analytics sink. Currently logs server-side only — swap the body for a write
 * to your store (Supabase `events` table, PostHog, etc.) when ready. Always
 * returns 204 so the client never blocks or errors.
 */
export async function POST(request: Request) {
  try {
    const event = await request.json();
    // eslint-disable-next-line no-console
    console.log("[analytics]", event);
  } catch {
    /* ignore malformed payloads */
  }
  return new NextResponse(null, { status: 204 });
}
