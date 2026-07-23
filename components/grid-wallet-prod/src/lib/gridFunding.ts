'use client';

import { gridFetch } from './gridClient';
import type { LogFn } from './gridSession';
import { centsToAmount, USDB_DECIMALS } from './gridUnits';

/** Sandbox fund body: cents -> USDB micro-units. */
export function fundAmountForCents(cents: number): { amount: number } {
  return { amount: centsToAmount(cents, USDB_DECIMALS) };
}

export async function sandboxFund(
  accountId: string,
  cents: number,
  log: LogFn,
): Promise<{ ok: boolean; status: number }> {
  const env = await gridFetch('POST', `/sandbox/internal-accounts/${accountId}/fund`, {
    body: fundAmountForCents(cents),
  });
  log(env);
  return { ok: env.response.status === 200, status: env.response.status };
}
