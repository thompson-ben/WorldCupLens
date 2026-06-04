"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Copies share text to the clipboard (or opens the native share sheet on
 * mobile). Used on every shareable card to drive the "screenshot & share" loop.
 */
export function ShareButton({
  text,
  label = "Copy share text",
  className = "btn ghost sm",
  card = "card",
}: {
  text: string;
  label?: string;
  className?: string;
  card?: string;
}) {
  const [done, setDone] = useState(false);

  async function share() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      track({ type: "share", card });
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* user dismissed the share sheet — ignore */
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={share}>
        {done ? "Copied ✓" : label}
      </button>
      {done && <div className="toast">Copied to clipboard</div>}
    </>
  );
}
