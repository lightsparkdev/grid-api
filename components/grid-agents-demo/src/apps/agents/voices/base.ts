import type { AgentAsk, AgentBalance, AgentMeta, AgentNote, AskRow, Params, Product, SubAgent } from '../conversation';
import { BANK_REACH } from '@/data/bankCountries';
import { linkedBank, pullsFrom } from '../linkedBank';
import { requestOf, shelfFor } from '../products';
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

/** "Muse balance", or Your agent's plain "Balance", as a value on its own. */
const walletName = (p: Params | undefined) => (s(p, 'wallet').startsWith('your ') ? 'Balance' : s(p, 'wallet'));

/** "a Muse balance", or Your agent's "a balance". */
const a = (p: Params | undefined) => (s(p, 'wallet').startsWith('your ') ? 'a balance' : `${/^[aeiou]/i.test(s(p, 'wallet')) ? 'an' : 'a'} ${s(p, 'wallet')}`);
/** "Your Muse balance", for a line that opens with it. */
const Yours = (p: Params | undefined) => yours(p).charAt(0).toUpperCase() + yours(p).slice(1);
/** What a purchase goes on: the saved card, or the app's balance. */
export const paidFrom = (p: Params | undefined) => (n(p, 'card') ? 'Visa •••• 4242' : s(p, 'wallet'));
export const CARD = 'Visa •••• 4242';
/** "Your Muse balance won't cover it. ", ahead of a purchase that went to the card for that reason. */
export const short = (p: Params | undefined) => (n(p, 'short') ? `${Yours(p)} won’t cover it. ` : '');
/** A withdrawal to their own bank lands at once, on every rail. */
const WITHDRAW_TIMING = 'It lands in seconds.';
/** How soon food and groceries get there. */
const SOON = '25–35 min';

/** What a purchase is, for the words around it: a store order, food on its way, a ride, a bill, a top-up, tickets or a table. */
export type Errand = 'order' | 'food' | 'ride' | 'bill' | 'topup' | 'tickets' | 'table';
export const errandOf = (p: Params | undefined): Errand => {
  switch (s(p, 'delivery')) {
    case 'now':
      return 'food';
    case 'ride':
      return 'ride';
    case 'bill':
      return 'bill';
    case 'instant':
      return 'topup';
    case 'email':
      return n(p, 'table') ? 'table' : n(p, 'tickets') ? 'tickets' : 'order';
    default:
      return 'order';
  }
};
/** Its words for what it is, falling back to an order's. */
export const byErrand = <T,>(p: Params | undefined, words: { order: T } & Partial<Record<Errand, T>>): T => words[errandOf(p)] ?? words.order;
/** "this order", "this ride": what a one-time card is locked to. */
export const orderNoun = (p: Params | undefined) => byErrand(p, { order: 'order', ride: 'ride', bill: 'bill', topup: 'top-up', table: 'booking' });

/** Where an order goes when it isn't shipped, by how it arrives (shelfParams' delivery and details). */
const whereOf = (p: Params | undefined): AgentAsk['where'] => {
  switch (s(p, 'delivery')) {
    case 'now':
      return { label: 'Deliver to', lines: [PERSON.full, ADDRESS] };
    case 'ride':
      return { label: 'Pickup at', lines: [ADDRESS, ...(s(p, 'to') ? [`To ${s(p, 'to')}`] : [])] };
    case 'instant':
      return { label: 'Top up', lines: [s(p, 'phone'), s(p, 'country')] };
    case 'bill':
      return { label: 'Pay to', lines: [`${s(p, 'merchant')} account ${s(p, 'account')}`, `Due ${s(p, 'due')}`] };
    default:
      return undefined;
  }
};

/** What buying it is, as an approval's title says it: "place an order at", or what a ride, a table, tickets, a top-up or a bill is. */
const buyingAt = (p: Params | undefined) => {
  const m = s(p, 'merchant');
  switch (s(p, 'delivery')) {
    case 'ride':
      return `book a ride with ${m}`;
    case 'instant':
      return `top up a phone with ${m}`;
    case 'bill':
      return `pay your ${m} bill`;
    case 'email':
      return n(p, 'table') ? `book a table at ${m}` : n(p, 'tickets') ? `buy tickets from ${m}` : `place an order at ${m}`;
    default:
      return `place an order at ${m}`;
  }
};
const Buying = (p: Params | undefined) => buyingAt(p).charAt(0).toUpperCase() + buyingAt(p).slice(1);

