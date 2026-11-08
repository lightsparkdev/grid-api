import type { AgentAsk, AgentBalance, AgentMeta, AgentNote, Params, Product, SubAgent } from '../conversation';
import { BANK_REACH } from '@/data/bankCountries';
import { linkedBank, pullsFrom, railTiming } from '../linkedBank';
import { shelfFor } from '../products';
import { ADDRESS, PERSON, usd, usd2 } from '../story';

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

/** "a Muse balance", or Your agent's "a balance". */
const a = (p: Params | undefined) => (s(p, 'wallet').startsWith('your ') ? 'a balance' : `${/^[aeiou]/i.test(s(p, 'wallet')) ? 'an' : 'a'} ${s(p, 'wallet')}`);
/** Withdrawn: on an instant rail it's there; ACH and bank transfers say when it lands. */
const cashoutDone = (rail: string) =>
  rail === 'ACH' ? 'Sent. It reaches your bank in 1–3 business days.' : rail === 'Bank Transfer' ? 'Sent. It should land within a business day.' : 'Done. It’s in your account.';
/** "Your Muse balance", for a line that opens with it. */
const Yours = (p: Params | undefined) => yours(p).charAt(0).toUpperCase() + yours(p).slice(1);
/** What a purchase goes on: the saved card, or the app's balance. */
export const paidFrom = (p: Params | undefined) => (n(p, 'card') ? 'Visa •••• 4242' : s(p, 'wallet'));
export const CARD = 'Visa •••• 4242';
/** "Your Muse balance won't cover it. ", ahead of a purchase that went to the card for that reason. */
export const short = (p: Params | undefined) => (n(p, 'short') ? `${Yours(p)} won’t cover it. ` : '');

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
  'buy.options': (p?: Params) => shelfFor(s(p, 'query')).options.filter((o) => !n(p, 'only') || o.pick),
} satisfies Record<string, (p?: Params) => Product[]>;

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
  'card.saved': () => ({ text: 'Visa •••• 4242 saved', icon: 'check' }),
  'bank.linked': () => ({ text: `${linkedBank().bankName} •••• ${linkedBank().last4} linked`, icon: 'check' }),
} satisfies Record<string, (p?: Params) => AgentMeta>;

export type MetaKey = keyof typeof METAS;

