"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires a single analytics event when a page mounts. Renders nothing. */
export function TrackView({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
