import type { AgentAsk, AgentBalance, AgentMeta, AgentNote, Params, Product, SubAgent } from '../conversation';
import { ADDRESS, BUY_OPTIONS, HOTEL, LUCIA, PERSON, RING_LIGHT, SOFIA, SUBSCRIPTION, usd, usd2 } from '../story';

/* The neutral voice: every line, ask and note a flow can produce, written so
   it reads right in any app. Each app's voice overrides what it says
   differently (voices/apps.ts). */

const n = (p: Params | undefined, k: string) => Number(p?.[k] ?? 0);
const s = (p: Params | undefined, k: string) => String(p?.[k] ?? '');

export type LineFn = (p?: Params) => string;
export type AskFn = (p?: Params) => AgentAsk;
export type NoteFn = (p?: Params) => AgentNote;

/** What the agent is doing while it works: Grok's status row, Muse's header subtitle. */
export const STATUS = {
  searching: () => 'Searching stores',
  filling: () => 'Filling the checkout form',
  paying: () => 'Paying for the order',
  quoting: () => 'Getting a quote',
  sending: () => 'Sending the payment',
  setup: (p) => `Setting up ${s(p, 'wallet')}`,
  checking: (p) => `Checking ${s(p, 'wallet')}`,
  talking: () => `Talking to ${HOTEL.name}’s agent`,
  watching: () => 'Waiting for the payment',
  adding: () => 'Adding money',
} satisfies Record<string, LineFn>;

export type StatusKey = keyof typeof STATUS;

export const PRODUCTS = {
  'buy.options': () => BUY_OPTIONS,
} satisfies Record<string, () => Product[]>;

export type ProductsKey = keyof typeof PRODUCTS;

export const SUBAGENTS = {
  hotel: (p) => ({
    name: `${HOTEL.name}’s agent`,
    initial: HOTEL.name[0],
    working: `Talking to ${HOTEL.name}’s agent`,
    done: `Got a direct rate from ${HOTEL.name}’s agent`,
    steps: [
      { title: `Found ${HOTEL.name}’s agent`, detail: 'The hotel takes bookings from agents directly, account to account.' },
      { title: 'Asked for June 12 to 14, two guests', detail: `It quoted ${usd(HOTEL.listed)} for the two nights, breakfast included.` },
      { title: 'Asked about paying directly', detail: `Skipping the card fee takes 10% off: ${usd2(HOTEL.amount)}.` },
      {
        title: 'Checked it against your limits',
        detail: `${usd2(HOTEL.amount)} is over the ${usd(n(p, 'approve'))} I can spend alone, so it goes to you to approve.`,
      },
    ],
    messages: [
      { from: 'us', text: `Hi, booking for ${PERSON.full}: June 12 to 14, two guests. What’s your best rate?` },
      { from: 'them', text: `${usd(HOTEL.listed)} for the two nights, breakfast included.` },
      { from: 'us', text: 'Can we pay you directly instead of by card?' },
      { from: 'them', text: `Pay me directly and I’ll take 10% off: ${usd2(HOTEL.amount)}.` },
      { from: 'us', text: `Deal. I’ll send it as soon as ${PERSON.first} approves.` },
    ],
  }),
} satisfies Record<string, (p?: Params) => SubAgent>;

export type SubAgentKey = keyof typeof SUBAGENTS;

export const METAS = {
  'buy.tracking': () => ({ text: 'Created routine · Track the delivery', icon: 'routine' }),
  'sub.reminder': () => ({ text: 'Created routine · Remind me before it renews', icon: 'routine' }),
  'connect.limits': () => ({ text: 'Limits saved', icon: 'check' }),
  'card.saved': () => ({ text: 'Visa •••• 4242 saved to your vault', icon: 'check' }),
} satisfies Record<string, (p?: Params) => AgentMeta>;

export type MetaKey = keyof typeof METAS;

