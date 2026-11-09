import type { ConnectorId } from '@/data/connectors';
import type { Params } from '../conversation';
import { BANK_REACH } from '@/data/bankCountries';
import { usd, usd2 } from '../story';
import {
  ASKS,
  CARD,
  MUSE_ORDER,
  short,
  nightsOf,
  setupDone,
  type AskFn,
  type AskKey,
  type LineFn,
  type LineKey,
  type NoteFn,
  type NoteKey,
  type StatusKey,
  was,
} from './base';

/* What each app says differently. Anything not here falls back to the
   neutral voice (voices/base.ts). */

export interface VoiceOverrides {
  /** What the agent calls itself. */
  name: string;
  /** A lowercase voice: neutral lines it hasn't written its own way are lowercased to match (`casual`). */
  casual?: boolean;
  /** What the app calls the money it holds for you. */
  wallet: string;
  lines?: Partial<Record<LineKey, LineFn>>;
  asks?: Partial<Record<AskKey, AskFn>>;
  notes?: Partial<Record<NoteKey, NoteFn>>;
  status?: Partial<Record<StatusKey, LineFn>>;
}

const n = (p: Params | undefined, k: string) => Number(p?.[k] ?? 0);
const s = (p: Params | undefined, k: string) => String(p?.[k] ?? '');
const lower = (p: Params | undefined, k: string) => s(p, k).toLowerCase();
/** Instinct's " (was $10)" after a limit that changes. */
const wasText = (p: Params | undefined, key: string, from: string) => was(p, key, from, (v) => ` (was ${v})`) ?? '';

/** Muse's send and withdraw checkouts: what pays sits in a Pay with row above the total, as its order sheet does. */
const museSpend =
  (key: 'pay' | 'cashout' | 'crypto'): AskFn =>
  (p) => ({ ...ASKS[key](p), payWith: 'Muse balance', method: `${usd2(n(p, 'balance'))} available` });

/** Claude Duet's spend card: a clock on the request, Approve, then Paid. */
const duetSpend =
  (key: AskKey): AskFn =>
  (p) => ({ ...ASKS[key](p), expires: 'Expires in 10 min', allowed: 'Paid' });

