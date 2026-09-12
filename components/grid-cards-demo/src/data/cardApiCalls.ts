/* ============================================================
   Cards API call sequences shown in the panel.
   Request and response bodies follow the OpenAPI schemas in
   openapi/components/schemas/cards/ and the webhook wrappers in
   openapi/components/schemas/webhooks/. The calls are scripted;
   the on-phone flow is the trigger.
   ============================================================ */

import type { ApiCall } from './flow';
import { TAP_MERCHANTS } from '@/apps/shared/card/merchants';
import type { MerchantCategory } from '@/apps/shared/card/types';

// Realistic placeholder ids (same formats the sandbox returns).
const CARDHOLDER = 'Customer:019e8f47-2a3d-1d02-0000-6b1f0c4e2a91';
const FUNDING_SOURCE = 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463';
const WEBHOOK_ENDPOINT = 'https://your-app.com/webhooks/grid';
const PLATFORM_CONFIG_ID = 'PlatformConfig:019e8f46-0c2a-7b11-0000-3e9d1a5c7f20';

const USD = { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 };

/** Issuer activation lag mirrored on the phone (useCardHome ISSUE_MS). */
const ACTIVATION_MS = 2700;

let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}:019e8f4c-${(0x6d2f + seq).toString(16).padStart(4, '0')}-4b81-0000-${seq.toString(16).padStart(12, '0')}`;
}
function toIso(ms: number) {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}
function nowIso() {
  return toIso(Date.now());
}
function usd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/** The card the session is acting on. Every POST /cards mints a new one (a
 *  closed card is never brought back), so its id and createdAt move with it. */
let cardSeq = 0;
let card = {
  id: 'Card:019e8f4b-2c1e-7a30-0000-5f0a3b7c9d12',
  // Server-generated; a value in the request is ignored.
  platformCardId: 'card-demo-001',
  createdAt: nowIso(),
  activeAt: toIso(Date.now() + ACTIVATION_MS),
};
function mintCard() {
  const now = Date.now();
  cardSeq += 1;
  card = {
    id: nextId('Card'),
    platformCardId: `card-demo-${String(cardSeq).padStart(3, '0')}`,
    createdAt: toIso(now),
    activeAt: toIso(now + ACTIVATION_MS),
  };
}
/** Idempotency key for a fee-bearing POST /cards; a retry reuses it. */
function idempotencyKey() {
  const hex = (n: number) => Math.floor(Math.random() * 16 ** n).toString(16).padStart(n, '0');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${hex(4)}-${hex(12)}`;
}

export type CardLifecycleState = 'ACTIVE' | 'FROZEN' | 'CLOSED';

export interface CardSpendLimits {
  maxSpendPerTransaction?: number | null;
  maxSpendPerDay?: number | null;
}

interface CardResourceOptions {
  state?: 'PROCESSING' | CardLifecycleState;
  limits?: CardSpendLimits;
  updatedAt?: string;
}

/** What the issuer's program lets this card do. Fixed at issuance; the
 *  playground's card is on a Grid-decisioned program with PAN reveal. */
const CARD_CAPABILITIES = {
  supportsSpendLimits: true,
  supportsTransactionCountLimit: true,
  supports3dSecurePassword: false,
  supportsPanReveal: true,
};

/** The Card resource. `stateReason` is present only once the card is
 *  CLOSED (or provisioning was rejected); the demo only ever closes it. */
