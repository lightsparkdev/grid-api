import type { ActionId } from '@/data/actions';
import type { AccountSnapshot } from '@/data/agentApiCalls';
import { purchaseSpendLimit, type DepositNetwork, type Limits, type Purchase } from '@/data/agentEvents';
import type { Beat, ChipGlyph, Params } from './conversation';
import { formatMoney } from './linkedBank';
import { draftRecipient, payeeFor, recipientNamed, type Recipient } from './recipients';
import { CASHOUT, FUND, HOTEL, LUCIA, NEW_LIMITS, RING_LIGHT, SUBSCRIPTION, usd2 } from './story';

/* What each flow does once the visitor sends its line: the agent's beats, the
   Grid events at each beat, and the points where it waits on the visitor.
   Flows read the account as it is when they start, so a payment over the
   approval threshold asks and one under it doesn't, as Grid would decide. */

export type FundMethod = 'card' | 'bank' | 'usdc' | 'bitcoin';

/** The details someone gave in the chat, as the model read them. A tile passes none and plays the story's own. */
export interface FlowParams {
  /** Pay someone: who, where they bank (ISO country), how much, in USD or their currency, and what for. */
  name?: string;
  country?: string;
  amount?: number;
  currency?: string;
  note?: string;
  /** Add funds: where it comes from. Add funds and Withdraw read `amount` in USD. */
  method?: FundMethod;
  /** Set limits, in USD. */
  approve?: number;
  daily?: number;
  perTx?: number;
  /** Buy online, subscription: the service and its monthly price in USD. */
  merchant?: string;
  price?: number;
}

export interface FlowContext {
  account: () => AccountSnapshot;
  needsApproval: (usdCents: number) => boolean;
  /** Which of the tile's prompts this run started from (Buy online has two). */
  variant: number;
  params?: FlowParams;
}

const cents = (usd: number | undefined) => (usd && usd > 0 ? Math.round(usd * 100) : undefined);

const limitParams = (ctx: FlowContext) => ({ limit: ctx.account().limits.approvalAbove });

const cryptoGlyph = (network: DepositNetwork): ChipGlyph => (network === 'LIGHTNING' ? 'bolt' : 'coin');

/** What the balance card reads: the balance, today's spend against the limits, recent activity. */
function balanceParams(ctx: FlowContext) {
  const a = ctx.account();
  const rows = a.ledger.slice(0, 4).map((l) => ({
    title: l.title,
    detail: l.detail,
    amount: `${l.cents >= 0 ? '+' : '−'}${usd2(l.cents)}`,
    incoming: l.cents >= 0,
  }));
  return {
    balance: a.balanceCents,
    spent: a.spentTodayCents,
    daily: a.limits.daily,
    leftToday: Math.max(0, a.limits.daily - a.spentTodayCents),
    perTx: a.limits.perTransaction,
    approve: a.limits.approvalAbove,
    rows: JSON.stringify(rows),
  };
}

/** Held for the person over the threshold; carried out on the agent's own authority under it. */
function approvalOr(
  ctx: FlowContext,
  needs: boolean,
  ask: { key: string; params?: Record<string, string | number> },
  autoLine: string,
  after: Beat[],
  denied: string,
): Beat[] {
  if (!needs) return [{ say: autoLine, params: limitParams(ctx) }, ...after];
  return [
    {
      ask: ask.key,
      params: ask.params,
      faceId: true,
      allow: [{ emit: { type: 'action.approve' } }, ...after],
      deny: [{ emit: { type: 'action.reject' } }, { say: denied }],
    },
  ];
}

const connect = (ctx: FlowContext): Beat[] => {
  const l = ctx.account().limits;
  return [
    { react: '❤️' },
    { say: 'connect.intro' },
    {
      ask: 'connect',
      params: { perTx: l.perTransaction, daily: l.daily, approve: l.approvalAbove },
      faceId: true,
      allow: [
        { work: 'setup', ms: 1100 },
        { emit: { type: 'connect' } },
        { say: 'connect.done' },
        { when: () => [{ card: 'account.ready', params: balanceParams(ctx) }] },
      ],
      deny: [{ say: 'connect.denied' }],
    },
  ];
};

/** Top up from a card: vault it the first time (each app's own way), then charge it. */
const cardTopUp = (ctx: FlowContext, amount: number): Beat[] => [
  {
    when: () => {
      const charge: Beat[] = [
        { work: 'adding', ms: 900 },
        { emit: { type: 'fund.card', amount } },
        { when: () => [{ say: 'fund.done', params: { amount, balance: ctx.account().balanceCents } }] },
      ];
      if (ctx.account().cardVaulted) return [{ say: 'fund.card', params: { amount } }, ...charge];
      return [
        { say: 'card.intro' },
        {
          ask: 'vault',
          faceId: true,
          allow: [{ emit: { type: 'card.vault' } }, { meta: 'card.saved' }, ...charge],
          deny: [{ say: 'card.denied' }],
        },
      ];
    },
  },
];