export const VOICES: Record<ConnectorId, VoiceOverrides> = {
  /** Meta's agent: warm, brief, and it pays from its own Muse balance. */
  muse: {
    name: 'Muse',
    wallet: 'Muse balance',
    lines: {
      greeting: () => `Hey! I can pay people in ${BANK_REACH} countries, shop and collect money for you. Add a card or set up a Muse balance to start.`,
      'setup.auto': (p) => `Quick note: ${setupDone(p)}, so we can dive right in.`,
      'connect.already': () => 'Already set! Here’s your Muse balance.',
      'connect.intro': () => 'First I’ll set up a Muse balance, with limits you choose.',
      'connect.self': (p) => (n(p, 'hasAgent') ? 'Happy to. Here’s the Muse balance I’d set up, with limits you choose.' : 'Happy to. I’ll set up a Muse balance with limits you choose.'),
      'connect.done': () => 'All set. Your Muse balance is ready, and I’ll always stay inside your limits.',
      'connect.denied': (p) => (n(p, 'hasAgent') ? `No problem. I’ll keep paying with your ${CARD}.` : 'No problem. I won’t touch money until you set me up.'),
      'buy.which': (p) => `The ${s(p, 'merchant')} ${s(p, 'model')} is the one I’d get. Want it, or one of the others?`,
      'buy.card': (p) =>
        n(p, 'needs')
          ? `${short(p)}Here’s the final quote. Do these details look correct, and should I place the order with your ${n(p, 'card') ? CARD : 'Muse balance'}?`
          : `${short(p)}Here’s the final quote: ${usd2(n(p, 'amount'))} on your ${n(p, 'card') ? CARD : 'Muse balance'}.`,
      'buy.done': (p) => (n(p, 'now') ? 'Ordered. It gets there in about 30 minutes, and you can track it from your inbox.' : 'Ordered. It arrives Thursday, and tracking is in your inbox.'),
      'buy.sent': () => 'Sent! It’s in your inbox.',
      'pay.newRecipient': (p) => `I don’t have ${s(p, 'first')}’s bank yet. Add it once and I’ll take it from there.`,
      'pay.done': (p) => `Sent! ${s(p, 'first')} has it, and I let them know it’s from you.`,
      'agent.done': () => 'You’re booked. The confirmation is in your inbox.',
      fallback: () => 'I can only help with money here: paying people, shopping, and getting paid.',
    },
    asks: {
      buy: (p) => MUSE_ORDER(p),
      pay: museSpend('pay'),
      cashout: museSpend('cashout'),
      crypto: museSpend('crypto'),
    },
    status: {
      searching: () => '🛍️ Searching stores',
      filling: () => '📝 Filling checkout',
      paying: () => '💳 Checking out',
      quoting: () => '💱 Getting a quote',
      sending: () => '💸 Sending',
      setup: () => '✨ Setting up Muse balance',
      checking: () => '👀 Checking your balance',
      talking: (p) => `🏨 Talking to ${s(p, 'hotel')}`,
      watching: () => '⏳ Waiting for the payment',
    },
  },

  /** xAI's bot: direct, a little dry. */
  grok: {
    name: 'Grok Bot',
    wallet: 'Grok Bot balance',
    lines: {
      greeting: () => `Hey. Give me the money chores: paying people in ${BANK_REACH} countries, subscriptions, getting paid. Hand me a card or a balance, plus a leash. Pick one.`,
      'setup.auto': (p) => `FYI: ${setupDone(p)}. Skipped the paperwork.`,
      'connect.already': () => 'Already connected. Here’s the account.',
      'connect.intro': (p) => (n(p, 'hasAgent') ? 'That needs a Grok Bot balance. Here’s the deal.' : 'First I need my own account and a leash. Here’s what I’m asking for.'),
      'connect.self': (p) => (n(p, 'hasAgent') ? 'Sure. Here’s the Grok Bot balance deal.' : 'Sure. I need my own account and a leash. Here’s what I’m asking for.'),
      'connect.done': (p) => (n(p, 'hasAgent') ? 'Grok Bot balance on. Your rules.' : 'Connected. My own account, your rules.'),
      'fund.offer': () => 'Empty for now. Add money?',
      'fund.offerShort': () => 'Add money?',
      'fund.offerFrom': (p) => `Balance is empty. Top up from your ${n(p, 'bank') ? 'bank' : 'card'}?`,
      'pay.newRecipient': (p) => `No bank on file for ${s(p, 'first')}. Add it once and I’ll send it.`,
      'pay.intro': (p) => `${s(p, 'first')} banks with ${s(p, 'bank')}, so ${s(p, 'rail')}.${n(p, 'converted') ? ` ${s(p, 'from')} is about ${s(p, 'to')}.` : ''}`,
      'pay.done': (p) => `Sent. ${s(p, 'first')}’s got it. Receipt’s in your inbox.`,
      'buy.done': (p) => (n(p, 'now') ? 'Ordered. There in about 30 minutes. The card already self-destructed.' : 'Ordered. Arrives Thursday. The card already self-destructed.'),
      'buy.sent': () => 'Sent. It’s in your inbox. The card already self-destructed.',
      'agent.intro': (p) => `${s(p, 'hotel')}’s agent wanted ${usd(n(p, 'listed'))}. Paying directly knocks off 10%: ${usd2(n(p, 'amount'))}.`,
      'getpaid.done': (p) => `${s(p, 'first')} paid. ${usd2(n(p, 'amount'))} in, ${usd2(n(p, 'balance'))} total.`,
      'balance.answer': (p) => `${usd2(n(p, 'balance'))}. Here’s the breakdown.`,
      fallback: () => 'Not my department. I only handle money: paying people, shopping, getting paid.',
    },
    asks: {
      connect: (p) => ({
        ...ASKS.connect(p),
        form: {
          title: 'Turn on Grok Bot balance',
          sub: 'Set what your Bot can spend. Only you can change these.',
          sheetTitle: 'Grok Bot balance',
          fields: [
            { label: 'Per payment', value: usd(n(p, 'perTx')) },
            { label: 'Per day', value: usd(n(p, 'daily')) },
            { label: 'Ask me above', value: usd(n(p, 'approve')) },
          ],
          toggle: 'Face ID for anything over the limit',
          submitted: 'Turned on Grok Bot balance',
        },
      }),
      vault: () => ({
        ...ASKS.vault(),
        form: {
          title: 'Add your card',
          sub: 'Saved to your Bot’s vault. Remove it any time in Settings.',
          sheetTitle: 'Card',
          fields: [
            { label: 'Card number', value: '4242 4242 4242 4242' },
            { label: 'Expiration', value: '09 / 29' },
            { label: 'CVC', value: '•••' },
            { label: 'ZIP', value: '90405' },
          ],
          toggle: 'Securely save to your Bot’s vault',
          submitted: 'Saved your card',
        },
      }),
      bank: (p) => ({
        ...ASKS.bank(p),
        form: {
          title: 'Link your bank',
          sub: `Banks in ${BANK_REACH} countries.`,
          sheetTitle: 'Bank account',
          fields: [],
          submitted: 'Linked your bank',
        },
      }),
      recipient: (p) => ({
        ...ASKS.recipient(p),
        form: {
          title: `Add ${s(p, 'first')}’s bank`,
          sub: `${s(p, 'country')} · ${s(p, 'rail')}.`,
          sheetTitle: 'Bank account',
          fields: [],
          submitted: `Saved ${s(p, 'first')}’s bank`,
        },
      }),
      limits: (p) => ({
        ...ASKS.limits(p),
        form: {
          title: 'Update your Bot’s limits',
          sub: 'Your Bot can’t change its own limits. Review and save them here.',
          sheetTitle: 'Limits',
          fields: [
            { label: `Acts alone up to${was(p, 'approve', 'fromApprove', (v) => ` (was ${v})`) ?? ''}`, value: usd(n(p, 'approve')) },
            { label: `Per day${was(p, 'daily', 'fromDaily', (v) => ` (was ${v})`) ?? ''}`, value: usd(n(p, 'daily')) },
            { label: `Per payment${was(p, 'perTx', 'fromPerTx', (v) => ` (was ${v})`) ?? ''}`, value: usd(n(p, 'perTx')) },
          ],
          submitted: 'Saved new limits',
        },
      }),
    },
  },

  /** OpenAI's dot: casual, lowercase, upbeat. */
  dot: {
    name: 'dot',
    casual: true,
    wallet: 'Dots balance',
    lines: {
      greeting: () => `hey! i can pay people in ${BANK_REACH} countries, buy stuff and collect money for you. add a card or set up a Dots balance to start. try one of these:`,
      'setup.auto': (p) => `heads up: ${setupDone(p).toLowerCase().replace('dots balance', 'Dots balance')}, so we can jump right in!`,
      'fund.needed': (p) => `i’ll need ${usd(n(p, 'amount'))} in your **Dots balance** to cover that. how do you want to add it?`,
      'connect.already': () => 'already on! here’s your **Dots balance**:',
      'limits.same': (p) => `those are already my limits! i handle anything up to ${usd(n(p, 'approve'))}, ${usd(n(p, 'perTx'))} a payment and ${usd(n(p, 'daily'))} a day.`,
      'agent.already': (p) => `you’re already booked at ${lower(p, 'hotel')} for ${lower(p, 'dates')}! the confirmation’s in your inbox.`,
      'getpaid.already': (p) => `${lower(p, 'first')} already paid that invoice! nothing else is outstanding.`,
      'connect.intro': () => 'first i’ll need a **Dots balance** for that, with limits you pick. here’s what i’m asking for:',
      'connect.self': () => 'ooh yes. here’s the **Dots balance** i’d set up, with limits you pick:',
      'connect.done': () => 'done! your **Dots balance** is on, and i’ll stay inside your limits.',
      'connect.denied': (p) => (n(p, 'hasAgent') ? `no problem! i’ll keep paying with your **${CARD}**.` : 'no problem! i won’t touch money until you set me up.'),
      'fund.offer': () => 'it’s empty for now. want to add money?',
      'fund.offerShort': () => 'want to add money?',
      'fund.offerFrom': (p) => `your **Dots balance** is empty. want to add money from ${n(p, 'bank') ? 'your bank' : `your **${CARD}**`}?`,
      'fund.amount': () => 'sure! how much should i add?',
      'fund.ask': () => 'pick what’s easiest:',
      'fund.done': (p) => `${usd(n(p, 'amount'))} landed! you’ve got ${usd2(n(p, 'balance'))} now.`,
      'pay.newRecipient': (p) => `i don’t have ${lower(p, 'first')}’s bank yet! add it here once and i’ll send it.`,
      'pay.done': (p) => `sent! ${lower(p, 'first')} has it.`,
      'getpaid.ask': (p) => `how does ${lower(p, 'first')} want to pay?`,
      'getpaid.done': (p) => `${lower(p, 'first')} paid! ${usd2(n(p, 'amount'))} is in your account. i sent a receipt and marked the invoice paid.`,
      'cashout.amount': () => 'sure! how much should i move to your bank?',
      'cashout.bank': () => 'i’ll need your bank first! link it once and i can send money there any time. where is it?',
      'buy.which': (p) => `i’d go with the **${s(p, 'merchant')} ${s(p, 'model')}**! want that one, or one of the others?`,
      'buy.card': (p) =>
        n(p, 'card')
          ? `${n(p, 'short') ? 'your **Dots balance** won’t cover it, so ' : ''}i’ll put it on your **${CARD}** through a one-time card for exactly this order.${n(p, 'needs') ? ' opening the checkout for you' : ''}`
          : `i’ll pay from your **Dots balance** with a one-time card for exactly this order.${n(p, 'needs') ? ' opening the checkout for you' : ''}`,
      'buy.payWith': () => `want me to pay from your **Dots balance** or your **${CARD}**?`,
      'buy.short': (p) => `you’ve got ${usd2(n(p, 'balance'))} in your **Dots balance**. i can put this on your card instead, or you can add ${usd(n(p, 'amount'))} first!`,
      'card.forBuy': () => 'add your card once and i’ll take it from there!',
      'card.done': (p) => (n(p, 'topUp') ? `saved! i can pay with your **${CARD}** now, or top up from it.` : `saved! i can pay with your **${CARD}** now.`),
      'balance.offer': () => 'want a **Dots balance** too? i can pay from it without your card, and you can get paid into it and send money abroad.',
      'balance.later': () => 'no problem! just ask when you want one.',
      'bank.kept': () => 'i’ll keep this account connected for next time, for adding money and withdrawing.',
      'buy.done': (p) => (n(p, 'now') ? 'ordered! it’ll be there in **about 30 minutes**.' : 'ordered! it arrives **thursday**.'),
      'buy.sent': () => 'sent! it’s in your **inbox**.',
      'pay.intro': (p) => `${lower(p, 'first')} banks with **${s(p, 'bank')}**, so i’ll send it over ${s(p, 'rail')}.${n(p, 'converted') ? ` ${s(p, 'from')} is **${s(p, 'to')}** right now.` : ''}`,
      fallback: () => 'i can only help with money here! paying people, shopping, getting paid.',
    },
    asks: {
      connect: (p) => ({
        ...ASKS.connect(p),
        title: 'Turn on Dots balance',
        rows: [
          { text: 'Your own Dots balance', sub: 'You fund it. It stays separate from your bank.', icon: 'wallet' },
          { text: `Up to ${usd(n(p, 'perTx'))} a payment`, sub: `And ${usd(n(p, 'daily'))} a day in total.`, icon: 'gauge' },
          { text: `It asks you above ${usd(n(p, 'approve'))}`, sub: 'You approve those with Face ID.', icon: 'lock' },
        ],
        allow: 'Turn on Dots balance',
        allowed: 'Dots balance on',
      }),
      limits: (p) => ({
        ...ASKS.limits(p),
        title: 'Update your limits',
        rows: [
          { text: `Acts alone up to ${usd(n(p, 'approve'))}`, sub: was(p, 'approve', 'fromApprove', (v) => `Was ${v}.`), icon: 'lock' },
          { text: `${usd(n(p, 'daily'))} a day`, sub: was(p, 'daily', 'fromDaily', (v) => `Was ${v}.`), icon: 'gauge' },
          { text: `${usd(n(p, 'perTx'))} a payment`, sub: was(p, 'perTx', 'fromPerTx', (v) => `Was ${v}.`), icon: 'gauge' },
        ],
        allow: s(p, 'go') ? `Save and ${s(p, 'go')}` : 'Save limits',
        allowed: 'Limits saved',
      }),
    },
  },

  /** Instinct over iMessage: short texts, a lot more action than talk. */
  instinct: {
    name: 'Instinct',
    casual: true,
    wallet: 'Instinct balance',
    lines: {
      greeting: () => 'hey, it’s Instinct. text me anything money, paying someone abroad, a subscription. add a card or set up an Instinct balance to start',
      'setup.auto': (p) => `fyi ${setupDone(p).replace(/^I /, 'i ')}`,
      'fund.needed': (p) => `need ${usd(n(p, 'amount'))} in your Instinct balance to cover that. how do you want to add it?`,
      'connect.already': () => 'already on. here’s where you’re at',
      'limits.same': (p) => `those are already my limits, ${usd(n(p, 'approve'))} on my own, ${usd(n(p, 'perTx'))} a payment, ${usd(n(p, 'daily'))} a day`,
      'agent.already': (p) => `you’re already booked at ${s(p, 'hotel')}, ${lower(p, 'dates')}`,
      'getpaid.already': (p) => `${s(p, 'first')} already paid, nothing outstanding`,
      'connect.intro': () => 'first i’ll need an Instinct balance for that, with limits you ok',
      'connect.self': () => 'sure, here’s the Instinct balance i’d set up, with limits you ok',
      'connect.done': () => 'done. your Instinct balance is on, and i’ll stay inside your limits',
      'connect.denied': (p) => (n(p, 'hasAgent') ? 'ok, no balance. i’ll keep using your card' : 'ok, no money stuff then'),
      'fund.offer': () => 'it’s empty for now, want to add money?',
      'fund.offerShort': () => 'want to add money?',
      'fund.offerFrom': (p) => `your Instinct balance is empty, want to add money from your ${n(p, 'bank') ? 'bank' : 'card'}?`,
      'fund.amount': () => 'how much?',
      'fund.ask': () => 'how do you want to add it?',
      'fund.done': (p) => `got it. ${usd2(n(p, 'balance'))} in the account`,
      'limits.intro': () => 'i can’t change my own limits, you have to ok them',
      'limits.done': (p) =>
        s(p, 'what') === 'perTx'
          ? `done. up to ${usd(n(p, 'perTx'))} a payment now`
          : s(p, 'what') === 'daily'
            ? `done. up to ${usd(n(p, 'daily'))} a day now`
            : `done. i’ll ask you for anything over ${usd(n(p, 'approve'))}`,
      'pay.newRecipient': (p) => `need ${lower(p, 'first')}’s bank first. add it here and i’ll send it`,
      'pay.intro': (p) => `${lower(p, 'first')} banks with ${s(p, 'bank')}, so ${s(p, 'rail')}${n(p, 'converted') ? `. ${s(p, 'from')} ≈ ${s(p, 'to')}` : ''}`,
      'pay.done': (p) => `sent, ${lower(p, 'first')} has it`,
      'pay.denied': () => 'ok, not sending',
      'buy.card': (p) =>
        n(p, 'card')
          ? `${n(p, 'short') ? 'your Instinct balance won’t cover it, so ' : ''}i’ll put it on your ${CARD} with a one-time card for exactly this order`
          : 'i’ll pay from your Instinct balance with a one-time card for exactly this order',
      'buy.payWith': () => `your Instinct balance or your ${CARD}?`,
      'buy.short': (p) => `you’ve got ${usd2(n(p, 'balance'))} in your Instinct balance. i can put this on your card, or you can add ${usd(n(p, 'amount'))} first`,
      'card.forBuy': () => 'add your card once and i’ve got it',
      'balance.offer': () => 'want an Instinct balance too? i can pay from it without your card, and you can get paid into it, send money abroad',
      'balance.later': () => 'ok, just ask when you want one',
      'buy.which': (p) => `i’d go with the ${s(p, 'merchant')} ${s(p, 'model')}. that one, or one of the others?`,
      'buy.picked': (p) => `got your pick: the ${s(p, 'item')}. i’ll check the current total and get checkout ready. nothing’s charged without your ok`,
      'buy.shortCard': (p) => `your Instinct balance won’t cover it. put it on your ${CARD}, or add ${usd(n(p, 'amount'))} first?`,
      'bank.kept': () => 'i’ll keep it connected for next time, for adding money and withdrawing',
      'buy.done': (p) => (n(p, 'now') ? 'ordered, there in about 30 min' : 'ordered, arrives thursday'),
      'buy.sent': () => 'sent, it’s in your inbox',
      'agent.intro': (p) => `talked to ${s(p, 'hotel')}’s agent. ${usd2(n(p, 'amount'))} for ${nightsOf(p)} if we pay direct, 10% off`,
      'agent.done': () => 'booked. confirmation’s in your email',
      'getpaid.done': (p) => `${s(p, 'first')} paid, ${usd2(n(p, 'amount'))}`,
      'cashout.done': () => 'done, it’s in your bank',
      'cashout.amount': () => 'how much?',
      'cashout.bank': () => 'need your bank first. where is it?',
      'balance.answer': () => 'here’s where you’re at',
      'history.answer': () => 'here’s this week',
      fallback: () => 'i only do money here, paying people, shopping, getting paid',
    },
    asks: {
      connect: (p) => ({
        ...ASKS.connect(p),
        title: 'Turn on Instinct balance',
        text: `here’s what i’d set: up to ${usd(n(p, 'perTx'))} a payment, ${usd(n(p, 'daily'))} a day, and i’ll text you before anything over ${usd(n(p, 'approve'))}. reply yes and i’ll turn it on`,
      }),
      vault: () => ({
        ...ASKS.vault(),
        title: 'Purchase card',
        rows: [
          { text: 'Card number', sub: '•••• •••• •••• 4242', icon: 'card' },
          { text: 'Expiry month', sub: '09', icon: 'card' },
          { text: 'Expiry year', sub: '29', icon: 'card' },
          { text: 'CVV', sub: '•••', icon: 'lock' },
          { text: 'Billing ZIP', sub: '90405', icon: 'lock' },
        ],
        allow: 'Save to vault',
        allowed: 'Saved',
      }),
      bank: (p) => ({
        ...ASKS.bank(p),
        allowed: 'Saved',
      }),
      limits: (p) => ({
        ...ASKS.limits(p),
        title: 'Update your limits',
        text: `new limits: i’d act alone up to ${usd(n(p, 'approve'))}${wasText(p, 'approve', 'fromApprove')}, ${usd(n(p, 'daily'))} a day${wasText(p, 'daily', 'fromDaily')}, ${usd(n(p, 'perTx'))} a payment${wasText(p, 'perTx', 'fromPerTx')}. reply yes to save them${s(p, 'go') ? ` and ${s(p, 'go')} it` : ''}`,
      }),
    },
  },

  /** Anthropic's Duet: measured, organized, the one that briefs you. */
  claude: {
    name: 'Claude',
    wallet: 'Duet balance',
    lines: {
      greeting: () => `Hi. I can pay people in ${BANK_REACH} countries, shop and get paid for you. To start, add a card or set up a Duet balance.`,
      'setup.auto': (p) => `For the record: ${setupDone(p)}, so we could go straight to it.`,
      'connect.intro': (p) =>
        n(p, 'hasAgent') ? 'I’ll need a Duet balance for this, with limits you set. Here’s exactly what I’m asking for.' : 'First I’ll need my own account for this, with limits you set. Here’s exactly what I’m asking for.',
      'connect.self': (p) => (n(p, 'hasAgent') ? 'Here’s the Duet balance, with limits you set.' : 'I’ll need my own account, with limits you set. Here’s exactly what I’m asking for.'),
      'connect.done': (p) => (n(p, 'hasAgent') ? 'Your Duet balance is on, and I’ll stay inside the limits you set.' : 'Connected. I have my own account now, and I’ll stay inside the limits you set.'),
      'pay.newRecipient': (p) => `I don’t have ${s(p, 'first')}’s bank details yet. Add them here once, and I’ll send it right after.`,
      'pay.intro': (p) => `${s(p, 'first')} banks with ${s(p, 'bank')}, so I’ll send it over ${s(p, 'rail')}.${n(p, 'converted') ? ` ${s(p, 'from')} comes to ${s(p, 'to')} at today’s rate.` : ''}`,
      'buy.card': (p) => `${short(p)}I’ll pay with a virtual card locked to this one order${n(p, 'card') ? `, charged to your ${CARD}` : ''}.`,
      'buy.done': (p) => (n(p, 'now') ? 'Done. It gets there in about 30 minutes, and the receipt is filed.' : 'Done. It arrives Thursday, and the receipt is filed.'),
      'buy.sent': () => 'Done. It’s in your inbox, and the receipt is filed.',
      'sub.card': (p) => `${short(p)}I’ll use a card only ${s(p, 'merchant')} can charge, capped at ${usd2(n(p, 'amount'))} a month${n(p, 'card') ? `, billed to your ${CARD}` : ''}.`,
      'agent.done': () => 'Booked. I added it to your calendar and filed the receipt.',
      'history.answer': () => 'Here’s what moved this week.',
      fallback: () => 'I can only help with money here: paying people, shopping, and getting paid.',
    },
    asks: {
      // Duet asks for a yes in the thread, with reply pills, and keeps cards for money.
      connect: (p) => ({
        ...ASKS.connect(p),
        text: `Here’s the setup: up to ${usd(n(p, 'perTx'))} a payment and ${usd(n(p, 'daily'))} a day, and I’ll check with you before anything over ${usd(n(p, 'approve'))}. Want me to turn it on?`,
      }),
      limits: (p) => ({
        ...ASKS.limits(p),
        text: `New limits: I’d act alone up to ${usd(n(p, 'approve'))}${wasText(p, 'approve', 'fromApprove')}, ${usd(n(p, 'daily'))} a day${wasText(p, 'daily', 'fromDaily')} and ${usd(n(p, 'perTx'))} a payment${wasText(p, 'perTx', 'fromPerTx')}. ${s(p, 'go') ? `Save them and ${s(p, 'go')} it?` : 'Save them?'}`,
      }),
      pay: duetSpend('pay'),
      cashout: duetSpend('cashout'),
      crypto: duetSpend('crypto'),
      buy: duetSpend('buy'),
      sub: duetSpend('sub'),
      agent: duetSpend('agent'),
    },
  },

  /** A platform's own agent: the neutral voice. */
  yourapp: {
    name: 'Your agent',
    wallet: 'your balance',
  },
};
