/* ============================================================
   Agent Accounts API calls shown in the panel.

   Provisional: this file follows today's agent spec on main
   (openapi/paths/agents/*, openapi/components/schemas/agents/*,
   openapi/webhooks/agent-action.yaml) and will be rewritten when the
   new Agent Accounts docs land. Every tool call, path, body and webhook
   the playground shows lives here, built from the conversation's
   events (data/agentEvents.ts); nothing else names an endpoint.

   Each event becomes one or more steps. A step is either the agent's
   tool call inside the app (named like Lightspark's MCP tools:
   quote_send, execute_send, create_deposit, ...) with the Grid calls
   the app's backend makes for it, or the platform's own calls with no
   tool (creating the agent, changing its policy, approving an action).

   Ahead of the spec: Pay someone and Withdraw quote to a bank account
   or mobile wallet on a local rail. Today `POST /agents/me/quotes`
   pays embedded wallets, Spark accounts, chain addresses and
   Lightning invoices only.
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
import type { ApiCall } from './flow';

/* ── Fixtures ─────────────────────────────────────────────────────────── */

const CUSTOMER = 'Customer:019e8f47-2a3d-1d02-0000-6b1f0c4e2a91';
const PLATFORM_CUSTOMER = 'customer_demo_001';
/** The customer's Embedded Wallet: the account the agent spends from. */
const WALLET = 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463';
/** The merchant agent's customer wallet, on the same platform. */
const MERCHANT_WALLET = 'InternalAccount:019e8f52-7a0c-4d1e-0000-2b6f8e1c9a35';
const WEBHOOK_ENDPOINT = 'https://your-app.com/webhooks/grid';
const SIGNED = { 'X-Grid-Signature': '<signature>' };

const USD = { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 };
const USDB = { code: 'USDB', name: 'USDB', symbol: '$', decimals: 2 };
const FIAT: Record<string, { code: string; name: string; symbol: string; decimals: number }> = {
  USD,
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimals: 2 },
};

const PERMISSIONS = ['VIEW_TRANSACTIONS', 'CREATE_QUOTES', 'EXECUTE_QUOTES', 'RECEIVE_FUNDS', 'ISSUE_CARDS'];

/** The real default policy: $1,000 a payment, $2,500 a day, approval above $10. */
export const DEFAULT_LIMITS: Limits = {
  perTransaction: 100_000,
  daily: 250_000,
  approvalAbove: 1_000,
};
const MONTHLY_LIMIT = 1_000_000;

/** What the customer's wallet holds before the visitor funds it. */
export const OPENING_BALANCE_CENTS = 125_000;

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
}

export interface AccountSnapshot {
  connected: boolean;
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
  return `${prefix}:019e8f${hex(2)}-${hex(4)}-7${hex(3)}-0000-${seq.toString(16).padStart(4, '0')}${hex(8)}`;
}
function idempotencyKey() {
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${hex(4)}-${hex(12)}`;
}
function base64url(n: number) {
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  return Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
}
function money(cents: number, symbol = '$') {
  return `${symbol}${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fiat(code: string) {
  return FIAT[code] ?? { code, name: code, symbol: '', decimals: 2 };
}
const dollars = (cents: number) => Number((cents / 100).toFixed(2));

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
    approvalThresholds: { currency: 'USD', amount: limits.approvalAbove },
  };
}

function depositTarget(network: DepositNetwork, amount: number) {
  if (network === 'LIGHTNING') return `lnbc${Math.round(amount / 4)}0n1pn${base64url(40).toLowerCase()}`;
  if (network === 'SOLANA') return `7xKX${base64url(36).replace(/[-_]/g, 'q')}`;
  if (network === 'TRON') return `TQ${base64url(32).replace(/[-_]/g, 'r')}`;
  return `0x${hex(40)}`;
}

/** The past few days, so History is never empty. */
function seedLedger(): LedgerEntry[] {
  const day = 86_400_000;
  const now = Date.now();
  return [
    { id: nextId('Transaction'), at: now - 1 * day, title: 'Spotify', detail: 'Subscription · card', cents: -1199, status: 'COMPLETED' },
    { id: nextId('Transaction'), at: now - 2 * day, title: 'Added funds', detail: 'USDC on Base', cents: 100_000, status: 'COMPLETED' },
    { id: nextId('Transaction'), at: now - 3 * day, title: 'Blue Bottle Coffee', detail: 'One-time card', cents: -1850, status: 'COMPLETED' },
    { id: nextId('Transaction'), at: now - 5 * day, title: 'Added funds', detail: 'Lightning', cents: 25_000, status: 'COMPLETED' },
  ];
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
  incoming?: () => ApiCall;
};