/** Top up from a bank over ACH: link it the first time (each app's consent), then request the transfer. */
const bankTopUp = (ctx: FlowContext, amount: number): Beat[] => [
  {
    when: () => {
      const transfer: Beat[] = [
        { say: 'fund.bank', params: { amount } },
        { work: 'adding', ms: 1100 },
        { emit: { type: 'fund.bank', amount } },
        { when: () => [{ say: 'fund.done', params: { amount, balance: ctx.account().balanceCents } }] },
      ];
      if (ctx.account().bankLinked) return transfer;
      return [
        { say: 'bank.intro' },
        {
          ask: 'bank',
          faceId: true,
          allow: [{ emit: { type: 'bank.link' } }, { meta: 'bank.linked' }, ...transfer],
          deny: [{ say: 'bank.denied' }],
        },
      ];
    },
  },
];

/** Add funds' sources, in its chips' order. */
const FUND_METHODS: FundMethod[] = ['card', 'bank', 'usdc', 'bitcoin'];

const fund = (ctx: FlowContext): Beat[] => {
  const amount = cents(ctx.params?.amount) ?? FUND.amount;
  const from = (picked: number): Beat[] => {
    if (picked === 0) return cardTopUp(ctx, amount);
    if (picked === 1) return bankTopUp(ctx, amount);
    const o = FUND.crypto[picked - 2];
    const params = { method: o.label, network: o.network, currency: o.currency, amount };
    return [
      { emit: { type: 'fund.deposit', network: o.network, currency: o.currency, amount } },
      { say: 'fund.address', params },
      { card: 'deposit', params },
      {
        chips: [{ label: 'I’ve sent it', glyph: 'check' }],
        reply: true,
        then: () => [
          { pause: 900 },
          { emit: { type: 'fund.received' } },
          { when: () => [{ say: 'fund.done', params: { amount, balance: ctx.account().balanceCents } }] },
        ],
      },
    ];
  };
  const method = ctx.params?.method ? FUND_METHODS.indexOf(ctx.params.method) : -1;
  if (method >= 0) return [{ react: '👍' }, ...from(method)];
  return [
    { react: '👍' },
    { say: 'fund.ask' },
    {
      chips: [
        { label: FUND.card, glyph: 'card' },
        { label: FUND.bank, glyph: 'bank' },
        ...FUND.crypto.map((o) => ({ label: o.label, glyph: cryptoGlyph(o.network) })),
      ],
      reply: true,
      then: from,
    },
  ];
};

/** The limits someone asked for: what they named, the rest raised only as far as it has to be to stay in order. */
function limitsFor(ctx: FlowContext, from: Limits): Limits {
  const p = ctx.params;
  if (!p || !(p.approve || p.daily || p.perTx)) return NEW_LIMITS;
  const approvalAbove = cents(p.approve) ?? from.approvalAbove;
  const perTransaction = cents(p.perTx) ?? Math.max(from.perTransaction, approvalAbove);
  const daily = cents(p.daily) ?? Math.max(from.daily, perTransaction);
  return { approvalAbove: Math.min(approvalAbove, perTransaction), perTransaction: Math.min(perTransaction, daily), daily };
}

const limits = (ctx: FlowContext): Beat[] => {
  const from = ctx.account().limits;
  const to = limitsFor(ctx, from);
  // Asked in the chat, the agent has already said it's sending the change over.
  const asked = ctx.params && (ctx.params.approve || ctx.params.daily || ctx.params.perTx);
  return [
    { react: '👍' },
    ...(asked ? [] : [{ say: 'limits.intro' } as Beat]),
    {
      ask: 'limits',
      params: {
        approve: to.approvalAbove,
        daily: to.daily,
        perTx: to.perTransaction,
        fromApprove: from.approvalAbove,
        fromDaily: from.daily,
        fromPerTx: from.perTransaction,
      },
      faceId: true,
      allow: [{ emit: { type: 'limits.update', limits: to } }, { say: 'limits.done', params: { approve: to.approvalAbove } }],
      deny: [{ say: 'limits.denied' }],
    },
  ];
};

/** The Pay someone tile's payment: Sofia, R$250. */
const STORY_PAY: FlowParams = { name: 'Sofia', amount: 250, currency: 'BRL', note: 'the concert tickets' };

/** Who's being paid, as the lines and the approval read them. */
function recipientParams(r: Recipient): Params {
  const c = r.bank.country;
  return { name: r.name, first: r.first, flag: c.code, country: c.name, rail: c.rail, currency: r.bank.currency, bank: r.bank.bankName };
}

