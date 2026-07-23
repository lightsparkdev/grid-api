/**
 * Grid `CurrencyAmount.amount` is an integer in the currency's smallest unit
 * (openapi/components/schemas/common/CurrencyAmount.yaml). USDB has 6 decimals
 * (openapi .../PaymentEmbeddedWalletInfo + currencyResponse in apiCodeFormat).
 * The wallet UI models money as integer "cents" (2 decimals). This layer maps
 * between a Grid amount at any decimals and the app's cents.
 */

export const USDB_DECIMALS = 6;

/** Grid smallest-unit amount -> app cents (2 dp). e.g. 2_000_000 USDB micro -> 200. */
export function amountToCents(amount: number, decimals: number): number {
  if (!Number.isFinite(amount)) return 0;
  if (decimals <= 2) return Math.round(amount * Math.pow(10, 2 - decimals));
  return Math.round(amount / Math.pow(10, decimals - 2));
}

/** App cents (2 dp) -> Grid smallest-unit amount at `decimals`. e.g. 200 -> 2_000_000 USDB micro. */
export function centsToAmount(cents: number, decimals: number): number {
  if (!Number.isFinite(cents)) return 0;
  if (decimals <= 2) return Math.round(cents / Math.pow(10, 2 - decimals));
  return Math.round(cents * Math.pow(10, decimals - 2));
}

/** "$1,234.50" style — mirrors the app's existing fmt() in src/data/actions.ts. */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