type Pending =
  | { kind: 'quote'; action: string; quote: Quote }
  | { kind: 'card'; action: string; purchase: Purchase };

export interface AgentSession {
  /** The steps one conversation event makes, in order. */
  stepsFor(event: AgentEvent): CallStep[];
  /** Whether an amount (USD cents) waits for the person under the current policy. */
  needsApproval(usdCents: number): boolean;
  /** Install the agent without logging anything: a flow that needs it, started first. */
  assumeConnected(): void;
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
  let limits = { ...DEFAULT_LIMITS };
  let balance = OPENING_BALANCE_CENTS;
  let spentToday = 0;
  let countToday = 0;
  const ledger: LedgerEntry[] = seedLedger();
  let quote: Quote | null = null;
  let deposit: { id: string; network: DepositNetwork; currency: string; amount: number } | null = null;
  let receive: { network: DepositNetwork; currency: string; address: string } | null = null;
  let pending: Pending | null = null;
  let card: { id: string; purchase: Purchase } | null = null;

  const needsApproval = (usdCents: number) => usdCents > limits.approvalAbove;

  const record = (title: string, detail: string, cents: number, status: LedgerEntry['status'] = 'COMPLETED') => {
    ledger.unshift({ id: nextId('Transaction'), at: Date.now(), title, detail, cents, status });
  };
  const spend = (usd: number) => {
    balance -= usd;
    spentToday += usd;
    countToday += 1;
  };

  const agentResource = () => ({
    id: agent,
    name: nameOf(),
    customerId: CUSTOMER,
    isPaused: false,
    isConnected: true,
    policy: policyBody(limits),
    usage: {
      dailyTransactionCount: countToday,
      dailySpend: spentToday,
      dailyResetDate: nowIso().slice(0, 10),
      monthlySpend: spentToday,
      monthlyResetMonth: nowIso().slice(0, 7),
    },
    createdAt,
    updatedAt: nowIso(),
  });