/** Muse's checkout row for how it arrives. */
const arrivalRow = (p: Params | undefined): AskRow => {
  switch (s(p, 'delivery')) {
    case 'email':
      return n(p, 'table')
        ? { text: 'Confirmation by email', sub: PERSON.email, icon: 'envelope' }
        : n(p, 'tickets')
          ? { text: 'Tickets by email', sub: PERSON.email, icon: 'envelope' }
          : { text: 'Delivered by email', sub: PERSON.email, icon: 'envelope' };
    case 'now':
      return { text: `Delivery in ${SOON}`, sub: ADDRESS, icon: 'truck' };
    case 'ride':
      return { text: `Pickup in ${s(p, 'eta')}`, sub: s(p, 'to') ? `To ${s(p, 'to')}` : ADDRESS, icon: 'car' };
    case 'instant':
      return { text: 'Credited in seconds', sub: `${s(p, 'phone')} · ${s(p, 'country')}`, icon: 'checkmark' };
    case 'bill':
      return { text: `Paid to account ${s(p, 'account')}`, sub: `Due ${s(p, 'due')}`, icon: 'card' };
    default:
      return n(p, 'email')
        ? { text: 'Delivered by email', sub: PERSON.email, icon: 'envelope' }
        : { text: 'Standard by 2 to 5 business days', sub: ADDRESS, icon: 'truck' };
  }
};
/** When the one they named costs more than they said they'd spend. */
export const overBudget = (p: Params | undefined) => (n(p, 'over') ? ` That’s over the ${usd(n(p, 'over'))} you mentioned.` : '');
/** A gift card that doesn't come in the value they asked for: the nearest it does. */
const giftRange = (p: Params | undefined) =>
  n(p, 'asked') ? ` ${s(p, 'merchant')} cards ${n(p, 'asked') > n(p, 'amount') ? 'top out' : 'start'} at ${usd(n(p, 'amount'))}.` : '';

/** " R$250 is $46.30 right now.", or " $50.00 is ₱2,900 right now." when they asked in dollars; nothing for a payment in dollars. */
export const converted = (p: Params | undefined, how = 'right now') => (n(p, 'converted') ? ` ${s(p, 'from')} is ${s(p, 'to')} ${how}.` : '');

export type LineFn = (p?: Params) => string;
export type AskFn = (p?: Params) => AgentAsk;
export type NoteFn = (p?: Params) => AgentNote;

