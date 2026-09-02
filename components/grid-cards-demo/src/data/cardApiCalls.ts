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
const ISSUER_TXN = 'f3a1c2d4-5b6e-7890-abcd-ef0123456789';
const WEBHOOK_ENDPOINT = 'https://your-app.com/webhooks/grid';

const USD = { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 };

const ISSUED_AT = '2026-06-05T12:00:00Z';
const ACTIVE_AT = '2026-06-05T12:00:03Z';

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}:019e8f4c-${(0x6d2f + seq).toString(16).padStart(4, '0')}-4b81-0000-${seq.toString(16).padStart(12, '0')}`;
}
function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}
function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export type CardLifecycleState = 'ACTIVE' | 'FROZEN' | 'CLOSED';

export interface CardSpendLimits {
  maxSpendPerTransaction?: number | null;
  maxSpendPerDay?: number | null;
}

interface CardResourceOptions {
  state?: 'PROCESSING' | CardLifecycleState;
  stateReason?: 'CLOSED_BY_PLATFORM' | null;
  limits?: CardSpendLimits;
  updatedAt?: string;
}

function cardResource({
  state = 'ACTIVE',
  stateReason = null,
  limits = {},
  updatedAt,
}: CardResourceOptions = {}) {
  return {
    id: CARD_ID,
    cardholderId: CARDHOLDER,
    platformCardId: 'card-demo-001',
    state,
    stateReason,
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
    updatedAt: updatedAt ?? (state === 'PROCESSING' ? ISSUED_AT : ACTIVE_AT),
  };
}

function stateWebhook(card: ReturnType<typeof cardResource>, title: string, note: string): ApiCall {
  return {
    method: 'POST',
    path: WEBHOOK_ENDPOINT,
    inbound: true,
    title,
    headers: { 'X-Grid-Signature': '<signature>' },
    reqBody: {
      id: nextId('Webhook'),
      type: 'CARD.STATE_CHANGE',
      timestamp: card.updatedAt,
      data: card,
    },
    status: '200 OK',
    note,
  };
}

/* ── Issue ─────────────────────────────────────────────────────────────── */

/** Issue a virtual card — POST /cards, then the issuer activates it and Grid
 *  delivers CARD.STATE_CHANGE to your webhook endpoint. */
export function cardCalls(limits: CardSpendLimits = {}): ApiCall[] {
  const reqLimits: Record<string, number> = {};
  if (limits.maxSpendPerTransaction) reqLimits.maxSpendPerTransaction = limits.maxSpendPerTransaction;
  if (limits.maxSpendPerDay) reqLimits.maxSpendPerDay = limits.maxSpendPerDay;
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
        ...reqLimits,
      },
      status: '201 Created',
      note: 'Card enters PROCESSING while the issuer provisions it. The cardholder must have KYC status APPROVED.',
      resBody: cardResource({ state: 'PROCESSING', limits }),
    },
    stateWebhook(
      cardResource({ state: 'ACTIVE', limits }),
      'Card active',
      'CARD.STATE_CHANGE — the issuer activated the card. It can be revealed, added to a wallet, and used.',
    ),
  ];
}

/* ── Reveal ────────────────────────────────────────────────────────────── */

export function revealCalls(): ApiCall[] {
  const expires = new Date(Date.now() + 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  return [
    {
      method: 'POST',
      path: `/cards/${CARD_ID}/reveal`,
      title: 'Reveal card details',
      status: '200 OK',
      note: 'Returns a short-lived iframe URL that renders the PAN, expiry, and CVV. The card resource itself only carries last4 and expiry — card credentials never cross your servers.',
      resBody: {
        panEmbedUrl: 'https://embed.lithic.com/iframe/card_b81c2a4f?t=eyJhbGciOiJIUzI1NiJ9…',
        expiresAt: expires,
      },
    },
  ];
}

/* ── Freeze / unfreeze / close ─────────────────────────────────────────── */

export function stateChangeCalls(state: CardLifecycleState, limits: CardSpendLimits = {}): ApiCall[] {
  const at = nowIso();
  const card = cardResource({
    state,
    stateReason: state === 'CLOSED' ? 'CLOSED_BY_PLATFORM' : null,
    limits,
    updatedAt: at,
  });
  const copy = {
    FROZEN: {
      title: 'Freeze card',
      note: 'ACTIVE → FROZEN. New authorizations decline with CARD_PAUSED; in-flight clearings still post.',
      hookTitle: 'Card frozen',
      hookNote: 'CARD.STATE_CHANGE — state is FROZEN. Reversible with state: ACTIVE.',
    },
    ACTIVE: {
      title: 'Unfreeze card',
      note: 'FROZEN → ACTIVE. Authorizations resume immediately.',
      hookTitle: 'Card active',
      hookNote: 'CARD.STATE_CHANGE — state is back to ACTIVE.',
    },
    CLOSED: {
      title: 'Close card',
      note: 'ACTIVE | FROZEN → CLOSED. Terminal: funding sources detach and the card can no longer be mutated.',
      hookTitle: 'Card closed',
      hookNote: 'CARD.STATE_CHANGE — state is CLOSED with stateReason CLOSED_BY_PLATFORM.',
    },
  }[state];
  return [
    {
      method: 'PATCH',
      path: `/cards/${CARD_ID}`,
      title: copy.title,
      reqBody: { state },
      status: '200 OK',
      note: copy.note,
      resBody: card,
    },
    stateWebhook(card, copy.hookTitle, copy.hookNote),
  ];
}

export function closeRejectedCall(): ApiCall {
  return {
    method: 'PATCH',
    path: `/cards/${CARD_ID}`,
    title: 'Close card (again)',
    reqBody: { state: 'CLOSED' },
    status: '409 Conflict',
    note: 'CLOSED is terminal. A second close returns CARD_ALREADY_CLOSED; any other mutation returns CARD_NOT_MUTABLE.',
    resBody: {
      status: 409,
      code: 'CARD_ALREADY_CLOSED',
      message: 'Card is already CLOSED.',
    },
  };
}

/* ── Limits ────────────────────────────────────────────────────────────── */

export function limitsCalls(limits: CardSpendLimits): ApiCall[] {
  const body: Record<string, number | null> = {};
  if (limits.maxSpendPerTransaction !== undefined) body.maxSpendPerTransaction = limits.maxSpendPerTransaction;
  if (limits.maxSpendPerDay !== undefined) body.maxSpendPerDay = limits.maxSpendPerDay;
  const parts = [
    limits.maxSpendPerTransaction ? `${usd(limits.maxSpendPerTransaction)} per transaction` : null,
    limits.maxSpendPerDay ? `${usd(limits.maxSpendPerDay)} per UTC day` : null,
  ].filter(Boolean);
  return [
    {
      method: 'PATCH',
      path: `/cards/${CARD_ID}`,
      title: 'Set spend limits',
      reqBody: body,
      status: '200 OK',
      note: parts.length
        ? `Caps: ${parts.join(', ')}. Grid enforces the lower of the card cap and the platform cap. The daily window resets at 00:00 UTC; refunds don't restore capacity.`
        : 'Both caps cleared (null). The platform-level cardConfigs still apply.',
      resBody: cardResource({ state: 'ACTIVE', limits, updatedAt: nowIso() }),
    },
  ];
}

