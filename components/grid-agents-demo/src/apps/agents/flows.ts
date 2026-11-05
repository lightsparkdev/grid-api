import type { ActionId } from '@/data/actions';
import type { AccountSnapshot } from '@/data/agentApiCalls';
import { purchaseSpendLimit } from '@/data/agentEvents';
import type { Beat } from './conversation';
import { CASHOUT, FUND, HOTEL, LUCIA, NEW_LIMITS, RING_LIGHT, SOFIA, SUBSCRIPTION, usd2 } from './story';

/* What each flow does once the visitor sends its line: the agent's beats, the
   Grid events at each beat, and the points where it waits on the visitor.
   Flows read the account as it is when they start, so a payment over the
   approval threshold asks and one under it doesn't, as Grid would decide. */

export interface FlowContext {
  account: () => AccountSnapshot;
  needsApproval: (usdCents: number) => boolean;
  /** Which of the tile's prompts this run started from (Buy online has two). */
  variant: number;
}

const limitParams = (ctx: FlowContext) => ({ limit: ctx.account().limits.approvalAbove });

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

const fund = (ctx: FlowContext): Beat[] => [
  { say: 'fund.ask' },
  {
    chips: FUND.options.map((o) => ({ label: o.label })),
    reply: true,
    then: (i) => {
      const o = FUND.options[i];
      const params = { method: o.label, network: o.network, currency: o.currency, amount: FUND.amount };
      return [
        { emit: { type: 'fund.deposit', network: o.network, currency: o.currency, amount: FUND.amount } },
        { say: 'fund.address', params },
        { card: 'deposit', params },
        {
          chips: [{ label: 'I’ve sent it' }],
          reply: true,
          then: () => [
            { pause: 900 },
            { emit: { type: 'fund.received' } },
            { when: () => [{ say: 'fund.done', params: { amount: FUND.amount, balance: ctx.account().balanceCents } }] },
          ],
        },
      ];
    },
  },
];

const limits = (ctx: FlowContext): Beat[] => {
  const from = ctx.account().limits;
  const to = NEW_LIMITS;
  return [
    { say: 'limits.intro' },
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

const pay = (ctx: FlowContext): Beat[] => [
  { react: '👍' },
  { work: 'quoting', ms: 1200 },
  { emit: { type: 'pay.quote', payee: SOFIA } },
  { say: 'pay.intro' },
  { emit: { type: 'pay.execute' } },
  ...approvalOr(
    ctx,
    ctx.needsApproval(SOFIA.usd),
    { key: 'pay' },
    'pay.auto',
    [{ work: 'sending', ms: 1000 }, { card: 'receipt.pay' }, { say: 'pay.done' }],
    'pay.denied',
  ),
];

const buy = (ctx: FlowContext): Beat[] => {
  if (ctx.variant % 2 === 1) {
    return [
      { say: 'sub.intro' },
      { say: 'sub.card' },
      { emit: { type: 'buy.request', purchase: SUBSCRIPTION } },
      // A recurring card always waits for the person.
      ...approvalOr(
        ctx,
        true,
        { key: 'sub' },
        'buy.auto',
        [{ work: 'paying', ms: 1000 }, { emit: { type: 'buy.checkout' } }, { card: 'receipt.sub' }, { say: 'sub.done' }, { meta: 'sub.reminder' }],
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
  { say: 'agent.intro' },
  { say: 'agent.offer', sender: `${HOTEL.name}’s agent` },
  { say: 'agent.accept' },
  { emit: { type: 'agent.quote', to: HOTEL } },
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
  { say: 'getpaid.ask' },
  {
    chips: LUCIA.options.map((o) => ({ label: o.label })),
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
  { say: 'cashout.ask' },
  {
    chips: CASHOUT.map((c) => ({ label: c.chip, flag: c.flag })),
    reply: true,
    then: (i) => {
      const p = CASHOUT[i];
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
