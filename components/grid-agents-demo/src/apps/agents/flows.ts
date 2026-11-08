import { actionLabel, type ActionId } from '@/data/actions';
import type { AccountSnapshot } from '@/data/agentApiCalls';
import { purchaseSpendLimit, type DepositNetwork, type Limits, type Payee, type Purchase } from '@/data/agentEvents';
import { addressKind, canSend, NETWORK_FEE, NETWORKS_FOR, SENDS_ON, sendsLabel, shortAddress, type SendAsset } from '@/data/cryptoSend';
import type { Beat, ChipGlyph, Params, PayTo } from './conversation';
import { depositDetails, formatMoney, linkedBank, pullsFrom } from './linkedBank';
import { draftRecipient, payeeFor, recipientNamed, type Recipient } from './recipients';
import { hash, merchantFor, stayFor, stayParams } from './hotels';
import { purchaseFor, shelfFor, shelfParams, shelfWith, type Shelf } from './products';
import { CASHOUT_AMOUNT, CRYPTO, FUND, LUCIA, NETWORK_NAME, NEW_LIMITS, SUBSCRIPTION, usd2, type CryptoAsset } from './story';

/* What each flow does once the visitor sends its line: the agent's beats, the
   Grid events at each beat, and the points where it waits on the visitor.
   Flows read the account as it is when they start, so a payment over the
   approval threshold asks and one under it doesn't, as Grid would decide. */

export type FundMethod = 'card' | 'bank' | 'crypto';

/** The details someone gave in the chat, as the model read them. A tile passes none and plays the story's own. */
export interface FlowParams {
  /** Pay someone: who, where they bank (ISO country), how much, in USD or their currency, and what for. Get paid: who's paying, and how much in USD. */
  name?: string;
  country?: string;
  amount?: number;
  currency?: string;
  note?: string;
  /** Add funds: where it comes from. Add funds and Withdraw read `amount` in USD. */
  method?: FundMethod;
  /** Add funds and Send crypto: the asset and network, if they said. */
  asset?: SendAsset;
  network?: DepositNetwork;
  /** Send crypto: where to, as they gave it (an address, a Lightning invoice, a Spark address). */
  address?: string;
  /** Set limits, in USD. */
  approve?: number;
  daily?: number;
  perTx?: number;
  /** Pay an agent: where to stay, check-in and check-out (YYYY-MM-DD), and how many people. */
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  /** Buy online, subscription: the service and its monthly price in USD. */
  merchant?: string;
  price?: number;
  /** Buy online, an order: what they want, in their words ("noise cancelling headphones"). */
  query?: string;
  /** Buy online: they just added money to pay from the balance, so it doesn't ask again. */
  pay?: 'balance';
}

export interface FlowContext {
  account: () => AccountSnapshot;
  needsApproval: (usdCents: number) => boolean;
  /** Which of the tile's prompts this run started from (Buy online has two). */
  variant: number;
  params?: FlowParams;
  /** What comes next once this flow has done its part: the task a setup was for. */
  then?: () => Beat[];
  /** Pay someone with too little in the balance: adds what's short (USD cents) once the payee and quote are set,
   *  so no money moves before the agent knows who it's for. */
  topUp?: (short: number, then: () => Beat[]) => Beat[];
  /** The app's checkout has a Pay with row (Muse, Dots): the agent goes with what covers a purchase, and the
   *  person switches there. Elsewhere the agent asks first. */
  picksInCheckout?: boolean;
  /** The task a setup step is on the way to ("paying Sofia"): a no to the step puts it on hold, out loud. */
  held?: string;
}

const cents = (usd: number | undefined) => (usd && usd > 0 ? Math.round(usd * 100) : undefined);

/** A no to a setup step on the way to a task: the task waits, and the agent says so. */
const holdOr = (ctx: FlowContext, otherwise: Beat): Beat => (ctx.held ? { say: 'task.held', params: { what: ctx.held } } : otherwise);

/** Add exactly what's short (USD cents) once the price is known, then carry on. */
const addShort =
  (ctx: FlowContext) =>
  (short: number, then: () => Beat[]): Beat[] =>
    ctx.topUp ? ctx.topUp(short, then) : fund({ ...ctx, params: { amount: short / 100 }, then }).filter((b) => !('react' in b));

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

/**
 * Held for the person over the threshold; carried out on the agent's own authority under it. Face ID guards money
 * leaving to someone else; a withdrawal to your own bank is just a tap.
 */
function approvalOr(
  ctx: FlowContext,
  needs: boolean,
  ask: { key: string; params?: Record<string, string | number>; swap?: (to: PayTo) => Beat[] },
  autoLine: string,
  after: Beat[],
  denied: string,
  deniedParams?: Params,
): Beat[] {
  if (!needs) return [{ say: autoLine, params: limitParams(ctx) }, ...after];
  return [
    {
      ask: ask.key,
      swap: ask.swap,
      params: ask.params,
      faceId: ask.key !== 'cashout',
      allow: [{ emit: { type: 'action.approve' } }, ...after],
      deny: [{ emit: { type: 'action.reject' } }, { say: denied, params: deniedParams }],
    },
  ];
}

/** Whether the account has a settled payment to or from `title` (the ledger names the other side). */
const paid = (ctx: FlowContext, title: string) => ctx.account().ledger.some((l) => l.title === title && l.status === 'COMPLETED');

