import type { AgentAsk, AgentBalance, AgentMeta, AgentNote, Params, Product, SubAgent } from '../conversation';
import { BANK_REACH } from '@/data/bankCountries';
import { linkedBank, localAmount, railTiming } from '../linkedBank';
import { ADDRESS, BUY_OPTIONS, LUCIA, PERSON, RING_LIGHT, usd, usd2 } from '../story';

/* The neutral voice: every line, ask and note a flow can produce, written so
   it reads right in any app. Each app's voice overrides what it says
   differently (voices/apps.ts). */

const n = (p: Params | undefined, k: string) => Number(p?.[k] ?? 0);
const s = (p: Params | undefined, k: string) => String(p?.[k] ?? '');
/** What a shortcut set up on its own: "I turned on your Muse balance with the default limits and added $1,250". */
export const setupDone = (p: Params | undefined) => {
  const parts = [n(p, 'connected') ? `I turned on ${yours(p)} with the default limits` : '', n(p, 'funded') ? `added ${usd(n(p, 'funded'))}` : ''].filter(Boolean);
  return parts.length === 2 ? `${parts[0]} and ${parts[1]}` : n(p, 'funded') ? `I added ${usd(n(p, 'funded'))} to ${yours(p)}` : parts[0];
};
/** "your Muse balance", and Your agent's "your balance" without saying your twice. */
export const yours = (p: Params | undefined) => (s(p, 'wallet').startsWith('your ') ? s(p, 'wallet') : `your ${s(p, 'wallet')}`);

/** " R$250 is $46.30 right now." for a payment in another currency, nothing in dollars. */
export const converted = (p: Params | undefined, how = 'right now') => (n(p, 'converted') ? ` ${s(p, 'local')} is ${usd2(n(p, 'usd'))} ${how}.` : '');

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
  talking: (p) => `Talking to ${s(p, 'hotel')}’s agent`,
  watching: () => 'Waiting for the payment',
  adding: () => 'Adding money',
} satisfies Record<string, LineFn>;

export type StatusKey = keyof typeof STATUS;

export const PRODUCTS = {
  'buy.options': () => BUY_OPTIONS,
} satisfies Record<string, () => Product[]>;

export type ProductsKey = keyof typeof PRODUCTS;

/** The stay, as the lines say it: "two nights", "two guests". */
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const count = (k: number, one: string, many: string) => `${WORDS[k] ?? k} ${k === 1 ? one : many}`;
export const nightsOf = (p?: Params) => count(n(p, 'nights'), 'night', 'nights');
export const guestsOf = (p?: Params) => count(n(p, 'guests'), 'guest', 'guests');

export const SUBAGENTS = {
  hotel: (p) => {
    const hotel = s(p, 'hotel');
    const over = n(p, 'amount') > n(p, 'approve');
    return {
      name: `${hotel}’s agent`,
      initial: hotel[0],
      working: `Talking to ${hotel}’s agent`,
      done: `Got a direct rate from ${hotel}’s agent`,
      status: 'Asking for a direct rate',
      summary: `Direct rate ${usd2(n(p, 'amount'))}, 10% off`,
      steps: [
        { title: `Found ${hotel}’s agent`, detail: `The hotel takes bookings in ${s(p, 'city')} from agents directly, account to account.` },
        { title: `Asked for ${s(p, 'dates')}, ${guestsOf(p)}`, detail: `It quoted ${usd(n(p, 'listed'))} for the ${nightsOf(p)}, breakfast included.` },
        { title: 'Asked about paying directly', detail: `Skipping the card fee takes 10% off: ${usd2(n(p, 'amount'))}.` },
        {
          title: 'Checked it against your limits',
          detail: over
            ? `${usd2(n(p, 'amount'))} is over the ${usd(n(p, 'approve'))} I can spend alone, so it goes to you to approve.`
            : `${usd2(n(p, 'amount'))} is inside the ${usd(n(p, 'approve'))} I can spend alone, so I can pay it myself.`,
        },
      ],
      messages: [
        { from: 'us', text: `Hi, booking a room for ${s(p, 'dates')}, ${guestsOf(p)}. What’s your best rate?` },
        { from: 'them', text: `${usd(n(p, 'listed'))} for the ${nightsOf(p)}, breakfast included.` },
        { from: 'us', text: 'Can we pay you directly instead of by card?' },
        { from: 'them', text: `Pay me directly and I’ll take 10% off: ${usd2(n(p, 'amount'))}.` },
        { from: 'us', text: over ? 'Deal. I’ll send it as soon as it’s approved.' : 'Deal. Sending it now.' },
      ],
    };
  },
} satisfies Record<string, (p?: Params) => SubAgent>;

export type SubAgentKey = keyof typeof SUBAGENTS;