export const LINES = {
  greeting: () => `Hi! I can pay people in ${BANK_REACH} countries, shop and get paid for you. Add a card or set up a balance to start, or ask me anything.`,
  'setup.auto': (p) => `Heads up: ${setupDone(p)}, so we can jump right in.`,
  fallback: () => 'I can only help with money here: paying people, shopping, and getting paid.',
  limited: () => 'I’ve hit my chat limit for now. You can still tap any of the things I can do.',

  'connect.intro': (p) =>
    n(p, 'hasAgent') ? `First I’ll need ${a(p)} for that, with limits you set. Here’s what I’m asking for.` : 'First I’ll need my own account for that, with limits you set. Here’s what I’m asking for.',
  'connect.self': (p) => (n(p, 'hasAgent') ? `Sure. Here’s ${a(p)} I’d set up, with limits you set.` : 'Sure. I’ll need my own account, with limits you set. Here’s what I’m asking for.'),
  'connect.done': (p) => (n(p, 'hasAgent') ? `${Yours(p)} is on. I’ll stay inside the limits you set.` : 'Connected. I have my own account now, and I’ll stay inside the limits you set.'),
  'connect.denied': (p) => (n(p, 'hasAgent') ? `No problem. I’ll keep paying with your ${CARD}.` : 'No problem. I won’t touch money until you connect me.'),
  'connect.already': (p) => `I’m already set up. Here’s ${yours(p)}.`,

  'fund.amount': () => 'How much do you want to add?',
  'fund.ask': () => 'How do you want to add it?',
  'fund.needed': (p) => `I’ll need ${usd(n(p, 'amount'))} in ${yours(p)} to cover that. How do you want to add it?`,
  'fund.asset': () => 'What are you sending?',
  'fund.network': (p) => `Which network is your ${s(p, 'asset')} on?`,
  'fund.address': (p) => `Here’s your ${s(p, 'method')} ${s(p, 'network') === 'LIGHTNING' ? 'invoice' : 'address'}. Whatever you send lands as dollars.`,
  'fund.bank': (p) => `Pulling ${usd(n(p, 'amount'))} from your ${linkedBank().bankName} •••• ${linkedBank().last4} over ACH.`,
  'fund.push': (p) =>
    `Send ${s(p, 'send')} from your ${linkedBank().bankName} by ${s(p, 'rail')} to these details. It lands in ${yours(p)} as dollars.`,
  'bank.intro': () => `Link a bank once and you can move money in and out any time. It works with banks in ${BANK_REACH} countries.`,
  'bank.where': () => 'Where’s your bank?',
  'bank.kept': () => 'I’ll keep this account connected for next time, for adding money and withdrawing.',
  'bank.denied': () => 'Okay, no bank for now. You can link one any time.',
  'fund.done': (p) => `${usd(n(p, 'amount'))} landed. You have ${usd2(n(p, 'balance'))} now.`,
  'fund.card': (p) => `Adding ${usd(n(p, 'amount'))} from your Visa •••• 4242.`,
  'card.intro': (p) => (n(p, 'topUp') ? `Add a card once and I can pay with it or top up ${yours(p)} from it.` : 'Add a card once and I can pay with it.'),
  'card.forBuy': () => 'Add your card once and I’ll take it from there.',
  'card.denied': () => 'Okay, no card for now. You can add one any time.',
  'card.done': (p) => (n(p, 'topUp') ? `Saved. I can pay with your ${CARD} now, or top up from it.` : `Saved. I can pay with your ${CARD} now.`),
  'card.already': (p) => (n(p, 'topUp') ? `Your ${CARD} is already saved. I can pay with it or top up from it.` : `Your ${CARD} is already saved. I can pay with it.`),
  'balance.offer': (p) => `Want a ${s(p, 'wallet').replace(/^your /, '')} too? You could keep money there, get paid into it, and send money abroad.`,
  'balance.later': () => 'No problem. Just ask when you want one.',
  'bank.done': () => `Linked. I’ll keep your ${linkedBank().bankName} •••• ${linkedBank().last4} connected for next time, for adding money and withdrawing.`,
  'bank.already': () =>
    pullsFrom(linkedBank())
      ? `Your ${linkedBank().bankName} •••• ${linkedBank().last4} is already connected. I can add money from it or withdraw to it.`
      : `Your ${linkedBank().bankName} •••• ${linkedBank().last4} is already connected. You can send money from it, and I can withdraw to it.`,
  'balance.none': (p) =>
    n(p, 'card')
      ? `You don’t have ${a(p)} yet. I pay with your ${CARD}.`
      : `You don’t have ${a(p)} yet. Set one up to keep money here and get paid, or add a card for me to pay with.`,

  'limits.intro': () => 'I can’t change my own limits, so I sent it to you to confirm.',
  'limits.done': (p) => `Done. I’ll handle anything up to ${usd(n(p, 'approve'))} and ask you above it.`,
  'limits.denied': () => 'Okay, your limits stay as they are.',
  'limits.same': (p) => `Those are already my limits: I handle anything up to ${usd(n(p, 'approve'))}, ${usd(n(p, 'perTx'))} a payment and ${usd(n(p, 'daily'))} a day.`,

  'pay.where': (p) => `Where does ${s(p, 'first')} bank? I can pay into banks in ${BANK_REACH} countries.`,
  'pay.newRecipient': (p) => `I don’t have ${s(p, 'first')}’s bank yet. Add it here once and I’ll send it.`,
  'pay.intro': (p) => `${s(p, 'first')} banks with ${s(p, 'bank')}, so I’ll send it over ${s(p, 'rail')}.${converted(p)}`,
  'pay.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'pay.done': (p) => `Sent. ${s(p, 'first')} has it, with a note that it’s from you.`,
  'pay.denied': () => 'Okay, I won’t send it.',
  'crypto.where': () => 'Sure. What address should I send it to?',
  'crypto.invalid': () => 'That doesn’t look like an address I can send to. Can you paste the whole thing?',
  'crypto.onchain': () => 'That’s a Bitcoin address. I can pay a Lightning invoice or send USDB to a Spark address, but not bitcoin on-chain yet.',
  'crypto.mismatch': (p) => `${s(p, 'network')} addresses only take ${s(p, 'takes')}, so I can’t send ${s(p, 'asset')} there.`,
  'crypto.amount': () => 'How much do you want to send?',
  'crypto.asset': () => 'USDC or USDT?',
  'crypto.network': () => 'Which network is that address on? Sending on the wrong one can lose the money.',
  'crypto.intro': (p) =>
    n(p, 'lightning')
      ? `That invoice is for ${s(p, 'sends')}, plus ${usd2(n(p, 'fee'))} in fees.`
      : `${s(p, 'sends')} to ${s(p, 'short')} on ${s(p, 'network')}. The network fee is ${usd2(n(p, 'fee'))}, so exactly ${s(p, 'sends')} arrives.`,
  'crypto.done': (p) => (n(p, 'lightning') ? 'Paid. The invoice is settled.' : `Sent. ${s(p, 'sends')} is at ${s(p, 'short')} on ${s(p, 'network')}.`),
  'limit.over': (p) => `That’s more than the ${usd(n(p, 'perTx'))} I can spend in one payment. Raise my limit and I’ll do it.`,
  'pay.over': (p) => `That’s more than the ${usd(n(p, 'perTx'))} I can send in one payment. Raise my limit and I’ll send it.`,

  'buy.intro': (p) => `Found three that fit. The ${s(p, 'merchant')} ${s(p, 'model')} is the best of them, ${usd2(n(p, 'amount'))} with standard shipping.`,
  'buy.which': () => 'Want that one, or one of the others?',
  'buy.found': (p) => `Found it: the ${s(p, 'merchant')} ${s(p, 'model')}, ${usd2(n(p, 'amount'))} with standard shipping.`,
  'buy.picked': (p) => `Got your pick: the ${s(p, 'item')}. I’ll check the total and get checkout ready. Nothing is charged without your approval.`,
  'buy.payWith': (p) => `Want me to pay from ${yours(p)} or your ${CARD}?`,
  'buy.shortCard': (p) => `${Yours(p)} won’t cover it. Should I put it on your ${CARD}, or do you want to add ${usd(n(p, 'amount'))} first?`,
  'buy.noBalance': (p) => `I can put this on your card, or set up ${s(p, 'wallet').startsWith('your ') ? 'a balance' : `a ${s(p, 'wallet')}`} you can pay from.`,
  'buy.short': (p) => `You have ${usd2(n(p, 'balance'))} in ${yours(p)}. I can put this on your card instead, or you can add ${usd(n(p, 'amount'))} first.`,
  'buy.card': (p) =>
    n(p, 'card')
      ? `${short(p)}I’ll pay with a one-time card for exactly this order, charged to your ${CARD}.`
      : `I’ll pay from ${yours(p)} with a one-time card for exactly this order.`,
  'buy.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m checking out.`,
  'buy.done': () => 'Ordered. It arrives Thursday.',
  'buy.denied': () => 'Okay, I won’t place the order. Nothing was charged.',

  'sub.intro': (p) => `${s(p, 'item')} is ${usd2(n(p, 'amount'))} a month.`,
  'sub.card': (p) => `${short(p)}I’ll get a card that only ${s(p, 'merchant')} can charge, up to ${usd2(n(p, 'amount'))} a month${n(p, 'card') ? `, billed to your ${CARD}` : ''}.`,
  'sub.done': (p) => `You’re subscribed. The card is locked to ${s(p, 'merchant')} now, so nobody else can use it.`,
  'sub.denied': () => 'Okay, no subscription.',

  'agent.intro': (p) =>
    `${s(p, 'hotel')}’s agent quoted ${usd(n(p, 'listed'))} for the ${nightsOf(p)}, or ${usd2(n(p, 'amount'))} if we pay directly. I took the direct rate.`,
  'agent.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m paying now.`,
  'agent.done': () => 'Booked. The confirmation is in your inbox.',
  'agent.denied': (p) => `Okay, I won’t book it. I told ${s(p, 'hotel')}’s agent we’ll pass.`,
  'agent.already': (p) => `You’re already booked at ${s(p, 'hotel')} for ${s(p, 'dates')}. The confirmation is in your inbox.`,

  'getpaid.ask': (p) => `How does ${s(p, 'first')} want to pay?`,
  'getpaid.address': (p) =>
    `Here’s where ${s(p, 'first')} can send it. I sent it over with invoice ${s(p, 'invoice')}${s(p, 'method') ? ` (${s(p, 'method')})` : ''}.`,
  'getpaid.done': (p) => `${s(p, 'first')} paid ${usd2(n(p, 'amount'))}. You have ${usd2(n(p, 'balance'))} now.`,
  'getpaid.already': (p) => `${s(p, 'first')} already paid ${s(p, 'invoice')}, ${usd2(n(p, 'amount'))}. Nothing else is outstanding.`,

  'cashout.amount': () => 'How much should I move to your bank?',
  'cashout.bank': () => 'I’ll need your bank first. Link it once and I can move money there any time.',
  'cashout.over': (p) => `You have ${usd2(n(p, 'balance'))} in ${yours(p)}, so I can move up to that.`,
  'cashout.empty': (p) => `There’s nothing in ${yours(p)} to move yet.`,
  'cashout.quote': (p) => `Moving ${s(p, 'local')} to your ${s(p, 'to')} over ${s(p, 'rail')}. ${railTiming(linkedBank())}`,
  'cashout.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'cashout.done': () => cashoutDone(linkedBank().country.rail),
  'cashout.noBalance': (p) => `There’s nothing to move yet: you don’t have ${a(p)}. Add money to one and I can send it to your bank.`,
  'cashout.denied': () => 'Okay, the money stays put.',

  'balance.answer': (p) => `You have ${usd2(n(p, 'balance'))}. Here’s where things stand.`,
  'history.answer': () => 'Here’s what moved recently.',
} satisfies Record<string, LineFn>;