const connect = (ctx: FlowContext): Beat[] => {
  const l = ctx.account().limits;
  const hasAgent = ctx.account().connected ? 1 : 0;
  if (ctx.account().balanceOn) return [{ react: '👍' }, { say: 'connect.already' }, { when: () => [{ card: 'balance', params: balanceParams(ctx) }] }];
  return [
    { react: '❤️' },
    // On the way to something else it's a first step; asked for itself, it's the answer. Paying with their card
    // already, it only adds a balance (`hasAgent`).
    { say: ctx.then ? 'connect.intro' : 'connect.self', params: { hasAgent } },
    {
      ask: 'connect',
      params: { perTx: l.perTransaction, daily: l.daily, approve: l.approvalAbove, hasAgent },
      allow: [
        { work: 'setup', ms: 1100 },
        { emit: { type: 'connect' } },
        { say: 'connect.done', params: { hasAgent } },
        // On the way to something else, that's what comes next; an empty balance card would only be in the way.
        { when: () => (ctx.then ? ctx.then() : [{ card: 'account.ready', params: balanceParams(ctx) }]) },
      ],
      deny: [holdOr(ctx, { say: 'connect.denied', params: { hasAgent } })],
    },
  ];
};

/** The top-up landed: say so, then carry on with whatever it was for. */
const landed = (ctx: FlowContext, amount: number): Beat => ({
  when: () => {
    // What it was for carries on in the same bubble when it opens with a line ("$149 landed… Here's the final quote").
    const [next, ...rest] = ctx.then?.() ?? [];
    const carried: Beat[] = next ? ['say' in next ? { ...next, join: true } : next, ...rest] : [];
    return [{ say: 'fund.done', params: { amount, balance: ctx.account().balanceCents } }, ...carried];
  },
});

/** Top up from a card: vault it the first time (each app's own way), then charge it. `onNo` follows a no to the card. */
const cardTopUp = (ctx: FlowContext, amount: number, onNo: Beat[] = [{ say: 'card.denied' }]): Beat[] => [
  {
    when: () => {
      const charge: Beat[] = [
        { work: 'adding', ms: 900 },
        { emit: { type: 'fund.card', amount } },
        landed(ctx, amount),
      ];
      if (ctx.account().cardVaulted) return [{ say: 'fund.card', params: { amount } }, ...charge];
      return [
        { say: 'card.intro', params: { topUp: 1 } },
        {
          ask: 'vault',
          allow: [{ emit: { type: 'card.vault' } }, { meta: 'card.saved' }, ...charge],
          deny: onNo,
        },
      ];
    },
  },
];

/** Where the person's own bank is: the US links through Plaid, anywhere else through the app's own form. */
const HOMES: { label: string; flag?: string; home: string }[] = [
  { label: 'United States', flag: 'us', home: 'us' },
  { label: 'Mexico', flag: 'mx', home: 'mx' },
  { label: 'Brazil', flag: 'br', home: 'br' },
  { label: 'Somewhere else', home: 'other' },
];

/** Link the person's own bank: what it's for and where it is (one line), then the app's consent for that country. */
const linkOwnBank = (intro: string, after: Beat[], onNo: Beat[] = [{ say: 'bank.denied' }]): Beat[] => [
  { say: intro },
  {
    chips: HOMES.map(({ label, flag }) => (flag ? { label, flag } : { label, glyph: 'bank' })),
    reply: true,
    then: (picked): Beat[] => [
      { say: 'bank.opening', params: { home: HOMES[picked].home, country: HOMES[picked].label } },
      {
        ask: 'bank',
        params: { home: HOMES[picked].home },
        allow: [{ emit: { type: 'bank.link' } }, { meta: 'bank.linked' }, ...after],
        deny: onNo,
      },
    ],
  },
];

/**
 * Top up from the person's bank, linked the first time (each app's consent). A US bank is pulled from over ACH;
 * anywhere else Grid can't pull, so the person sends it from their bank to the details Grid issues.
 */
const bankTopUp = (ctx: FlowContext, amount: number, onNo?: Beat[]): Beat[] => [
  {
    when: () => {
      // Just linked, "I'll keep it connected" and what happens next are one bubble.
      const move = (linked = false): Beat[] => {
        const bank = linkedBank();
        const kept: Beat[] = linked ? [{ say: 'bank.kept' }] : [];
        if (pullsFrom(bank)) {
          return [...kept, { say: 'fund.bank', params: { amount }, join: true }, { work: 'adding', ms: 1100 }, { emit: { type: 'fund.bank', amount } }, landed(ctx, amount)];
        }
        const d = depositDetails(bank, amount);
        const params = { amount, send: formatMoney(d.amount, d.currency), rail: d.rail, wire: d.currency === bank.currency ? 0 : 1, rows: JSON.stringify(d.rows), reference: d.reference };
        return [
          { emit: { type: 'fund.instructions', amount } },
          ...kept,
          { say: 'fund.push', params, join: true },
          { card: 'deposit.bank', params },
          {
            chips: [{ label: 'I’ve sent it', glyph: 'check' }],
            reply: true,
            then: () => [{ pause: 900 }, { emit: { type: 'fund.received' } }, landed(ctx, amount)],
          },
        ];
      };
      if (ctx.account().bankLinked) return move();
      return linkOwnBank('bank.intro', [{ when: () => move(true) }], onNo);
    },
  },
];

/** Save a card in the app's own vault sheet, then carry on with what it was for. */
const vaultThen = (ctx: FlowContext, intro: string, after: () => Beat[]): Beat[] => [
  { say: intro },
  {
    ask: 'vault',
    allow: [{ emit: { type: 'connect', lite: true } }, { emit: { type: 'card.vault' } }, { meta: 'card.saved' }, { when: after }],
    deny: [holdOr(ctx, { say: 'card.denied' })],
  },
];

