/* ============================================================
   Cards API call sequences shown in the panel.
   Request and response bodies follow the OpenAPI schemas in
   openapi/components/schemas/cards/ and the webhook wrappers in
   openapi/components/schemas/webhooks/. The calls are scripted;
   the on-phone flow is the trigger.
   ============================================================ */

import type { ApiCall } from './flow';

// Realistic placeholder ids (same formats the sandbox returns).
export const CARD_ID = 'Card:019e8f4b-2c1e-7a30-0000-5f0a3b7c9d12';
const CARDHOLDER = 'Customer:019e8f47-2a3d-1d02-0000-6b1f0c4e2a91';
const FUNDING_SOURCE = 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463';
const CARD_TXN = 'CardTransaction:019e8f4c-6d2f-4b81-0000-2e7c1a9f5b03';
const WEBHOOK_STATE = 'Webhook:019e8f4b-2d40-1d02-0000-7b3e9c1a4f28';
const WEBHOOK_TXN = 'Webhook:019e8f4c-6e05-1d02-0000-1c8d4f2b7e91';
const ISSUER_TXN = 'f3a1c2d4-5b6e-7890-abcd-ef0123456789';
const WEBHOOK_ENDPOINT = 'https://your-app.com/webhooks/grid';

const USD = { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 };

const ISSUED_AT = '2026-06-05T12:00:00Z';
const ACTIVE_AT = '2026-06-05T12:00:03Z';

export interface CardSpendLimits {
  maxSpendPerTransaction?: number;
  maxSpendPerDay?: number;
}

function cardResource(state: 'PROCESSING' | 'ACTIVE', limits: CardSpendLimits) {
  return {
    id: CARD_ID,
    cardholderId: CARDHOLDER,
    platformCardId: 'card-demo-001',
    state,
    stateReason: null,
    brand: 'VISA',
    form: 'VIRTUAL',
    last4: '8972',
    expMonth: 6,
    expYear: 2030,
    fundingSources: [FUNDING_SOURCE],
    maxSpendPerTransaction: limits.maxSpendPerTransaction ?? null,
    maxSpendPerDay: limits.maxSpendPerDay ?? null,
    currency: 'USD',
    processorRef: 'card_b81c2a4f',
    issuerRef: 'lead_card_7a1b9c3d',
    createdAt: ISSUED_AT,
    updatedAt: state === 'ACTIVE' ? ACTIVE_AT : ISSUED_AT,
  };
}

/** Issue a virtual card — POST /cards, then the issuer activates it and Grid
 *  delivers CARD.STATE_CHANGE to your webhook endpoint. */
export function cardCalls(limits: CardSpendLimits = {}): ApiCall[] {
  return [
    {
      method: 'POST',
      path: '/cards',
      title: 'Create card',
      reqBody: {
        cardholderId: CARDHOLDER,
        platformCardId: 'card-demo-001',
        form: 'VIRTUAL',
        fundingSources: [FUNDING_SOURCE],
        ...limits,
      },
      status: '201 Created',
      note: 'Card enters PROCESSING while the issuer provisions it. The cardholder must have KYC status APPROVED.',
      resBody: cardResource('PROCESSING', limits),
    },
    {
      method: 'POST',
      path: WEBHOOK_ENDPOINT,
      inbound: true,
      title: 'Card active',
      headers: { 'X-Grid-Signature': '<signature>' },
      reqBody: {
        id: WEBHOOK_STATE,
        type: 'CARD.STATE_CHANGE',
        timestamp: ACTIVE_AT,
        data: cardResource('ACTIVE', limits),
      },
      status: '200 OK',
      note: 'CARD.STATE_CHANGE — the issuer activated the card. It can be revealed, added to a wallet, and used.',
    },
  ];
}

function cardTransaction(merchant: string, cents: number) {
  return {
    type: 'CARD',
    id: CARD_TXN,
    cardId: CARD_ID,
    customerId: CARDHOLDER,
    platformCustomerId: 'customer_demo_001',
    issuerTransactionToken: ISSUER_TXN,
    status: 'AUTHORIZED',
    direction: 'DEBIT',
    merchant: { descriptor: merchant.toUpperCase(), mcc: '5814', country: 'US' },
    authorizedAmount: { amount: cents, currency: USD },
    accountId: FUNDING_SOURCE,
    pullSummary: { count: 1, totalAmount: cents, pendingCount: 0 },
    authorizedAt: '2026-06-05T12:05:00Z',
    lastEventAt: '2026-06-05T12:05:00Z',
    createdAt: '2026-06-05T12:05:00Z',
    updatedAt: '2026-06-05T12:05:00Z',
  };
}

/** Spend on the card. In sandbox the simulate call stands in for the terminal;
 *  Grid authorizes against the funding source and delivers
 *  CARD_TRANSACTION.AUTHORIZED. */
export function tapCalls(merchant: string, cents: number): ApiCall[] {
  const txn = cardTransaction(merchant, cents);
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${CARD_ID}/simulate/authorization`,
      title: 'Simulate authorization',
      reqBody: {
        amount: cents,
        currency: 'USD',
        merchant: { descriptor: merchant.toUpperCase(), mcc: '5814', country: 'US' },
      },
      status: '202 Accepted',
      note: 'Sandbox only — stands in for the card being tapped at a terminal. The outcome arrives by webhook.',
      resBody: { issuerTransactionToken: ISSUER_TXN },
    },
    {
      method: 'POST',
      path: WEBHOOK_ENDPOINT,
      inbound: true,
      title: 'Authorization approved',
      headers: { 'X-Grid-Signature': '<signature>' },
      reqBody: {
        id: WEBHOOK_TXN,
        type: 'CARD_TRANSACTION.AUTHORIZED',
        timestamp: txn.authorizedAt,
        data: txn,
      },
      status: '200 OK',
      note: `CARD_TRANSACTION.AUTHORIZED — $${(cents / 100).toFixed(2)} at ${merchant}, funded from the card's first funding source.`,
    },
    {
      method: 'GET',
      path: `/transactions/${CARD_TXN}`,
      title: 'Get card transaction',
      status: '200 OK',
      note: 'Card transactions appear in the transaction list with type CARD.',
      resBody: txn,
    },
  ];
}