export const LINES = {
  greeting: () => `Hi ${PERSON.first}. I can pay, buy and get paid for you, within limits you set. What do you need?`,
  fallback: () => 'I can only help with your account here. Try one of the flows on the left.',
  limited: () => 'Let’s keep going with the flows on the left. I’ve hit my chat limit for now.',

  'connect.intro': () => 'I’ll need my own account for that, with limits you set. Here’s what I’m asking for.',
  'connect.done': () => 'Connected. I have my own account now, and I can only spend what you put in it.',
  'connect.denied': () => 'No problem. I won’t touch money until you connect me.',

  'fund.ask': () => 'How do you want to add it?',
  'fund.address': (p) => `Here’s your ${s(p, 'method')} ${s(p, 'method') === 'Lightning' ? 'invoice' : 'address'}. Whatever you send lands as dollars.`,
  'fund.done': (p) => `${usd(n(p, 'amount'))} landed. You have ${usd2(n(p, 'balance'))} now.`,
  'fund.card': (p) => `Adding ${usd(n(p, 'amount'))} from your Visa •••• 4242.`,
  'card.intro': (p) => `Add your card once and it stays in your ${s(p, 'wallet')} vault. I only ever see a card id, never the number.`,
  'card.denied': () => 'Okay, no card for now. You can add one any time.',

  'limits.intro': () => 'I can’t change my own limits, so I sent it to you to confirm.',
  'limits.done': (p) => `Done. I’ll handle anything up to ${usd(n(p, 'approve'))} and ask you above it.`,
  'limits.denied': () => 'Okay, your limits stay as they are.',

  'pay.intro': () => `${SOFIA.first} banks with ${SOFIA.bank}, so I’ll send it over PIX. ${SOFIA.local.replace('.00', '')} is ${usd2(SOFIA.usd)} right now.`,
  'pay.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'pay.done': () => `Sent. ${SOFIA.first} has it, and I told her it’s from you.`,
  'pay.denied': () => 'Okay, I won’t send it.',

  'buy.intro': () => `Found three that fit. The ${RING_LIGHT.merchant} RP10-H is the best of them, ${usd2(RING_LIGHT.amount)} with standard shipping.`,
  'buy.card': () => `I’ll get a one-time card for exactly this order, so ${RING_LIGHT.merchant} never sees your real card.`,
  'buy.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m checking out.`,
  'buy.done': () => 'Ordered. It arrives Thursday, and the card closed itself after the charge.',
  'buy.denied': () => 'Okay, I won’t place the order. Nothing was charged.',

  'sub.intro': () => `${SUBSCRIPTION.item} is ${usd2(SUBSCRIPTION.amount)} a month.`,
  'sub.card': () => `I’ll get a card that only ${SUBSCRIPTION.merchant} can charge, up to ${usd2(SUBSCRIPTION.amount)} a month.`,
  'sub.done': () => `You’re subscribed. The card is locked to ${SUBSCRIPTION.merchant} now, so nobody else can use it.`,
  'sub.denied': () => 'Okay, no subscription.',

  'agent.intro': () =>
    `${HOTEL.name}’s agent quoted ${usd(HOTEL.listed)} for the two nights, or ${usd2(HOTEL.amount)} if we pay directly. I took the direct rate.`,
  'agent.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m paying now.`,
  'agent.done': () => 'Booked. The confirmation is in your inbox.',
  'agent.denied': () => `Okay, I won’t book it. I told ${HOTEL.name}’s agent we’ll pass.`,

  'getpaid.ask': () => `How does ${LUCIA.first} want to pay?`,
  'getpaid.address': (p) =>
    `Here’s where she can send it. I sent it to ${LUCIA.first} with invoice ${LUCIA.invoice}${s(p, 'method') ? ` (${s(p, 'method')})` : ''}.`,
  'getpaid.done': (p) => `${LUCIA.first} paid ${usd2(LUCIA.amount)}. You have ${usd2(n(p, 'balance'))} now.`,

  'cashout.ask': () => 'Where should it go?',
  'cashout.quote': (p) => `${s(p, 'local')} to ${s(p, 'to')}, arriving in seconds over ${s(p, 'rail')}.`,
  'cashout.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'cashout.done': () => 'Done. It’s in your account.',
  'cashout.denied': () => 'Okay, the money stays put.',

  'balance.answer': (p) => `You have ${usd2(n(p, 'balance'))}. Here’s where things stand.`,
  'history.answer': () => 'Here’s what moved recently.',
} satisfies Record<string, LineFn>;

export type LineKey = keyof typeof LINES;

const limitsRows = (p?: Params): AgentAsk['rows'] => [
  { text: `Acts alone up to ${usd(n(p, 'approve'))}`, sub: `Was ${usd(n(p, 'fromApprove'))}`, icon: 'lock' },
  { text: `${usd(n(p, 'daily'))} a day`, sub: `Was ${usd(n(p, 'fromDaily'))}`, icon: 'gauge' },
  { text: `${usd(n(p, 'perTx'))} a payment`, sub: `Was ${usd(n(p, 'fromPerTx'))}`, icon: 'gauge' },
];