/** After a card goes in with no balance yet: the card already works, and a balance is there if they want one. */
const offerBalance = (ctx: FlowContext): Beat[] => [
  { say: 'balance.offer' },
  {
    chips: [
      { label: 'Set up a balance', glyph: 'wallet' },
      { label: 'Not now', glyph: 'card' },
    ],
    reply: true,
    then: (picked) =>
      picked === 0 ? connect(ctx).filter((b) => !('react' in b)) : [{ say: 'balance.later' }],
  },
];

/** What the balance is short of a price (USD cents). */
const shortOf = (ctx: FlowContext, price: number) => price - ctx.account().balanceCents;

/**
 * What a purchase is paid with, decided at checkout once the price is known. Asked for on the card, or with no
 * balance, it goes on the card (saved first if it isn't yet), with nothing to say about a balance. A balance and
 * no card: the balance, or when it's short, the card or exactly what's missing. With both, an app whose checkout can switch
 * it goes with what covers it (the card when the balance is short, `short` so the line says why); elsewhere the
 * agent asks. On the card, the balance isn't touched.
 */
function payWith(ctx: FlowContext, price: number, go: (card: boolean, short?: boolean) => Beat[]): Beat[] {
  const a = ctx.account();
  const onCard = () => (a.cardVaulted ? go(true) : vaultThen(ctx, 'card.forBuy', () => go(true)));
  if (ctx.params?.method === 'card' || !a.balanceOn) return onCard();
  if (ctx.params?.pay === 'balance') return go(false);
  const short = shortOf(ctx, price) > 0;
  const topUp = () => fund({ ...ctx, params: { amount: shortOf(ctx, price) / 100 }, then: () => go(false) }).slice(1);
  if (!a.cardVaulted) {
    if (!short) return go(false);
    return [
      { say: 'buy.short', params: { amount: shortOf(ctx, price), balance: a.balanceCents } },
      {
        chips: [
          { label: 'Use my card', glyph: 'card' },
          { label: 'Add money', glyph: 'wallet' },
        ],
        reply: true,
        then: (picked) => (picked === 0 ? onCard() : topUp().map((b) => ('say' in b && b.say === 'fund.needed' ? { say: 'fund.ask' } : b))),
      },
    ];
  }
  if (ctx.picksInCheckout) return go(short, short);
  if (short) {
    return [
      { say: 'buy.shortCard', params: { amount: shortOf(ctx, price) } },
      {
        chips: [
          { label: 'Visa •••• 4242', glyph: 'card' },
          { label: 'Add money first', glyph: 'wallet' },
        ],
        reply: true,
        then: (picked) => (picked === 0 ? go(true) : topUp()),
      },
    ];
  }
  return [
    { say: 'buy.payWith' },
    {
      chips: [
        { label: 'My balance', glyph: 'wallet' },
        { label: 'Visa •••• 4242', glyph: 'card' },
      ],
      reply: true,
      then: (picked) => go(picked === 1),
    },
  ];
}

/**
 * Add a card on its own: into the vault, each app's own way. It's enough to pay with on its own (the agent is
 * created for it if it isn't yet); with no balance, the agent then offers one.
 */
const card = (ctx: FlowContext): Beat[] => {
  const a = ctx.account();
  const topUp = a.balanceOn ? 1 : 0;
  if (a.cardVaulted) return [{ react: '👍' }, { say: 'card.already', params: { topUp } }];
  return [
    { react: '👍' },
    { say: 'card.intro', params: { topUp } },
    {
      ask: 'vault',
      allow: [
        { emit: { type: 'connect', lite: true } },
        { emit: { type: 'card.vault' } },
        { meta: 'card.saved' },
        { say: 'card.done', params: { topUp } },
        { when: () => (ctx.account().balanceOn ? [] : offerBalance(ctx)) },
      ],
      deny: [{ say: 'card.denied' }],
    },
  ];
};

/** Link a bank on its own: the app's consent, then it's there to top up from and cash out to. */
const bank = (ctx: FlowContext): Beat[] => {
  if (ctx.account().bankLinked) return [{ react: '👍' }, { say: 'bank.already' }];
  return [{ react: '👍' }, ...linkOwnBank('bank.intro', [{ say: 'bank.done' }])];
};

/** Add funds' sources, in its chips' order. */
const FUND_METHODS: FundMethod[] = ['card', 'bank', 'crypto'];
const FUND_GLYPH: Record<FundMethod, ChipGlyph> = { card: 'card', bank: 'bank', crypto: 'coin' };

/** What a network alone says about the asset: only USDT arrives on Tron, only Bitcoin over Lightning. Spark could be either. */
const assetOn = (network?: DepositNetwork): CryptoAsset | undefined =>
  network === 'TRON' ? 'USDT' : network === 'LIGHTNING' ? 'BTC' : undefined;