export const METAS = {
  'buy.tracking': () => ({ text: 'Created routine · Track the delivery', icon: 'routine' }),
  'sub.reminder': () => ({ text: 'Created routine · Remind me before it renews', icon: 'routine' }),
  'connect.limits': () => ({ text: 'Limits saved', icon: 'check' }),
  'card.saved': () => ({ text: 'Visa •••• 4242 saved to your vault', icon: 'check' }),
  'bank.linked': () => ({ text: `${linkedBank().bankName} •••• ${linkedBank().last4} linked`, icon: 'check' }),
} satisfies Record<string, (p?: Params) => AgentMeta>;

export type MetaKey = keyof typeof METAS;

export const LINES = {
  greeting: () => `Hi! I can pay people in ${BANK_REACH} countries, shop and get paid for you. First I’ll need my own account, with limits you set. Start there, or ask me anything.`,
  'setup.auto': (p) => `Heads up: ${setupDone(p)}, so we can jump right in.`,
  fallback: () => 'I can only help with your account here. Try one of the flows on the left.',
  limited: () => 'Let’s keep going with the flows on the left. I’ve hit my chat limit for now.',

  'connect.intro': () => 'I’ll need my own account for that, with limits you set. Here’s what I’m asking for.',
  'connect.done': () => 'Connected. I have my own account now, and I can only spend what you put in it.',
  'connect.denied': () => 'No problem. I won’t touch money until you connect me.',
  'connect.already': (p) => `I’m already set up. Here’s ${yours(p)}.`,

  'fund.amount': () => 'How much do you want to add?',
  'fund.ask': () => 'How do you want to add it?',
  'fund.needed': (p) => `I’ll need ${usd(n(p, 'amount'))} in ${yours(p)} to cover that. How do you want to add it?`,
  'fund.address': (p) => `Here’s your ${s(p, 'method')} ${s(p, 'network') === 'LIGHTNING' ? 'invoice' : 'address'}. Whatever you send lands as dollars.`,
  'fund.bank': (p) => {
    const bank = linkedBank();
    const local = bank.currency === 'USD' ? '' : ` That’s ${localAmount(n(p, 'amount'), bank)} at today’s rate.`;
    return `Requesting ${usd(n(p, 'amount'))} from your ${bank.bankName} •••• ${bank.last4}.${local} ${railTiming(bank)}`;
  },
  'bank.intro': () => `Link a bank once and you can top up from it any time. It works with banks in ${BANK_REACH} countries.`,
  'bank.denied': () => 'Okay, no bank for now. You can link one any time.',
  'fund.done': (p) => `${usd(n(p, 'amount'))} landed. You have ${usd2(n(p, 'balance'))} now.`,
  'fund.card': (p) => `Adding ${usd(n(p, 'amount'))} from your Visa •••• 4242.`,
  'card.intro': (p) => `Add a card once and I can top up ${yours(p)} from it whenever you ask.`,
  'card.denied': () => 'Okay, no card for now. You can add one any time.',

  'limits.intro': () => 'I can’t change my own limits, so I sent it to you to confirm.',
  'limits.done': (p) => `Done. I’ll handle anything up to ${usd(n(p, 'approve'))} and ask you above it.`,
  'limits.denied': () => 'Okay, your limits stay as they are.',
  'limits.same': (p) => `Those are already my limits: I handle anything up to ${usd(n(p, 'approve'))}, ${usd(n(p, 'perTx'))} a payment and ${usd(n(p, 'daily'))} a day.`,

  'pay.newRecipient': (p) => `I don’t have ${s(p, 'first')}’s bank yet. Add it here once and I’ll send it.`,
  'pay.intro': (p) => `${s(p, 'first')} banks with ${s(p, 'bank')}, so I’ll send it over ${s(p, 'rail')}.${converted(p)}`,
  'pay.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'pay.done': (p) => `Sent. ${s(p, 'first')} has it, with a note that it’s from you.`,
  'pay.denied': () => 'Okay, I won’t send it.',
  'pay.over': (p) => `That’s more than the ${usd(n(p, 'perTx'))} I can send in one payment. Raise my limit and I’ll send it.`,

  'buy.intro': () => `Found three that fit. The ${RING_LIGHT.merchant} RP10-H is the best of them, ${usd2(RING_LIGHT.amount)} with standard shipping.`,
  'buy.card': () => `I’ll get a one-time card for exactly this order, so ${RING_LIGHT.merchant} never sees your real card.`,
  'buy.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m checking out.`,
  'buy.done': () => 'Ordered. It arrives Thursday, and the card closed itself after the charge.',
  'buy.denied': () => 'Okay, I won’t place the order. Nothing was charged.',

  'sub.intro': (p) => `${s(p, 'item')} is ${usd2(n(p, 'amount'))} a month.`,
  'sub.card': (p) => `I’ll get a card that only ${s(p, 'merchant')} can charge, up to ${usd2(n(p, 'amount'))} a month.`,
  'sub.done': (p) => `You’re subscribed. The card is locked to ${s(p, 'merchant')} now, so nobody else can use it.`,
  'sub.denied': () => 'Okay, no subscription.',

  'agent.intro': (p) =>
    `${s(p, 'hotel')}’s agent quoted ${usd(n(p, 'listed'))} for the ${nightsOf(p)}, or ${usd2(n(p, 'amount'))} if we pay directly. I took the direct rate.`,
  'agent.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m paying now.`,
  'agent.done': () => 'Booked. The confirmation is in your inbox.',
  'agent.denied': (p) => `Okay, I won’t book it. I told ${s(p, 'hotel')}’s agent we’ll pass.`,
  'agent.already': (p) => `You’re already booked at ${s(p, 'hotel')} for ${s(p, 'dates')}. The confirmation is in your inbox.`,

  'getpaid.ask': () => `How does ${LUCIA.first} want to pay?`,
  'getpaid.address': (p) =>
    `Here’s where she can send it. I sent it to ${LUCIA.first} with invoice ${LUCIA.invoice}${s(p, 'method') ? ` (${s(p, 'method')})` : ''}.`,
  'getpaid.done': (p) => `${LUCIA.first} paid ${usd2(LUCIA.amount)}. You have ${usd2(n(p, 'balance'))} now.`,
  'getpaid.already': () => `${LUCIA.first} already paid ${LUCIA.invoice}, ${usd2(LUCIA.amount)}. Nothing else is outstanding.`,

  'cashout.amount': () => 'How much should I move to your bank?',
  'cashout.bank': () => 'I’ll need your bank first. Link it once and I can move money there any time.',
  'cashout.over': (p) => `You have ${usd2(n(p, 'balance'))} in ${yours(p)}, so I can move up to that.`,
  'cashout.empty': (p) => `There’s nothing in ${yours(p)} to move yet.`,
  'cashout.quote': (p) => `Moving ${s(p, 'local')} to your ${s(p, 'to')} over ${s(p, 'rail')}. ${railTiming(linkedBank())}`,
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
    rows: [
      { text: 'Its own balance', sub: 'Funded by you, separate from your bank', icon: 'wallet' },
      { text: `Up to ${usd(n(p, 'perTx'))} a payment`, sub: `${usd(n(p, 'daily'))} a day`, icon: 'gauge' },
      { text: `Asks you above ${usd(n(p, 'approve'))}`, sub: 'Face ID to approve', icon: 'lock' },
    ],
    allow: 'Connect',
    allowed: 'Connected',
  }),
  limits: (p) => ({
    title: `Update ${s(p, 'agent')}’s limits`,
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
  bank: () => ({
    title: 'Link your bank',
    bank: true,
    allow: 'Link bank',
    allowed: 'Bank linked',
    deny: 'Not now',
    denied: 'Not now',
  }),
  recipient: (p) => ({
    title: `Add ${s(p, 'first')}’s bank`,
    bank: true,
    recipient: { name: s(p, 'name'), first: s(p, 'first'), country: s(p, 'flag') },
    allow: 'Save',
    allowed: 'Saved',
    deny: 'Not now',
    denied: 'Not now',
  }),
  pay: (p) => ({
    title: `Send ${s(p, 'local')} to ${s(p, 'first')}`,
    who: { name: s(p, 'name'), flag: s(p, 'flag'), detail: `${s(p, 'local')} to ${s(p, 'bank')} via ${s(p, 'rail')}` },
    amount: s(p, 'local'),
    method: `From ${s(p, 'wallet')} · ${usd2(n(p, 'usd'))}`,
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
    title: `Subscribe to ${s(p, 'item')}`,
    who: { name: s(p, 'merchant'), detail: `Up to ${usd2(n(p, 'amount'))} a month · card locked to ${s(p, 'merchant')}` },
    amount: `${usd2(n(p, 'amount'))}/mo`,
    method: `From ${s(p, 'wallet')} · card only ${s(p, 'merchant')} can charge`,
    allow: 'Approve',
    allowed: 'Approved',
    deny: 'Decline',
    denied: 'Declined',
  }),
  agent: (p) => ({
    title: `Pay ${s(p, 'hotel')}’s agent`,
    who: { name: s(p, 'hotel'), detail: `${n(p, 'nights')} ${n(p, 'nights') === 1 ? 'night' : 'nights'} in ${s(p, 'city')}, ${s(p, 'dates')}` },
    amount: usd2(n(p, 'amount')),
    method: `Account to account · you save ${usd2(n(p, 'listed') - n(p, 'amount'))}`,
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
    title: `${s(p, 'local')} to ${s(p, 'name')}`,
    lines: [`${s(p, 'bank')} · ${s(p, 'rail')}`, `${usd2(n(p, 'usd'))} from ${s(p, 'wallet')}`],
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
  'receipt.sub': (p) => ({
    title: `${usd2(n(p, 'amount'))} at ${s(p, 'merchant')}`,
    lines: [`Recurring Visa · renews monthly, only for ${s(p, 'merchant')}`],
    done: true,
  }),
  'receipt.agent': (p) => ({
    title: `Settled, instant and final · ${usd2(n(p, 'amount'))}`,
    lines: [`To ${s(p, 'hotel')}’s account · ${s(p, 'dates')}`, `Saved ${usd2(n(p, 'listed') - n(p, 'amount'))} by skipping the card`],
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