/* ── Spend ─────────────────────────────────────────────────────────────── */

export interface SpendRef {
  /** Stable CardTransaction id for this purchase (so clearing/return reference it). */
  txnId: string;
  merchant: string;
  cents: number;
  authorizedAt: string;
}

export function newSpendRef(merchant: string, cents: number): SpendRef {
  return { txnId: nextId('CardTransaction'), merchant, cents, authorizedAt: nowIso() };
}

function merchantBody(merchant: string) {
  return { descriptor: merchant.toUpperCase(), mcc: '5814', country: 'US' };
}

function cardTransaction(ref: SpendRef, status: 'AUTHORIZED' | 'SETTLED' | 'REFUNDED', at: string) {
  const base = {
    type: 'CARD',
    id: ref.txnId,
    cardId: CARD_ID,
    customerId: CARDHOLDER,
    platformCustomerId: 'customer_demo_001',
    issuerTransactionToken: ISSUER_TXN,
    status,
    direction: 'DEBIT',
    merchant: merchantBody(ref.merchant),
    authorizedAmount: { amount: ref.cents, currency: USD },
    accountId: FUNDING_SOURCE,
    pullSummary: { count: 1, totalAmount: ref.cents, pendingCount: 0 },
    authorizedAt: ref.authorizedAt,
    lastEventAt: at,
    createdAt: ref.authorizedAt,
    updatedAt: at,
  };
  if (status === 'AUTHORIZED') return base;
  const settled = {
    ...base,
    settledAmount: { amount: ref.cents, currency: USD },
    settlementSummary: { count: 1, totalAmount: ref.cents },
  };
  if (status === 'SETTLED') return settled;
  return {
    ...settled,
    refundedAmount: { amount: ref.cents, currency: USD },
    refundSummary: { count: 1, totalAmount: ref.cents },
  };
}