const fund = (ctx: FlowContext): Beat[] => {
  const amount = cents(ctx.params?.amount);
  // Nobody named an amount (the tile): ask, then carry on as if they had.
  if (amount === undefined) {
    return [
      { react: '👍' },
      { say: 'fund.amount' },
      { amount: true, then: (usd) => fund({ ...ctx, params: { ...ctx.params, amount: usd } }).slice(1) },
    ];
  }
  const deposit = (asset: CryptoAsset, network: DepositNetwork): Beat[] => {
    const lightning = network === 'LIGHTNING';
    // A Lightning invoice is priced in dollars; a chain address takes the asset itself.
    const currency = lightning ? 'USD' : asset;
    const { label } = CRYPTO.find((o) => o.asset === asset)!;
    const method = lightning ? 'Bitcoin over Lightning' : `${label} on ${NETWORK_NAME[network]}`;
    const params = { method, network, currency: asset, amount };
    return [
      { emit: { type: 'fund.deposit', network, currency, amount } },
      { say: 'fund.address', params },
      { card: 'deposit', params },
      {
        chips: [{ label: 'I’ve sent it', glyph: 'check' }],
        reply: true,
        then: () => [
          { pause: 900 },
          { emit: { type: 'fund.received' } },
          landed(ctx, amount),
        ],
      },
    ];
  };
  // Crypto asks what they're sending, then on which network, skipping whatever they already said or has one answer.
  const onNetwork = (asset: CryptoAsset): Beat[] => {
    const { networks, label } = CRYPTO.find((o) => o.asset === asset)!;
    const said = ctx.params?.network;
    if (said && networks.includes(said)) return deposit(asset, said);
    if (networks.length === 1) return deposit(asset, networks[0]);
    return [
      { say: 'fund.network', params: { asset: label } },
      {
        chips: networks.map((n) => ({ label: NETWORK_NAME[n], glyph: 'coin' as const })),
        reply: true,
        then: (picked) => deposit(asset, networks[picked]),
      },
    ];
  };
  const crypto = (): Beat[] => {
    const asked = CRYPTO.find((o) => o.asset === ctx.params?.asset)?.asset;
    const said = asked ?? assetOn(ctx.params?.network);
    if (said) return onNetwork(said);
    return [
      { say: 'fund.asset' },
      {
        chips: CRYPTO.map((o) => ({ label: o.label, glyph: o.asset === 'BTC' ? ('bolt' as const) : ('coin' as const) })),
        reply: true,
        then: (picked) => onNetwork(CRYPTO[picked].asset),
      },
    ];
  };
  // Topping up for something else, a no to the card or the bank offers the other ways, or puts the task on hold.
  const otherWays = (tried: number[]): Beat[] | undefined => {
    if (!ctx.then) return undefined;
    const rest = FUND_METHODS.map((_, i) => i).filter((i) => !tried.includes(i));
    return [
      { say: 'fund.other', params: { amount, again: tried.length > 1 ? 1 : 0 } },
      {
        chips: [...rest.map((i) => ({ label: FUND[FUND_METHODS[i]], glyph: FUND_GLYPH[FUND_METHODS[i]] })), { label: 'Not now' }],
        reply: true,
        then: (picked) => (picked < rest.length ? from(rest[picked], tried) : [holdOr(ctx, { say: 'fund.later' })]),
      },
    ];
  };
  const from = (picked: number, tried: number[] = []): Beat[] =>
    picked === 0
      ? cardTopUp(ctx, amount, otherWays([...tried, 0]))
      : picked === 1
        ? bankTopUp(ctx, amount, otherWays([...tried, 1]))
        : crypto();
  const named = ctx.params?.method ?? (ctx.params?.asset || ctx.params?.network ? 'crypto' : undefined);
  const method = named ? FUND_METHODS.indexOf(named) : -1;
  if (method >= 0) return [{ react: '👍' }, ...from(method)];
  return [
    { react: '👍' },
    // Topping up for something else, it says what it needs and why.
    ctx.then ? { say: 'fund.needed', params: { amount }, join: true } : { say: 'fund.ask' },
    {
      chips: FUND_METHODS.map((m) => ({ label: FUND[m], glyph: FUND_GLYPH[m] })),
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
  const perTx = Math.min(perTransaction, daily);
  return { approvalAbove: Math.min(approvalAbove, perTx), perTransaction: perTx, daily };
}

const limits = (ctx: FlowContext): Beat[] => {
  const from = ctx.account().limits;
  const to = limitsFor(ctx, from);
  // Asked in the chat, the agent has already said it's sending the change over.
  const asked = ctx.params && (ctx.params.approve || ctx.params.daily || ctx.params.perTx);
  if (to.approvalAbove === from.approvalAbove && to.daily === from.daily && to.perTransaction === from.perTransaction) {
    return [{ react: '👍' }, { say: 'limits.same', params: { approve: to.approvalAbove, daily: to.daily, perTx: to.perTransaction } }];
  }
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

/** A rail as a sentence says it: PIX and SPEI keep their names, a plain "Bank Transfer" is just a bank transfer. */
const railName = (rail: string) => (/^[A-Z0-9]+$/.test(rail) ? rail : rail.toLowerCase());

/** Who's being paid, as the lines and the approval read them: by first name, as the person calls them. */
function recipientParams(r: Recipient): Params {
  const c = r.bank.country;
  return { name: r.name, first: r.first, flag: c.code, country: c.name, rail: railName(c.rail), currency: r.bank.currency, bank: r.bank.bankName };
}

/** What a payment to someone the agent already knows looks like: a quote, then sent or held for the person. */
function sendTo(ctx: FlowContext, r: Recipient, p: FlowParams): Beat[] {
  const payee = payeeFor(r, p.amount ?? 0, p.currency ?? 'USD');
  // The conversion reads from what they asked in: "$50 is ₱2,900", or "R$250 is $46.30".
  const inDollars = (p.currency ?? 'USD') === 'USD';
  const params: Params = {
    ...recipientParams(r),
    local: payee.local,
    usd: payee.usd,
    converted: payee.currency === 'USD' ? 0 : 1,
    from: inDollars ? usd2(payee.usd) : payee.local,
    to: inDollars ? payee.local : usd2(payee.usd),
    note: p.note ?? '',
  };
  const { perTransaction } = ctx.account().limits;
  if (payee.usd > perTransaction) return [{ say: 'pay.over', params: { ...params, perTx: perTransaction } }];
  const send = (): Beat[] => {
    const sent = { ...params, balance: ctx.account().balanceCents };
    return [
      { emit: { type: 'pay.execute' } },
      ...approvalOr(
        ctx,
        ctx.needsApproval(payee.usd),
        { key: 'pay', params: sent },
        'pay.auto',
        [{ work: 'sending', ms: 1000 }, { card: 'receipt.pay', params: sent }, { say: 'pay.done', params: sent }],
        'pay.denied',
      ),
    ];
  };
  const short = payee.usd - ctx.account().balanceCents;
  return [
    { work: 'quoting', ms: 1200 },
    { emit: { type: 'pay.quote', payee } },
    { say: 'pay.intro', params },
    ...(short > 0 ? addShort({ ...ctx, held: `paying ${r.first}` })(short, send) : send()),
  ];
}

/** Someone new gets their bank added once, in the app's own sheet, filled in for their country; then the payment. */
const pay = (ctx: FlowContext): Beat[] => {
  const p = ctx.params?.name ? ctx.params : STORY_PAY;
  const known = recipientNamed(p.name ?? '');
  if (known) return [{ react: '👍' }, ...sendTo(ctx, known, p)];
  const draft = draftRecipient(p.name ?? '', p.country ?? '');
  if (!draft) return [{ say: 'pay.where', params: { first: (p.name ?? '').split(' ')[0] } }];
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

/** The tile's send when nobody typed one: 50 USDC to an address that could be on any EVM chain, so it asks which. */
const STORY_CRYPTO: FlowParams = { address: '0x8C1d4bE27a9F3c05D6e1b2A4f7C9d0E3b5A6c2F1', amount: 50, asset: 'USDC' };

/**
 * Send crypto: what the address is, from its shape; the asset and network when it leaves them open; then a quote
 * and the send. A pasted fragment, or an address it can't send to, gets said so instead of guessed at.
 */
const crypto = (ctx: FlowContext): Beat[] => {
  const p = ctx.params ?? STORY_CRYPTO;
  const address = (p.address ?? '').trim();
  if (!address) return [{ react: '👍' }, { say: 'crypto.where' }];
  const kind = addressKind(address);
  if (kind === 'invalid') return [{ react: '👀' }, { say: 'crypto.invalid' }];
  if (kind === 'bitcoin') return [{ react: '👍' }, { say: 'crypto.onchain' }];
  const amount = cents(p.amount);
  if (amount === undefined) {
    return [
      { react: '👍' },
      { say: 'crypto.amount' },
      { amount: true, then: (usd) => crypto({ ...ctx, params: { ...p, amount: usd } }).slice(1) },
    ];
  }
  const networks = NETWORKS_FOR[kind];
  const short = shortAddress(address);

  const send = (asset: SendAsset, network: DepositNetwork): Beat[] => {
    const fee = NETWORK_FEE[network];
    const params: Params = { short, asset, network: NETWORK_NAME[network], sends: sendsLabel(asset, amount), usd: amount, fee, lightning: network === 'LIGHTNING' ? 1 : 0 };
    const { perTransaction } = ctx.account().limits;
    if (amount + fee > perTransaction) return [{ say: 'limit.over', params: { perTx: perTransaction } }];
    const go = (): Beat[] => {
      const sent = { ...params, balance: ctx.account().balanceCents };
      return [
        { emit: { type: 'crypto.execute' } },
        ...approvalOr(
          ctx,
          ctx.needsApproval(amount + fee),
          { key: 'crypto', params: sent },
          'pay.auto',
          [{ work: 'sending', ms: 1000 }, { card: 'receipt.crypto', params: sent }, { say: 'crypto.done', params: sent }],
          'pay.denied',
        ),
      ];
    };
    const toAdd = amount + fee - ctx.account().balanceCents;
    return [
      { work: 'quoting', ms: 1100 },
      { emit: { type: 'crypto.quote', payee: { address, network, asset, usd: amount, fee } } },
      { say: 'crypto.intro', params },
      ...(toAdd > 0 ? addShort({ ...ctx, held: 'that send' })(toAdd, go) : go()),
    ];
  };

  // Which network, when the address could be on more than one that takes this asset.
  const onNetwork = (asset: SendAsset): Beat[] => {
    const fits = networks.filter((n) => SENDS_ON[n].includes(asset));
    if (!fits.length) return [{ say: 'crypto.mismatch', params: { asset, network: NETWORK_NAME[networks[0]], takes: SENDS_ON[networks[0]].join(' or ') } }];
    if (p.network && fits.includes(p.network)) return send(asset, p.network);
    if (fits.length === 1) return send(asset, fits[0]);
    return [
      { say: 'crypto.network', params: { asset } },
      { chips: fits.map((n) => ({ label: NETWORK_NAME[n], glyph: 'coin' as const })), reply: true, then: (picked) => send(asset, fits[picked]) },
    ];
  };

  // Which asset, when the address takes more than one and they didn't say.
  const takes = networks.flatMap((n) => SENDS_ON[n]).filter((a, i, all) => all.indexOf(a) === i);
  const chosen = p.asset && takes.includes(p.asset) ? p.asset : takes.length === 1 ? takes[0] : undefined;
  if (p.asset && !takes.includes(p.asset)) {
    return [{ react: '👍' }, { say: 'crypto.mismatch', params: { asset: p.asset, network: NETWORK_NAME[networks[0]], takes: takes.join(' or ') } }];
  }
  if (chosen) return [{ react: '👍' }, ...onNetwork(chosen)];
  return [
    { react: '👍' },
    { say: 'crypto.asset' },
    { chips: takes.map((a) => ({ label: a, glyph: 'coin' as const })), reply: true, then: (picked) => onNetwork(takes[picked]) },
  ];
};

/** A subscription: the story's Duolingo Max, or the service someone named at its monthly price. */
function subscriptionFor(ctx: FlowContext): Purchase & { item: string } {
  const { merchant, price } = ctx.params ?? {};
  if (!merchant || !cents(price)) return SUBSCRIPTION;
  return { merchant, item: merchant, description: `${merchant}, monthly`, amount: cents(price)!, recurring: true };
}

/** What a checkout's Pay with reads: the balance, whether there's a choice (a card and a balance), and whether it covers it. */
const payParams = (ctx: FlowContext, price: number) => {
  const a = ctx.account();
  return { balance: a.balanceCents, saved: a.cardVaulted && a.balanceOn ? 1 : 0, enough: a.balanceCents >= price ? 1 : 0 };
};

/**
 * The checkout's Pay with, in an app that has one: the agent drops the card it asked for and comes back with a
 * checkout paid the new way, topping the balance up first if that's what was picked.
 */
const swapFor = (ctx: FlowContext, price: number, again: (onCard: boolean) => Beat[]) =>
  ctx.picksInCheckout && ctx.account().cardVaulted && ctx.account().balanceOn
    ? (to: PayTo): Beat[] => {
        const drop: Beat = { emit: { type: 'buy.withdraw' } };
        if (to !== 'topup') return [drop, ...again(to === 'card')];
        return [drop, ...fund({ ...ctx, params: { amount: shortOf(ctx, price) / 100 }, then: () => again(false) }).slice(1)];
      }
    : undefined;

const buy = (outer: FlowContext): Beat[] => {
  const ctx: FlowContext = { ...outer, held: outer.variant % 2 === 1 ? 'the subscription' : 'the order' };
  if (ctx.variant % 2 === 1) {
    const sub = subscriptionFor(ctx);
    const params = { item: sub.item, merchant: sub.merchant, amount: sub.amount };
    // Asked in the chat, the agent has already named it and its price.
    const intro: Beat[] = ctx.params?.merchant ? [] : [{ say: 'sub.intro', params }];
    return [
      ...intro,
      ...payWith(ctx, sub.amount, function checkout(onCard: boolean, short = false, again = false): Beat[] {
        const p = { ...params, card: onCard ? 1 : 0, short: short ? 1 : 0 };
        return [
          ...(again ? [] : [{ say: 'sub.card', params: p, join: true }]),
          { emit: { type: 'buy.request', purchase: { ...sub, byCard: onCard } } },
          // A recurring card always waits for the person.
          ...approvalOr(
            ctx,
            true,
            { key: 'sub', params: { ...p, ...payParams(ctx, sub.amount) }, swap: swapFor(ctx, sub.amount, (c) => checkout(c, false, true)) },
            'buy.auto',
            [
              { work: 'paying', ms: 1000 },
              { emit: { type: 'buy.checkout' } },
              { card: 'receipt.sub', params: p },
              { say: 'sub.done', params: p },
              { meta: 'sub.reminder' },
            ],
            'sub.denied',
          ),
        ];
      }),
    ];
  }
  const shelf = shelfFor(ctx.params?.query);
  // Something they named, it buys; three it found, it recommends one and they choose.
  const choose: Beat[] = shelf.named
    ? order(ctx, shelf)
    : [
        { say: 'buy.which' },
        {
          // What people call it ("Sonora Aura Max"), not the listing's full name.
          chips: shelf.options.map((o) => ({ label: o.model ? `${o.merchant} ${o.model}` : o.title })),
          reply: true,
          then: (picked) => order(ctx, shelfWith(shelf, picked)),
          onPage: (picked) => [{ say: 'buy.picked', params: { item: shelf.options[picked].title } }],
        },
      ];
  return [
    { react: '👍' },
    { work: 'searching', ms: 1800 },
    // Something named is the one thing it shows; three it found, it lines up to choose from.
    { say: shelf.named ? 'buy.found' : 'buy.intro', params: shelfParams(shelf) },
    { products: 'buy.options', params: { query: shelf.query, ...(shelf.named && { only: 1 }) } },
    ...choose,
  ];
};

/** Checking out what was chosen: what pays, then the card for it. Short of money with no card, it tops up first. */
function order(ctx: FlowContext, shelf: Shelf): Beat[] {
  const purchase = purchaseFor(shelf);
  const params = shelfParams(shelf);
  const spend = purchaseSpendLimit(purchase.amount);
  return [
    ...payWith(ctx, purchase.amount, function checkout(onCard: boolean, short = false, again = false): Beat[] {
      const p = { ...params, card: onCard ? 1 : 0, short: short ? 1 : 0, needs: ctx.needsApproval(spend) ? 1 : 0 };
      return [
        ...(again ? [] : [{ say: 'buy.card', params: p }]),
        { emit: { type: 'buy.request', purchase: { ...purchase, byCard: onCard } } },
        { work: 'filling', ms: again ? 700 : 1300 },
        ...approvalOr(
          ctx,
          ctx.needsApproval(spend),
          { key: 'buy', params: { ...p, ...payParams(ctx, purchase.amount) }, swap: swapFor(ctx, purchase.amount, (c) => checkout(c, false, true)) },
          'buy.auto',
          [
            { work: 'paying', ms: 1100 },
            { emit: { type: 'buy.checkout' } },
            { card: 'receipt.buy', params: p },
            { say: 'buy.done' },
            { meta: 'buy.tracking' },
          ],
          'buy.denied',
        ),
      ];
    }),
  ];
}

/** A stay booked by paying the hotel's own agent: the tile's Hotel Alma, or wherever and whenever someone asked. */
const agent = (ctx: FlowContext): Beat[] => {
  const stay = stayFor(ctx.params);
  const to = merchantFor(stay);
  const params = stayParams(stay);
  const booked = ctx.account().ledger.some((l) => l.title === to.name && l.detail === to.description && l.status === 'COMPLETED');
  if (booked) return [{ react: '👍' }, { say: 'agent.already', params }];
  const pay = (): Beat[] => [
    { emit: { type: 'agent.execute' } },
    ...approvalOr(
      ctx,
      ctx.needsApproval(stay.amount),
      { key: 'agent', params },
      'agent.auto',
      [{ card: 'receipt.agent', params }, { say: 'agent.done', params }],
      'agent.denied',
      params,
    ),
  ];
  // The hotel's agent quotes first; only then is what's short added.
  return [
    { react: '👍' },
    { subagent: 'hotel', ms: 4200, params: { ...params, approve: ctx.account().limits.approvalAbove } },
    { emit: { type: 'agent.quote', to } },
    { say: 'agent.intro', params },
    ...(shortOf(ctx, stay.amount) > 0 ? addShort({ ...ctx, held: `booking ${stay.hotel}` })(shortOf(ctx, stay.amount), pay) : pay()),
  ];
};

/** Who's paying: Lucía's invoice from the tile, or whoever they named, for what they said, with an invoice of its own. */
function payerFor(p?: FlowParams) {
  const name = p?.name?.trim();
  if (!name) return { payer: LUCIA.name, first: LUCIA.first, amount: LUCIA.amount, invoice: LUCIA.invoice };
  return { payer: name, first: name.split(' ')[0], amount: cents(p?.amount) ?? LUCIA.amount, invoice: `INV-${String(43 + (hash(name) % 900)).padStart(4, '0')}` };
}

const getpaid = (ctx: FlowContext): Beat[] => {
  const who = payerFor(ctx.params);
  if (paid(ctx, who.payer)) return [{ react: '👍' }, { say: 'getpaid.already', params: who }];
  return [
    { react: '‼️' },
    { say: 'getpaid.ask', params: who },
    {
      chips: LUCIA.options.map((o) => ({ label: o.label, glyph: cryptoGlyph(o.network) })),
      reply: true,
      then: (i) => {
        const o = LUCIA.options[i];
        const params = { ...who, method: o.label, network: o.network };
        return [
          { emit: { type: 'getpaid.address', network: o.network, currency: o.currency } },
          { say: 'getpaid.address', params },
          { card: 'receive', params },
          { work: 'watching', ms: 2200 },
          { emit: { type: 'getpaid.received', from: who.payer, amount: who.amount } },
          { when: () => [{ card: 'receipt.getpaid', params }, { say: 'getpaid.done', params: { ...params, balance: ctx.account().balanceCents } }] },
        ];
      },
    },
  ];
};

/** Withdraw goes to the person's own bank: the one they linked, or one they link now in the app's own sheet. */
const cashout = (ctx: FlowContext): Beat[] => {
  const balance = ctx.account().balanceCents;
  const amount = cents(ctx.params?.amount);
  if (balance <= 0) return [{ react: '👍' }, { say: 'cashout.empty' }];
  if (amount === undefined) {
    return [
      { react: '👍' },
      { say: 'cashout.amount' },
      { amount: true, all: balance, then: (usd) => cashout({ ...ctx, params: { ...ctx.params, amount: usd } }).slice(1) },
    ];
  }
  if (amount > balance) return [{ react: '👍' }, { say: 'cashout.over', params: { balance } }];
  const send = (): Beat[] => {
    const bank = linkedBank();
    const local = Math.round(amount * bank.country.usdToLocal);
    const rail = bank.country.rail;
    const p: Payee = { name: `${bank.bankName} •••• ${bank.last4}`, currency: bank.currency, amount: local, usd: amount, rail: rail.toUpperCase().replace(/ /g, '_'), bank: bank.bankName };
    const params = { local: formatMoney(local, bank.currency), to: p.name, rail, usd: amount, flag: bank.country.code, bank: bank.bankName, balance };
    return [
      { work: 'quoting', ms: 1000 },
      { emit: { type: 'cashout.quote', payee: p } },
      { say: 'cashout.quote', params },
      { emit: { type: 'cashout.execute' } },
      ...approvalOr(
        ctx,
        ctx.needsApproval(amount),
        { key: 'cashout', params },
        'cashout.auto',
        [{ work: 'sending', ms: 900 }, { card: 'receipt.cashout', params }, { say: 'cashout.done' }],
        'cashout.denied',
      ),
    ];
  };
  if (ctx.account().bankLinked) return [{ react: '👍' }, { when: send }];
  return [{ react: '👍' }, ...linkOwnBank('cashout.bank', [{ say: 'bank.kept' }, { when: send }], [holdOr({ ...ctx, held: 'the withdrawal' }, { say: 'bank.denied' })])];
};

/** No balance yet: says so rather than turning one on to show $0. With a card, it offers the balance; without, either. */
const balance = (ctx: FlowContext): Beat[] => {
  const a = ctx.account();
  if (a.balanceOn) return balanceShown(ctx);
  if (a.cardVaulted) return [{ react: '👍' }, { say: 'balance.none', params: { card: 1 } }, ...offerBalance(ctx).slice(1)];
  return [
    { react: '👍' },
    { say: 'balance.none', params: { card: 0 } },
    {
      chips: [
        { label: 'Set up a balance', glyph: 'wallet' },
        { label: 'Add a card', glyph: 'card' },
      ],
      reply: true,
      then: (picked) =>
        (picked === 0 ? connect(ctx) : card(ctx)).filter((b) => !('react' in b) && !('say' in b && b.say === 'connect.intro')),
    },
  ];
};

const balanceShown = (ctx: FlowContext): Beat[] => [
  { work: 'checking', ms: 700 },
  { emit: { type: 'account.overview' } },
  {
    when: () => {
      const params = balanceParams(ctx);
      return [{ say: 'balance.answer', params }, { card: 'balance', params }];
    },
  },
];

/** Nothing has moved yet: it says so, rather than setting anything up to show an empty list. */
const history = (ctx: FlowContext): Beat[] =>
  ctx.account().ledger.length ? historyShown(ctx) : [{ react: '👍' }, { say: 'history.none' }];

const historyShown = (ctx: FlowContext): Beat[] => [
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
  card,
  bank,
  fund,
  limits,
  pay,
  crypto,
  buy,
  agent,
  getpaid,
  cashout,
  balance,
  history,
};

/**
 * A request from the chat, as the product would handle it: what can't happen anyway is said first; no account
 * yet, the agent asks for one, with the task named so a no puts it on hold; then the task itself, which tops up
 * exactly what's short once it knows the price. Each step only carries on once it's done.
 */
export function planFor(flow: ActionId, ctx: FlowContext): Beat[] {
  const a = ctx.account();
  // Things that can't happen anyway are said before any setup or top-up: over the per-payment limit, or nothing to move.
  const spend = flowSpend(flow, ctx.params, ctx.variant);
  if (OVER_LIMIT[flow] && spend > a.limits.perTransaction) return [{ react: '👍' }, { say: 'limit.over', params: { perTx: a.limits.perTransaction } }];
  if (flow === 'cashout' && a.balanceOn && a.balanceCents <= 0) return [{ react: '👍' }, { say: 'cashout.empty' }];
  if (flow === 'cashout' && !a.balanceOn) return [{ react: '👍' }, { say: 'cashout.noBalance' }];
  // An address it can't send to (or can't send that asset to) is said before setting anything up for it.
  if (flow === 'crypto' && ctx.params?.address && !canSend(ctx.params.address, ctx.params.asset)) return FLOWS.crypto(ctx);
  if (flow === 'balance' && !a.balanceOn) return balance(ctx);
  if (needsSetup(flow, a)) {
    const task = () => FLOWS[flow](ctx).filter((b) => !('react' in b));
    return connect({ ...ctx, then: task, held: HELD[flow]?.(ctx.params) });
  }
  // Asked for directly, the agent's reply already says it's setting up.
  if (flow === 'connect') return connect(ctx).filter((b) => !('say' in b && b.say === 'connect.self'));
  return FLOWS[flow](ctx);
}

/** Flows whose one payment the per-payment limit caps, checked before anything else happens. */
const OVER_LIMIT: Partial<Record<ActionId, boolean>> = { pay: true, crypto: true, buy: true, agent: true, cashout: true };

/** What a run is about, for an app that labels it (Duet's eyebrow): who's paid, the hotel, the invoice, or the flow. */
const TOPIC: Partial<Record<ActionId, (ctx: FlowContext) => string>> = {
  connect: () => 'Set up a balance',
  pay: (ctx) => `Pay ${((ctx.params?.name ? ctx.params : STORY_PAY).name ?? '').split(' ')[0]}`,
  crypto: (ctx) => {
    const address = (ctx.params ?? STORY_CRYPTO).address;
    return address ? `Send to ${shortAddress(address)}` : 'Send crypto';
  },
  agent: (ctx) => stayFor(ctx.params).hotel,
  getpaid: (ctx) => `${payerFor(ctx.params).first}’s invoice`,
  buy: (ctx) => (ctx.variant % 2 === 1 ? subscriptionFor(ctx).merchant : 'Buy online'),
};
export const topicFor = (flow: ActionId, ctx: FlowContext) => TOPIC[flow]?.(ctx) ?? actionLabel(flow);

/** What a setup on the way to a task is for, so a no to it says what's on hold. */
const HELD: Partial<Record<ActionId, (p?: FlowParams) => string>> = {
  pay: (p) => `paying ${((p?.name ? p : STORY_PAY).name ?? '').split(' ')[0]}`,
  crypto: () => 'that send',
  agent: (p) => `booking ${stayFor(p).hotel}`,
  fund: () => 'adding money',
  getpaid: () => 'the invoice',
  bank: () => 'linking your bank',
};

/** The most a run spends (USD cents), so a jump to it can top the balance up first. */
export function flowSpend(flow: ActionId, params?: FlowParams, variant = 0): number {
  switch (flow) {
    case 'pay': {
      const p = params?.name ? params : STORY_PAY;
      const r = recipientNamed(p.name ?? '') ?? draftRecipient(p.name ?? '', p.country ?? '');
      return r ? payeeFor(r, p.amount ?? 0, p.currency ?? 'USD').usd : 0;
    }
    case 'crypto':
      return cents((params ?? STORY_CRYPTO).amount) ?? 0;
    case 'buy':
      return variant % 2 === 1 ? (cents(params?.price) ?? SUBSCRIPTION.amount) : purchaseSpendLimit(shelfFor(params?.query).pick.amount);
    case 'agent':
      return stayFor(params).amount;
    case 'cashout':
      return cents(params?.amount) ?? CASHOUT_AMOUNT;
    case 'connect':
    case 'card':
    case 'bank':
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

/** Flows that only need the agent, not a balance: a card-only account can use them as it is. */
const AGENT_ONLY = new Set<ActionId>(['limits', 'balance']);

/** Whether a flow has to set the account up first: the agent for some, the agent and its balance for the rest. */
export const needsSetup = (flow: ActionId, a: AccountSnapshot) => NEEDS_CONNECTION[flow] && (AGENT_ONLY.has(flow) ? !a.connected : !a.balanceOn);

/** Flows that need the agent with its balance. Connect and a card set it up themselves; a purchase works out what
 *  pays at checkout (the card when there's no balance); History just says when nothing has moved. */
const NEEDS_CONNECTION: Record<ActionId, boolean> = {
  connect: false,
  card: false,
  bank: true,
  fund: true,
  limits: true,
  pay: true,
  crypto: true,
  buy: false,
  agent: true,
  getpaid: true,
  cashout: true,
  balance: true,
  history: false,
};
