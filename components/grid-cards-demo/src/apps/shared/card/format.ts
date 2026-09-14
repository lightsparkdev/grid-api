/** Pure USD formatter shared by the card brain and every face. */

/** 150050 → "$1,500.50". */
export function formatUsdCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
