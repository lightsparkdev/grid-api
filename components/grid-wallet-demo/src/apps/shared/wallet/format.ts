/** Pure USD + address formatters shared by the wallet brain and every skin's
 *  faces. No JSX, no skin assumptions — the canonical home for these so a skin's
 *  views never have to reach into another skin's files for a formatter. */

/** Typed amount → cents (for balance/activity bookkeeping). */
export function typedToCents(raw: string): number {
  const n = Number.parseFloat(raw || '0');
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** "1500.5" → "$1,500.50" — final formatted USD. */
export function formatUsdCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Middle-truncate an address to first/last 6 around an ellipsis, e.g.
 *  "53am6G…sNkNV7" (only when it'd actually shorten). */
export function truncateAddress(addr: string): string {
  return addr.length > 13 ? `${addr.slice(0, 6)}…${addr.slice(-6)}` : addr;
}

/** Figma 109:29332 — the demo Solana address Paste drops into the send flow. */
export const SEND_DEMO_ADDRESS = 'DQLoc5rpDPz9vtUv9TxApy3z8HWPB3XCTwdSmDCRn9JT';