  const outgoingTxn = (q: Quote, status: 'PROCESSING' | 'COMPLETED') => ({
    id: q.body.transactionId,
    type: 'OUTGOING',
    status,
    customerId: CUSTOMER,
    platformCustomerId: PLATFORM_CUSTOMER,
    source: { sourceType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
    destination: q.body.destination,
    quoteId: q.id,
    sentAmount: { amount: q.body.totalSendingAmount, currency: USDB },
    receivedAmount: { amount: q.body.totalReceivingAmount, currency: q.body.receivingCurrency },
    exchangeRate: q.body.exchangeRate,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...(status === 'COMPLETED' ? { settledAt: nowIso() } : {}),
  });

  const actionBody = (
    id: string,
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED',
    rest: Record<string, unknown>,
  ): Record<string, unknown> => ({
    id,
    agentId: agent,
    customerId: CUSTOMER,
    platformCustomerId: PLATFORM_CUSTOMER,
    status,
    ...rest,
    expiresAt: toIso(Date.now() + 5 * 60_000),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  /** The webhooks that follow a quote Grid executes. */
  const settledCalls = (q: Quote): ApiCall[] => [
    webhook('outgoing-payment', 'OUTGOING_PAYMENT.COMPLETED', outgoingTxn(q, 'COMPLETED'), 'Payment completed', `OUTGOING_PAYMENT.COMPLETED: ${q.done}`),
    ...(q.incoming ? [q.incoming()] : []),
  ];

  const quoteStep = (
    toolName: string,
    toolArgs: Record<string, unknown>,
    destination: Record<string, unknown>,
    receiving: { code: string; amount: number },
    usd: number,
    labels: { title: string; detail: string; done: string; note: string },
  ): CallStep => {
    const id = nextId('Quote');
    const reqBody = {
      source: { sourceType: 'ACCOUNT', accountId: WALLET },
      destination,
      lockedCurrencySide: 'RECEIVING',
      lockedCurrencyAmount: receiving.amount,
    };
    const fee = Math.max(12, Math.round(usd * 0.003));
    const expiresAt = toIso(Date.now() + 5 * 60_000);
    const body = {
      id,
      status: 'PENDING',
      createdAt: nowIso(),
      expiresAt,
      source: reqBody.source,
      destination,
      sendingCurrency: USDB,
      receivingCurrency: fiat(receiving.code),
      totalSendingAmount: usd + fee,
      totalReceivingAmount: receiving.amount,
      exchangeRate: Number((receiving.amount / usd).toFixed(4)),
      feesIncluded: fee,
      transactionId: nextId('Transaction'),
    };
    quote = { id, body, usd, title: labels.title, detail: labels.detail, done: labels.done, toolName };
    return {
      tool: {
        name: toolName,
        args: toolArgs,
        result: { quote_id: id, amount: money(usd), fee: money(fee), expires_in: '5 minutes' },
      },
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
    const quoteBody = { ...q.body, status: 'PROCESSING' };
    const path = `/agents/me/quotes/${q.id}/execute`;
    const headers = { 'Idempotency-Key': idempotencyKey() };
    if (needsApproval(q.usd)) {
      const held = actionBody(action, 'PENDING_APPROVAL', { type: 'EXECUTE_QUOTE', quote: q.body });
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
    record(q.title, q.detail, -q.usd);
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
            note: `Under the ${money(limits.approvalAbove)} approval threshold, so it executes on the agent's own authority: APPROVED, with the transaction attached.`,
            resBody: actionBody(action, 'APPROVED', { type: 'EXECUTE_QUOTE', quote: quoteBody, transaction: outgoingTxn(q, 'PROCESSING') }),
          },
          ...settledCalls(q),
        ],
      },
    ];
  };

  const purchaseDetails = (p: Purchase) => ({
    amount: p.amount,
    spendLimit: purchaseSpendLimit(p.amount, p.recurring),
    currency: 'USD',
    description: p.description,
    fundingSource: WALLET,
    ...(p.recurring ? { recurring: true } : {}),
  });

  const agentCard = (p: Purchase) => {
    card = { id: card?.id ?? nextId('Card'), purchase: p };
    return {
      card: {
        id: card.id,
        customerId: CUSTOMER,
        status: 'ACTIVE',
        brand: 'VISA',
        form: 'VIRTUAL',
        last4: '4821',
        expMonth: 11,
        expYear: 2029,
        fundingSource: WALLET,
        currency: 'USD',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      agentId: agent,
      agentCardKind: 'PURCHASE',
      effectiveBlockedMccs: ['7995', '6051'],
      purchase: { ...purchaseDetails(p), ...(p.recurring ? {} : { expiresAt: toIso(Date.now() + 30 * 60_000) }) },
    };
  };

  /* ── Events ── */

  const connect = (): CallStep[] => {
    connected = true;
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
            reqBody: { name: nameOf(), customerId: CUSTOMER, policy: policyBody(limits) },
            status: '201 Created',
            note: 'The person approved in your app; your backend creates the agent with its policy. The device code goes to the agent once.',
            resBody: { agent: { ...agentResource(), isConnected: false }, deviceCode },
          },
          {
            method: 'POST',
            path: '/agents/device-codes/redeem',
            auth: 'none',
            title: 'Redeem device code',
            reqBody: { code },
            status: '200 OK',
            note: 'The agent trades the code for its own token. It signs every later call with it.',
            resBody: { agentId: agent, agentName: nameOf(), accessToken: `gat_${hex(40)}`, policy: policyBody(limits) },
          },
        ],
      },
    ];
  };

  const depositCall = (network: DepositNetwork, currency: string, amount: number | null, note: string) => {
    const id = nextId('AgentDeposit');
    const lightning = network === 'LIGHTNING';
    const target = depositTarget(network, amount ?? 0);
    const call: ApiCall = {
      method: 'POST',
      path: '/agents/me/deposits',
      auth: 'agent',
      title: 'Create deposit',
      reqBody: {
        sourceNetwork: network,
        sourceCurrency: currency,
        destinationInternalAccountId: WALLET,
        ...(lightning && amount ? { amount } : {}),
      },
      status: '201 Created',
      note,
      resBody: {
        id,
        status: 'PENDING',
        sourceNetwork: network,
        sourceCurrency: currency,
        destinationInternalAccountId: WALLET,
        destinationCurrency: 'USDB',
        ...(lightning && amount ? { estimatedReceiveAmount: { amount: amount - 20, currency: USDB } } : {}),
        targetType: lightning ? 'LIGHTNING_INVOICE' : 'CHAIN_ADDRESS',
        target,
        ...(lightning
          ? { paymentLinks: { cashApp: `https://cash.app/launch/lightning/${target.slice(0, 24)}` }, expiresAt: toIso(Date.now() + 10 * 60_000) }
          : { expiresAt: null }),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    };
    return { id, target, call };
  };

  const incomingWebhook = (amount: number, currency: string, rail: string, title: string, note: string, depositId?: string) =>
    webhook(
      'incoming-payment',
      'INCOMING_PAYMENT.COMPLETED',
      {
        id: nextId('Transaction'),
        type: 'INCOMING',
        status: 'COMPLETED',
        customerId: CUSTOMER,
        platformCustomerId: PLATFORM_CUSTOMER,
        source: { sourceType: 'REALTIME_FUNDING', currency, paymentRail: rail },
        destination: { destinationType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
        receivedAmount: { amount, currency: USDB },
        ...(depositId ? { depositId } : {}),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        settledAt: nowIso(),
      },
      title,
      note,
    );

  const fundDeposit = (network: DepositNetwork, currency: string, amount: number): CallStep[] => {
    const lightning = network === 'LIGHTNING';
    const d = depositCall(
      network,
      currency,
      amount,
      lightning
        ? 'A Lightning invoice for the exact amount. Fees come out of what lands.'
        : 'A standing address on the chain. It never expires; whatever lands converts into the wallet.',
    );
    deposit = { id: d.id, network, currency, amount };
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
    if (!deposit) return [];
    const d = deposit;
    deposit = null;
    balance += d.amount;
    record('Added funds', d.network === 'LIGHTNING' ? 'Lightning' : `${d.currency} on ${d.network[0]}${d.network.slice(1).toLowerCase()}`, d.amount);
    return [
      {
        tool: { name: 'get_deposit_status', args: { deposit_id: d.id }, result: { status: 'COMPLETED', received: money(d.amount) } },
        calls: [incomingWebhook(d.amount, d.currency, d.network, 'Deposit landed', `INCOMING_PAYMENT.COMPLETED: ${money(d.amount)} in the customer's wallet.`, d.id)],
      },
    ];
  };

  const getpaidAddress = (network: DepositNetwork, currency: string): CallStep[] => {
    const d = depositCall(network, currency, null, 'A standing address for anyone to pay. Whatever lands converts into the wallet.');
    receive = { network, currency, address: d.target };
    return [
      {
        tool: { name: 'get_receive_address', args: { asset: currency, network }, result: { address: d.target } },
        calls: [d.call],
      },
    ];
  };

  const getpaidReceived = (from: string, amount: number): CallStep[] => {
    const r = receive ?? { network: 'BASE' as DepositNetwork, currency: 'USDC', address: '' };
    receive = null;
    balance += amount;
    record(from, `Paid you · ${r.currency}`, amount);
    return [
      {
        tool: null,
        calls: [incomingWebhook(amount, r.currency, r.network, 'Payment received', `INCOMING_PAYMENT.COMPLETED: ${from} paid ${money(amount)}.`)],
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

  const payoutQuote = (p: Payee, toolName: string, title: string): CallStep[] => {
    const destination = { destinationType: 'ACCOUNT', accountId: nextId('ExternalAccount'), currency: p.currency, paymentRail: p.rail };
    const local = money(p.amount, fiat(p.currency).symbol);
    const rail = p.rail.replace('_', ' ');
    return [
      quoteStep(
        toolName,
        { to: p.name, amount: p.amount / 100, currency: p.currency, rail: p.rail },
        destination,
        { code: p.currency, amount: p.amount },
        p.usd,
        {
          title,
          detail: `${p.bank} · ${rail}`,
          done: `${local} landed at ${p.bank}.`,
          note: `${local} to ${p.name} at ${p.bank} over ${rail}, locked on the receiving side.`,
        },
      ),
    ];
  };

  const agentQuote = (to: MerchantAgent): CallStep[] => {
    const step = quoteStep(
      'quote_send',
      { to: `${to.name} (agent)`, amount: to.amount / 100, currency: 'USD' },
      { destinationType: 'ACCOUNT', accountId: MERCHANT_WALLET },
      { code: 'USD', amount: to.amount },
      to.amount,
      {
        title: to.name,
        detail: 'Agent to agent',
        done: `${money(to.amount)} settled in ${to.name}'s account. Final, no chargeback window.`,
        note: `${money(to.amount)} straight to ${to.name}'s Embedded Wallet: account to account on the same network, no card in between.`,
      },
    );
    quote!.incoming = () =>
      webhook(
        'incoming-payment',
        'INCOMING_PAYMENT.COMPLETED',
        {
          id: nextId('Transaction'),
          type: 'INCOMING',
          status: 'COMPLETED',
          customerId: 'Customer:019e8f52-1d4b-7c02-0000-8a3e5f6b2c19',
          platformCustomerId: 'merchant_demo_014',
          source: { sourceType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
          destination: { destinationType: 'ACCOUNT', accountId: MERCHANT_WALLET, currency: 'USDB' },
          receivedAmount: { amount: to.amount, currency: USDB },
          description: to.description,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          settledAt: nowIso(),
        },
        'Merchant agent paid',
        `INCOMING_PAYMENT.COMPLETED on ${to.name}'s side: the same ${money(to.amount)}, already spendable.`,
      );
    return [step];
  };

  const buyRequest = (p: Purchase): CallStep[] => {
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
            note: `Under the approval threshold, so the card is issued at once, good for one charge at ${p.merchant}.`,
            resBody: issued,
          },
        ],
      },
    ];
  };

  const buyCheckout = (): CallStep[] => {
    if (!card) return [];
    const c = card;
    card = null;
    spend(c.purchase.amount);
    record(c.purchase.merchant, c.purchase.recurring ? 'Subscription · card' : 'One-time card', -c.purchase.amount);
    const txn = {
      type: 'CARD',
      id: nextId('CardTransaction'),
      cardId: c.id,
      customerId: CUSTOMER,
      platformCustomerId: PLATFORM_CUSTOMER,
      status: 'AUTHORIZED',
      direction: 'DEBIT',
      merchant: { descriptor: c.purchase.merchant.toUpperCase(), mcc: c.purchase.recurring ? '8299' : '5732', country: 'US' },
      authorizedAmount: { amount: c.purchase.amount, currency: USD },
      accountId: WALLET,
      authorizedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
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
            note: 'The agent reads the number, expiry and CVV from the processor to check out. The digits never pass through Grid.',
            resBody: { panEmbedUrl: `https://embed.lithic.com/iframe/?t=${base64url(32)}`, expiresAt: toIso(Date.now() + 60_000) },
          },
          webhook(
            'card-transaction',
            'CARD_TRANSACTION.AUTHORIZED',
            txn,
            'Card charged',
            c.purchase.recurring
              ? `CARD_TRANSACTION.AUTHORIZED: ${money(c.purchase.amount)} at ${c.purchase.merchant}. The card is now locked to them for next month.`
              : `CARD_TRANSACTION.AUTHORIZED: ${money(c.purchase.amount)} at ${c.purchase.merchant}. The card closes after this one charge.`,
          ),
        ],
      },
    ];
  };

  const decide = (approve: boolean): CallStep[] => {
    if (!pending) return [];
    const p = pending;
    pending = null;
    const path = `/agents/${agent}/actions/${p.action}/${approve ? 'approve' : 'reject'}`;
    const headers = { 'Idempotency-Key': idempotencyKey() };
    if (!approve) {
      const type = p.kind === 'card' ? 'ISSUE_PURCHASE_CARD' : 'EXECUTE_QUOTE';
      const rejected = actionBody(p.action, 'REJECTED', { type, rejectionReason: 'Declined by the customer' });
      if (p.kind === 'quote') quote = null;
      return [
        {
          tool: null,
          calls: [
            {
              method: 'POST',
              path,
              title: 'Reject agent action',
              headers,
              reqBody: { reason: 'Declined by the customer' },
              status: '200 OK',
              note: 'The person said no in your app; your backend rejects the action. Nothing moves.',
              resBody: rejected,
            },
            webhook('agent-action', 'AGENT_ACTION.REJECTED', rejected, 'Agent action rejected', 'AGENT_ACTION.REJECTED: the agent finds out on its next status check.'),
          ],
        },
        {
          tool: { name: 'get_action_status', args: { action_id: p.action }, result: { status: 'REJECTED' } },
          calls: [],
        },
      ];
    }
    if (p.kind === 'card') {
      const issued = agentCard(p.purchase);
      const approved = actionBody(p.action, 'APPROVED', { type: 'ISSUE_PURCHASE_CARD', purchaseCard: purchaseDetails(p.purchase), cardId: issued.card.id });
      return [
        {
          tool: null,
          calls: [
            {
              method: 'POST',
              path,
              title: 'Approve agent action',
              headers,
              status: '200 OK',
              note: 'The person allowed it in your app; your backend approves. Grid issues the card.',
              resBody: approved,
            },
            webhook('agent-action', 'AGENT_ACTION.APPROVED', approved, 'Agent action approved', 'AGENT_ACTION.APPROVED: the card is issued and the agent can use it.'),
          ],
        },
        {
          tool: { name: 'get_action_status', args: { action_id: p.action }, result: { status: 'APPROVED', card_id: issued.card.id } },
          calls: [],
        },
      ];
    }
    const q = p.quote;
    spend(q.usd);
    record(q.title, q.detail, -q.usd);
    quote = null;
    const approved = actionBody(p.action, 'APPROVED', {
      type: 'EXECUTE_QUOTE',
      quote: { ...q.body, status: 'PROCESSING' },
      transaction: outgoingTxn(q, 'PROCESSING'),
    });
    return [
      {
        tool: null,
        calls: [
          {
            method: 'POST',
            path,
            title: 'Approve agent action',
            headers,
            status: '200 OK',
            note: 'The person allowed it in your app; your backend approves. Grid executes the quote.',
            resBody: approved,
          },
          ...settledCalls(q),
        ],
      },
      {
        tool: { name: 'get_action_status', args: { action_id: p.action }, result: { status: 'COMPLETED' } },
        calls: [],
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
          note: 'The wallet the agent spends from, and its balance.',
          resBody: {
            data: [{ id: WALLET, type: 'EMBEDDED_WALLET', status: 'ACTIVE', balance: { amount: balance, currency: USDB } }],
            hasMore: false,
          },
        },
      ],
    },
  ];

  const transactions = (): CallStep[] => [
    {
      tool: { name: 'list_transactions', args: { limit: 10 }, result: { count: Math.min(10, ledger.length) } },
      calls: [
        {
          method: 'GET',
          path: '/agents/me/transactions?limit=10',
          auth: 'agent',
          title: 'List transactions',
          status: '200 OK',
          note: 'Scoped to the agent’s customer; no customer filter needed.',
          resBody: {
            data: ledger.slice(0, 10).map((l) => ({
              id: l.id,
              type: l.cents >= 0 ? 'INCOMING' : 'OUTGOING',
              status: l.status,
              amount: { amount: Math.abs(l.cents), currency: USDB },
              description: `${l.title} · ${l.detail}`,
              createdAt: toIso(l.at),
            })),
            hasMore: ledger.length > 10,
          },
        },
      ],
    },
  ];

  return {
    needsApproval,
    assumeConnected: () => {
      connected = true;
    },
    snapshot: () => ({ connected, balanceCents: balance, limits: { ...limits }, spentTodayCents: spentToday, ledger: ledger.slice() }),
    stepsFor(event) {
      switch (event.type) {
        case 'connect':
          return connect();
        case 'fund.deposit':
          return fundDeposit(event.network, event.currency, event.amount);
        case 'fund.received':
          return fundReceived();
        case 'getpaid.address':
          return getpaidAddress(event.network, event.currency);
        case 'getpaid.received':
          return getpaidReceived(event.from, event.amount);
        case 'limits.update':
          return limitsUpdate(event.limits);
        case 'pay.quote':
          return payoutQuote(event.payee, 'quote_send', event.payee.name);
        case 'cashout.quote':
          return payoutQuote(event.payee, 'quote_bank_send', `To ${event.payee.name}`);
        case 'pay.execute':
        case 'cashout.execute':
        case 'agent.execute':
          return executeSteps();
        case 'buy.request':
          return buyRequest(event.purchase);
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