function cardResource({ state = 'ACTIVE', limits = {}, updatedAt }: CardResourceOptions = {}) {
  return {
    id: card.id,
    customerId: CARDHOLDER,
    platformCardId: card.platformCardId,
    state,
    ...(state === 'CLOSED' ? { stateReason: 'CLOSED_BY_PLATFORM' } : {}),
    brand: 'VISA',
    form: 'VIRTUAL',
    last4: '8972',
    expMonth: 6,
    expYear: 2030,
    fundingSource: FUNDING_SOURCE,
    cardCapabilities: CARD_CAPABILITIES,
    maxSpendPerTransaction: limits.maxSpendPerTransaction ?? null,
    maxSpendPerDay: limits.maxSpendPerDay ?? null,
    // The phone's Limits page only edits the two spend caps.
    maxTransactionsPerDay: null,
    currency: 'USD',
    processorRef: 'card_b81c2a4f',
    issuerRef: 'lead_card_7a1b9c3d',
    createdAt: card.createdAt,
    updatedAt: updatedAt ?? (state === 'PROCESSING' ? card.createdAt : card.activeAt),
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
  mintCard();
  const reqLimits: Record<string, number> = {};
  if (limits.maxSpendPerTransaction) reqLimits.maxSpendPerTransaction = limits.maxSpendPerTransaction;
  if (limits.maxSpendPerDay) reqLimits.maxSpendPerDay = limits.maxSpendPerDay;
  return [
    {
      method: 'POST',
      path: '/cards',
      title: 'Create card',
      headers: { 'Idempotency-Key': idempotencyKey() },
      reqBody: {
        customerId: CARDHOLDER,
        form: 'VIRTUAL',
        fundingSource: FUNDING_SOURCE,
        ...reqLimits,
      },
      status: '201 Created',
      note: 'Card enters PROCESSING while the issuer provisions it. The customer must have KYC status APPROVED, and issuance is fee-bearing, so the Idempotency-Key header is required. Spend caps are accepted only when the funding source\u2019s cardCapabilities.supportsSpendLimits is true.',
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
      path: `/cards/${card.id}/reveal`,
      title: 'Reveal card details',
      status: '200 OK',
      note: 'Returns a short-lived iframe URL that renders the PAN, expiry, and CVV. The card resource itself only carries last4 and expiry — card credentials never cross your servers. Only for cards whose cardCapabilities.supportsPanReveal is true; otherwise this returns 409 and the issuer\u2019s hosted reveal flow is used instead.',
      resBody: {
        panEmbedUrl: 'https://embed.lithic.com/iframe/card_b81c2a4f?t=eyJhbGciOiJIUzI1NiJ9…',
        expiresAt: expires,
      },
    },
  ];
}

/* ── Lock (FROZEN) / unlock / close ─────────────────────────────────────────── */

export function stateChangeCalls(state: CardLifecycleState, limits: CardSpendLimits = {}): ApiCall[] {
  const card = cardResource({ state, limits, updatedAt: nowIso() });
  const copy = {
    FROZEN: {
      title: 'Lock card',
      note: 'ACTIVE → FROZEN. New authorizations decline with CARD_PAUSED; in-flight clearings still post.',
      hookTitle: 'Card locked',
      hookNote: 'CARD.STATE_CHANGE — state is FROZEN. Reversible with state: ACTIVE.',
    },
    ACTIVE: {
      title: 'Unlock card',
      note: 'FROZEN → ACTIVE. Authorizations resume immediately.',
      hookTitle: 'Card active',
      hookNote: 'CARD.STATE_CHANGE — state is back to ACTIVE.',
    },
    CLOSED: {
      title: 'Close card',
      note: 'ACTIVE | FROZEN → CLOSED. Terminal: the funding source detaches, the card can no longer be mutated, and its slot against the platform\u2019s live-card limit frees up.',
      hookTitle: 'Card closed',
      hookNote: 'CARD.STATE_CHANGE — state is CLOSED with stateReason CLOSED_BY_PLATFORM.',
    },
  }[state];
  return [
    {
      method: 'PATCH',
      path: `/cards/${card.id}`,
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
    path: `/cards/${card.id}`,
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
      path: `/cards/${card.id}`,
      title: 'Set spend limits',
      reqBody: body,
      status: '200 OK',
      note: parts.length
        ? `Caps: ${parts.join(', ')}. Grid enforces the lower of the card cap and the platform cap. The daily window resets at 00:00 UTC; refunds don't restore capacity. maxTransactionsPerDay is omitted, so it stays unchanged.`
        : 'Both spend caps cleared (null); maxTransactionsPerDay is omitted, so it stays unchanged. The platform-level cardConfigs still apply.',
      resBody: cardResource({ state: 'ACTIVE', limits, updatedAt: nowIso() }),
    },
  ];
}

/* ── Spend ─────────────────────────────────────────────────────────────── */

export interface SpendRef {
  /** Stable CardTransaction id for this purchase (so clearing/return reference it). */
  txnId: string;
  /** The card the purchase was made on (a later re-issue mints a new card). */
  cardId: string;
  /** Issuer-side token correlating each simulate call to its webhook. */
  issuerTransactionToken: string;
  merchant: string;
  cents: number;
  authorizedAt: string;
}

function issuerToken() {
  const hex = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

export function newSpendRef(merchant: string, cents: number): SpendRef {
  return {
    txnId: nextId('Transaction'),
    cardId: card.id,
    issuerTransactionToken: issuerToken(),
    merchant,
    cents,
    authorizedAt: nowIso(),
  };
}

/** ISO 18245 Merchant Category Codes for the demo's merchants. */
const MCC_BY_CATEGORY: Record<MerchantCategory, string> = {
  coffee: '5814',
  'fast-food': '5814',
  convenience: '5499',
  cafe: '5812',
  fashion: '5651',
  apparel: '5651',
  accessories: '5699',
  furniture: '5712',
  homeware: '5719',
  grocery: '5411',
};

/** The merchant as the card network reports it: an uppercase ASCII
 *  descriptor plus MCC and country. */
function merchantBody(merchant: string) {
  const category = TAP_MERCHANTS.find((m) => m.title === merchant)?.category;
  const descriptor = merchant
    .normalize('NFKD')
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .toUpperCase();
  return { descriptor, mcc: category ? MCC_BY_CATEGORY[category] : '5999', country: 'US' };
}

interface CardTransactionOptions {
  status: 'AUTHORIZED' | 'SETTLED' | 'DECLINED';
  /** A merchant return is its own CREDIT row pointing back at the purchase. */
  direction?: 'DEBIT' | 'CREDIT';
  originalTransactionId?: string;
  at: string;
}

/** The CardTransaction resource at a lifecycle point, keys in the order the
 *  API's examples use. A purchase row rolls its clearings into settledAmount;
 *  a DECLINED row carries only the attempted authorizedAmount. */
function cardTransaction(
  ref: SpendRef,
  { status, direction = 'DEBIT', originalTransactionId, at }: CardTransactionOptions,
) {
  const amount = { amount: ref.cents, currency: USD };
  return {
    type: 'CARD',
    id: ref.txnId,
    cardId: ref.cardId,
    customerId: CARDHOLDER,
    platformCustomerId: 'customer_demo_001',
    issuerTransactionToken: ref.issuerTransactionToken,
    status,
    direction,
    ...(originalTransactionId ? { originalTransactionId } : {}),
    merchant: merchantBody(ref.merchant),
    authorizedAmount: amount,
    ...(status === 'SETTLED' ? { settledAmount: amount } : {}),
    accountId: FUNDING_SOURCE,
    authorizedAt: ref.authorizedAt,
    createdAt: ref.authorizedAt,
    updatedAt: at,
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
  const txn = cardTransaction(ref, { status: 'AUTHORIZED', at: ref.authorizedAt });
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${ref.cardId}/simulate/authorization`,
      title: 'Simulate authorization',
      reqBody: { amount: ref.cents, currency: { code: 'USD' }, merchant: merchantBody(ref.merchant) },
      status: '202 Accepted',
      note: 'Sandbox only — stands in for the card being tapped at a terminal. The outcome arrives by webhook.',
      resBody: { issuerTransactionToken: ref.issuerTransactionToken },
    },
    txnWebhook(
      'CARD_TRANSACTION.AUTHORIZED',
      txn,
      'Authorization approved',
      `CARD_TRANSACTION.AUTHORIZED — ${usd(ref.cents)} at ${ref.merchant}, held against the card's funding source.`,
    ),
  ];
}

export type DeclineCode = 'CARD_PAUSED' | 'CARD_CLOSED' | 'OVER_PER_TXN_LIMIT' | 'OVER_DAILY_LIMIT';

const DECLINE_WHY: Record<DeclineCode, string> = {
  CARD_PAUSED: 'the card is FROZEN, so Authorization Decisioning refuses new authorizations (CARD_PAUSED)',
  CARD_CLOSED: 'the card is CLOSED',
  OVER_PER_TXN_LIMIT: 'the amount exceeds the effective maxSpendPerTransaction (the lower of the card cap and the platform cap)',
  OVER_DAILY_LIMIT: 'this purchase would push cumulative spend past the effective maxSpendPerDay for the current UTC day',
};

/** A declined tap. The request is an ordinary authorization — Grid declines
 *  it from the card's own state (FROZEN / CLOSED) or its spend caps, the same
 *  way it would in production. The decline is recorded as a DECLINED
 *  CardTransaction and delivered as CARD_TRANSACTION.DECLINED. */
export function declineCalls(reason: DeclineCode, merchant: string, cents: number): ApiCall[] {
  const ref = newSpendRef(merchant, cents);
  const txn = cardTransaction(ref, { status: 'DECLINED', at: ref.authorizedAt });
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${ref.cardId}/simulate/authorization`,
      title: 'Simulate authorization',
      reqBody: { amount: cents, currency: { code: 'USD' }, merchant: merchantBody(merchant) },
      status: '202 Accepted',
      note: `Sandbox only — the card is tapped at a terminal. Grid declines because ${DECLINE_WHY[reason]}. Nothing is pulled from the funding source.`,
      resBody: { issuerTransactionToken: ref.issuerTransactionToken },
    },
    txnWebhook(
      'CARD_TRANSACTION.DECLINED',
      txn,
      'Authorization declined',
      `CARD_TRANSACTION.DECLINED — ${usd(cents)} at ${merchant} refused. A DECLINED row carries no settlement and is excluded from cardholder statements.`,
    ),
  ];
}

/** The network clears the authorization a few seconds later. */
export function clearingCalls(ref: SpendRef): ApiCall[] {
  const txn = cardTransaction(ref, { status: 'SETTLED', at: nowIso() });
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${ref.cardId}/simulate/clearing`,
      title: 'Simulate clearing',
      reqBody: { cardTransactionId: ref.txnId, amount: ref.cents },
      status: '202 Accepted',
      note: 'Sandbox only — the merchant presents the clearing. Pass a larger amount to exercise the over-authorization (tip) path, or 0 for an authorization expiry.',
      resBody: { issuerTransactionToken: ref.issuerTransactionToken },
    },
    txnWebhook(
      'CARD_TRANSACTION.SETTLED',
      txn,
      'Transaction settled',
      `CARD_TRANSACTION.SETTLED — ${usd(ref.cents)} posted. settledAmount now matches authorizedAmount.`,
    ),
  ];
}

