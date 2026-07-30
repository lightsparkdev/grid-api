'use client';

import { gridFetch } from './gridClient';
import type { LogFn } from './gridSession';
import type { QuoteBody } from './gridTransfer';

/**
 * Sandbox fund body for the PLATFORM's USD internal account. USD's smallest
 * unit is cents, so the app's "cents" map straight through — unlike the
 * embedded wallet's own USDB balance (6 decimals, see gridUnits.ts), there is
 * no conversion here.
 */
export function platformFundAmountForCents(cents: number): { amount: number } {
  return { amount: cents };
}

// Resolved once per session (module-level — the platform account doesn't
// change between "Add money" runs).
let platformUsdAccountId: string | null = null;

/**
 * Resolve (and cache) the platform's USD internal account id — the real
 * money source for "Add money"'s on-ramp leg. `POST /sandbox/.../fund` only
 * mints BOOK balance on the customer's own wallet (no on-chain USDB), so
 * outbound quotes from it fail with INSUFFICIENT_FUNDS; funding the platform
 * account and on-ramping from it into the customer's wallet is the only way
 * to land real, spendable balance in sandbox.
 */
export async function resolvePlatformUsdAccountId(log: LogFn): Promise<string> {
  if (platformUsdAccountId) return platformUsdAccountId;
  const env = await gridFetch('GET', '/platform/internal-accounts?currency=USD');
  log(env);
  if (env.response.status !== 200) {
    throw new Error(`list platform internal accounts: ${env.response.status}`);
  }
  const body = env.response.body as { data: { id: string }[] };
  const acct = body.data[0];
  if (!acct) throw new Error('No platform USD internal account found');
  platformUsdAccountId = acct.id;
  return acct.id;
}

/** Sandbox-fund the platform's USD account (the on-ramp's source leg). */
export async function sandboxFundPlatform(
  platformAccountId: string,
  cents: number,
  log: LogFn,
): Promise<{ ok: boolean; status: number }> {
  const env = await gridFetch('POST', `/sandbox/internal-accounts/${platformAccountId}/fund`, {
    body: platformFundAmountForCents(cents),
  });
  log(env);
  return { ok: env.response.status === 200, status: env.response.status };
}

/**
 * Platform -> customer-wallet on-ramp quote: USD in (2 decimals, same cents
 * as the fund above), USDB out to the customer's embedded wallet. Executing
 * this quote (see gridTransfer.executeQuoteUnsigned) needs no wallet
 * signature — the source is the platform account, not the customer's.
 */
export function onRampQuoteBodyFor(
  platformAccountId: string,
  customerAccountId: string,
  cents: number,
): QuoteBody {
  return {
    source: { sourceType: 'ACCOUNT', accountId: platformAccountId },
    destination: { destinationType: 'ACCOUNT', accountId: customerAccountId, currency: 'USDB' },
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