/** What the agent is doing while it works: Grok's status row, Muse's header subtitle. */
export const STATUS = {
  searching: (p) =>
    byErrand(p, { order: 'Searching stores', food: 'Checking what’s nearby', ride: 'Finding a ride', bill: 'Looking up the bill', topup: 'Checking the carrier', tickets: 'Finding tickets', table: 'Checking tables' }),
  filling: (p) =>
    byErrand(p, { order: 'Filling the checkout form', ride: 'Setting the pickup', bill: 'Filling in the bill', topup: 'Entering the number', tickets: 'Picking seats', table: 'Holding the table' }),
  paying: (p) =>
    byErrand(p, { order: 'Paying for the order', ride: 'Booking the ride', bill: 'Paying the bill', topup: 'Sending the top-up', tickets: 'Buying the tickets', table: 'Booking the table' }),
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
  'buy.options': (p?: Params) => shelfFor(requestOf(p)).options.filter((o) => !n(p, 'only') || o.pick),
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
  'buy.tracking': (p) => ({ text: s(p, 'delivery') === 'ride' ? 'Created routine · Track your ride' : 'Created routine · Track the delivery', icon: 'routine' }),
  'watch.routine': (p) => ({ text: `Created routine · Buy the ${s(p, 'model')} under ${usd(n(p, 'below'))}`, icon: 'routine' }),
  'pay.routine': (p) => ({ text: `Created routine · ${s(p, 'local')} to ${s(p, 'first')} on the ${s(p, 'day')} of each month`, icon: 'routine' }),
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

  'fund.offer': () => 'It’s empty for now. Want to add money?',
  'fund.offerShort': () => 'Want to add money?',
  'fund.offerFrom': (p) => `${Yours(p)} is empty. Want to add money from ${n(p, 'bank') ? `your ${linkedBank().bankName} account` : `your ${CARD}`}?`,
  'fund.amount': () => 'How much do you want to add?',
  'amount.other': () => 'Sure. Type any amount.',
  'fund.ask': () => 'How do you want to add it?',
  'fund.needed': (p) => `I’ll need ${usd(n(p, 'amount'))} in ${yours(p)} to cover that. How do you want to add it?`,
  'fund.asset': () => 'What are you sending?',
  'fund.network': (p) => `Which network is your ${s(p, 'asset')} on?`,
  'fund.address': (p) =>
    s(p, 'network') === 'LIGHTNING' ? 'Here’s your Lightning invoice. Whatever you send lands as dollars.' : `Here’s your address for ${s(p, 'method')}. Whatever you send lands as dollars.`,
  'fund.other': (p) => (n(p, 'again') ? 'Okay. Stablecoins work too, or I can hold off.' : `No problem. Want to add the ${usd(n(p, 'amount'))} another way?`),
  'fund.later': () => 'Okay, no money added. Just say when.',
  'task.held': (p) => `Okay, I’ll hold off on ${s(p, 'what')}. Just say when.`,
  'fund.bank': (p) => `Pulling ${usd(n(p, 'amount'))} from your ${linkedBank().bankName} •••• ${linkedBank().last4} over ACH.`,
  'fund.push': (p) =>
    `Send ${s(p, 'send')} from your ${linkedBank().bankName} by ${s(p, 'rail')} to these details. It lands in ${yours(p)} as dollars.`,
  'bank.intro': () => `Link a bank once and you can move money in and out any time, in ${BANK_REACH} countries. Where is it?`,
  'bank.opening': (p) =>
    s(p, 'home') === 'us'
      ? 'Opening Plaid so you can sign in to your bank.'
      : s(p, 'home') === 'other'
        ? 'Pick your country, then add your bank details.'
        : `Here’s the form for your bank in ${s(p, 'country')}.`,
  'bank.kept': () => 'I’ll keep this account connected for next time, for adding money and withdrawing.',
  'bank.denied': () => 'Okay, no bank for now. You can link one any time.',
  'fund.done': (p) => `${usd(n(p, 'amount'))} landed. You have ${usd2(n(p, 'balance'))} now.`,
  'fund.card': (p) => `Adding ${usd(n(p, 'amount'))} from your Visa •••• 4242.`,
  'card.intro': (p) => (n(p, 'topUp') ? `Add a card once and I can pay with it or top up ${yours(p)} from it.` : 'Add a card once and I can pay with it.'),
  'card.forBuy': () => 'Add your card once and I’ll take it from there.',
  'card.denied': () => 'Okay, no card for now. You can add one any time.',
  'card.done': (p) => (n(p, 'topUp') ? `Saved. I can pay with your ${CARD} now, or top up from it.` : `Saved. I can pay with your ${CARD} now.`),
  'card.already': (p) => (n(p, 'topUp') ? `Your ${CARD} is already saved. I can pay with it or top up from it.` : `Your ${CARD} is already saved. I can pay with it.`),
  'balance.offer': (p) => `Want a ${s(p, 'wallet').replace(/^your /, '')} too? I can pay from it without your card, and you can get paid into it and send money abroad.`,
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

  'limits.intro': () => 'I can’t change my own limits. Confirm these and they’re set.',
  'limits.done': (p) =>
    s(p, 'what') === 'perTx'
      ? `Done. I can spend up to ${usd(n(p, 'perTx'))} in one payment now.`
      : s(p, 'what') === 'daily'
        ? `Done. I can spend up to ${usd(n(p, 'daily'))} a day now.`
        : `Done. I’ll handle anything up to ${usd(n(p, 'approve'))} and ask you above it.`,
  'limits.denied': () => 'Okay, your limits stay as they are.',
  'limits.same': (p) => `Those are already my limits: I handle anything up to ${usd(n(p, 'approve'))}, ${usd(n(p, 'perTx'))} a payment and ${usd(n(p, 'daily'))} a day.`,

  'pay.where': (p) => `Where does ${s(p, 'first')} bank? I can pay into banks in ${BANK_REACH} countries.`,
  'pay.newRecipient': (p) => `I don’t have ${s(p, 'first')}’s bank yet. Add it here once and I’ll send it.`,
  'pay.intro': (p) => `${s(p, 'first')} banks with ${s(p, 'bank')}, so I’ll send it over ${s(p, 'rail')}.${converted(p)}`,
  'pay.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'pay.done': (p) => `Sent. ${s(p, 'first')} has it, with a note that it’s from you.`,
  'pay.scheduled': (p) => `Sent the first one. I’ll send ${s(p, 'first')} ${s(p, 'local')} on the ${s(p, 'day')} of every month, starting ${s(p, 'next')}, and check with you if anything changes.`,
  'split.intro': (p) => `That’s ${usd2(n(p, 'share'))} each, split ${n(p, 'count')} ways. I sent ${s(p, 'list')} a request.`,
  'split.done': (p) => `Everyone paid: ${usd2(n(p, 'back'))} back, so you’re square. You have ${usd2(n(p, 'balance'))} now.`,
  'pay.denied': () => 'Okay, I won’t send it.',
  'crypto.where': () => 'Sure. What address should I send it to?',
  'crypto.invalid': () => 'That doesn’t look like an address I can send to. Can you paste the whole thing?',
  'crypto.onchain': () => 'I can only send stablecoins: USDC or USDT to a wallet address.',
  'crypto.mismatch': (p) => `I can’t send ${s(p, 'asset')} there: ${s(p, 'network')} addresses only take ${s(p, 'takes')}.`,
  'crypto.amount': () => 'How much do you want to send?',
  'crypto.asset': () => 'USDC or USDT?',
  'crypto.network': () => 'Which network is that address on? Sending on the wrong one can lose the money.',
  'crypto.intro': (p) =>
    n(p, 'lightning')
      ? `That invoice is for ${s(p, 'sends')}, plus ${usd2(n(p, 'fee'))} in fees.`
      : n(p, 'fee')
        ? `${s(p, 'sends')} to ${s(p, 'short')} on ${s(p, 'network')}. The network fee is ${usd2(n(p, 'fee'))}, so exactly ${s(p, 'sends')} arrives.`
        : `${s(p, 'sends')} to ${s(p, 'short')} on ${s(p, 'network')}. There’s no network fee.`,
  'crypto.done': (p) => (n(p, 'lightning') ? 'Paid. The invoice is settled.' : `Sent. ${s(p, 'sends')} is at ${s(p, 'short')} on ${s(p, 'network')}.`),
  'limit.raise': (p) => `That’s more than the ${usd(n(p, 'perTx'))} I can ${s(p, 'act') || 'spend'} in one payment. Raise it to ${usd(n(p, 'to'))} and I’ll go ahead.`,
  'limit.kept': () => 'Okay, your limit stays as it is, so I’ll hold off on this one.',

  'buy.which': (p) => `I’d go with the ${s(p, 'merchant')} ${s(p, 'model')}. Want that one, or one of the others?`,
  'buy.note': (p) => `${overBudget(p)}${giftRange(p)}`.trim(),
  'gift.amount': (p) => `How much should the ${s(p, 'brand')} gift card be?`,
  'gift.store': () => 'Which store should the gift card be for?',
  'buy.picked': (p) => `Got your pick: the ${s(p, 'item')}. I’ll check the total and get ${byErrand(p, { order: 'checkout', ride: 'the ride', tickets: 'the tickets', table: 'the booking' })} ready. Nothing is charged without your approval.`,
  'buy.payWith': (p) => `Want me to pay from ${yours(p)} or your ${CARD}?`,
  'buy.shortCard': (p) => `${Yours(p)} won’t cover it. Should I put it on your ${CARD}, or do you want to add ${usd(n(p, 'amount'))} first?`,
  'buy.short': (p) => `You have ${usd2(n(p, 'balance'))} in ${yours(p)}. I can put this on your card instead, or you can add ${usd(n(p, 'amount'))} first.`,
  'buy.card': (p) =>
    n(p, 'card')
      ? `${short(p)}I’ll pay with a one-time card for exactly this ${orderNoun(p)}, charged to your ${CARD}.`
      : `I’ll pay from ${yours(p)} with a one-time card for exactly this ${orderNoun(p)}.`,
  'buy.auto': (p) =>
    `It’s under your ${usd(n(p, 'limit'))} limit, so I’m ${byErrand(p, { order: 'checking out', ride: 'booking it', bill: 'paying it', topup: 'sending it', tickets: 'buying them', table: 'booking it' })}.`,
  'buy.done': (p) => (n(p, 'now') ? 'Ordered. It gets there in about 30 minutes.' : 'Ordered. It arrives Thursday.'),
  'buy.sent': () => 'Done. It’s in your inbox.',
  'tickets.sent': (p) => `Done. ${n(p, 'tickets') === 1 ? 'Your ticket is' : 'The tickets are'} in your inbox.`,
  'table.done': (p) => `Booked: ${s(p, 'merchant')} at ${s(p, 'time')} for ${n(p, 'table')}. The confirmation is in your inbox, and the deposit comes off the bill.`,
  'ride.done': (p) => `Booked. Your driver is ${s(p, 'eta')} away${s(p, 'to') ? `, headed to ${s(p, 'to')}` : ''}.`,
  'topup.done': (p) => `Done. ${s(p, 'local') || usd2(n(p, 'amount'))} is on the phone now.`,
  'topup.amount': () => 'How much should I put on it?',
  'bill.done': (p) => `Paid. ${s(p, 'merchant')} has it, ahead of the ${s(p, 'due')} due date.`,
  'watch.set': (p) => `I’ll keep an eye on it and buy it the moment it’s under ${usd(n(p, 'below'))}.`,
  'watch.card': () => 'Add your card now, so I can buy it the moment it drops.',
  'watch.dropped': (p) => `The ${s(p, 'model')} just dropped to ${usd2(n(p, 'amount'))}, so I’m buying it like you asked.`,
  'watch.already': (p) => `It’s already ${usd2(n(p, 'amount'))}, under your ${usd(n(p, 'below'))}, so I’ll get it now.`,
  'buy.denied': (p) =>
    `Okay, I won’t ${byErrand(p, { order: 'place the order', ride: 'book the ride', bill: 'pay the bill', topup: 'send the top-up', tickets: 'buy the tickets', table: 'book the table' })}. Nothing was charged.`,

  'sub.intro': (p) => `It’s ${usd2(n(p, 'amount'))} a month for ${s(p, 'item')}.`,
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
  'cashout.bank': () => 'I’ll need your bank first. Link it once and I can move money there any time. Where is it?',
  'cashout.over': (p) => `You have ${usd2(n(p, 'balance'))} in ${yours(p)}, so I can move up to that.`,
  'cashout.empty': (p) => `There’s nothing in ${yours(p)} to move yet.`,
  'cashout.quote': (p) => `Moving ${s(p, 'local')} to your ${s(p, 'to')} over ${s(p, 'rail')}. ${WITHDRAW_TIMING}`,
  'cashout.auto': (p) => `It’s under your ${usd(n(p, 'limit'))} limit, so I’m sending it now.`,
  'cashout.done': () => 'Done. It’s in your account.',
  'cashout.noBalance': (p) => `There’s nothing to move yet. Set up ${a(p)} and add money, then I can move it to your bank.`,
  'cashout.denied': () => 'Okay, the money stays put.',

  'balance.answer': (p) => `You have ${usd2(n(p, 'balance'))}. Here’s where things stand.`,
  'history.answer': () => 'Here’s what moved recently.',
  'history.none': () => 'Nothing yet. Once I pay for something or money comes in, it shows up here.',
} satisfies Record<string, LineFn>;

