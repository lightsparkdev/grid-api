/* ============================================================
   Agent Accounts API calls shown in the panel.

   Follows the agent spec on main (openapi/paths/agents/*,
   openapi/components/schemas/agents/*, stored_cards/*, payout_runs/*,
   openapi/webhooks/*). Every tool call, path, body and webhook the
   playground shows lives here, built from the conversation's events
   (data/agentEvents.ts); nothing else names an endpoint.

   Each event becomes one or more steps. A step is either the agent's
   tool call inside the agent app (its own tool names: quote_send,
   execute_send, create_deposit, ...) with the Grid calls behind it, or
   the platform's own calls with no tool (creating the agent, changing
   its policy, approving an action).

   Paying a bank account goes through a one-row payout run: agent quotes
   reach wallets, Spark addresses, chain addresses and Lightning invoices
   only. A card top-up is charged by the platform's own card processor,
   which settles into the platform's BULK_SETTLEMENT account; the
   platform credits the wallet from it.
   ============================================================ */

import {
  purchaseSpendLimit,
  type AgentEvent,
  type DepositNetwork,
  type Limits,
  type MerchantAgent,
  type Payee,
  type Purchase,
} from './agentEvents';
import { linkedBank as chosenBank, depositDetails, formatMoney, type LinkedBank } from '@/apps/agents/linkedBank';
import { PERSON } from '@/apps/agents/story';
import { sendsLabel, shortAddress, type CryptoPayee, type SendAsset } from './cryptoSend';
import type { ApiCall } from './flow';

/* ── Fixtures ─────────────────────────────────────────────────────────── */

const CUSTOMER = 'Customer:019e8f47-2a3d-1d02-0000-6b1f0c4e2a91';
const PLATFORM_CUSTOMER = 'customer_demo_001';
/** The customer's Embedded Wallet, set aside for the agent: the only account its policy lets it use. */
const WALLET = 'InternalAccount:019e8f48-1135-1d02-0000-8b9d28990463';
/** The platform's BULK_SETTLEMENT account, where its card processor settles top-ups. */
const SETTLEMENT = 'InternalAccount:019e8f44-0b7e-1d02-0000-5c3a1f9e2d70';
/** The merchant agent's customer and wallet, on the same platform. */
const MERCHANT_CUSTOMER = 'Customer:019e8f52-1d4b-1d02-0000-8a3e5f6b2c19';
const MERCHANT_WALLET = 'InternalAccount:019e8f52-7a0c-1d02-0000-2b6f8e1c9a35';
const WEBHOOK_ENDPOINT = 'https://your-app.com/webhooks/grid';
const SIGNED = { 'X-Grid-Signature': '{"v":"1","s":"MEUCIQD…"}' };
const CARD_HOLDER = PERSON.full;
const BILLING = { line1: '2140 Ocean Park Blvd', line2: 'Apt 4', city: 'Santa Monica', state: 'CA', postalCode: '90405', country: 'US' };

const USD = { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 };
const USDB = { code: 'USDB', name: 'USDB', symbol: '$', decimals: 2 };
/** What a crypto send receives, with each asset's smallest unit (USDC and USDT in millionths, bitcoin in satoshis). */
const SEND_CURRENCY: Record<SendAsset, { code: string; name: string; symbol: string; decimals: number }> = {
  USDC: { code: 'USDC', name: 'USD Coin', symbol: '', decimals: 6 },
  USDT: { code: 'USDT', name: 'Tether USD', symbol: '', decimals: 6 },
  BTC: { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8 },
  USDB,
};
/** Dollars to satoshis at a demo price of $100,000 a bitcoin. */
const SATS_PER_CENT = 10;
const FIAT: Record<string, { code: string; name: string; symbol: string; decimals: number }> = {
  USD,
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2 },
};
/** The rails the spec names (PaymentRail), for a rail the playground labels in words. */
const PAYMENT_RAILS = new Set(['ACH', 'BANK_TRANSFER', 'FASTER_PAYMENTS', 'MOBILE_MONEY', 'PIX', 'PAYNOW', 'SEPA_INSTANT', 'SPEI', 'UPI', 'SWIFT', 'WIRE', 'RTP', 'FEDNOW']);

const PERMISSIONS = [
  'VIEW_TRANSACTIONS',
  'CREATE_QUOTES',
  'EXECUTE_QUOTES',
  'RECEIVE_FUNDS',
  'MANAGE_EXTERNAL_ACCOUNTS',
  'ISSUE_CARDS',
  'MANAGE_CARDS',
  'USE_STORED_CARDS',
];

/** The playground's starting policy (Grid has no default: the platform sends one with every agent it creates). */
export const DEFAULT_LIMITS: Limits = {
  perTransaction: 100_000,
  daily: 250_000,
  approvalAbove: 1_000,
};
const MONTHLY_LIMIT = 1_000_000;

/** What the customer's wallet holds before the visitor funds it. */
export const OPENING_BALANCE_CENTS = 0;
/** What a jump straight to a payment tops the balance up to, when it has less than the payment needs. */
export const FAST_FORWARD_FUND_CENTS = 125_000;

/* ── Shapes ───────────────────────────────────────────────────────────── */

/** The agent's tool call inside the app. */
export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
}

/** One beat in the panel: a tool call with its Grid calls, or platform calls on their own. */
export interface CallStep {
  tool: ToolCall | null;
  calls: ApiCall[];
}

/** A line of the account's history. Amounts are signed USD cents. */
export interface LedgerEntry {
  id: string;
  at: number;
  title: string;
  detail: string;
  cents: number;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  /** The Grid transaction behind it, as the agent's transaction list returns it. None for a purchase on the person's own
   *  card: the merchant charges it, and no money moves through Grid. */
  txn?: Record<string, unknown>;
}