export type LineKey = keyof typeof LINES;

/** A purchase's Pay with, for a checkout that can switch it: only with a card saved, so there's a choice. */
export const payOf = (p: Params | undefined): AgentAsk['pay'] =>
  n(p, 'saved')
    ? { by: n(p, 'card') ? 'card' : 'balance', card: CARD, wallet: s(p, 'wallet'), balance: usd2(n(p, 'balance')), enough: !!n(p, 'enough') }
    : undefined;

const limitsRows = (p?: Params): AgentAsk['rows'] => [
  { text: `Acts alone up to ${usd(n(p, 'approve'))}`, sub: `Was ${usd(n(p, 'fromApprove'))}`, icon: 'lock' },
  { text: `${usd(n(p, 'daily'))} a day`, sub: `Was ${usd(n(p, 'fromDaily'))}`, icon: 'gauge' },
  { text: `${usd(n(p, 'perTx'))} a payment`, sub: `Was ${usd(n(p, 'fromPerTx'))}`, icon: 'gauge' },
];

export const ASKS = {
  connect: (p) => ({
    // Already paying with their card, it has its account; this only adds the balance.
    title: n(p, 'hasAgent') ? `Set up ${yours(p)}` : `${s(p, 'agent')} wants its own account`,
    rows: [
      { text: 'Its own balance', sub: 'Funded by you, separate from your bank', icon: 'wallet' },
      { text: `Up to ${usd(n(p, 'perTx'))} a payment`, sub: `${usd(n(p, 'daily'))} a day`, icon: 'gauge' },
      { text: `Asks you above ${usd(n(p, 'approve'))}`, sub: 'Face ID to approve', icon: 'lock' },
    ],
    allow: 'Connect',
    allowed: 'Connected',
  }),
  limits: (p) => ({
    title: `Update ${s(p, 'agent').replace(/^Your /, 'your ')}’s limits`,
    rows: limitsRows(p),
    allow: 'Save',
    allowed: 'Saved',
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
  bank: (p) => ({
    title: 'Link your bank',
    bank: true,
    home: s(p, 'home') || undefined,
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
    who: { name: s(p, 'name'), flag: s(p, 'flag'), bank: s(p, 'bank'), detail: `${s(p, 'local')} to ${s(p, 'bank')} via ${s(p, 'rail')}` },
    amount: s(p, 'local'),
    method: `From ${s(p, 'wallet')} · ${usd2(n(p, 'usd'))}`,
    allow: 'Approve',
    allowed: 'Paid',
    denied: 'Declined',
  }),
  crypto: (p) => ({
    title: n(p, 'lightning') ? 'Pay a Lightning invoice' : `Send ${s(p, 'sends')} to ${s(p, 'short')}`,
    who: n(p, 'lightning')
      ? { name: 'Lightning invoice', mark: '⚡', detail: `${s(p, 'short')} · fee ${usd2(n(p, 'fee'))}` }
      : { name: s(p, 'short'), mark: '$', detail: `${s(p, 'asset')} on ${s(p, 'network')} · fee ${usd2(n(p, 'fee'))}` },
    amount: s(p, 'sends'),
    method: `From ${s(p, 'wallet')} · ${usd2(n(p, 'usd') + n(p, 'fee'))}`,
    allow: 'Approve',
    allowed: 'Sent',
    denied: 'Declined',
  }),
  cashout: (p) => ({
    title: `Move ${s(p, 'local')} to ${s(p, 'to')}`,
    who: { name: s(p, 'to'), flag: s(p, 'flag') || undefined, bank: s(p, 'bank'), detail: `${s(p, 'local')} over ${s(p, 'rail')}` },
    amount: s(p, 'local'),
    method: `From ${s(p, 'wallet')} · ${usd2(n(p, 'usd'))}`,
    allow: 'Approve',
    allowed: 'Sent',
    denied: 'Declined',
  }),
  buy: (p) => ({
    title: `Buy at ${s(p, 'merchant')}`,
    who: { name: s(p, 'merchant'), icon: s(p, 'image'), detail: `${s(p, 'item')} · one-time card` },
    amount: usd2(n(p, 'amount')),
    method: `From ${paidFrom(p)} · one-time card`,
    pay: payOf(p),
    allow: 'Approve',
    allowed: 'Approved',
    denied: 'Declined',
  }),
  sub: (p) => ({
    title: `Subscribe to ${s(p, 'item')}`,
    who: { name: s(p, 'merchant'), detail: `Up to ${usd2(n(p, 'amount'))} a month · card locked to ${s(p, 'merchant')}` },
    amount: `${usd2(n(p, 'amount'))}/mo`,
    method: `From ${paidFrom(p)} · card only ${s(p, 'merchant')} can charge`,
    pay: payOf(p),
    allow: 'Approve',
    allowed: 'Approved',
    denied: 'Declined',
  }),
  agent: (p) => ({
    title: `Pay ${s(p, 'hotel')}’s agent`,
    who: { name: s(p, 'hotel'), detail: `${n(p, 'nights')} ${n(p, 'nights') === 1 ? 'night' : 'nights'} in ${s(p, 'city')}, ${s(p, 'dates')}` },
    amount: usd2(n(p, 'amount')),
    method: `Account to account · you save ${usd2(n(p, 'listed') - n(p, 'amount'))}`,
    allow: 'Approve',
    allowed: 'Paid',
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
    spent: { today: usd2(spent), limit: usd(daily), ratio: daily > 0 ? Math.min(1, spent / daily) : 0, left: usd2(Math.max(0, daily - spent)) },
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
    balance: balanceOf(p, 'Available to spend'),
  }),
  deposit: (p) => {
    const lightning = s(p, 'network') === 'LIGHTNING';
    return {
      title: s(p, 'method'),
      code: ADDRESS_ON[s(p, 'network')] ?? ADDRESS_ON.BASE,
      lines: lightning ? [`${usd2(n(p, 'amount'))} · expires in 10 min`] : [`Send ${s(p, 'currency')} only`, 'This address never expires'],
    };
  },
  receive: (p) => ({
    title: `Pay ${PERSON.full}`,
    code: s(p, 'network') === 'LIGHTNING' ? RECEIVE_INVOICE : ADDRESS_ON.BASE,
    lines: [`${usd2(n(p, 'amount'))} · ${s(p, 'invoice')}`, s(p, 'method')],
  }),
  'deposit.bank': (p) => {
    const rows: [string, string][] = JSON.parse(s(p, 'rows') || '[]');
    const [first, ...rest] = rows;
    return {
      title: `Send ${s(p, 'send')} by ${s(p, 'rail')}`,
      code: first?.[1],
      lines: [`${first?.[0]} · ${PERSON.full}`, ...rest.map(([label, value]) => `${label} ${value}`), `Reference ${s(p, 'reference')}`],
    };
  },
  quote: (p) => ({
    title: `${s(p, 'local')} to ${s(p, 'to')}`,
    lines: [`${usd2(n(p, 'usd'))} from ${s(p, 'wallet')} · fee ${usd2(n(p, 'fee'))}`, 'Quote expires in 5 min'],
  }),
  'receipt.crypto': (p) => ({
    title: n(p, 'lightning') ? `Paid ${s(p, 'sends')} invoice` : `${s(p, 'sends')} to ${s(p, 'short')}`,
    lines: [n(p, 'lightning') ? 'Lightning' : `${s(p, 'asset')} on ${s(p, 'network')}`, `${usd2(n(p, 'usd') + n(p, 'fee'))} from ${s(p, 'wallet')}`],
    done: true,
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
  'receipt.buy': (p) => ({
    title: `${usd2(n(p, 'amount'))} at ${s(p, 'merchant')}`,
    lines: n(p, 'card') ? [`Paid with ${CARD}`, 'One-time card · closed after the charge'] : ['One-time Visa · closed after the charge'],
    done: true,
  }),
  'receipt.sub': (p) => ({
    title: `${usd2(n(p, 'amount'))} at ${s(p, 'merchant')}`,
    lines: [`Recurring Visa · renews monthly, only for ${s(p, 'merchant')}`, ...(n(p, 'card') ? [`Billed to ${CARD}`] : [])],
    done: true,
  }),
  'receipt.agent': (p) => ({
    title: `Settled, instant and final · ${usd2(n(p, 'amount'))}`,
    lines: [`To ${s(p, 'hotel')}’s account · ${s(p, 'dates')}`, `Saved ${usd2(n(p, 'listed') - n(p, 'amount'))} by skipping the card`],
    done: true,
  }),
  'receipt.getpaid': (p) => ({
    title: `${usd2(n(p, 'amount'))} from ${s(p, 'payer')}`,
    lines: [`${s(p, 'invoice')} · paid`],
    done: true,
  }),
  balance: (p) => ({
    title: usd2(n(p, 'balance')),
    lines: [
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

/** Deposit addresses in each network's own format, whole, so copying one gets all of it; cards shorten them. */
const ADDRESS_ON: Record<string, string> = {
  LIGHTNING: 'lnbc1pn5x9qhpp5w8u3kzj4d2fh0xa7t6vlr9cq5mgy3ens8p4w2ke7rz0h6dlc9qsdqqcqzzsxqyz5vqsp5q7mxt0',
  SPARK: 'sp1pqzu5y8t3rk0v7w2xg6hn4c9ldm5qf8ja3ze6xp2t0w4rs7kv9n3h7f3k',
  BASE: '0x4f2a8B3c71dE9056aF2b4C8d1e7F3a9B6c0D9c1e',
  ETHEREUM: '0x4f2a8B3c71dE9056aF2b4C8d1e7F3a9B6c0D9c1e',
  POLYGON: '0x4f2a8B3c71dE9056aF2b4C8d1e7F3a9B6c0D9c1e',
  ARBITRUM: '0x4f2a8B3c71dE9056aF2b4C8d1e7F3a9B6c0D9c1e',
  SOLANA: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU9q2Lm',
  TRON: 'TQ8vYk3Zr9WbXsN5hLc2Fj7Pd4mUe6RrN2k',
};
const RECEIVE_INVOICE = 'lnbc4682u1pn5x9qhpp5r3w0t8yq9zk2fh6xa4t7vlc5mgy8ens3p2w9ke6rz0h4dlc7qsdqqcqzzsxqyh3kq9z';

/** Muse's order sheet for what it found. */
export const MUSE_ORDER = (p: Params | undefined): AgentAsk => ({
  title: `The agent wants to place an order at ${s(p, 'merchant')}`,
  badge: s(p, 'merchant')[0],
  rows: [
    { text: s(p, 'item'), sub: 'Qty: 1', image: s(p, 'image') },
    { text: 'Standard by 2 to 5 business days', sub: ADDRESS, icon: 'truck' },
  ],
  total: usd2(n(p, 'amount')),
  payWith: n(p, 'card') ? CARD : 'Muse balance',
  method: n(p, 'card') ? 'Expires 09/29' : `${usd2(n(p, 'balance'))} available`,
  legal: s(p, 'merchant'),
  pay: payOf(p),
  allow: 'Allow',
  allowed: 'Allowed',
  denied: 'Denied',
});
