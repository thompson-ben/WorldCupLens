/** Format a 0–1 probability as a percentage string. */
export function percent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

/** Country flag emoji from an ISO 3166-1 alpha-2 code (best effort). */
export function flagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "";
  const base = 0x1f1e6;
  const chars = [...countryCode.toUpperCase()].map((c) => base + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}
