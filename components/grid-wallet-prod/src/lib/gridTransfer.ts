'use client';

import { gridFetch, type GridEnvelope } from './gridClient';
import type { ExternalAccountInput } from '@/data/apiCalls';
import type { LogFn } from './gridSession';
import { stamp } from './gridCrypto';
import { centsToAmount, USDB_DECIMALS } from './gridUnits';

export type OutboundMode = 'withdraw' | 'send';

export interface RawQuote {
  id: string;
  status: string;
  transactionId?: string;
  paymentInstructions?: { accountOrWalletInfo?: { accountType?: string; payloadToSign?: string } }[];
}

const CUSTOMER = '{customerId}';
const externalAccountCache = new Map<string, string>(); // destSignature -> ExternalAccount id

/** Stable signature for a destination so we create it at most once per session. */
export function destSignature(input: ExternalAccountInput): string {
  return input.kind === 'crypto'
    ? `crypto:${input.network}:${input.currency}:${input.address}`
    : `bank:${input.currency}:${input.bankName}:${JSON.stringify(input.fields)}`;
}

function externalAccountBody(input: ExternalAccountInput): Record<string, unknown> {
  if (input.kind === 'crypto') {
    return {
      customerId: CUSTOMER,
      currency: input.currency,
      accountInfo: { accountType: input.accountType, address: input.address },
    };
  }
  return {
    customerId: CUSTOMER,
    currency: input.currency,
    accountInfo: {
      accountType: input.accountType,
      ...input.fields,
      beneficiary: { beneficiaryType: 'INDIVIDUAL', fullName: input.beneficiary },
    },
  };
}

export async function ensureExternalAccount(input: ExternalAccountInput, log: LogFn): Promise<string> {
  const sig = destSignature(input);
  const cached = externalAccountCache.get(sig);
  if (cached) return cached;
  const env = await gridFetch('POST', '/customers/external-accounts', { body: externalAccountBody(input) });
  log(env);
  if (env.response.status !== 201) {
    const b = env.response.body as { error?: { message?: string } };
    throw new Error(`create external account: ${env.response.status} ${b?.error?.message ?? ''}`);
  }
  const id = (env.response.body as { id: string }).id;
  externalAccountCache.set(sig, id);
  return id;
}

export interface QuoteBody {
  source: Record<string, unknown>;
  destination: Record<string, unknown>;
  lockedCurrencySide: 'SENDING' | 'RECEIVING';
  lockedCurrencyAmount: number;
}

/** Outbound (embedded-wallet source) quote body. USDB source, external destination. */
export function quoteBodyFor(
  accountId: string,
  externalAccountId: string,
  cents: number,
  destCurrency: string,
): QuoteBody {
  return {
    source: { sourceType: 'ACCOUNT', accountId },
    destination: { destinationType: 'ACCOUNT', accountId: externalAccountId, currency: destCurrency },
    lockedCurrencySide: 'SENDING',
    lockedCurrencyAmount: centsToAmount(cents, USDB_DECIMALS),
  };
}

export function findEmbeddedWalletPayload(quote: RawQuote): string | null {
  const inst = (quote.paymentInstructions ?? []).find(
    (p) => p.accountOrWalletInfo?.accountType === 'EMBEDDED_WALLET',
  );
  return inst?.accountOrWalletInfo?.payloadToSign ?? null;
}

export async function createQuote(
  body: QuoteBody,
  log: LogFn,
  idempotencyKey: string,
): Promise<{ quoteId: string; transactionId: string | null; payloadToSign: string | null; env: GridEnvelope }> {
  const env = await gridFetch('POST', '/quotes', { body, headers: { 'Idempotency-Key': idempotencyKey } });
  log(env);
  if (env.response.status !== 201) {
    const b = env.response.body as { error?: { message?: string } };
    throw new Error(`create quote: ${env.response.status} ${b?.error?.message ?? ''}`);
  }
  const q = env.response.body as RawQuote;
  return { quoteId: q.id, transactionId: q.transactionId ?? null, payloadToSign: findEmbeddedWalletPayload(q), env };
}

export async function executeQuote(
  quoteId: string,
  payloadToSign: string,
  sessionPrivHex: string,
  log: LogFn,
  idempotencyKey: string,
): Promise<GridEnvelope> {
  const sig = await stamp(sessionPrivHex, payloadToSign); // byte-for-byte over payloadToSign
  const env = await gridFetch('POST', `/quotes/${quoteId}/execute`, {
    body: {},
    headers: { 'Grid-Wallet-Signature': sig, 'Idempotency-Key': idempotencyKey },
  });
  log(env);
  return env; // caller inspects status: 200 = PROCESSING; 4xx = truthful error rendered in the panel
}

const TERMINAL = new Set(['COMPLETED', 'FAILED', 'REJECTED', 'REFUNDED', 'EXPIRED']);
export function isTerminalStatus(status: string): boolean {
  return TERMINAL.has(status);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Poll GET /transactions/{id} until terminal or timeout. Sandbox off-ramp settles in 60–180s. */
export async function pollTransaction(
  txnId: string,
  log: LogFn,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<string> {
  const timeoutMs = opts.timeoutMs ?? 180_000;
  const intervalMs = opts.intervalMs ?? 4_000;
  const deadline = Date.now() + timeoutMs;
  let status = 'UNKNOWN';
  for (;;) {
    const env = await gridFetch('GET', `/transactions/${txnId}`);
    log(env);
    if (env.response.status === 200) {
      status = (env.response.body as { status: string }).status;
      if (isTerminalStatus(status)) return status;
    }
    if (Date.now() >= deadline) return status; // give up; caller renders the last-seen status
    await sleep(intervalMs);
  }
}