/** What a payment to someone the agent already knows looks like: a quote, then sent or held for the person. */
function sendTo(ctx: FlowContext, r: Recipient, p: FlowParams): Beat[] {
  const payee = payeeFor(r, p.amount ?? 0, p.currency ?? 'USD');
  const params: Params = {
    ...recipientParams(r),
    local: payee.local,
    usd: payee.usd,
    converted: payee.currency === 'USD' ? 0 : 1,
    note: p.note ?? '',
  };
  const { perTransaction } = ctx.account().limits;
  if (payee.usd > perTransaction) return [{ say: 'pay.over', params: { ...params, perTx: perTransaction } }];
  return [
    { work: 'quoting', ms: 1200 },
    { emit: { type: 'pay.quote', payee } },
    { say: 'pay.intro', params },
    { emit: { type: 'pay.execute' } },
    ...approvalOr(
      ctx,
      ctx.needsApproval(payee.usd),
      { key: 'pay', params },
      'pay.auto',
      [{ work: 'sending', ms: 1000 }, { card: 'receipt.pay', params }, { say: 'pay.done', params }],
      'pay.denied',
    ),
  ];
}

/** Someone new gets their bank added once, in the app's own sheet, filled in for their country; then the payment. */
const pay = (ctx: FlowContext): Beat[] => {
  const p = ctx.params?.name ? ctx.params : STORY_PAY;
  const known = recipientNamed(p.name ?? '');
  if (known) return [{ react: '👍' }, ...sendTo(ctx, known, p)];
  const draft = draftRecipient(p.name ?? '', p.country ?? '');
  if (!draft) return [{ say: 'fallback' }];
  const params = recipientParams(draft);
  return [
    { react: '👍' },
    { say: 'pay.newRecipient', params },
    {
      ask: 'recipient',
      params,
      allow: [
        {
          when: () => {
            const saved = recipientNamed(draft.name) ?? draft;
            return [{ emit: { type: 'recipient.add', name: saved.name, bank: saved.bank } }, ...sendTo(ctx, saved, p)];
          },
        },
      ],
      deny: [{ say: 'pay.denied' }],
    },
  ];
};

/** A subscription: the story's Duolingo Max, or the service someone named at its monthly price. */
function subscriptionFor(ctx: FlowContext): Purchase & { item: string } {
  const { merchant, price } = ctx.params ?? {};
  if (!merchant || !cents(price)) return SUBSCRIPTION;
  return { merchant, item: merchant, description: `${merchant}, monthly`, amount: cents(price)!, recurring: true };
}

const buy = (ctx: FlowContext): Beat[] => {
  if (ctx.variant % 2 === 1) {
    const sub = subscriptionFor(ctx);
    const params = { item: sub.item, merchant: sub.merchant, amount: sub.amount };
    // Asked in the chat, the agent has already named it and its price.
    const intro: Beat[] = ctx.params?.merchant ? [] : [{ say: 'sub.intro', params }];
    return [
      ...intro,
      { say: 'sub.card', params },
      { emit: { type: 'buy.request', purchase: sub } },
      // A recurring card always waits for the person.
      ...approvalOr(
        ctx,
        true,
        { key: 'sub', params },
        'buy.auto',
        [
          { work: 'paying', ms: 1000 },
          { emit: { type: 'buy.checkout' } },
          { card: 'receipt.sub', params },
          { say: 'sub.done', params },
          { meta: 'sub.reminder' },
        ],
        'sub.denied',
      ),
    ];
  }
  return [
    { react: '👍' },
    { work: 'searching', ms: 1800 },
    { say: 'buy.intro' },
    { products: 'buy.options' },
    { say: 'buy.card' },
    { emit: { type: 'buy.request', purchase: RING_LIGHT } },
    { work: 'filling', ms: 1300 },
    ...approvalOr(
      ctx,
      ctx.needsApproval(purchaseSpendLimit(RING_LIGHT.amount)),
      { key: 'buy', params: { balance: ctx.account().balanceCents } },
      'buy.auto',
      [
        { work: 'paying', ms: 1100 },
        { emit: { type: 'buy.checkout' } },
        { card: 'receipt.buy' },
        { say: 'buy.done' },
        { meta: 'buy.tracking' },
      ],
      'buy.denied',
    ),
  ];
};

const agent = (ctx: FlowContext): Beat[] => [
  { react: '👍' },
  { subagent: 'hotel', ms: 4200, params: { approve: ctx.account().limits.approvalAbove } },
  { emit: { type: 'agent.quote', to: HOTEL } },
  { say: 'agent.intro' },
  { emit: { type: 'agent.execute' } },
  ...approvalOr(
    ctx,
    ctx.needsApproval(HOTEL.amount),
    { key: 'agent' },
    'agent.auto',
    [{ card: 'receipt.agent' }, { say: 'agent.done' }],
    'agent.denied',
  ),
];

