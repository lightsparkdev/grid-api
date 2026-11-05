import type { AgentAsk, AgentNote, Params } from '../conversation';
import { ADDRESS, HOTEL, LUCIA, PERSON, RING_LIGHT, SOFIA, SUBSCRIPTION, usd, usd2 } from '../story';

/* The neutral voice: every line, ask and note a flow can produce, written so
   it reads right in any app. Each app's voice overrides what it says
   differently (voices/apps.ts). */

const n = (p: Params | undefined, k: string) => Number(p?.[k] ?? 0);
const s = (p: Params | undefined, k: string) => String(p?.[k] ?? '');

export type LineFn = (p?: Params) => string;
export type AskFn = (p?: Params) => AgentAsk;
export type NoteFn = (p?: Params) => AgentNote;

export const LINES = {
  greeting: () => `Hi ${PERSON.first}. I can pay, buy and get paid for you, within limits you set. What do you need?`,
  fallback: () => 'I can only help with your account here. Try one of the flows on the left.',

  'connect.intro': () => 'I’ll need my own account for that, with limits you set. Here’s what I’m asking for.',
  'connect.done': () => 'Connected. I have my own account now, and I can only spend what you put in it.',
  'connect.denied': () => 'No problem. I won’t touch money until you connect me.',

  'fund.ask': () => 'How do you want to add it?',
  'fund.address': (p) => `Here’s your ${s(p, 'method')} ${s(p, 'method') === 'Lightning' ? 'invoice' : 'address'}. Whatever you send lands as dollars.`,
  'fund.done': (p) => `${usd(n(p, 'amount'))} landed. You have ${usd2(n(p, 'balance'))} now.`,

  'limits.intro': () => 'I can’t change my own limits, so I sent it to you to confirm.',
  'limits.done': (p) => `Done. I’ll handle anything up to ${usd(n(p, 'approve'))} and ask you above it.`,
  'limits.denied': () => 'Okay, your limits stay as they are.',

  'pay.intro': () => `${SOFIA.first} banks with ${SOFIA.bank}, so I’ll send it over PIX. ${SOFIA.local.replace('.00', '')} is ${usd2(SOFIA.usd)} right now.`,
  'pay.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'pay.done': () => `Sent. ${SOFIA.first} has it, and I told her it’s from you.`,
  'pay.denied': () => 'Okay, I won’t send it.',

  'buy.intro': () => `Found it at ${RING_LIGHT.merchant}: the RP10-H, ${usd2(RING_LIGHT.amount)} with standard shipping.`,
  'buy.card': () => `I’ll get a one-time card for exactly this order, so ${RING_LIGHT.merchant} never sees your real card.`,
  'buy.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m checking out.`,
  'buy.done': () => 'Ordered. It arrives Thursday, and the card closed itself after the charge.',
  'buy.denied': () => 'Okay, I won’t place the order. Nothing was charged.',

  'sub.intro': () => `${SUBSCRIPTION.item} is ${usd2(SUBSCRIPTION.amount)} a month.`,
  'sub.card': () => `I’ll get a card that only ${SUBSCRIPTION.merchant} can charge, up to ${usd2(SUBSCRIPTION.amount)} a month.`,
  'sub.done': () => `You’re subscribed. The card is locked to ${SUBSCRIPTION.merchant} now, so nobody else can use it.`,
  'sub.denied': () => 'Okay, no subscription.',

  'agent.intro': () => `${HOTEL.name}’s agent quoted ${usd(HOTEL.listed)} for the two nights.`,
  'agent.offer': () => 'Pay me directly, get 10% off.',
  'agent.accept': () => 'Deal. Paying directly.',
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
  pay: () => ({
    title: `Send ${SOFIA.local} to ${SOFIA.first}`,
    who: { name: SOFIA.name, flag: SOFIA.flag, detail: `${SOFIA.local} to ${SOFIA.bank} via PIX` },
    amount: SOFIA.local,
    method: `From your balance · ${usd2(SOFIA.usd)}`,
    allow: 'Approve',
    allowed: 'Paid',
    deny: 'Decline',
    denied: 'Declined',
  }),
  cashout: (p) => ({
    title: `Move ${s(p, 'local')} to ${s(p, 'to')}`,
    who: { name: s(p, 'to'), flag: s(p, 'flag') || undefined, detail: `${s(p, 'local')} over ${s(p, 'rail')}` },
    amount: s(p, 'local'),
    method: `From your balance · ${usd2(n(p, 'usd'))}`,
    allow: 'Approve',
    allowed: 'Sent',
    deny: 'Decline',
    denied: 'Declined',
  }),
  buy: () => ({
    title: `Buy at ${RING_LIGHT.merchant}`,
    who: { name: RING_LIGHT.merchant, detail: `${RING_LIGHT.item} · one-time card` },
    amount: usd2(RING_LIGHT.amount),
    method: 'One-time Visa · closes after one charge',
    allow: 'Approve',
    allowed: 'Approved',
    deny: 'Decline',
    denied: 'Declined',
  }),
  sub: () => ({
    title: `Subscribe to ${SUBSCRIPTION.item}`,
    who: { name: SUBSCRIPTION.merchant, detail: `Up to ${usd2(SUBSCRIPTION.amount)} a month · card locked to ${SUBSCRIPTION.merchant}` },
    amount: `${usd2(SUBSCRIPTION.amount)}/mo`,
    method: 'Recurring Visa · only Duolingo can charge it',
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

export const NOTES = {
  'account.ready': (p) => ({
    title: 'Account ready',
    lines: [`${s(p, 'agent')} · •••• 4417`, `Balance ${usd2(n(p, 'balance'))}`],
    done: true,
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
    lines: [`${usd2(n(p, 'usd'))} from your balance · fee ${usd2(n(p, 'fee'))}`, 'Quote expires in 5 min'],
  }),
  'receipt.pay': () => ({
    title: `${SOFIA.local} to ${SOFIA.name}`,
    lines: [`${SOFIA.bank} · PIX`, `${usd2(SOFIA.usd)} from your balance`],
    done: true,
  }),
  'receipt.cashout': (p) => ({
    title: `${s(p, 'local')} to ${s(p, 'to')}`,
    lines: [s(p, 'rail'), `${usd2(n(p, 'usd'))} from your balance`],
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
  }),
  history: (p) => ({
    title: 'Recent activity',
    lines: [],
    rows: JSON.parse(s(p, 'rows') || '[]'),
  }),
} satisfies Record<string, NoteFn>;

export type NoteKey = keyof typeof NOTES;

/** Meta Pay's order sheet for the ring light, shared by Muse's voice. */
export const MUSE_ORDER = (balance: number): AgentAsk => ({
  title: `The agent wants to place an order at ${RING_LIGHT.merchant}`,
  badge: 'N',
  rows: [
    { text: RING_LIGHT.item, sub: 'Qty: 1', image: RING_LIGHT.image },
    { text: 'Standard by 2 to 5 business days', sub: ADDRESS, icon: 'truck' },
    { text: PERSON.email, sub: PERSON.phone, icon: 'envelope' },
    { text: 'Meta Pay balance', sub: 'Pay with Meta Pay', icon: 'meta' },
  ],
  total: usd2(RING_LIGHT.amount),
  method: `${usd2(balance)} available`,
  legal: RING_LIGHT.merchant,
  allow: 'Allow',
  allowed: 'Allowed',
  deny: 'Deny',
  denied: 'Denied',
});
