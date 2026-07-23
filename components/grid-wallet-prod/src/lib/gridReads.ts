'use client';

import type { Tx } from '@/data/flow';
import { gridFetch } from './gridClient';
import type { LogFn } from './gridSession';
import { amountToCents, formatCents } from './gridUnits';

const CUSTOMER = '{customerId}';

export interface RawCurrencyAmount {
  amount: number;
  currency: { code: string; decimals: number };
}
export interface RawTransaction {
  id: string;
  type: 'INCOMING' | 'OUTGOING';
  direction?: 'CREDIT' | 'DEBIT';
  status: string;
  createdAt?: string;
  sentAmount?: RawCurrencyAmount;
  receivedAmount?: RawCurrencyAmount;
  // Grid's CounterpartyInformation is a free-form key/value bag
  // (openapi/components/schemas/transactions/CounterpartyInformation.yaml);
  // FULL_NAME is the field the API actually populates for a person's name.
  counterpartyInformation?: { FULL_NAME?: string };
}

export async function fetchBalanceCents(log: LogFn): Promise<number> {
  const env = await gridFetch(
    'GET',
    `/customers/internal-accounts?customerId=${CUSTOMER}&type=EMBEDDED_WALLET`,
  );
  log(env);
  if (env.response.status !== 200) return 0;
  const body = env.response.body as {
    data: { balance: { amount: number; currency: { decimals: number } } }[];
  };
  const b = body.data[0]?.balance;
  return b ? amountToCents(b.amount, b.currency.decimals) : 0;
}

/** Pure: one Grid transaction -> a panel Tx row. */
export function transactionToTx(t: RawTransaction): Tx {
  const credit = t.direction ? t.direction === 'CREDIT' : t.type === 'INCOMING';
  const money = credit ? t.receivedAmount : t.sentAmount;
  const cents = money ? amountToCents(money.amount, money.currency.decimals) : 0;
  const name = t.counterpartyInformation?.FULL_NAME ?? (credit ? 'Received' : 'Sent');
  return {
    kind: credit ? 'bank' : 'send',
    name,
    sub: t.status === 'COMPLETED' ? 'Completed' : t.status,
    amount: `${credit ? '+' : '-'}${formatCents(cents)}`,
    positive: credit,
  };
}

export async function fetchActivity(log: LogFn): Promise<Tx[]> {
  const env = await gridFetch('GET', `/transactions?customerId=${CUSTOMER}&limit=20`);
  log(env);
  if (env.response.status !== 200) return [];
  const body = env.response.body as { data: RawTransaction[] };
  return (body.data ?? []).map(transactionToTx);
}