function txnWebhook(type: string, data: Record<string, unknown>, title: string, note: string): ApiCall {
  return {
    method: 'POST',
    path: WEBHOOK_ENDPOINT,
    inbound: true,
    title,
    headers: { 'X-Grid-Signature': '<signature>' },
    reqBody: { id: nextId('Webhook'), type, timestamp: data.updatedAt, data },
    status: '200 OK',
    note,
  };
}

/** Spend on the card. In sandbox the simulate call stands in for the terminal;
 *  Grid authorizes against the funding source and delivers
 *  CARD_TRANSACTION.AUTHORIZED. */
export function tapCalls(ref: SpendRef): ApiCall[] {
  const txn = cardTransaction(ref, 'AUTHORIZED', ref.authorizedAt);
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${CARD_ID}/simulate/authorization`,
      title: 'Simulate authorization',
      reqBody: { amount: ref.cents, currency: 'USD', merchant: merchantBody(ref.merchant) },
      status: '202 Accepted',
      note: 'Sandbox only — stands in for the card being tapped at a terminal. The outcome arrives by webhook.',
      resBody: { issuerTransactionToken: ISSUER_TXN },
    },
    txnWebhook(
      'CARD_TRANSACTION.AUTHORIZED',
      txn,
      'Authorization approved',
      `CARD_TRANSACTION.AUTHORIZED — ${usd(ref.cents)} at ${ref.merchant}, funded from the card's first funding source.`,
    ),
  ];
}

export type DeclineCode = 'CARD_PAUSED' | 'CARD_CLOSED' | 'OVER_PER_TXN_LIMIT' | 'OVER_DAILY_LIMIT';

const DECLINE_SUFFIX: Record<DeclineCode, string> = {
  CARD_PAUSED: '003',
  CARD_CLOSED: '003',
  OVER_PER_TXN_LIMIT: '002',
  OVER_DAILY_LIMIT: '002',
};

const DECLINE_NOTE: Record<DeclineCode, string> = {
  CARD_PAUSED: 'Declined — CARD_PAUSED. The card is FROZEN, so Grid refuses new authorizations. No CardTransaction is created and nothing is pulled from the funding source.',
  CARD_CLOSED: 'Declined — the card is CLOSED. No CardTransaction is created.',
  OVER_PER_TXN_LIMIT: 'Declined — the amount exceeds maxSpendPerTransaction. No CardTransaction is created.',
  OVER_DAILY_LIMIT: 'Declined — this purchase would exceed maxSpendPerDay for the current UTC day. No CardTransaction is created.',
};