export const ASKS = {
  connect: (p) => ({
    title: `${s(p, 'agent')} wants its own account`,
    badge: 'L',
    rows: [
      { text: 'Its own balance', sub: 'Funded by you, separate from your bank', icon: 'wallet' },
      { text: `Up to ${usd(n(p, 'perTx'))} a payment`, sub: `${usd(n(p, 'daily'))} a day`, icon: 'gauge' },
      { text: `Asks you above ${usd(n(p, 'approve'))}`, sub: 'Face ID to approve', icon: 'lock' },
    ],
    allow: 'Connect',
    allowed: 'Connected',
    deny: 'Not now',
    denied: 'Not now',
  }),
  limits: (p) => ({
    title: `Update ${s(p, 'agent')}’s limits`,
    badge: 'L',
    rows: limitsRows(p),
    allow: 'Save',
    allowed: 'Saved',
    deny: 'Cancel',
    denied: 'Canceled',
  }),
  vault: () => ({
    title: 'Add your card',
    rows: [
      { text: 'Card number', sub: '•••• •••• •••• 4242', icon: 'card' },
      { text: 'Expires', sub: '09 / 29', icon: 'card' },
      { text: 'Billing ZIP', sub: '90405', icon: 'lock' },
    ],
    card: { brand: 'VISA', last4: '4242', expires: '09/29', name: PERSON.full },
    allow: 'Save card',
    allowed: 'Card saved',
    deny: 'Not now',
    denied: 'Not now',
  }),
  pay: (p) => ({
    title: `Send ${SOFIA.local} to ${SOFIA.first}`,
    who: { name: SOFIA.name, flag: SOFIA.flag, detail: `${SOFIA.local} to ${SOFIA.bank} via PIX` },
    amount: SOFIA.local,
    method: `From ${s(p, 'wallet')} · ${usd2(SOFIA.usd)}`,
    allow: 'Approve',
    allowed: 'Paid',
    deny: 'Decline',
    denied: 'Declined',
  }),
  cashout: (p) => ({
    title: `Move ${s(p, 'local')} to ${s(p, 'to')}`,
    who: { name: s(p, 'to'), flag: s(p, 'flag') || undefined, detail: `${s(p, 'local')} over ${s(p, 'rail')}` },
    amount: s(p, 'local'),
    method: `From ${s(p, 'wallet')} · ${usd2(n(p, 'usd'))}`,
    allow: 'Approve',
    allowed: 'Sent',
    deny: 'Decline',
    denied: 'Declined',
  }),
  buy: (p) => ({
    title: `Buy at ${RING_LIGHT.merchant}`,
    who: { name: RING_LIGHT.merchant, icon: RING_LIGHT.image, detail: `${RING_LIGHT.item} · one-time card` },
    amount: usd2(RING_LIGHT.amount),
    method: `From ${s(p, 'wallet')} · one-time card`,
    allow: 'Approve',
    allowed: 'Approved',
    deny: 'Decline',
    denied: 'Declined',
  }),
  sub: (p) => ({
    title: `Subscribe to ${SUBSCRIPTION.item}`,
    who: { name: SUBSCRIPTION.merchant, detail: `Up to ${usd2(SUBSCRIPTION.amount)} a month · card locked to ${SUBSCRIPTION.merchant}` },
    amount: `${usd2(SUBSCRIPTION.amount)}/mo`,
    method: `From ${s(p, 'wallet')} · card only ${SUBSCRIPTION.merchant} can charge`,
    allow: 'Approve',
    allowed: 'Approved',
    deny: 'Decline',
    denied: 'Declined',
  }),
  agent: () => ({
    title: `Pay ${HOTEL.name}’s agent`,
    who: { name: HOTEL.name, detail: `2 nights, ${HOTEL.nights}` },
    amount: usd2(HOTEL.amount),
    method: `Account to account · you save ${usd2(HOTEL.listed - HOTEL.amount)}`,
    allow: 'Approve',
    allowed: 'Paid',
    deny: 'Decline',
    denied: 'Declined',
  }),
} satisfies Record<string, AskFn>;

export type AskKey = keyof typeof ASKS;

/** The balance card's numbers, from a flow's params. */
function balanceOf(p: Params | undefined, note: string): AgentBalance {
  const daily = n(p, 'daily');
  const spent = n(p, 'spent');
  const wallet = s(p, 'wallet');
  return {
    wallet: wallet.charAt(0).toUpperCase() + wallet.slice(1),
    amount: usd2(n(p, 'balance')),
    note,
    spent: { today: usd2(spent), limit: usd(daily), ratio: daily > 0 ? Math.min(1, spent / daily) : 0 },
    stats: [
      { label: 'Left today', value: usd2(Math.max(0, daily - spent)) },
      { label: 'Per payment', value: usd(n(p, 'perTx')) },
      { label: 'Asks above', value: usd(n(p, 'approve')) },
    ],
    activity: JSON.parse(s(p, 'rows') || '[]'),
  };
}

