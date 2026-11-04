/* ============================================================
   Agent Accounts API calls shown in the panel.

   Provisional: this file follows today's agent spec on main
   (openapi/paths/agents/*, openapi/components/schemas/agents/*,
   openapi/webhooks/agent-action.yaml) and will be rewritten when the
   new Agent Accounts docs land. Every path, body and webhook the
   playground shows lives here, built from the conversation's events
   (data/agentEvents.ts); nothing else names an endpoint.

   Ahead of the spec: Pay someone quotes to a bank account on a local
   rail. Today `POST /agents/me/quotes` pays embedded wallets, Spark
   accounts, chain addresses and Lightning invoices only.
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
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  GBP: { code: 'GBP', name: 'Pound Sterling', symbol: '£', decimals: 2 },
};

const PERMISSIONS = ['VIEW_TRANSACTIONS', 'CREATE_QUOTES', 'EXECUTE_QUOTES', 'RECEIVE_FUNDS', 'ISSUE_CARDS'];

/** The policy Connect installs the agent with. Set limits changes it. */
const DEFAULT_LIMITS: Limits = {
  perTransaction: 500_000,
  daily: 1_000_000,
  approvalAbove: 2_500,
};

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
  return `${symbol}${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fiat(code: string) {
  return FIAT[code] ?? { code, name: code, symbol: '', decimals: 2 };
}

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
      monthlyLimit: 1_000_000,
    },
    approvalThresholds: { currency: 'USD', amount: limits.approvalAbove },
  };
}

/* ── Session ──────────────────────────────────────────────────────────── */

type Pending =
  | { kind: 'quote'; action: string; quote: Record<string, unknown>; outcome: () => ApiCall[] }
  | { kind: 'card'; action: string; purchase: Purchase };

export interface AgentSession {
  /** The requests and webhooks one conversation event makes, in order. */
  callsFor(event: AgentEvent): ApiCall[];
  /** Whether an amount (USD cents) waits for the person under the current policy. */
  needsApproval(usdCents: number): boolean;
  readonly limits: Limits;
}

/**
 * One agent's run in the playground: its ids, its policy, and the action
 * waiting for approval, so a quote's id carries from create to execute and an
 * approval names the action that was held. Reset makes a new session.
 */
export function createAgentSession(agentName: string): AgentSession {
  const agent = nextId('Agent');
  const createdAt = nowIso();
  let limits = { ...DEFAULT_LIMITS };
  let dailySpend = 0;
  let dailyCount = 0;
  let quote: { id: string; body: Record<string, unknown>; usd: number; describe: string; incoming?: () => ApiCall } | null =
    null;
  let deposit: { id: string; network: DepositNetwork; currency: string; amount: number } | null = null;
  let pending: Pending | null = null;
  let card: { id: string; purchase: Purchase } | null = null;

  const needsApproval = (usdCents: number) => usdCents > limits.approvalAbove;

  const agentResource = () => ({
    id: agent,
    name: agentName,
    customerId: CUSTOMER,
    isPaused: false,
    isConnected: true,
    policy: policyBody(limits),
    usage: {
      dailyTransactionCount: dailyCount,
      dailySpend,
      dailyResetDate: nowIso().slice(0, 10),
      monthlySpend: dailySpend,
      monthlyResetMonth: nowIso().slice(0, 7),
    },
    createdAt,
    updatedAt: nowIso(),
  });

  /** A transaction for a quote Grid carried out. */
  const outgoingTxn = (q: NonNullable<typeof quote>, status: 'PROCESSING' | 'COMPLETED') => ({
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
    status: 'PENDING_APPROVAL' | 'APPROVED',
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

  const spend = (usd: number) => {
    dailySpend += usd;
    dailyCount += 1;
  };

  /** The webhooks that follow a quote Grid executes. */
  const settledCalls = (q: NonNullable<typeof quote>): ApiCall[] => [
    webhook(
      'outgoing-payment',
      'OUTGOING_PAYMENT.COMPLETED',
      outgoingTxn(q, 'COMPLETED'),
      'Payment completed',
      `OUTGOING_PAYMENT.COMPLETED: ${q.describe}`,
    ),
    ...(q.incoming ? [q.incoming()] : []),
  ];

  /** Execute the current quote: on the agent's own authority under the threshold, held above it. */
  const executeCalls = (): ApiCall[] => {
    if (!quote) return [];
    const q = quote;
    const action = nextId('AgentAction');
    const quoteBody = { ...q.body, status: 'PROCESSING' };
    if (needsApproval(q.usd)) {
      const held = actionBody(action, 'PENDING_APPROVAL', { type: 'EXECUTE_QUOTE', quote: q.body });
      pending = { kind: 'quote', action, quote: q.body, outcome: () => settledCalls(q) };
      return [
        {
          method: 'POST',
          path: `/agents/me/quotes/${q.id}/execute`,
          auth: 'agent',
          title: 'Execute quote',
          headers: { 'Idempotency-Key': idempotencyKey() },
          status: '200 OK',
          note: `${money(q.usd)} is over the ${money(limits.approvalAbove)} approval threshold, so the action waits as PENDING_APPROVAL.`,
          resBody: held,
        },
        webhook(
          'agent-action',
          'AGENT_ACTION.PENDING_APPROVAL',
          held,
          'Agent action pending',
          'AGENT_ACTION.PENDING_APPROVAL: show the person the quote and ask them to approve it.',
        ),
      ];
    }
    spend(q.usd);
    const txn = outgoingTxn(q, 'PROCESSING');
    quote = null;
    return [
      {
        method: 'POST',
        path: `/agents/me/quotes/${q.id}/execute`,
        auth: 'agent',
        title: 'Execute quote',
        headers: { 'Idempotency-Key': idempotencyKey() },
        status: '200 OK',
        note: `Under the ${money(limits.approvalAbove)} approval threshold, so it executes on the agent's own authority: APPROVED, with the transaction attached.`,
        resBody: actionBody(action, 'APPROVED', { type: 'EXECUTE_QUOTE', quote: quoteBody, transaction: txn }),
      },
      ...settledCalls(q),
    ];
  };

  const quoteCall = (
    destination: Record<string, unknown>,
    receiving: { code: string; amount: number },
    usd: number,
    rate: number,
    title: string,
    note: string,
  ): ApiCall => {
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
      receivingCurrency: fiat(receiving.code),
      totalSendingAmount: usd,
      totalReceivingAmount: receiving.amount,
      exchangeRate: rate,
      feesIncluded: 0,
      transactionId: nextId('Transaction'),
    };
    quote = { id, body, usd, describe: '' };
    return {
      method: 'POST',
      path: '/agents/me/quotes',
      auth: 'agent',
      title,
      headers: { 'Idempotency-Key': idempotencyKey() },
      reqBody,
      status: '201 Created',
      note,
      resBody: body,
    };
  };

  /* ── Events ── */

  const connect = (): ApiCall[] => {
    const code = base64url(22);
    const deviceCode = { code, agentId: agent, expiresAt: toIso(Date.now() + 15 * 60_000), redeemed: false };
    return [
      {
        method: 'POST',
        path: '/agents',
        title: 'Create agent',
        reqBody: { name: agentName, customerId: CUSTOMER, policy: policyBody(limits) },
        status: '201 Created',
        note: 'Your backend creates the agent for the customer with its policy. The device code goes to the agent once.',
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
        resBody: {
          agentId: agent,
          agentName,
          accessToken: `gat_${hex(40)}`,
          policy: policyBody(limits),
        },
      },
    ];
  };

  const fundDeposit = (network: DepositNetwork, currency: string, amount: number): ApiCall[] => {
    const id = nextId('AgentDeposit');
    deposit = { id, network, currency, amount };
    const lightning = network === 'LIGHTNING';
    const target = lightning
      ? `lnbc${Math.round(amount / 4)}0n1pn${base64url(40).toLowerCase()}`
      : network === 'SOLANA'
        ? `7xKX${base64url(36).replace(/[-_]/g, 'q')}`
        : network === 'TRON'
          ? `TQ${base64url(32).replace(/[-_]/g, 'r')}`
          : `0x${hex(40)}`;
    return [
      {
        method: 'POST',
        path: '/agents/me/deposits',
        auth: 'agent',
        title: 'Create deposit',
        reqBody: {
          sourceNetwork: network,
          sourceCurrency: currency,
          destinationInternalAccountId: WALLET,
          ...(lightning ? { amount } : {}),
        },
        status: '201 Created',
        note: lightning
          ? 'A Lightning invoice for the exact amount. Fees come out of what lands.'
          : 'A standing address on the chain. It never expires; whatever lands converts into the wallet.',
        resBody: {
          id,
          status: 'PENDING',
          sourceNetwork: network,
          sourceCurrency: currency,
          destinationInternalAccountId: WALLET,
          destinationCurrency: 'USDB',
          ...(lightning ? { estimatedReceiveAmount: { amount: amount - 12, currency: USDB } } : {}),
          targetType: lightning ? 'LIGHTNING_INVOICE' : 'CHAIN_ADDRESS',
          target,
          ...(lightning
            ? {
                paymentLinks: { cashApp: `https://cash.app/launch/lightning/${target.slice(0, 24)}` },
                expiresAt: toIso(Date.now() + 10 * 60_000),
              }
            : { expiresAt: null }),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      },
    ];
  };

  const fundReceived = (): ApiCall[] => {
    if (!deposit) return [];
    const d = deposit;
    deposit = null;
    return [
      webhook(
        'incoming-payment',
        'INCOMING_PAYMENT.COMPLETED',
        {
          id: nextId('Transaction'),
          type: 'INCOMING',
          status: 'COMPLETED',
          customerId: CUSTOMER,
          platformCustomerId: PLATFORM_CUSTOMER,
          source: { sourceType: 'REALTIME_FUNDING', currency: d.currency, paymentRail: d.network },
          destination: { destinationType: 'ACCOUNT', accountId: WALLET, currency: 'USDB' },
          receivedAmount: { amount: d.amount, currency: USDB },
          depositId: d.id,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          settledAt: nowIso(),
        },
        'Deposit landed',
        `INCOMING_PAYMENT.COMPLETED: ${money(d.amount)} in the customer's wallet.`,
      ),
    ];
  };

  const limitsUpdate = (next: Limits): ApiCall[] => {
    limits = { ...next };
    return [
      {
        method: 'PATCH',
        path: `/agents/${agent}/policy`,
        title: 'Update agent policy',
        reqBody: {
          spendingLimits: { perTransactionLimit: next.perTransaction, dailyLimit: next.daily },
          approvalThresholds: { currency: 'USD', amount: next.approvalAbove },
        },
        status: '200 OK',
        note: `Your backend changes the policy; the agent can't. It now acts alone up to ${money(next.approvalAbove)} and asks above it.`,
        resBody: agentResource(),
      },
    ];
  };

  const payQuote = (p: Payee): ApiCall[] => {
    const destination = {
      destinationType: 'ACCOUNT',
      accountId: nextId('ExternalAccount'),
      currency: p.currency,
      paymentRail: p.rail,
    };
    const call = quoteCall(
      destination,
      { code: p.currency, amount: p.amount },
      p.usd,
      Number((p.amount / p.usd).toFixed(4)),
      'Create quote',
      `${money(p.amount, fiat(p.currency).symbol)} to ${p.name} at ${p.bank} over ${p.rail.replace('_', ' ')}, locked on the receiving side.`,
    );
    quote!.describe = `${money(p.amount, fiat(p.currency).symbol)} landed in ${p.name}'s account at ${p.bank}.`;
    return [call];
  };

  const agentQuote = (to: MerchantAgent): ApiCall[] => {
    const destination = { destinationType: 'ACCOUNT', accountId: MERCHANT_WALLET };
    const call = quoteCall(
      destination,
      { code: 'USD', amount: to.amount },
      to.amount,
      1,
      'Create quote',
      `${money(to.amount)} straight to ${to.name}'s Embedded Wallet: account to account on the same network, no card in between.`,
    );
    const q = quote!;
    q.describe = `${money(to.amount)} settled in ${to.name}'s account. Final, no chargeback window.`;
    q.incoming = () =>
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
    return [call];
  };

  const purchaseDetails = (p: Purchase) => ({
    amount: p.amount,
    spendLimit: purchaseSpendLimit(p.amount),
    currency: 'USD',
    description: p.description,
    fundingSource: WALLET,
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
      purchase: { ...purchaseDetails(p), expiresAt: toIso(Date.now() + 30 * 60_000) },
    };
  };

  const buyRequest = (p: Purchase): ApiCall[] => {
    const reqBody = { kind: 'PURCHASE', fundingSource: WALLET, amount: p.amount, description: p.description };
    const headers = { 'Idempotency-Key': idempotencyKey() };
    if (needsApproval(purchaseDetails(p).spendLimit)) {
      const action = nextId('AgentAction');
      const held = actionBody(action, 'PENDING_APPROVAL', {
        type: 'ISSUE_PURCHASE_CARD',
        purchaseCard: purchaseDetails(p),
      });
      pending = { kind: 'card', action, purchase: p };
      return [
        {
          method: 'POST',
          path: '/agents/me/cards',
          auth: 'agent',
          title: 'Request purchase card',
          headers,
          reqBody,
          status: '202 Accepted',
          note: `A single-use card for ${money(p.amount)} at ${p.merchant}. Its limit is over the approval threshold, so Grid holds it for the person.`,
          resBody: held,
        },
        webhook(
          'agent-action',
          'AGENT_ACTION.PENDING_APPROVAL',
          held,
          'Agent action pending',
          'AGENT_ACTION.PENDING_APPROVAL: the payload has the amount, limit and description to show in your approval sheet.',
        ),
      ];
    }
    spend(p.amount);
    return [
      {
        method: 'POST',
        path: '/agents/me/cards',
        auth: 'agent',
        title: 'Request purchase card',
        headers,
        reqBody,
        status: '201 Created',
        note: `Under the approval threshold, so the card is issued at once, good for one charge at ${p.merchant}.`,
        resBody: agentCard(p),
      },
    ];
  };

  const buyCheckout = (): ApiCall[] => {
    if (!card) return [];
    const c = card;
    card = null;
    const txn = {
      type: 'CARD',
      id: nextId('CardTransaction'),
      cardId: c.id,
      customerId: CUSTOMER,
      platformCustomerId: PLATFORM_CUSTOMER,
      status: 'AUTHORIZED',
      direction: 'DEBIT',
      merchant: { descriptor: c.purchase.merchant.toUpperCase(), mcc: '5732', country: 'US' },
      authorizedAmount: { amount: c.purchase.amount, currency: USD },
      accountId: WALLET,
      authorizedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return [
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
        `CARD_TRANSACTION.AUTHORIZED: ${money(c.purchase.amount)} at ${c.purchase.merchant}. The card closes after this one charge.`,
      ),
    ];
  };

  const approve = (): ApiCall[] => {
    if (!pending) return [];
    const p = pending;
    pending = null;
    const path = `/agents/${agent}/actions/${p.action}/approve`;
    if (p.kind === 'card') {
      spend(p.purchase.amount);
      const issued = agentCard(p.purchase);
      const approved = actionBody(p.action, 'APPROVED', {
        type: 'ISSUE_PURCHASE_CARD',
        purchaseCard: purchaseDetails(p.purchase),
        cardId: issued.card.id,
      });
      return [
        {
          method: 'POST',
          path,
          title: 'Approve agent action',
          headers: { 'Idempotency-Key': idempotencyKey() },
          status: '200 OK',
          note: 'The person allowed it in your app; your backend approves. Grid issues the card.',
          resBody: approved,
        },
        webhook('agent-action', 'AGENT_ACTION.APPROVED', approved, 'Agent action approved', 'AGENT_ACTION.APPROVED: the card is issued and the agent can use it.'),
      ];
    }
    const q = quote!;
    spend(q.usd);
    quote = null;
    const approved = actionBody(p.action, 'APPROVED', {
      type: 'EXECUTE_QUOTE',
      quote: { ...p.quote, status: 'PROCESSING' },
      transaction: outgoingTxn(q, 'PROCESSING'),
    });
    return [
      {
        method: 'POST',
        path,
        title: 'Approve agent action',
        headers: { 'Idempotency-Key': idempotencyKey() },
        status: '200 OK',
        note: 'The person allowed it in your app; your backend approves. Grid executes the quote.',
        resBody: approved,
      },
      ...p.outcome(),
    ];
  };

  return {
    get limits() {
      return limits;
    },
    needsApproval,
    callsFor(event) {
      switch (event.type) {
        case 'connect':
          return connect();
        case 'fund.deposit':
          return fundDeposit(event.network, event.currency, event.amount);
        case 'fund.received':
          return fundReceived();
        case 'limits.update':
          return limitsUpdate(event.limits);
        case 'pay.quote':
          return payQuote(event.payee);
        case 'pay.execute':
        case 'agent.execute':
          return executeCalls();
        case 'buy.request':
          return buyRequest(event.purchase);
        case 'buy.checkout':
          return buyCheckout();
        case 'agent.quote':
          return agentQuote(event.to);
        case 'action.approve':
          return approve();
        default: {
          const exhaustive: never = event;
          return exhaustive;
        }
      }
    },
  };
}