/** The merchant returns the purchase in full. The return posts as its own
 *  dated CREDIT CardTransaction linked to the purchase via
 *  originalTransactionId; the purchase row stays SETTLED. */
export function refundCalls(purchase: SpendRef): ApiCall[] {
  const credit: SpendRef = { ...newSpendRef(purchase.merchant, purchase.cents), cardId: purchase.cardId };
  const txn = cardTransaction(credit, {
    status: 'SETTLED',
    direction: 'CREDIT',
    originalTransactionId: purchase.txnId,
    at: credit.authorizedAt,
  });
  return [
    {
      method: 'POST',
      path: `/sandbox/cards/${purchase.cardId}/simulate/return`,
      title: 'Simulate return',
      reqBody: { cardTransactionId: purchase.txnId, amount: purchase.cents },
      status: '202 Accepted',
      note: 'Sandbox only — a merchant RETURN against the settled purchase. Full or partial, the purchase keeps its SETTLED status; the return is posted as a separate CREDIT transaction.',
      resBody: { issuerTransactionToken: credit.issuerTransactionToken },
    },
    txnWebhook(
      'CARD_TRANSACTION.SETTLED',
      txn,
      'Return credited',
      `CARD_TRANSACTION.SETTLED on a new CREDIT row — ${usd(purchase.cents)} back on the funding source, with originalTransactionId pointing at the purchase. Daily spend capacity is not restored.`,
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
      title: 'Set up wallet branding',
      reqBody: body,
      status: '200 OK',
      note: 'One-time platform setup, not a per-card call. When a cardholder adds a card to Apple Pay or Google Pay, the wallet asks for a one-time code; Grid sends it with your name, logo, and copy. Adding the card itself is handled by the wallet and the issuer — there is no Grid call for it, so this only appears again if your branding changes.',
      resBody: {
        id: PLATFORM_CONFIG_ID,
        webhookEndpoint: WEBHOOK_ENDPOINT,
        ...body,
        cardConfigs: { maxSpendPerTransaction: null, maxSpendPerDay: null, maxTransactionsPerDay: null },
        createdAt: '2026-05-08T14:10:00Z',
        updatedAt: nowIso(),
      },
    },
  ];
}
