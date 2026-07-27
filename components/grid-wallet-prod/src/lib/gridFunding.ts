'use client';

import { gridFetch } from './gridClient';
import type { LogFn } from './gridSession';
import { CUSTOMER, type QuoteBody } from './gridTransfer';

/**
 * The only currency this platform has real-time funding enabled for in sandbox
 * (verified: an EUR quote comes back INVALID_INPUT, "Sending currency 'EUR' is
 * not configured for your platform"). The euro deposit section is placeholder
 * details anyway (see placeholderDeposit.ts), so the stand-in deposits USD and
 * the action card says so rather than implying euros arrived.
 */
export const SANDBOX_FUNDING_CURRENCY = 'USD';

/**
 * Real-time funding quote: money arriving from OUTSIDE Grid straight into the
 * customer's embedded wallet. This is what the deposit instructions on the phone
 * describe, and `POST /sandbox/send` settles it (see sandboxSendForQuote) the way
 * a real inbound transfer would.
 *
 * `lockedCurrencyAmount` is in the SENDING currency's minor units (USD cents).
 * Executing is not involved — an inbound quote is settled by the sender, not by us.
 *
 * Why not fund the platform's own USD account and on-ramp from it: that DOES land
 * spendable balance, but the resulting transaction belongs to the PLATFORM, so it
 * never appears in `GET /transactions?customerId=...` and the arrival was missing
 * from the phone's activity list. A real-time-funding quote is the customer's own
 * transaction — verified against the sandbox: COMPLETED, and listed with the
 * wallet as its destination.
 */
export function realtimeFundingQuoteBodyFor(
  walletAccountId: string,
  cents: number,
  currency: string = SANDBOX_FUNDING_CURRENCY,
): QuoteBody {
  return {
    source: { sourceType: 'REALTIME_FUNDING', currency, customerId: CUSTOMER },
    destination: { destinationType: 'ACCOUNT', accountId: walletAccountId, currency: 'USDB' },
    lockedCurrencySide: 'SENDING',
    lockedCurrencyAmount: cents,
  };
}

/**
 * SANDBOX ONLY: stand in for the customer pushing funds to a quote that sources
 * from their external account (which can't be executed — see pullQuoteBodyFor).
 * This is Grid's own affordance for it, named in the execute error, and it
 * settles the quote's transaction the same way a real wire would.
 */
export async function sandboxSendForQuote(
  quoteId: string,
  currencyCode: string,
  cents: number,
  log: LogFn,
): Promise<{ ok: boolean; status: number }> {
  const env = await gridFetch('POST', '/sandbox/send', {
    body: { quoteId, currencyCode, currencyAmount: cents },
  });
  log(env);
  return { ok: env.response.status === 200, status: env.response.status };
}

/**
 * Convert USD sitting in the customer's own fiat account into USDB in their
 * wallet. Money pushed to the deposit instructions arrives as USD there; this is
 * the leg that gets it to the balance the phone shows.
 *
 * `lockedCurrencyAmount` is USD cents (the SENDING side), and executing needs no
 * `Grid-Wallet-Signature`: the embedded wallet is the destination, not the source.
 * Verified against the sandbox — 300 USD in, 3000000 USDB out, COMPLETED.
 */
export function sweepQuoteBodyFor(
  fiatAccountId: string,
  walletAccountId: string,
  cents: number,
): QuoteBody {
  return {
    source: { sourceType: 'ACCOUNT', accountId: fiatAccountId },
    destination: { destinationType: 'ACCOUNT', accountId: walletAccountId, currency: 'USDB' },
    lockedCurrencySide: 'SENDING',
    lockedCurrencyAmount: cents,
  };
}