export const NOTES = {
  'account.ready': (p) => ({
    title: `${s(p, 'wallet')} is on`,
    lines: [`Balance ${usd2(n(p, 'balance'))}`],
    done: true,
    balance: balanceOf(p, 'Ready to spend'),
  }),
  deposit: (p) => {
    const lightning = s(p, 'network') === 'LIGHTNING';
    return {
      title: s(p, 'method'),
      code: lightning ? 'lnbc1pn5x9…q7mxt0' : s(p, 'network') === 'BASE' ? '0x4f2a…9c1e' : 'TQ8v…rN2k',
      lines: lightning ? [`${usd2(n(p, 'amount'))} · expires in 10 min`] : [`Send ${s(p, 'currency')} only`, 'This address never expires'],
    };
  },
  receive: (p) => ({
    title: `Pay ${PERSON.full}`,
    code: s(p, 'network') === 'LIGHTNING' ? 'lnbc4682…h3kq9z' : '0x4f2a…9c1e',
    lines: [`${usd2(LUCIA.amount)} · ${LUCIA.invoice}`, s(p, 'method')],
  }),
  quote: (p) => ({
    title: `${s(p, 'local')} to ${s(p, 'to')}`,
    lines: [`${usd2(n(p, 'usd'))} from ${s(p, 'wallet')} · fee ${usd2(n(p, 'fee'))}`, 'Quote expires in 5 min'],
  }),
  'receipt.pay': (p) => ({
    title: `${SOFIA.local} to ${SOFIA.name}`,
    lines: [`${SOFIA.bank} · PIX`, `${usd2(SOFIA.usd)} from ${s(p, 'wallet')}`],
    done: true,
  }),
  'receipt.cashout': (p) => ({
    title: `${s(p, 'local')} to ${s(p, 'to')}`,
    lines: [s(p, 'rail'), `${usd2(n(p, 'usd'))} from ${s(p, 'wallet')}`],
    done: true,
  }),
  'receipt.buy': () => ({
    title: `${usd2(RING_LIGHT.amount)} at ${RING_LIGHT.merchant}`,
    lines: ['One-time Visa · closed after the charge'],
    done: true,
  }),
  'receipt.sub': () => ({
    title: `${usd2(SUBSCRIPTION.amount)} at ${SUBSCRIPTION.merchant}`,
    lines: ['Recurring Visa · renews monthly, only for Duolingo'],
    done: true,
  }),
  'receipt.agent': () => ({
    title: `Settled, instant and final · ${usd2(HOTEL.amount)}`,
    lines: [`To ${HOTEL.name}’s account`, `Saved ${usd2(HOTEL.listed - HOTEL.amount)} by skipping the card`],
    done: true,
  }),
  'receipt.getpaid': () => ({
    title: `${usd2(LUCIA.amount)} from ${LUCIA.name}`,
    lines: [`${LUCIA.invoice} · paid`],
    done: true,
  }),
  balance: (p) => ({
    title: usd2(n(p, 'balance')),
    lines: [
      `Left to spend today · ${usd2(n(p, 'leftToday'))}`,
      `Up to ${usd(n(p, 'perTx'))} a payment`,
      `Asks you above ${usd(n(p, 'approve'))}`,
    ],
    balance: balanceOf(p, 'Available to spend'),
  }),
  history: (p) => ({
    title: 'Recent activity',
    lines: [],
    rows: JSON.parse(s(p, 'rows') || '[]'),
  }),
} satisfies Record<string, NoteFn>;

export type NoteKey = keyof typeof NOTES;

/** Muse's order sheet for the ring light. */
export const MUSE_ORDER = (balance: number): AgentAsk => ({
  title: `The agent wants to place an order at ${RING_LIGHT.merchant}`,
  badge: 'N',
  rows: [
    { text: RING_LIGHT.item, sub: 'Qty: 1', image: RING_LIGHT.image },
    { text: 'Standard by 2 to 5 business days', sub: ADDRESS, icon: 'truck' },
    { text: PERSON.email, sub: PERSON.phone, icon: 'envelope' },
    { text: 'Muse balance', sub: 'Pay with Muse balance', icon: 'meta' },
  ],
  total: usd2(RING_LIGHT.amount),
  method: `${usd2(balance)} available`,
  legal: RING_LIGHT.merchant,
  allow: 'Allow',
  allowed: 'Allowed',
  deny: 'Deny',
  denied: 'Denied',
});