export interface AccountSnapshot {
  /** The agent exists: created with its policy, its device code redeemed. */
  connected: boolean;
  /** The person set up a balance for it to hold money in. Without one (a card only), it pays with the card. */
  balanceOn: boolean;
  /** The person saved a credit or debit card the agent may use. */
  cardVaulted: boolean;
  /** A bank is linked to top up from over ACH. */
  bankLinked: boolean;
  balanceCents: number;
  limits: Limits;
  spentTodayCents: number;
  ledger: LedgerEntry[];
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function toIso(ms: number) {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}
const nowIso = () => toIso(Date.now());

function hex(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
let seq = 0;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}:019e8f${hex(2)}-${hex(4)}-1d02-0000-${seq.toString(16).padStart(4, '0')}${hex(8)}`;
}
function idempotencyKey() {
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${hex(4)}-${hex(12)}`;
}
function base64url(n: number) {
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  return Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
}
function txHash(network: string) {
  return network === 'SOLANA' ? base64url(86).replace(/[-_0OIl]/g, 'x') : `0x${hex(64)}`;
}
function money(cents: number, symbol = '$') {
  return `${symbol}${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fiat(code: string) {
  if (FIAT[code]) return FIAT[code];
  const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(0);
  const name = new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) ?? code;
  return { code, name, symbol: parts.find((p) => p.type === 'currency')?.value ?? '', decimals: 2 };
}
const dollars = (cents: number) => Number((cents / 100).toFixed(2));
/** A rail the playground names in words ("SEPA Instant", "international wire"), as the spec names it. */
function paymentRail(label: string) {
  if (/wire/i.test(label)) return 'SWIFT';
  const rail = label.toUpperCase().replace(/ /g, '_');
  return PAYMENT_RAILS.has(rail) ? rail : 'BANK_TRANSFER';
}
/** A merchant as an agent names it to Grid: its website host. */
const host = (merchant: string) => `${merchant.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`;

function webhook(name: string, type: string, data: Record<string, unknown>, title: string, note: string): ApiCall {
  return {
    method: 'POST',
    path: WEBHOOK_ENDPOINT,
    inbound: true,
    webhook: name,
    title,
    headers: SIGNED,
    reqBody: { id: nextId('Webhook'), type, timestamp: nowIso(), data },
    status: '200 OK',
    note,
  };
}

function policyBody(limits: Limits) {
  return {
    permissions: PERMISSIONS,
    defaultExecutionMode: 'AUTO',
    spendingLimits: {
      currency: 'USD',
      perTransactionLimit: limits.perTransaction,
      dailyLimit: limits.daily,
      dailyTransactionLimit: 50,
      monthlyLimit: MONTHLY_LIMIT,
    },
    accountRestrictions: { allowedAccountIds: [WALLET] },
    approvalThresholds: { currency: 'USD', amount: limits.approvalAbove },
  };
}

function depositTarget(network: DepositNetwork, amount: number) {
  if (network === 'LIGHTNING') return `lnbc${Math.round(amount / 4)}0n1pn${base64url(40).toLowerCase()}`;
  if (network === 'SOLANA') return `7xKX${base64url(36).replace(/[-_]/g, 'q')}`;
  if (network === 'TRON') return `TQ${base64url(32).replace(/[-_]/g, 'r')}`;
  return `0x${hex(40)}`;
}

/** The saved card as Grid shows it to anyone but its owner. */
const CARD_DISPLAY = { lastFour: '4242', brand: 'VISA', funding: 'CREDIT', issuerCountry: 'US', expiryMonth: 9, expiryYear: 2029 };

/** The whole quote Grid returns for a platform quote that moves money into the wallet. */
function intoWallet(args: {
  source: Record<string, unknown>;
  sending: typeof USD;
  sendingAmount: number;
  amount: number;
  status: string;
  transactionId: string;
  expiresIn?: number;
  paymentInstructions?: Record<string, unknown>[];
}) {
  return {
    id: nextId('Quote'),
    status: args.status,
    createdAt: nowIso(),
    expiresAt: toIso(Date.now() + (args.expiresIn ?? 5 * 60_000)),
    source: args.source,
    destination: { destinationType: 'ACCOUNT', accountId: WALLET },
    sendingCurrency: args.sending,
    receivingCurrency: USDB,
    totalSendingAmount: args.sendingAmount,
    totalReceivingAmount: args.amount,
    exchangeRate: Number((args.amount / args.sendingAmount).toFixed(6)),
    feesIncluded: 0,
    ...(args.paymentInstructions && { paymentInstructions: args.paymentInstructions }),
    transactionId: args.transactionId,
  };
}

/* ── Session ──────────────────────────────────────────────────────────── */

type Quote = {
  id: string;
  body: Record<string, unknown>;
  usd: number;
  title: string;
  detail: string;
  done: string;
  toolName: string;
  /** Where the money lands, as the transaction records it. */
  txnDestination: Record<string, unknown>;
  incoming?: () => ApiCall;
};

/** A one-row payout run to a saved bank account, previewed and waiting to be created. */
type Run = {
  payee: Payee;
  accountId: string;
  fee: number;
  title: string;
  detail: string;
  done: string;
  previewTool: string;
  sendTool: string;
};

type Pending =
  | { kind: 'quote'; action: string; quote: Quote }
  | { kind: 'card'; action: string; purchase: Purchase }
  | { kind: 'use'; action: string; purchase: Purchase }
  | { kind: 'run'; action: string; run: Run; id: string };

export interface AgentSession {
  /** The steps one conversation event makes, in order. */
  stepsFor(event: AgentEvent): CallStep[];
  /** Whether an amount (USD cents) waits for the person under the current policy. */
  needsApproval(usdCents: number): boolean;
  /** Install the agent without logging anything: a flow that needs it, started first. */
  assumeConnected(): void;
  /** Top up without logging anything: a payment jumped to before any money was added. */
  assumeFunded(cents: number): void;
  snapshot(): AccountSnapshot;
}

/**
 * One agent's run in the playground: its ids, its policy, the account's
 * balance and history, and the action waiting for approval, so a quote's id
 * carries from create to execute and an approval names the action that was
 * held. Reset makes a new session.
 */
export function createAgentSession(nameOf: () => string): AgentSession {
  const agent = nextId('Agent');
  const createdAt = nowIso();
  let connected = false;
  let balanceOn = false;
  /** The agent's delegated key on the wallet, which every send and purchase card is signed with. */
  let keyed = false;
  let limits = { ...DEFAULT_LIMITS };
  let balance = OPENING_BALANCE_CENTS;
  let spentToday = 0;
  let countToday = 0;
  const ledger: LedgerEntry[] = [];
  let quote: Quote | null = null;
  let run: Run | null = null;
  let deposit: { id: string; quoteId: string; network: DepositNetwork; currency: string; amount: number; body: Record<string, unknown> } | null = null;
  /** A top-up the person is pushing from their bank: the real-time funded quote it settles. */
  let wire: { quoteId: string; transactionId: string; currency: string; local: number; amount: number; label: string; rail: string } | null = null;
  let receive: { quoteId: string; network: DepositNetwork; currency: string; address: string } | null = null;
  let pending: Pending | null = null;
  /** The purchase card waiting for checkout, or a stored-card use whose link the agent collects at checkout. */
  let card: { id: string; purchase: Purchase } | null = null;
  let use: { action: string; purchase: Purchase } | null = null;
  let storedCard: string | null = null;
  let linkedBank: string | null = null;
  /** The external account each person the agent pays was saved as, by name. */
  const payeeAccounts = new Map<string, string>();
  const payeeAccount = (name: string) => {
    const id = payeeAccounts.get(name) ?? nextId('ExternalAccount');
    payeeAccounts.set(name, id);
    return id;
  };
  /** When each action was created and when it expires, so every state of it reads the same. */
  const actionTimes = new Map<string, { createdAt: string; expiresAt: string }>();

  const needsApproval = (usdCents: number) => usdCents > limits.approvalAbove;

  const record = (title: string, detail: string, cents: number, txn?: Record<string, unknown>, status: LedgerEntry['status'] = 'COMPLETED') => {
    ledger.unshift({ id: (txn?.id as string) ?? nextId('Transaction'), at: Date.now(), title, detail, cents, status, txn });
  };
  const spend = (usd: number, fromBalance = true) => {
    if (fromBalance) balance -= usd;
    spentToday += usd;
    countToday += 1;
  };

  const agentResource = () => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const pad = (v: number) => String(v).padStart(2, '0');
    return {
      id: agent,
      name: nameOf(),
      customerId: CUSTOMER,
      isPaused: false,
      isConnected: true,
      policy: policyBody(limits),
      usage: {
        dailyTransactionCount: countToday,
        dailySpend: spentToday,
        dailyResetDate: `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`,
        monthlySpend: spentToday,
        monthlyResetMonth: `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}`,
      },
      createdAt,
      updatedAt: nowIso(),
    };
  };

  /** An incoming transaction into the customer's wallet, as the webhook and the transaction list carry it. */
  const incomingTxn = (args: {
    id?: string;
    amount: number;
    source: Record<string, unknown>;
    direction?: 'CREDIT' | 'DEBIT';
    quoteId?: string;
    description?: string;
    status?: 'PROCESSING' | 'COMPLETED';
  }) => {
    const status = args.status ?? 'COMPLETED';
    return {
      id: args.id ?? nextId('Transaction'),
      type: 'INCOMING',
      status,
      direction: args.direction ?? 'CREDIT',
      customerId: CUSTOMER,
      platformCustomerId: PLATFORM_CUSTOMER,
      source: args.source,
      destination: { destinationType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
      receivedAmount: { amount: args.amount, currency: USDB },
      ...(args.quoteId && { quoteId: args.quoteId }),
      ...(args.description && { description: args.description }),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...(status === 'COMPLETED' && { settledAt: nowIso() }),
    };
  };
  const incomingWebhook = (txn: Record<string, unknown>, title: string, note: string) => webhook('incoming-payment', 'INCOMING_PAYMENT.COMPLETED', txn, title, note);

  const outgoingTxn = (q: Quote, status: 'PROCESSING' | 'COMPLETED') => ({
    id: q.body.transactionId,
    type: 'OUTGOING',
    status,
    direction: 'DEBIT',
    customerId: CUSTOMER,
    platformCustomerId: PLATFORM_CUSTOMER,
    agentId: agent,
    source: { sourceType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
    destination: status === 'COMPLETED' ? q.txnDestination : { ...q.txnDestination, railDetails: undefined },
    quoteId: q.id,
    sentAmount: { amount: q.body.totalSendingAmount, currency: USDB },
    receivedAmount: { amount: q.body.totalReceivingAmount, currency: q.body.receivingCurrency },
    exchangeRate: q.body.exchangeRate,
    fees: q.body.feesIncluded,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...(status === 'COMPLETED' ? { settledAt: nowIso() } : {}),
  });

  const actionBody = (
    id: string,
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED',
    rest: Record<string, unknown>,
    window = 15 * 60_000,
  ): Record<string, unknown> => {
    const times = actionTimes.get(id) ?? { createdAt: nowIso(), expiresAt: toIso(Date.now() + window) };
    actionTimes.set(id, times);
    return { id, agentId: agent, customerId: CUSTOMER, platformCustomerId: PLATFORM_CUSTOMER, status, ...rest, ...times, updatedAt: nowIso() };
  };

  /** The agent checking on an action it's waiting for. */
  const pollStep = (action: string, body: Record<string, unknown>, result: Record<string, unknown>): CallStep => ({
    tool: { name: 'get_action_status', args: { action_id: action }, result },
    calls: [
      {
        method: 'GET',
        path: `/agents/me/actions/${action}`,
        auth: 'agent',
        title: 'Get agent action',
        status: '200 OK',
        note: 'The agent polls the action for the decision.',
        resBody: body,
      },
    ],
  });

  /** The webhooks that follow a quote Grid executes. */
  const settledCalls = (q: Quote): ApiCall[] => {
    const txn = outgoingTxn(q, 'COMPLETED');
    record(q.title, q.detail, -q.usd, txn);
    return [webhook('outgoing-payment', 'OUTGOING_PAYMENT.COMPLETED', txn, 'Payment completed', `OUTGOING_PAYMENT.COMPLETED: ${q.done}`), ...(q.incoming ? [q.incoming()] : [])];
  };

  const quoteStep = (
    toolName: string,
    toolArgs: Record<string, unknown>,
    destination: Record<string, unknown>,
    receiving: { currency: typeof USD; amount: number },
    usd: number,
    fee: number,
    labels: { title: string; detail: string; done: string; note: string },
  ): CallStep => {
    const id = nextId('Quote');
    const reqBody = {
      source: { sourceType: 'ACCOUNT', accountId: WALLET },
      destination,
      lockedCurrencySide: 'RECEIVING',
      lockedCurrencyAmount: receiving.amount,
    };
    const body = {
      id,
      status: 'PENDING',
      createdAt: nowIso(),
      expiresAt: toIso(Date.now() + 5 * 60_000),
      source: reqBody.source,
      destination,
      sendingCurrency: USDB,
      receivingCurrency: receiving.currency,
      totalSendingAmount: usd + fee,
      totalReceivingAmount: receiving.amount,
      exchangeRate: Number((receiving.amount / usd).toFixed(4)),
      feesIncluded: fee,
      platformFeesIncluded: 0,
      transactionId: nextId('Transaction'),
    };
    quote = {
      id,
      body,
      usd: usd + fee,
      title: labels.title,
      detail: labels.detail,
      done: labels.done,
      toolName,
      txnDestination: { ...destination, currency: receiving.currency.code },
    };
    return {
      tool: { name: toolName, args: toolArgs, result: { quote_id: id, amount: money(usd), fee: money(fee), expires_in: '5 minutes' } },
      calls: [
        {
          method: 'POST',
          path: '/agents/me/quotes',
          auth: 'agent',
          title: 'Create quote',
          headers: { 'Idempotency-Key': idempotencyKey() },
          reqBody,
          status: '201 Created',
          note: labels.note,
          resBody: body,
        },
      ],
    };
  };

  /** Execute the current quote: on the agent's own authority under the threshold, held above it. */
  const executeSteps = (): CallStep[] => {
    if (!quote) return [];
    const q = quote;
    const action = nextId('AgentAction');
    const path = `/agents/me/quotes/${q.id}/execute`;
    const headers = { 'Idempotency-Key': idempotencyKey() };
    if (needsApproval(q.usd)) {
      const held = actionBody(action, 'PENDING_APPROVAL', { type: 'EXECUTE_QUOTE', quote: q.body }, 5 * 60_000);
      pending = { kind: 'quote', action, quote: q };
      return [
        {
          tool: {
            name: 'execute_send',
            args: { quote_id: q.id },
            result: { status: 'PENDING_APPROVAL', action_id: action, message: `Over the ${money(limits.approvalAbove)} approval amount. Waiting for approval.` },
          },
          calls: [
            {
              method: 'POST',
              path,
              auth: 'agent',
              title: 'Execute quote',
              headers,
              status: '200 OK',
              note: `${money(q.usd)} is over the ${money(limits.approvalAbove)} approval threshold, so the action waits as PENDING_APPROVAL.`,
              resBody: held,
            },
            webhook('agent-action', 'AGENT_ACTION.PENDING_APPROVAL', held, 'Agent action pending', 'AGENT_ACTION.PENDING_APPROVAL: show the person the quote and ask them to approve it.'),
          ],
        },
      ];
    }
    spend(q.usd);
    quote = null;
    return [
      {
        tool: { name: 'execute_send', args: { quote_id: q.id }, result: { status: 'COMPLETED', action_id: action } },
        calls: [
          {
            method: 'POST',
            path,
            auth: 'agent',
            title: 'Execute quote',
            headers,
            status: '200 OK',
            note: `Under the ${money(limits.approvalAbove)} approval threshold, so Grid signs it with the agent's delegated key and executes it: APPROVED, with the transaction attached.`,
            resBody: actionBody(action, 'APPROVED', { type: 'EXECUTE_QUOTE', quote: { ...q.body, status: 'PROCESSING' }, transaction: outgoingTxn(q, 'PROCESSING') }, 5 * 60_000),
          },
          ...settledCalls(q),
        ],
      },
    ];
  };

  const purchaseDetails = (p: Purchase, expiresAt?: string) => ({
    amount: p.amount,
    spendLimit: purchaseSpendLimit(p.amount, p.recurring),
    currency: 'USD',
    description: p.description,
    fundingSource: WALLET,
    ...(p.recurring ? { recurring: true } : {}),
    ...(expiresAt && { expiresAt }),
  });

  /** A purchase card as Grid shows it, in a given status. */
  const cardObject = (id: string, status: string) => ({
    id,
    customerId: CUSTOMER,
    status,
    brand: 'VISA',
    form: 'VIRTUAL',
    last4: '4821',
    expMonth: 11,
    expYear: 2029,
    fundingSource: WALLET,
    currency: 'USD',
    agentId: agent,
    defaultMccBlocksLifted: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  const agentCard = (p: Purchase, status = 'ACTIVE') => {
    card = { id: card?.id ?? nextId('Card'), purchase: p };
    const expiresAt = p.recurring ? undefined : toIso(Date.now() + 30 * 60_000);
    return {
      card: cardObject(card.id, status),
      agentId: agent,
      agentCardKind: 'PURCHASE',
      effectiveBlockedMccs: ['7995', '6051'],
      purchase: purchaseDetails(p, expiresAt),
    };
  };

  /** A use of the person's saved card at a merchant, as an action carries it. */
  const storedCardUse = (p: Purchase) => ({
    storedCardId: storedCard,
    card: CARD_DISPLAY,
    merchant: host(p.merchant),
    amount: p.amount,
    currency: 'USD',
    purpose: p.description,
    needsCvc: false,
    autoApproved: false,
  });

  /* ── Events ── */

  /** The agent's delegated key on the wallet: the wallet owner signs twice in your app, and Grid custodies the key. */
  const delegatedKeySteps = (): CallStep[] => {
    keyed = true;
    const requestId = nextId('Request');
    const reqBody = { agentId: agent, internalAccountId: WALLET, nickname: `${nameOf()} spending key` };
    return [
      {
        tool: null,
        calls: [
          {
            method: 'POST',
            path: '/auth/delegated-keys',
            title: 'Create delegated key',
            reqBody,
            status: '202 Accepted',
            note: 'So the agent can spend from the wallet without holding its keys: Grid generates a key it custodies, and the wallet owner authorizes it.',
            resBody: {
              payloadToSign: `{"organizationId":"org_${hex(10)}","parameters":{"apiKeys":[…]},"timestampMs":"${Date.now()}","type":"ACTIVITY_TYPE_CREATE_API_KEYS_V2"}`,
              requestId,
              expiresAt: toIso(Date.now() + 5 * 60_000),
            },
          },
          {
            method: 'POST',
            path: '/auth/delegated-keys',
            title: 'Authorize delegated key',
            headers: { 'Grid-Wallet-Signature': `eyJwdWJsaWNLZXkiOiIwMm${base64url(24)}…`, 'Request-Id': requestId },
            reqBody,
            status: '201 Created',
            note: 'The person confirms with Face ID: their session key stamps the challenge, once here and once on a second retry. The key is ACTIVE, and Grid signs the agent’s approved sends with it.',
            resBody: {
              id: nextId('DelegatedKey'),
              agentId: agent,
              accountId: WALLET,
              publicKey: `02${hex(64)}`,
              nickname: reqBody.nickname,
              status: 'ACTIVE',
              createdAt: nowIso(),
              updatedAt: nowIso(),
            },
          },
        ],
      },
    ];
  };

  const connect = (lite = false, start?: Limits): CallStep[] => {
    // Already there for the card: the balance turns on, and the agent gets its key on the wallet.
    if (connected) {
      balanceOn = balanceOn || !lite;
      return balanceOn && !keyed ? delegatedKeySteps() : [];
    }
    if (start) limits = { ...start };
    connected = true;
    balanceOn = !lite;
    const code = base64url(22);
    const deviceCode = { code, agentId: agent, expiresAt: toIso(Date.now() + 15 * 60_000), redeemed: false };
    return [
      {
        tool: null,
        calls: [
          {
            method: 'POST',
            path: '/agents',
            title: 'Create agent',
            headers: { 'Idempotency-Key': idempotencyKey() },
            reqBody: { name: nameOf(), customerId: CUSTOMER, policy: policyBody(limits) },
            status: '201 Created',
            note: lite
              ? `The person saved a card for the agent to pay with; your backend creates the agent with ${start ? 'a policy that covers what it’s buying' : 'your starting policy'}. No balance yet. The device code goes to the agent once.`
              : 'The person approved in your app; your backend creates the agent with its policy, locked to the wallet set aside for it. The device code goes to the agent once.',
            resBody: { agent: { ...agentResource(), isConnected: false }, deviceCode },
          },
          {
            method: 'POST',
            path: '/agents/device-codes/redeem',
            auth: 'none',
            title: 'Redeem device code',
            reqBody: { code },
            status: '200 OK',
            note: 'The agent trades the code for its bearer token, returned once, and sends it on every later call.',
            resBody: { agentId: agent, agentName: nameOf(), accessToken: `gat_${hex(40)}`, policy: policyBody(limits) },
          },
        ],
      },
      ...(lite ? [] : delegatedKeySteps()),
    ];
  };

  const depositCall = (network: DepositNetwork, currency: string, amount: number | null, note: string) => {
    const id = nextId('AgentDeposit');
    const quoteId = nextId('Quote');
    const lightning = network === 'LIGHTNING';
    const target = depositTarget(network, amount ?? 0);
    const body = {
      id,
      status: 'PENDING',
      quoteId,
      sourceNetwork: network,
      sourceCurrency: currency,
      destinationInternalAccountId: WALLET,
      destinationCurrency: 'USDB',
      ...(lightning && amount ? { estimatedReceiveAmount: { amount, currency: USDB } } : {}),
      targetType: lightning ? 'LIGHTNING_INVOICE' : 'CHAIN_ADDRESS',
      target,
      ...(lightning
        ? { paymentLinks: { cashApp: `https://cash.app/launch/lightning/${target.slice(0, 24)}` }, expiresAt: toIso(Date.now() + 10 * 60_000) }
        : { expiresAt: null }),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const call: ApiCall = {
      method: 'POST',
      path: '/agents/me/deposits',
      auth: 'agent',
      title: 'Create deposit',
      headers: { 'Idempotency-Key': idempotencyKey() },
      reqBody: {
        sourceNetwork: network,
        sourceCurrency: currency,
        destinationInternalAccountId: WALLET,
        ...(lightning && amount ? { amount } : {}),
      },
      status: '201 Created',
      note,
      resBody: body,
    };
    return { id, quoteId, target, body, call };
  };

  /** Where a deposit came from: the chain and its transaction, or Lightning, which has no rail details. */
  const depositSource = (network: DepositNetwork, currency: string) =>
    network === 'LIGHTNING'
      ? { sourceType: 'REALTIME_FUNDING', currency: 'BTC' }
      : { sourceType: 'REALTIME_FUNDING', currency, railDetails: { paymentRail: 'ONCHAIN', transactionHash: txHash(network), network } };

  const fundDeposit = (network: DepositNetwork, currency: string, amount: number): CallStep[] => {
    const lightning = network === 'LIGHTNING';
    const d = depositCall(
      network,
      currency,
      amount,
      lightning
        ? 'A Lightning invoice for the exact amount. Fees come out of what lands.'
        : 'A deposit address on the chain. It doesn’t expire; the first payment it receives within 24 hours converts into the wallet.',
    );
    deposit = { id: d.id, quoteId: d.quoteId, network, currency, amount, body: d.body };
    return [
      {
        tool: {
          name: 'create_deposit',
          args: { asset: lightning ? 'BTC' : currency, network, amount_usd: dollars(amount) },
          result: { deposit_id: d.id, target: d.target, ...(lightning ? { expires_in: '10 minutes' } : {}) },
        },
        calls: [d.call],
      },
    ];
  };

  const fundReceived = (): CallStep[] => {
    if (wire) return wireReceived();
    if (!deposit) return [];
    const d = deposit;
    deposit = null;
    balance += d.amount;
    const txn = incomingTxn({ amount: d.amount, source: depositSource(d.network, d.currency), quoteId: d.quoteId, description: 'Deposit' });
    record('Added funds', d.network === 'LIGHTNING' ? 'Bitcoin (Lightning)' : `${d.currency} on ${d.network[0]}${d.network.slice(1).toLowerCase()}`, d.amount, txn);
    return [
      {
        tool: { name: 'get_deposit_status', args: { deposit_id: d.id }, result: { status: 'COMPLETED', received: money(d.amount) } },
        calls: [
          {
            method: 'GET',
            path: `/agents/me/deposits/${d.id}`,
            auth: 'agent',
            title: 'Get deposit',
            status: '200 OK',
            note: 'Paid. The transaction that paid it carries the same quoteId.',
            resBody: { ...d.body, status: 'COMPLETED', updatedAt: nowIso() },
          },
          incomingWebhook(txn, 'Deposit landed', `INCOMING_PAYMENT.COMPLETED: ${money(d.amount)} in the customer's wallet.`),
        ],
      },
    ];
  };

  /* The person's own card, saved with Grid's stored cards: collected with Evervault's card form, so Grid only ever holds
     ciphertext, then shared with the agent. The agent never gets the number unless the person approves a use. */
  const cardVault = (): CallStep[] => {
    storedCard = nextId('StoredCard');
    const stored = {
      id: storedCard,
      customerId: CUSTOMER,
      status: 'ACTIVE',
      ...CARD_DISPLAY,
      holderName: CARD_HOLDER,
      billingAddress: BILLING,
      agentIds: [] as string[],
      autoApprovals: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return [
      {
        tool: { name: 'save_card', args: { source: 'card_form' }, result: { stored_card_id: storedCard, brand: 'VISA', last4: '4242' } },
        calls: [
          {
            method: 'POST',
            path: `/customers/${CUSTOMER}/stored-cards`,
            title: 'Store card',
            reqBody: {
              number: 'ev:Tk9D:number:…$',
              cvc: 'ev:Tk9D:cvc:…$',
              lastFour: '4242',
              expiryMonth: 9,
              expiryYear: 2029,
              holderName: CARD_HOLDER,
              billingAddress: BILLING,
            },
            status: '201 Created',
            note: 'Evervault encrypts the number and CVC in the person’s browser, so Grid only holds ciphertext. Grid checks the card with its issuer and discards the CVC.',
            resBody: stored,
          },
          {
            method: 'PUT',
            path: `/customers/${CUSTOMER}/stored-cards/${storedCard}/agents/${agent}`,
            title: 'Share card with agent',
            status: '200 OK',
            note: 'A new card is shared with no agent. Now this one may ask to use it; the person approves each use.',
            resBody: { ...stored, agentIds: [agent], updatedAt: nowIso() },
          },
        ],
      },
    ];
  };

  /* A top-up from the saved card: your card processor charges it, and its settlement lands in your BULK_SETTLEMENT account.
     You credit the wallet from that account at once. */
  const fundCard = (amount: number): CallStep[] => {
    balance += amount;
    const transactionId = nextId('Transaction');
    const source = { sourceType: 'ACCOUNT', accountId: SETTLEMENT, customerId: CUSTOMER };
    const q = intoWallet({ source, sending: USD, sendingAmount: amount, amount, status: 'PROCESSING', transactionId });
    const txn = incomingTxn({
      id: transactionId,
      amount,
      source: { sourceType: 'ACCOUNT', accountId: SETTLEMENT, currency: 'USD' },
      quoteId: q.id,
      description: 'Card top-up',
    });
    record('Added funds', 'Visa •••• 4242', amount, txn);
    return [
      {
        tool: { name: 'add_funds', args: { source: 'saved_card', amount_usd: dollars(amount) }, result: { status: 'COMPLETED', received: money(amount) } },
        calls: [
          {
            method: 'POST',
            path: '/quotes',
            title: 'Credit the top-up',
            headers: { 'Idempotency-Key': idempotencyKey() },
            reqBody: {
              source,
              destination: { destinationType: 'ACCOUNT', accountId: WALLET },
              lockedCurrencySide: 'SENDING',
              lockedCurrencyAmount: amount,
              immediatelyExecute: true,
              description: 'Card top-up',
            },
            status: '200 OK',
            note: `Your card processor charged Visa •••• 4242 ${money(amount)}, and it settles into your BULK_SETTLEMENT account. You credit the wallet from it right away.`,
            resBody: q,
          },
          incomingWebhook(txn, 'Top-up landed', `INCOMING_PAYMENT.COMPLETED: ${money(amount)} from your settlement account, for the card charge.`),
        ],
      },
    ];
  };

  /** The beneficiary a bank account needs, by its currency: some ask for where the person lives. */
  const beneficiary = (name: string, bank: LinkedBank) => {
    const country = bank.country.code.toUpperCase();
    return {
      beneficiaryType: 'INDIVIDUAL',
      fullName: name,
      ...((bank.currency === 'EUR' || bank.currency === 'TRY') && { countryOfResidence: country }),
      ...(bank.currency === 'AED' && { address: { line1: 'Sheikh Zayed Rd 101', city: 'Dubai', postalCode: '00000', country } }),
    };
  };

  /** An external account as Grid returns it: everything sent, with the rails it can be paid over. */
  const externalAccount = (id: string, name: string, bank: LinkedBank) => {
    const { region, ...fields } = bank.values;
    const accountInfo = {
      accountType: bank.country.accountType,
      ...fields,
      ...(region && { region }),
      ...('bankName' in fields && { bankName: bank.bankName }),
      beneficiary: beneficiary(name, bank),
    };
    return {
      reqBody: { customerId: CUSTOMER, currency: bank.currency, accountInfo },
      resBody: { id, customerId: CUSTOMER, currency: bank.currency, status: 'ACTIVE', accountInfo: { ...accountInfo, paymentRails: [paymentRail(bank.country.rail)] } },
    };
  };

  /* Funding from a linked bank, as the Global Accounts playground does it: the bank becomes the customer's
     external account. A US bank is pulled from over ACH; anywhere else, a real-time funded quote issues the
     account the person pushes the money to from their bank. */
  const bankLink = (): CallStep[] => {
    const bank = chosenBank();
    linkedBank = nextId('ExternalAccount');
    const account = externalAccount(linkedBank, bank.holder, bank);
    return [
      {
        tool: { name: 'link_bank', args: { source: 'customer_consent' }, result: { external_account_id: linkedBank, bank: bank.bankName, country: bank.country.code.toUpperCase(), last4: bank.last4 } },
        calls: [
          {
            method: 'POST',
            path: '/customers/external-accounts',
            title: `Link bank · ${bank.country.name}`,
            reqBody: account.reqBody,
            status: '201 Created',
            note: `The person links their own bank in ${bank.country.name}. The agent only needs the account id.`,
            resBody: account.resBody,
          },
        ],
      },
    ];
  };

  const fundBank = (amount: number): CallStep[] => {
    const bank = chosenBank();
    const from = linkedBank ?? nextId('ExternalAccount');
    linkedBank = from;
    balance += amount;
    const label = `${bank.bankName} •••• ${bank.last4}`;
    const transactionId = nextId('Transaction');
    const source = { sourceType: 'ACCOUNT', accountId: from };
    const q = intoWallet({ source, sending: USD, sendingAmount: amount, amount, status: 'PROCESSING', transactionId });
    const txn = incomingTxn({
      id: transactionId,
      amount,
      direction: 'DEBIT',
      quoteId: q.id,
      source: {
        sourceType: 'ACCOUNT',
        accountId: from,
        currency: 'USD',
        railDetails: {
          paymentRail: 'ACH',
          status: 'SETTLED',
          bankAccount: { accountHolderName: bank.holder, routingNumber: '021000021', accountNumber: `****${bank.last4}` },
          traceNumber: `0210000${hex(8).replace(/\D/g, '1')}`,
          settledAt: nowIso(),
        },
      },
    });
    record('Added funds', `${label} · ACH`, amount, txn);
    return [
      {
        tool: { name: 'add_funds', args: { source: 'linked_bank', amount_usd: dollars(amount) }, result: { status: 'PROCESSING', amount: money(amount) } },
        calls: [
          {
            method: 'POST',
            path: '/quotes',
            title: 'Pull from linked bank',
            headers: { 'Idempotency-Key': idempotencyKey() },
            reqBody: {
              source,
              destination: { destinationType: 'ACCOUNT', accountId: WALLET },
              lockedCurrencySide: 'SENDING',
              lockedCurrencyAmount: amount,
              immediatelyExecute: true,
            },
            status: '200 OK',
            note: `An ACH pull from ${label}. It settles in 1–3 business days; the webhook below is what arrives when it does.`,
            resBody: q,
          },
          incomingWebhook(txn, 'Pull landed', `INCOMING_PAYMENT.COMPLETED: ${money(amount)} pulled from ${label}. An ACH pull is an incoming transaction with a DEBIT direction.`),
        ],
      },
    ];
  };

  const fundInstructions = (amount: number): CallStep[] => {
    const bank = chosenBank();
    const d = depositDetails(bank, amount);
    const transactionId = nextId('Transaction');
    const label = `${bank.bankName} •••• ${bank.last4}`;
    const sending = formatMoney(d.amount, d.currency);
    const local = d.currency !== 'USD';
    const source = { sourceType: 'REALTIME_FUNDING', customerId: CUSTOMER, currency: d.currency };
    const q = intoWallet({
      source,
      sending: fiat(d.currency),
      sendingAmount: d.amount,
      amount,
      status: 'PENDING',
      transactionId,
      expiresIn: 30 * 60_000,
      paymentInstructions: [{ accountOrWalletInfo: d.info, instructionsNotes: `Include reference ${d.reference} with the transfer.`, isPlatformAccount: false }],
    });
    wire = { quoteId: q.id, transactionId, currency: d.currency, local: d.amount, amount, label, rail: d.rail };
    return [
      {
        tool: {
          name: 'add_funds',
          args: { source: 'linked_bank', amount_usd: dollars(amount) },
          result: { status: 'WAITING_FOR_TRANSFER', send: sending, rail: d.rail, reference: d.reference },
        },
        calls: [
          {
            method: 'POST',
            path: '/quotes',
            title: 'Fund by bank transfer',
            reqBody: {
              source,
              destination: { destinationType: 'ACCOUNT', accountId: WALLET },
              lockedCurrencySide: 'RECEIVING',
              lockedCurrencyAmount: amount,
            },
            status: '200 OK',
            note: `Grid can't pull from ${label}, so the quote issues ${local ? `${bank.country.rail} details in ${d.currency}` : 'wire details in USD'} for the person to send ${sending} to. It converts into the wallet on arrival.`,
            resBody: q,
          },
        ],
      },
    ];
  };

  const wireReceived = (): CallStep[] => {
    const w = wire!;
    wire = null;
    balance += w.amount;
    const source = { sourceType: 'REALTIME_FUNDING', currency: w.currency, paymentRail: paymentRail(w.rail) };
    const txn = incomingTxn({ id: w.transactionId, amount: w.amount, source, quoteId: w.quoteId });
    record('Added funds', `${w.label} · ${w.rail}`, w.amount, txn);
    return [
      {
        tool: { name: 'get_transfer_status', args: { quote_id: w.quoteId }, result: { status: 'COMPLETED', received: money(w.amount) } },
        calls: [
          {
            method: 'POST',
            path: '/sandbox/send',
            title: 'Simulate the transfer',
            reqBody: { quoteId: w.quoteId, currencyCode: w.currency, currencyAmount: w.local },
            status: '200 OK',
            note: `Sandbox stands in for the person sending ${formatMoney(w.local, w.currency)} from their bank.`,
            resBody: { ...txn, status: 'PROCESSING', settledAt: undefined },
          },
          incomingWebhook(txn, 'Transfer landed', `INCOMING_PAYMENT.COMPLETED: ${money(w.amount)} from ${w.label}.`),
        ],
      },
    ];
  };

  const getpaidAddress = (network: DepositNetwork, currency: string): CallStep[] => {
    const d = depositCall(network, currency, null, 'An address on the chain for the payer. It doesn’t expire; the first payment it receives within 24 hours converts into the wallet.');
    receive = { quoteId: d.quoteId, network, currency, address: d.target };
    return [
      {
        tool: { name: 'get_receive_address', args: { asset: currency, network }, result: { address: d.target } },
        calls: [d.call],
      },
    ];
  };

  const getpaidReceived = (from: string, amount: number): CallStep[] => {
    const r = receive ?? { quoteId: nextId('Quote'), network: 'BASE' as DepositNetwork, currency: 'USDC', address: '' };
    receive = null;
    balance += amount;
    const txn = incomingTxn({ amount, source: depositSource(r.network, r.currency), quoteId: r.quoteId, description: `From ${from}` });
    record(from, `Paid you · ${r.currency}`, amount, txn);
    return [
      {
        tool: null,
        calls: [incomingWebhook(txn, 'Payment received', `INCOMING_PAYMENT.COMPLETED: ${from} paid ${money(amount)}.`)],
      },
    ];
  };

  const limitsUpdate = (next: Limits): CallStep[] => {
    limits = { ...next };
    return [
      {
        tool: null,
        calls: [
          {
            method: 'PATCH',
            path: `/agents/${agent}/policy`,
            title: 'Update agent policy',
            reqBody: {
              spendingLimits: { perTransactionLimit: next.perTransaction, dailyLimit: next.daily },
              approvalThresholds: { currency: 'USD', amount: next.approvalAbove },
            },
            status: '200 OK',
            note: `The person changed it in your app; your backend updates the policy. The agent can't. It now acts alone up to ${money(next.approvalAbove)}.`,
            resBody: agentResource(),
          },
        ],
      },
    ];
  };

  /* Someone new to pay: the person adds their bank in the app, and it becomes one of the customer's external
     accounts with that person as the beneficiary. The agent pays it by id. */
  const recipientAdd = (name: string, bank: LinkedBank): CallStep[] => {
    const id = payeeAccount(name);
    const account = externalAccount(id, name, bank);
    return [
      {
        tool: { name: 'add_recipient', args: { name, country: bank.country.code.toUpperCase() }, result: { external_account_id: id, bank: bank.bankName, last4: bank.last4 } },
        calls: [
          {
            method: 'POST',
            path: '/customers/external-accounts',
            title: `Add recipient · ${name}`,
            reqBody: account.reqBody,
            status: '201 Created',
            note: `The person added ${name}'s bank in ${bank.country.name} in your app. The agent only needs the account id to pay it.`,
            resBody: account.resBody,
          },
        ],
      },
    ];
  };

  /* Paying a saved bank account: a one-row payout run from the wallet. The preview says what leaves the wallet, the fee,
     and what should arrive; fees come out of what lands, so the amount received is an estimate. */
  const runRow = (r: Run) => ({ clientRowId: 'row-1', amount: r.payee.usd, destination: { destinationType: 'EXTERNAL_ACCOUNT', externalAccountId: r.accountId } });

  const payoutPreview = (p: Payee, previewTool: string, sendTool: string, title: string, accountId: string): CallStep[] => {
    const local = money(p.amount, fiat(p.currency).symbol);
    const fee = Math.max(12, Math.round(p.usd * 0.003));
    const r: Run = { payee: p, accountId, fee, title, detail: `${p.bank} · ${p.rail.replace('_', ' ')}`, done: `About ${local} landed at ${p.bank}.`, previewTool, sendTool };
    run = r;
    const held = needsApproval(p.usd);
    return [
      {
        tool: { name: previewTool, args: { to: p.name, amount: p.amount / 100, currency: p.currency }, result: { sends: money(p.usd), arrives_about: local, fee: money(fee), needs_approval: held } },
        calls: [
          {
            method: 'POST',
            path: '/agents/me/payout-runs/preview',
            auth: 'agent',
            title: 'Preview payout',
            reqBody: { sourceAccountId: WALLET, rows: [runRow(r)] },
            status: '200 OK',
            note: `${money(p.usd)} leaves the wallet; about ${local} reaches ${p.name} at ${p.bank}, after the fee. Nothing is created yet.`,
            resBody: {
              sourceAccountId: WALLET,
              total: { amount: p.usd, currency: USDB },
              estimatedFees: { amount: fee, currency: USDB },
              walletBalanceAfter: { amount: balance - p.usd, currency: USDB },
              rows: [
                {
                  clientRowId: 'row-1',
                  amount: { amount: p.usd, currency: USDB },
                  estimatedFee: { amount: fee, currency: USDB },
                  estimatedReceiveAmount: { amount: p.amount, currency: fiat(p.currency) },
                  feeSetAtClaim: false,
                },
              ],
              approval: { required: held, reasons: held ? ['LIMIT'] : [] },
            },
          },
        ],
      },
    ];
  };

  /** What the run's one row records once it's paid: an outgoing transaction with its rail. */
  const runTxn = (r: Run) => ({
    id: nextId('Transaction'),
    type: 'OUTGOING',
    status: 'COMPLETED',
    direction: 'DEBIT',
    customerId: CUSTOMER,
    platformCustomerId: PLATFORM_CUSTOMER,
    agentId: agent,
    source: { sourceType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
    destination: { destinationType: 'ACCOUNT', accountId: r.accountId, currency: r.payee.currency },
    paymentRail: paymentRail(r.payee.rail),
    sentAmount: { amount: r.payee.usd, currency: USDB },
    receivedAmount: { amount: r.payee.amount, currency: fiat(r.payee.currency) },
    exchangeRate: Number((r.payee.amount / (r.payee.usd - r.fee)).toFixed(4)),
    fees: r.fee,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    settledAt: nowIso(),
  });

  const runBody = (r: Run, id: string, action: string, status: string) => ({
    id,
    status,
    source: { accountId: WALLET },
    allOrNothing: false,
    rowCounts: { total: 1, pending: status === 'PENDING_APPROVAL' ? 1 : 0, pendingClaim: 0, processing: status === 'PROCESSING' ? 1 : 0, completed: status === 'COMPLETED' ? 1 : 0, failed: 0, skipped: 0 },
    agentId: agent,
    agentActionId: action,
    total: { amount: r.payee.usd, currency: USDB },
    rowCount: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...(status === 'COMPLETED' && { finishedAt: nowIso() }),
  });

  /** The run as its webhook carries it: the payout run itself, without what only the agent's view adds. */
  const runCore = ({ agentId: _a, agentActionId: _b, total: _c, rowCount: _d, ...core }: ReturnType<typeof runBody>) => core;

  /** The row paid and the run finished: the row's own payment webhook, then the run's. */
  const runPaid = (r: Run, id: string, action: string): ApiCall[] => {
    spend(r.payee.usd);
    const txn = runTxn(r);
    record(r.title, r.detail, -r.payee.usd, txn);
    return [
      webhook('outgoing-payment', 'OUTGOING_PAYMENT.COMPLETED', txn, 'Payment completed', `OUTGOING_PAYMENT.COMPLETED: ${r.done}`),
      webhook('payout-run', 'PAYOUT_RUN.COMPLETED', runCore(runBody(r, id, action, 'COMPLETED')), 'Payout run completed', 'PAYOUT_RUN.COMPLETED: no row is left to pay.'),
    ];
  };

  const actionRun = (r: Run, id: string, status: string) => ({ id, status, sourceAccountId: WALLET, total: { amount: r.payee.usd, currency: USDB }, rowCount: 1, rows: [runRow(r)] });

  const payoutCreate = (): CallStep[] => {
    if (!run) return [];
    const r = run;
    run = null;
    const id = nextId('PayoutRun');
    const action = nextId('AgentAction');
    const reqBody = { sourceAccountId: WALLET, rows: [runRow(r)] };
    const headers = { 'Idempotency-Key': idempotencyKey() };
    if (needsApproval(r.payee.usd)) {
      pending = { kind: 'run', action, run: r, id };
      const held = actionBody(action, 'PENDING_APPROVAL', { type: 'PAYOUT_RUN', payoutRun: actionRun(r, id, 'PENDING_APPROVAL') }, 24 * 60 * 60_000);
      return [
        {
          tool: { name: r.sendTool, args: { to: r.payee.name, amount_usd: dollars(r.payee.usd) }, result: { status: 'PENDING_APPROVAL', action_id: action } },
          calls: [
            {
              method: 'POST',
              path: '/agents/me/payout-runs',
              auth: 'agent',
              title: 'Create payout run',
              headers,
              reqBody,
              status: '201 Created',
              note: `${money(r.payee.usd)} is over the ${money(limits.approvalAbove)} approval threshold, so the run waits as PENDING_APPROVAL. It expires in 24 hours.`,
              resBody: runBody(r, id, action, 'PENDING_APPROVAL'),
            },
            webhook('agent-action', 'AGENT_ACTION.PENDING_APPROVAL', held, 'Agent action pending', 'AGENT_ACTION.PENDING_APPROVAL: the payload lists who is paid and how much, for your approval sheet.'),
          ],
        },
      ];
    }
    return [
      {
        tool: { name: r.sendTool, args: { to: r.payee.name, amount_usd: dollars(r.payee.usd) }, result: { status: 'PROCESSING', payout_run_id: id } },
        calls: [
          {
            method: 'POST',
            path: '/agents/me/payout-runs',
            auth: 'agent',
            title: 'Create payout run',
            headers,
            reqBody,
            status: '201 Created',
            note: `Under the ${money(limits.approvalAbove)} approval threshold, so the run starts at once with an APPROVED PAYOUT_RUN action. Grid signs the row with the agent's delegated key.`,
            resBody: runBody(r, id, action, 'PROCESSING'),
          },
          ...runPaid(r, id, action),
        ],
      },
    ];
  };

  /** A send to an address on another chain, a Lightning invoice, or a saved Spark address, locked on what arrives. */
  const cryptoQuote = (p: CryptoPayee): CallStep[] => {
    const id = nextId('Quote');
    const currency = SEND_CURRENCY[p.asset];
    const receiving = p.asset === 'BTC' ? p.usd * SATS_PER_CENT : p.asset === 'USDB' ? p.usd : p.usd * 10_000;
    const units = receiving / 10 ** currency.decimals;
    const account = nextId('ExternalAccount');
    const spark = p.network === 'SPARK';
    const chain = { destinationType: 'CHAIN_ADDRESS', network: p.network, currency: p.asset, address: p.address };
    const invoice = { destinationType: 'LIGHTNING_INVOICE', invoice: p.address };
    const asked = p.network === 'LIGHTNING' ? invoice : spark ? { destinationType: 'ACCOUNT', accountId: account } : chain;
    const reqBody = { source: { sourceType: 'ACCOUNT', accountId: WALLET }, destination: asked, lockedCurrencySide: 'RECEIVING', lockedCurrencyAmount: receiving };
    const total = p.usd + p.fee;
    const body = {
      id,
      status: 'PENDING',
      createdAt: nowIso(),
      expiresAt: toIso(Date.now() + 5 * 60_000),
      source: reqBody.source,
      destination: { destinationType: 'ACCOUNT', accountId: account },
      sendingCurrency: USDB,
      receivingCurrency: currency,
      totalSendingAmount: total,
      totalReceivingAmount: receiving,
      exchangeRate: Number((units / (p.usd / 100)).toPrecision(6)),
      feesIncluded: p.fee,
      platformFeesIncluded: 0,
      minimumReceivingAmount: p.network === 'LIGHTNING' || spark ? null : receiving,
      ...(p.network === 'LIGHTNING' ? { destinationLightningInvoice: invoice } : spark ? { destinationSparkAddress: p.address } : { destinationChainAddress: chain }),
      transactionId: nextId('Transaction'),
    };
    const sends = sendsLabel(p.asset, p.usd);
    const where = p.network === 'LIGHTNING' ? 'Lightning invoice' : `${p.asset} on ${p.network.charAt(0)}${p.network.slice(1).toLowerCase()}`;
    const onChain = p.network !== 'LIGHTNING' && !spark;
    quote = {
      id,
      body,
      usd: total,
      title: `To ${shortAddress(p.address)}`,
      detail: where,
      done: p.network === 'LIGHTNING' ? `The invoice is paid: ${sends}.` : `${sends} arrived at ${shortAddress(p.address)}.`,
      toolName: 'quote_stablecoin_send',
      txnDestination: {
        destinationType: 'ACCOUNT',
        accountId: account,
        currency: p.asset,
        ...(onChain && { railDetails: { paymentRail: 'ONCHAIN', transactionHash: txHash(p.network), network: p.network } }),
      },
    };
    const saveSpark: ApiCall[] = spark
      ? [
          {
            method: 'POST',
            path: '/agents/me/external-accounts',
            auth: 'agent',
            title: 'Save Spark address',
            reqBody: { currency: 'USDB', accountInfo: { accountType: 'SPARK_WALLET', address: p.address } },
            status: '201 Created',
            note: 'A Spark address is paid as one of the customer’s saved accounts, so the agent saves it first.',
            resBody: { id: account, customerId: CUSTOMER, currency: 'USDB', status: 'ACTIVE', accountInfo: { accountType: 'SPARK_WALLET', address: p.address } },
          },
        ]
      : [];
    return [
      {
        tool: {
          name: 'quote_stablecoin_send',
          args: { to: p.address, network: p.network, asset: p.asset, amount: dollars(p.usd) },
          result: { quote_id: id, receives: sends, fee: money(p.fee), expires_in: '5 minutes' },
        },
        calls: [
          ...saveSpark,
          {
            method: 'POST',
            path: '/agents/me/quotes',
            auth: 'agent',
            title: 'Create quote',
            headers: { 'Idempotency-Key': idempotencyKey() },
            reqBody,
            status: '201 Created',
            note:
              p.network === 'LIGHTNING'
                ? `Pays the invoice's exact amount from the wallet; the ${money(p.fee)} fee is added to what's debited.`
                : spark
                  ? `USDB to the saved Spark address, account to account.`
                  : `Grid records the address as an external account, screens it, and pays the chain itself at a locked rate: exactly ${sends} arrives, and the ${money(p.fee)} network fee is added to the USDB sent.`,
            resBody: body,
          },
        ],
      },
    ];
  };

  const agentQuote = (to: MerchantAgent): CallStep[] => {
    const step = quoteStep(
      'quote_send',
      { to: `${to.name} (agent)`, amount: to.amount / 100, currency: 'USD' },
      { destinationType: 'ACCOUNT', accountId: MERCHANT_WALLET },
      { currency: USDB, amount: to.amount },
      to.amount,
      0,
      {
        title: to.name,
        detail: to.description,
        done: `${money(to.amount)} settled in ${to.name}'s account. Final, no chargeback window.`,
        note: `${money(to.amount)} straight to ${to.name}'s Embedded Wallet: account to account on the same network, no card in between, no fee.`,
      },
    );
    const q = quote!;
    q.incoming = () =>
      webhook(
        'incoming-payment',
        'INCOMING_PAYMENT.COMPLETED',
        {
          id: nextId('Transaction'),
          type: 'INCOMING',
          status: 'COMPLETED',
          direction: 'CREDIT',
          customerId: MERCHANT_CUSTOMER,
          platformCustomerId: 'merchant_demo_014',
          source: { sourceType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
          destination: { destinationType: 'ACCOUNT', accountId: MERCHANT_WALLET, currency: 'USDB' },
          receivedAmount: { amount: to.amount, currency: USDB },
          quoteId: q.id,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          settledAt: nowIso(),
        },
        'Merchant agent paid',
        `INCOMING_PAYMENT.COMPLETED on ${to.name}'s side: the same ${money(to.amount)}, already spendable.`,
      );
    return [step];
  };

  /* Paying with the person's own card: the agent asks to use it at the merchant for an amount, and the person approves
     each use. Grid moves no money: the merchant charges the card. */
  const cardUseRequest = (p: Purchase): CallStep[] => {
    const action = nextId('AgentAction');
    const merchant = host(p.merchant);
    const path = `/agents/me/stored-cards/${storedCard}/reveal`;
    const reqBody = { merchant, amount: p.amount, currency: 'USD', purpose: p.description };
    const toolArgs = { merchant: p.merchant, amount: dollars(p.amount), purpose: p.description };
    use = { action, purchase: p };
    const held = actionBody(action, 'PENDING_APPROVAL', { type: 'USE_STORED_CARD', storedCardUse: storedCardUse(p) });
    const ask: ApiCall = {
      method: 'POST',
      path,
      auth: 'agent',
      title: 'Ask to use saved card',
      reqBody,
      status: '202 Accepted',
      note: `The agent names the merchant, the amount and what it's for. The person approves each use of their card, so Grid holds it.`,
      resBody: held,
    };
    const pendingHook = webhook('agent-action', 'AGENT_ACTION.PENDING_APPROVAL', held, 'Agent action pending', 'AGENT_ACTION.PENDING_APPROVAL: show which card, where and for how much.');
    if (p.approved) {
      // The person already said yes in the app (raising the limit for this purchase, a price watch): the platform
      // approves the use as soon as Grid holds it, without asking again.
      const approved = actionBody(action, 'APPROVED', { type: 'USE_STORED_CARD', storedCardUse: storedCardUse(p) });
      return [
        { tool: { name: 'use_saved_card', args: toolArgs, result: { status: 'PENDING_APPROVAL', action_id: action } }, calls: [ask, pendingHook] },
        {
          tool: null,
          calls: [
            {
              method: 'POST',
              path: `/agents/${agent}/actions/${action}/approve`,
              title: 'Approve agent action',
              reqBody: { autoApproveMerchant: false },
              status: '200 OK',
              note: 'The person already approved this purchase in your app, so your backend approves the card use right away instead of asking again.',
              resBody: approved,
            },
            webhook('agent-action', 'AGENT_ACTION.APPROVED', approved, 'Agent action approved', 'AGENT_ACTION.APPROVED: the agent can collect the card link now.'),
          ],
        },
      ];
    }
    pending = { kind: 'use', action, purchase: p };
    return [{ tool: { name: 'use_saved_card', args: toolArgs, result: { status: 'PENDING_APPROVAL', action_id: action } }, calls: [ask, pendingHook] }];
  };

  /** The single-use link to the card's details, decrypted by Evervault's Relay on the way. */
  const revealBody = (action: string) => ({
    detailsUrl: `https://relay.evervault.com/grid/2025-10-13/stored-card-reveals/${base64url(32)}`,
    expiresAt: toIso(Date.now() + 5 * 60_000),
    actionId: action,
    cvcIncluded: false,
    card: { id: storedCard, ...CARD_DISPLAY },
    holderName: CARD_HOLDER,
    billingAddress: BILLING,
  });

  const buyRequest = (p: Purchase): CallStep[] => {
    if (p.byCard && storedCard) return cardUseRequest(p);
    const reqBody = {
      kind: 'PURCHASE',
      fundingSource: WALLET,
      amount: p.amount,
      description: p.description,
      ...(p.recurring ? { recurring: true } : {}),
    };
    const headers = { 'Idempotency-Key': idempotencyKey() };
    const toolArgs = { merchant: p.merchant, amount: dollars(p.amount), description: p.description, ...(p.recurring ? { recurring: true } : {}) };
    // A recurring card always needs the person's approval, whatever the policy says.
    if (p.recurring || needsApproval(purchaseSpendLimit(p.amount, p.recurring))) {
      const action = nextId('AgentAction');
      const held = actionBody(action, 'PENDING_APPROVAL', { type: 'ISSUE_PURCHASE_CARD', purchaseCard: purchaseDetails(p) });
      pending = { kind: 'card', action, purchase: p };
      return [
        {
          tool: { name: 'request_purchase_card', args: toolArgs, result: { status: 'PENDING_APPROVAL', action_id: action } },
          calls: [
            {
              method: 'POST',
              path: '/agents/me/cards',
              auth: 'agent',
              title: 'Request purchase card',
              headers,
              reqBody,
              status: '202 Accepted',
              note: p.recurring
                ? `A recurring card for ${p.merchant}, up to ${money(p.amount)} a month. Recurring cards always wait for the person.`
                : `A single-use card for ${money(p.amount)} at ${p.merchant}. Its limit is over the approval threshold, so Grid holds it for the person.`,
              resBody: held,
            },
            webhook('agent-action', 'AGENT_ACTION.PENDING_APPROVAL', held, 'Agent action pending', 'AGENT_ACTION.PENDING_APPROVAL: the payload has the amount, limit and description to show in your approval sheet.'),
          ],
        },
      ];
    }
    const issued = agentCard(p);
    return [
      {
        tool: { name: 'request_purchase_card', args: toolArgs, result: { status: 'ISSUED', card_id: issued.card.id } },
        calls: [
          {
            method: 'POST',
            path: '/agents/me/cards',
            auth: 'agent',
            title: 'Request purchase card',
            headers,
            reqBody,
            status: '201 Created',
            note: `Under the approval threshold, so the card is issued at once, paid from the wallet and good for one charge at ${p.merchant}.`,
            resBody: issued,
          },
        ],
      },
    ];
  };

  /** The agent collects the link for an approved use of the person's card and checks out with it. */
  const cardUseCheckout = (): CallStep[] => {
    if (!use) return [];
    const u = use;
    use = null;
    spend(u.purchase.amount, false);
    record(u.purchase.merchant, 'Visa •••• 4242', -u.purchase.amount);
    return [
      {
        tool: { name: 'get_card_details', args: { action_id: u.action }, result: { card: 'Visa •••• 4242', details: 'read once from the link' } },
        calls: [
          {
            method: 'POST',
            path: `/agents/me/stored-cards/${storedCard}/reveal`,
            auth: 'agent',
            title: 'Collect card link',
            reqBody: { actionId: u.action },
            status: '200 OK',
            note: `The agent opens the link once, at checkout, and ${u.purchase.merchant} charges the person's own Visa. Grid moves no money, so no payment webhook follows.`,
            resBody: revealBody(u.action),
          },
        ],
      },
    ];
  };

  const buyCheckout = (): CallStep[] => {
    if (use) return cardUseCheckout();
    if (!card) return [];
    const c = card;
    card = null;
    spend(c.purchase.amount);
    const descriptor = c.purchase.merchant.toUpperCase().slice(0, 25);
    const txn = {
      type: 'CARD',
      id: nextId('Transaction'),
      cardId: c.id,
      customerId: CUSTOMER,
      platformCustomerId: PLATFORM_CUSTOMER,
      status: 'AUTHORIZED',
      direction: 'DEBIT',
      description: descriptor,
      merchant: { descriptor, mcc: c.purchase.recurring ? '8299' : '5732', country: 'US' },
      authorizedAmount: { amount: c.purchase.amount, currency: USD },
      accountId: WALLET,
      authorizedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    record(c.purchase.merchant, c.purchase.recurring ? 'Subscription · card' : 'One-time card', -c.purchase.amount, txn);
    const closed = webhook('card-status-change', 'CARD.STATUS_CHANGE', cardObject(c.id, 'CLOSED'), 'Card closed', 'CARD.STATUS_CHANGE: a single-use card closes with its first approved charge.');
    return [
      {
        tool: {
          name: 'get_purchase_card_details',
          args: { card_id: c.id },
          result: { last4: '4821', exp: '11/29', card_details: 'shown in the processor’s frame' },
        },
        calls: [
          {
            method: 'POST',
            path: `/agents/me/cards/${c.id}/reveal`,
            auth: 'agent',
            title: 'Reveal card',
            status: '200 OK',
            note: 'The agent reads the number, expiry and CVV from the processor to check out. The digits never pass through Grid, and every reveal is logged.',
            resBody: { panEmbedUrl: `https://embed.lithic.com/iframe/?t=${base64url(32)}`, expiresAt: toIso(Date.now() + 60_000) },
          },
          webhook(
            'card-transaction',
            'CARD_TRANSACTION.AUTHORIZED',
            txn,
            'Card charged',
            c.purchase.recurring
              ? `CARD_TRANSACTION.AUTHORIZED: ${money(c.purchase.amount)} at ${c.purchase.merchant}. The card now locks to them for next month.`
              : `CARD_TRANSACTION.AUTHORIZED: ${money(c.purchase.amount)} at ${c.purchase.merchant}.`,
          ),
          ...(c.purchase.recurring ? [] : [closed]),
        ],
      },
    ];
  };

  /** What the held action carries, whatever state it's in. */
  const embedOf = (p: Pending, status: string): Record<string, unknown> => {
    switch (p.kind) {
      case 'quote':
        return { type: 'EXECUTE_QUOTE', quote: p.quote.body };
      case 'card':
        return { type: 'ISSUE_PURCHASE_CARD', purchaseCard: purchaseDetails(p.purchase) };
      case 'use':
        return { type: 'USE_STORED_CARD', storedCardUse: storedCardUse(p.purchase) };
      case 'run':
        return { type: 'PAYOUT_RUN', payoutRun: actionRun(p.run, p.id, status) };
      default: {
        const exhaustive: never = p;
        return exhaustive;
      }
    }
  };

  /** The platform rejects the held action: the person said no, or chose another way to pay. */
  const rejectSteps = (p: Pending, reason: string, note: string): CallStep[] => {
    const rejected = actionBody(p.action, 'REJECTED', { ...embedOf(p, 'CANCELLED'), rejectionReason: reason });
    return [
      {
        tool: null,
        calls: [
          {
            method: 'POST',
            path: `/agents/${agent}/actions/${p.action}/reject`,
            title: 'Reject agent action',
            reqBody: { reason },
            status: '200 OK',
            note,
            resBody: rejected,
          },
          webhook('agent-action', 'AGENT_ACTION.REJECTED', rejected, 'Agent action rejected', 'AGENT_ACTION.REJECTED: Grid confirms the rejection to your backend.'),
        ],
      },
      pollStep(p.action, rejected, { status: 'REJECTED' }),
    ];
  };

  const decide = (approve: boolean): CallStep[] => {
    if (!pending) return [];
    const p = pending;
    pending = null;
    if (!approve) {
      if (p.kind === 'quote') quote = null;
      if (p.kind === 'use') use = null;
      return rejectSteps(p, 'Declined by the customer', 'The person said no in your app; your backend rejects the action. Nothing moves.');
    }
    const path = `/agents/${agent}/actions/${p.action}/approve`;
    const approveCall = (body: Record<string, unknown>, note: string, reqBody?: Record<string, unknown>): ApiCall => ({
      method: 'POST',
      path,
      title: 'Approve agent action',
      ...(reqBody && { reqBody }),
      status: '200 OK',
      note,
      resBody: body,
    });
    const approvedHook = (body: Record<string, unknown>, note: string) => webhook('agent-action', 'AGENT_ACTION.APPROVED', body, 'Agent action approved', note);
    switch (p.kind) {
      case 'card': {
        const issued = agentCard(p.purchase);
        const approved = actionBody(p.action, 'APPROVED', { type: 'ISSUE_PURCHASE_CARD', purchaseCard: issued.purchase, cardId: issued.card.id });
        return [
          { tool: null, calls: [approveCall(approved, 'The person allowed it in your app; your backend approves. Grid issues the card.'), approvedHook(approved, 'AGENT_ACTION.APPROVED: the card is issued and the agent can use it.')] },
          pollStep(p.action, approved, { status: 'APPROVED', card_id: issued.card.id }),
        ];
      }
      case 'use': {
        const approved = actionBody(p.action, 'APPROVED', { type: 'USE_STORED_CARD', storedCardUse: storedCardUse(p.purchase) });
        return [
          {
            tool: null,
            calls: [
              approveCall(approved, 'The person allowed this use of their card in your app; your backend approves.', { autoApproveMerchant: false }),
              approvedHook(approved, 'AGENT_ACTION.APPROVED: the agent can collect the card link now.'),
            ],
          },
          pollStep(p.action, approved, { status: 'APPROVED' }),
        ];
      }
      case 'run': {
        const approved = actionBody(p.action, 'APPROVED', { type: 'PAYOUT_RUN', payoutRun: actionRun(p.run, p.id, 'PROCESSING') });
        return [
          {
            tool: null,
            calls: [
              approveCall(approved, 'The person allowed it in your app; your backend approves. The run starts paying.'),
              approvedHook(approved, 'AGENT_ACTION.APPROVED: the payout run is paying its row.'),
              ...runPaid(p.run, p.id, p.action),
            ],
          },
          pollStep(p.action, approved, { status: 'APPROVED' }),
        ];
      }
      case 'quote': {
        const q = p.quote;
        spend(q.usd);
        quote = null;
        const approved = actionBody(p.action, 'APPROVED', { type: 'EXECUTE_QUOTE', quote: { ...q.body, status: 'PROCESSING' }, transaction: outgoingTxn(q, 'PROCESSING') });
        return [
          {
            tool: null,
            calls: [
              approveCall(approved, 'The person allowed it in your app; your backend approves. Grid executes the quote.'),
              approvedHook(approved, 'AGENT_ACTION.APPROVED: the transaction is attached.'),
              ...settledCalls(q),
            ],
          },
          pollStep(p.action, approved, { status: 'APPROVED' }),
        ];
      }
      default: {
        const exhaustive: never = p;
        return exhaustive;
      }
    }
  };

  /** The person picked another way to pay before approving: the platform rejects the held request, or the agent freezes
   *  the card it was already given. */
  const withdraw = (): CallStep[] => {
    if (pending && (pending.kind === 'card' || pending.kind === 'use')) {
      const p = pending;
      pending = null;
      use = null;
      return rejectSteps(p, 'Paid another way', 'The person chose another way to pay; your backend rejects the request so it doesn’t sit pending.');
    }
    if (use) {
      use = null;
      return [];
    }
    if (!card) return [];
    const frozen = agentCard(card.purchase, 'FROZEN');
    card = null;
    return [
      {
        tool: null,
        calls: [
          {
            method: 'PATCH',
            path: `/agents/me/cards/${frozen.card.id}`,
            auth: 'agent',
            title: 'Freeze card',
            reqBody: { status: 'FROZEN' },
            status: '200 OK',
            note: 'The person chose another way to pay, so the agent freezes the card it was given. It can’t unfreeze it.',
            resBody: frozen,
          },
        ],
      },
    ];
  };

  const overview = (): CallStep[] => [
    {
      tool: {
        name: 'get_account_overview',
        args: {},
        result: {
          balance: money(balance),
          left_today: money(limits.daily - spentToday),
          approval_above: money(limits.approvalAbove),
        },
      },
      calls: [
        { method: 'GET', path: '/agents/me', auth: 'agent', title: 'Get agent', status: '200 OK', note: 'The agent reads its own policy and what it has used today.', resBody: agentResource() },
        {
          method: 'GET',
          path: '/agents/me/internal-accounts',
          auth: 'agent',
          title: 'List internal accounts',
          status: '200 OK',
          note: 'The wallet the agent spends from, and its balance: the only account its policy allows.',
          resBody: {
            data: [
              {
                id: WALLET,
                customerId: CUSTOMER,
                type: 'EMBEDDED_WALLET',
                status: 'ACTIVE',
                balance: { amount: balance, currency: USDB },
                totalBalance: { amount: balance, currency: USDB },
                fundingPaymentInstructions: [],
                createdAt,
                updatedAt: nowIso(),
              },
            ],
            hasMore: false,
          },
        },
      ],
    },
  ];

  const transactions = (): CallStep[] => {
    const rows = ledger.filter((l) => l.txn).slice(0, 10);
    return [
      {
        tool: { name: 'list_transactions', args: { limit: 10 }, result: { count: rows.length } },
        calls: [
          {
            method: 'GET',
            path: '/agents/me/transactions?limit=10',
            auth: 'agent',
            title: 'List transactions',
            status: '200 OK',
            note: 'Scoped to the agent’s customer; no customer filter needed. Purchases on the person’s own card aren’t here: the merchant charged the card, not the wallet.',
            resBody: { data: rows.map((l) => l.txn), hasMore: ledger.filter((l) => l.txn).length > 10 },
          },
        ],
      },
    ];
  };

  return {
    needsApproval,
    assumeConnected: () => {
      connected = true;
      balanceOn = true;
      keyed = true;
    },
    assumeFunded: (cents) => {
      balance += cents;
      const txn = incomingTxn({ amount: cents, source: { sourceType: 'REALTIME_FUNDING', currency: 'USD', paymentRail: 'ACH' }, description: 'Bank transfer' });
      record('Added funds', 'Bank transfer', cents, txn);
    },
    snapshot: () => ({ connected, balanceOn, cardVaulted: storedCard !== null, bankLinked: linkedBank !== null, balanceCents: balance, limits: { ...limits }, spentTodayCents: spentToday, ledger: ledger.slice() }),
    stepsFor(event) {
      switch (event.type) {
        case 'connect':
          return connect(event.lite, event.limits);
        case 'fund.deposit':
          return fundDeposit(event.network, event.currency, event.amount);
        case 'fund.received':
          return fundReceived();
        case 'card.vault':
          return cardVault();
        case 'fund.card':
          return fundCard(event.amount);
        case 'bank.link':
          return bankLink();
        case 'fund.bank':
          return fundBank(event.amount);
        case 'fund.instructions':
          return fundInstructions(event.amount);
        case 'getpaid.address':
          return getpaidAddress(event.network, event.currency);
        case 'getpaid.received':
          return getpaidReceived(event.from, event.amount);
        case 'limits.update':
          return limitsUpdate(event.limits);
        case 'recipient.add':
          return recipientAdd(event.name, event.bank);
        case 'pay.quote':
          return payoutPreview(event.payee, 'preview_payout', 'send_payout', event.payee.name, payeeAccount(event.payee.name));
        case 'cashout.quote':
          return payoutPreview(event.payee, 'preview_withdrawal', 'withdraw', `To ${event.payee.name}`, linkedBank ?? payeeAccount(event.payee.name));
        case 'crypto.quote':
          return cryptoQuote(event.payee);
        case 'pay.execute':
        case 'cashout.execute':
          return payoutCreate();
        case 'crypto.execute':
        case 'agent.execute':
          return executeSteps();
        case 'buy.request':
          return buyRequest(event.purchase);
        case 'buy.withdraw':
          return withdraw();
        case 'buy.checkout':
          return buyCheckout();
        case 'agent.quote':
          return agentQuote(event.to);
        case 'action.approve':
          return decide(true);
        case 'action.reject':
          return decide(false);
        case 'account.overview':
          return overview();
        case 'transactions.list':
          return transactions();
        default: {
          const exhaustive: never = event;
          return exhaustive;
        }
      }
    },
  };
}