const getpaid = (ctx: FlowContext): Beat[] => [
  { react: '‼️' },
  { say: 'getpaid.ask' },
  {
    chips: LUCIA.options.map((o) => ({ label: o.label, glyph: cryptoGlyph(o.network) })),
    reply: true,
    then: (i) => {
      const o = LUCIA.options[i];
      const params = { method: o.label, network: o.network };
      return [
        { emit: { type: 'getpaid.address', network: o.network, currency: o.currency } },
        { say: 'getpaid.address', params },
        { card: 'receive', params },
        { work: 'watching', ms: 2200 },
        { emit: { type: 'getpaid.received', from: LUCIA.name, amount: LUCIA.amount } },
        { when: () => [{ card: 'receipt.getpaid' }, { say: 'getpaid.done', params: { balance: ctx.account().balanceCents } }] },
      ];
    },
  },
];

const cashout = (ctx: FlowContext): Beat[] => [
  { react: '👍' },
  { say: 'cashout.ask' },
  {
    chips: CASHOUT.map((c) => ({ label: c.chip, flag: c.flag })),
    reply: true,
    then: (i) => {
      const story = CASHOUT[i];
      const usd = cents(ctx.params?.amount) ?? story.usd;
      const amount = Math.round((story.amount * usd) / story.usd);
      const p = { ...story, usd, amount, local: formatMoney(amount, story.currency) };
      const params = { local: p.local, to: p.name, rail: p.rail, usd: p.usd, flag: p.flag ?? '' };
      return [
        { work: 'quoting', ms: 1000 },
        { emit: { type: 'cashout.quote', payee: p } },
        { say: 'cashout.quote', params },
        { emit: { type: 'cashout.execute' } },
        ...approvalOr(
          ctx,
          ctx.needsApproval(p.usd),
          { key: 'cashout', params },
          'cashout.auto',
          [{ work: 'sending', ms: 900 }, { card: 'receipt.cashout', params }, { say: 'cashout.done' }],
          'cashout.denied',
        ),
      ];
    },
  },
];

const balance = (ctx: FlowContext): Beat[] => [
  { work: 'checking', ms: 700 },
  { emit: { type: 'account.overview' } },
  {
    when: () => {
      const params = balanceParams(ctx);
      return [{ say: 'balance.answer', params }, { card: 'balance', params }];
    },
  },
];

const history = (ctx: FlowContext): Beat[] => [
  { work: 'checking', ms: 700 },
  { emit: { type: 'transactions.list' } },
  {
    when: () => {
      const rows = ctx
        .account()
        .ledger.slice(0, 6)
        .map((l) => ({
          title: l.title,
          detail: l.detail,
          amount: `${l.cents >= 0 ? '+' : '−'}${usd2(l.cents)}`,
          incoming: l.cents >= 0,
        }));
      return [{ say: 'history.answer' }, { card: 'history', params: { rows: JSON.stringify(rows) } }];
    },
  },
];

export const FLOWS: Record<ActionId, (ctx: FlowContext) => Beat[]> = {
  connect,
  fund,
  limits,
  pay,
  buy,
  agent,
  getpaid,
  cashout,
  balance,
  history,
};

/** The most a run spends (USD cents), so a jump to it can top the balance up first. */
export function flowSpend(flow: ActionId, params?: FlowParams): number {
  switch (flow) {
    case 'pay': {
      const p = params?.name ? params : STORY_PAY;
      const r = recipientNamed(p.name ?? '') ?? draftRecipient(p.name ?? '', p.country ?? '');
      return r ? payeeFor(r, p.amount ?? 0, p.currency ?? 'USD').usd : 0;
    }
    case 'buy':
      return Math.max(purchaseSpendLimit(RING_LIGHT.amount), cents(params?.price) ?? 0);
    case 'agent':
      return HOTEL.amount;
    case 'cashout':
      return cents(params?.amount) ?? CASHOUT[0].usd;
    case 'connect':
    case 'fund':
    case 'limits':
    case 'getpaid':
    case 'balance':
    case 'history':
      return 0;
    default: {
      const exhaustive: never = flow;
      return exhaustive;
    }
  }
}

/** Flows that need an installed agent: everything but Connect. */
export const NEEDS_CONNECTION: Record<ActionId, boolean> = {
  connect: false,
  fund: true,
  limits: true,
  pay: true,
  buy: true,
  agent: true,
  getpaid: true,
  cashout: true,
  balance: true,
  history: true,
};