/** A declined tap: the sandbox descriptor suffix forces the decline path
 *  (…003 = CARD_PAUSED, …002 = insufficient / over cap). No webhook fires;
 *  the terminal just shows the decline. */
export function declineCalls(reason: DeclineCode, merchant: string, cents: number): ApiCall[] {
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${CARD_ID}/simulate/authorization`,
      title: 'Simulate authorization',
      reqBody: {
        amount: cents,
        currency: 'USD',
        merchant: { ...merchantBody(merchant), descriptor: `${merchant.toUpperCase()} ${DECLINE_SUFFIX[reason]}` },
      },
      status: '202 Accepted',
      note: DECLINE_NOTE[reason],
      resBody: { issuerTransactionToken: ISSUER_TXN },
    },
  ];
}

/** The network clears the authorization a few seconds later. */
export function clearingCalls(ref: SpendRef): ApiCall[] {
  const at = nowIso();
  const txn = cardTransaction(ref, 'SETTLED', at);
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${CARD_ID}/simulate/clearing`,
      title: 'Simulate clearing',
      reqBody: { cardTransactionId: ref.txnId, amount: ref.cents },
      status: '202 Accepted',
      note: 'Sandbox only — the merchant presents the clearing. Pass a larger amount to exercise the over-authorization (tip) path.',
      resBody: { issuerTransactionToken: ISSUER_TXN },
    },
    txnWebhook(
      'CARD_TRANSACTION.SETTLED',
      txn,
      'Transaction settled',
      `CARD_TRANSACTION.SETTLED — ${usd(ref.cents)} posted. settledAmount now matches authorizedAmount.`,
    ),
  ];
}

/** The merchant returns the purchase in full. */
export function refundCalls(ref: SpendRef): ApiCall[] {
  const at = nowIso();
  const txn = cardTransaction(ref, 'REFUNDED', at);
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${CARD_ID}/simulate/return`,
      title: 'Simulate return',
      reqBody: { cardTransactionId: ref.txnId, amount: ref.cents },
      status: '202 Accepted',
      note: 'Sandbox only — a merchant RETURN against the settled transaction. A partial amount keeps the parent SETTLED.',
      resBody: { issuerTransactionToken: ISSUER_TXN },
    },
    txnWebhook(
      'CARD_TRANSACTION.REFUNDED',
      txn,
      'Transaction refunded',
      `CARD_TRANSACTION.REFUNDED — ${usd(ref.cents)} returned to the funding source. Daily spend capacity is not restored.`,
    ),
  ];
}

/* ── Apple Wallet ──────────────────────────────────────────────────────── */

export function walletBrandingCalls(programName: string, logoUrl: string | null): ApiCall[] {
  const name = programName.trim() || 'Your brand';
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'your-brand';
  const body = {
    cardTokenization2faConfig: {
      displayName: name,
      logoUrl: logoUrl ? `https://${slug}.com/card-wallet-logo.png` : `https://${slug}.com/logo.png`,
      email: {
        fromAddress: `cards@${slug}.com`,
        fromName: `${name} Cards`,
        subject: `Your ${name} card verification code`,
        bodyText: `Use this code to finish adding your ${name} card to your digital wallet.`,
      },
      sms: {
        bodyText: `Use this code to finish adding your ${name} card to your digital wallet.`,
      },
    },
  };
  return [
    {
      method: 'PATCH',
      path: '/platform/config',
      title: 'Brand the wallet verification',
      reqBody: body,
      status: '200 OK',
      note: 'When a cardholder adds the card to Apple Pay or Google Pay, the wallet asks for a one-time code. Grid sends it with your name, logo, and copy. Provisioning itself is handled by the wallet and the issuer — there is no Grid call for it.',
      resBody: {
        ...body,
        cardConfigs: { maxSpendPerTransaction: null, maxSpendPerDay: null },
        updatedAt: nowIso(),
      },
    },
  ];
}