export type LineKey = keyof typeof LINES;

/** A purchase's Pay with, for a checkout that can switch it: only with a card saved, so there's a choice. */
export const payOf = (p: Params | undefined): AgentAsk['pay'] =>
  n(p, 'saved')
    ? { by: n(p, 'card') ? 'card' : 'balance', card: CARD, wallet: s(p, 'wallet'), balance: usd2(n(p, 'balance')), enough: !!n(p, 'enough') }
    : undefined;

/** "Was $10" under a limit that changes; nothing under one that stays. */
export const was = (p: Params | undefined, key: string, from: string, format = (v: string) => `Was ${v}`) =>
  n(p, key) === n(p, from) ? undefined : format(usd(n(p, from)));

const limitsRows = (p?: Params): AgentAsk['rows'] => [
  { text: `Acts alone up to ${usd(n(p, 'approve'))}`, sub: was(p, 'approve', 'fromApprove'), icon: 'lock' },
  { text: `${usd(n(p, 'daily'))} a day`, sub: was(p, 'daily', 'fromDaily'), icon: 'gauge' },
  { text: `${usd(n(p, 'perTx'))} a payment`, sub: was(p, 'perTx', 'fromPerTx'), icon: 'gauge' },
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
    allow: s(p, 'go') ? `Save and ${s(p, 'go')}` : 'Save',
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
    title: `Send ${s(p, 'local')} to ${s(p, 'first')}${n(p, 'monthly') ? ', then monthly' : ''}`,
    who: { name: s(p, 'first'), flag: s(p, 'flag'), bank: s(p, 'bank'), detail: `${s(p, 'local')} to ${s(p, 'bank')} via ${s(p, 'rail')}` },
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
      : { name: s(p, 'short'), mark: '$', detail: `${s(p, 'asset')} on ${s(p, 'network')} · ${n(p, 'fee') ? `fee ${usd2(n(p, 'fee'))}` : 'no fee'}` },
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
    title: ['ship', 'now', ''].includes(s(p, 'delivery')) ? `Buy at ${s(p, 'merchant')}` : Buying(p),
    who: { name: s(p, 'merchant'), icon: s(p, 'image'), detail: `${s(p, 'item')} · one-time card` },
    amount: usd2(n(p, 'amount')),
    where: whereOf(p),
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
    method: `Paid direct · you save ${usd2(n(p, 'listed') - n(p, 'amount'))}`,
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
    title: `${s(p, 'wallet').charAt(0).toUpperCase()}${s(p, 'wallet').slice(1)} is on`,
    lines: [`Balance ${usd2(n(p, 'balance'))}`],
    done: true,
    balance: balanceOf(p, 'Available to spend'),
  }),
  deposit: (p) => {
    const lightning = s(p, 'network') === 'LIGHTNING';
    return {
      title: s(p, 'method'),
      code: ADDRESS_ON[s(p, 'network')] ?? ADDRESS_ON.BASE,
      glyph: lightning ? 'bolt' : 'coin',
      lines: lightning ? [`${usd2(n(p, 'amount'))} · expires in 10 min`] : [`Send ${s(p, 'currency')} only`, 'This address never expires'],
    };
  },
  receive: (p) => ({
    title: `Receive ${usd2(n(p, 'amount'))}`,
    code: s(p, 'network') === 'LIGHTNING' ? RECEIVE_INVOICE : ADDRESS_ON.BASE,
    glyph: s(p, 'network') === 'LIGHTNING' ? 'bolt' : 'coin',
    lines: [`From ${s(p, 'first')} · ${s(p, 'invoice')}`, s(p, 'method')],
  }),
  'deposit.bank': (p) => {
    const rows: [string, string][] = JSON.parse(s(p, 'rows') || '[]');
    const [first, ...rest] = rows;
    return {
      title: `Send ${s(p, 'send')} by ${s(p, 'rail')}`,
      code: first?.[1],
      glyph: 'bank',
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
    stats: [
      { label: 'Sent', value: s(p, 'sends') },
      { label: 'Fee', value: n(p, 'fee') ? usd2(n(p, 'fee')) : 'None' },
      { label: 'Network', value: n(p, 'lightning') ? 'Lightning' : s(p, 'network') },
    ],
  }),
  'receipt.pay': (p) => ({
    title: `${s(p, 'local')} to ${s(p, 'first')}`,
    lines: [`${s(p, 'bank')} · ${s(p, 'rail')}`, `${usd2(n(p, 'usd'))} from ${s(p, 'wallet')}`],
    done: true,
    stats: [
      { label: 'Sent', value: s(p, 'local') },
      { label: 'Cost', value: usd2(n(p, 'usd')) },
      { label: 'Via', value: s(p, 'rail') },
    ],
  }),
  'receipt.cashout': (p) => ({
    title: `${s(p, 'local')} to ${s(p, 'to')}`,
    lines: [s(p, 'rail'), `${usd2(n(p, 'usd'))} from ${s(p, 'wallet')}`],
    done: true,
    stats: [
      { label: 'Moved', value: s(p, 'local') },
      { label: 'From balance', value: usd2(n(p, 'usd')) },
      { label: 'Via', value: s(p, 'rail') },
    ],
  }),
  'receipt.buy': (p) => ({
    title: `${usd2(n(p, 'amount'))} at ${s(p, 'merchant')}`,
    lines: [n(p, 'card') ? `Paid with ${CARD}` : `Paid from ${yours(p)}`, 'One-time card'],
    done: true,
    stats: [
      { label: 'Total', value: usd2(n(p, 'amount')) },
      { label: 'Paid with', value: n(p, 'card') ? CARD : walletName(p) },
      { label: 'Card', value: 'One-time' },
    ],
  }),
  'receipt.sub': (p) => ({
    title: `${usd2(n(p, 'amount'))} at ${s(p, 'merchant')}`,
    lines: [`Recurring Visa · renews monthly, only for ${s(p, 'merchant')}`, ...(n(p, 'card') ? [`Billed to ${CARD}`] : [])],
    done: true,
    stats: [
      { label: 'Monthly', value: usd2(n(p, 'amount')) },
      { label: 'Billed to', value: n(p, 'card') ? CARD : walletName(p) },
      { label: 'Card', value: `${s(p, 'merchant')} only` },
    ],
  }),
  'receipt.agent': (p) => ({
    title: `Paid ${s(p, 'hotel')} · ${usd2(n(p, 'amount'))}`,
    lines: [s(p, 'dates'), `You saved ${usd2(n(p, 'listed') - n(p, 'amount'))} by paying direct`],
    done: true,
    stats: [
      { label: 'Paid', value: usd2(n(p, 'amount')) },
      { label: 'Saved', value: usd2(n(p, 'listed') - n(p, 'amount')) },
      { label: 'Stay', value: nightsOf(p) },
    ],
  }),
  'receipt.getpaid': (p) => ({
    title: `${usd2(n(p, 'amount'))} from ${s(p, 'payer')}`,
    lines: [`${s(p, 'invoice')} · paid`],
    done: true,
    stats: [
      { label: 'Received', value: usd2(n(p, 'amount')) },
      { label: 'Invoice', value: s(p, 'invoice') },
      { label: 'Status', value: 'Paid' },
    ],
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

/** Muse's sheet footnote and header by what it is: a bill or a top-up is a payment with no store terms to accept. */
const legalOf = (p: Params | undefined): Pick<AgentAsk, 'legal' | 'heading'> => {
  const merchant = s(p, 'merchant');
  const errand = errandOf(p);
  switch (errand) {
    case 'bill':
      return { heading: { title: 'Bill payment', payment: true } };
    case 'topup':
      return { heading: { title: 'Top-up', payment: true } };
    case 'ride':
      return { heading: { title: 'Ride' }, legal: { merchant, shares: 'trip info', policies: ['Privacy Policy', 'Terms of Service'] } };
    case 'table':
      return { heading: { title: 'Reservation' }, legal: { merchant, shares: 'booking info', policies: ['Cancellation Policy', 'Privacy Policy'] } };
    case 'tickets':
      return { heading: { title: 'Tickets' }, legal: { merchant, shares: 'order info', policies: ['Refund Policy', 'Privacy Policy', 'Terms of Service'] } };
    case 'order':
    case 'food':
      return { legal: { merchant, shares: 'order info', policies: ['Refund Policy', 'Privacy Policy', 'Terms of Service'] } };
    default: {
      const exhaustive: never = errand;
      return exhaustive;
    }
  }
};

/** Muse's order sheet for what it found. */
export const MUSE_ORDER = (p: Params | undefined): AgentAsk => ({
  title: `${s(p, 'agent')} wants to ${buyingAt(p)}`,
  badge: s(p, 'merchant')[0],
  rows: [
    { text: s(p, 'item'), ...(['ship', 'now', ''].includes(s(p, 'delivery')) && { sub: 'Qty: 1' }), image: s(p, 'image') },
    arrivalRow(p),
  ],
  total: usd2(n(p, 'amount')),
  payWith: n(p, 'card') ? CARD : 'Muse balance',
  method: n(p, 'card') ? 'Expires 09/29' : `${usd2(n(p, 'balance'))} available`,
  ...legalOf(p),
  where: whereOf(p),
  pay: payOf(p),
  allow: 'Allow',
  allowed: 'Allowed',
  denied: 'Denied',
});
