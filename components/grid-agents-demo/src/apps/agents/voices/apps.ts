import type { ConnectorId } from '@/data/connectors';
import type { Params } from '../conversation';
import { BANK, HOTEL, LUCIA, PERSON, RING_LIGHT, SOFIA, SUBSCRIPTION, usd, usd2 } from '../story';
import {
  ASKS,
  MUSE_ORDER,
  type AskFn,
  type AskKey,
  type LineFn,
  type LineKey,
  type NoteFn,
  type NoteKey,
  type StatusKey,
} from './base';

/* What each app says differently. Anything not here falls back to the
   neutral voice (voices/base.ts). */

export interface VoiceOverrides {
  /** What the agent calls itself. */
  name: string;
  /** What the app calls the money it holds for you. */
  wallet: string;
  lines?: Partial<Record<LineKey, LineFn>>;
  asks?: Partial<Record<AskKey, AskFn>>;
  notes?: Partial<Record<NoteKey, NoteFn>>;
  status?: Partial<Record<StatusKey, LineFn>>;
}

const n = (p: Params | undefined, k: string) => Number(p?.[k] ?? 0);

/** Claude Duet's spend card: a clock on the request, Approve or Not now, then Paid. */
const duetSpend =
  (key: AskKey): AskFn =>
  (p) => ({ ...ASKS[key](p), expires: 'Expires in 10 min', allowed: 'Paid', deny: 'Not now', denied: 'Not now' });

export const VOICES: Record<ConnectorId, VoiceOverrides> = {
  /** Meta's agent: warm, brief, and it pays from its own Muse balance. */
  muse: {
    name: 'Muse',
    wallet: 'Muse balance',
    lines: {
      greeting: () => 'Hey! Your Thursday is clear after 2. Anything you want me to take care of?',
      'connect.intro': () => 'Happy to. I’ll set up a Muse balance for it, with limits you choose.',
      'connect.done': () => 'All set. Your Muse balance is ready, and I’ll always stay inside your limits.',
      'buy.intro': () => `Here are a few picks. The ${RING_LIGHT.merchant} RP10-H is the one I’d get: ${usd2(RING_LIGHT.amount)} with standard shipping.`,
      'buy.card': () => 'Here’s the final quote. Do these details look correct, and should I place the order with your Muse balance?',
      'buy.done': () => 'Ordered. It arrives Thursday, and tracking is in your inbox.',
      'pay.done': () => `Sent. ${SOFIA.first} has it, and I let her know it’s from you.`,
      'agent.done': () => 'You’re booked. The confirmation is in your inbox.',
      fallback: () => 'I can help with your Muse balance here. Try one of the flows on the left.',
    },
    asks: {
      buy: (p) => MUSE_ORDER(n(p, 'balance')),
    },
    status: {
      searching: () => '🛍️ Searching stores',
      filling: () => '📝 Filling checkout',
      paying: () => '💳 Checking out',
      quoting: () => '💱 Getting a quote',
      sending: () => '💸 Sending',
      setup: () => '✨ Setting up Muse balance',
      checking: () => '👀 Checking your balance',
      talking: () => `🏨 Talking to ${HOTEL.name}`,
      watching: () => '⏳ Waiting for the payment',
    },
  },

  /** xAI's bot: direct, a little dry. */
  grok: {
    name: 'Grok Bot',
    wallet: 'Bot balance',
    lines: {
      greeting: () => 'Hey. Give me the money chores. I’ll stay inside your limits and ask when it matters.',
      'connect.intro': () => 'Sure. I need my own account and a leash. Here’s what I’m asking for.',
      'connect.done': () => 'Connected. My own account, your rules.',
      'pay.intro': () => `${SOFIA.first} banks with ${SOFIA.bank} in São Paulo, so PIX in reais. ${SOFIA.local.replace('.00', '')} is about ${usd(SOFIA.usd)}.`,
      'pay.done': () => `Sent. ${SOFIA.first}’s got it, and the receipt is in her inbox.`,
      'buy.done': () => 'Ordered. Arrives Thursday. The card already self-destructed.',
      'agent.intro': () => `${HOTEL.name}’s agent wanted ${usd(HOTEL.listed)}. Paying directly knocks off 10%: ${usd2(HOTEL.amount)}.`,
      'getpaid.done': (p) => `${LUCIA.first} paid. ${usd2(LUCIA.amount)} in, ${usd2(n(p, 'balance'))} total.`,
      'balance.answer': (p) => `${usd2(n(p, 'balance'))}. Here’s the breakdown.`,
      fallback: () => 'Not my department here. I only handle your account. Pick a flow on the left.',
    },
    asks: {
      connect: (p) => ({
        ...ASKS.connect(p),
        form: {
          title: 'Turn on Bot balance',
          sub: 'Set what your Bot can spend. Only you can change these.',
          sheetTitle: 'Bot balance',
          fields: [
            { label: 'Per payment', value: usd(n(p, 'perTx')) },
            { label: 'Per day', value: usd(n(p, 'daily')) },
            { label: 'Ask me above', value: usd(n(p, 'approve')) },
          ],
          toggle: 'Face ID for anything over the limit',
          submitted: 'Turned on Bot balance',
        },
      }),
      vault: () => ({
        ...ASKS.vault(),
        form: {
          title: 'Add your card',
          sub: 'Never shown to your Bot. Only filled in your Bot’s vault.',
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
      bank: () => ({
        ...ASKS.bank(),
        form: {
          title: 'Link your bank',
          sub: 'Never shown to your Bot. Only filled in your Bot’s vault.',
          sheetTitle: 'Bank account',
          fields: [
            { label: 'Bank', value: `${BANK.name} · ${BANK.type}` },
            { label: 'Routing number', value: BANK.routing },
            { label: 'Account number', value: `•••• ${BANK.last4}` },
            { label: 'Account holder', value: PERSON.full },
          ],
          toggle: 'Securely save to your Bot’s vault',
          submitted: 'Linked your bank',
        },
      }),
      limits: (p) => ({
        ...ASKS.limits(p),
        form: {
          title: 'Update your Bot’s limits',
          sub: 'Your Bot can’t change its own limits. Review and save them here.',
          sheetTitle: 'Limits',
          fields: [
            { label: `Acts alone up to (was ${usd(n(p, 'fromApprove'))})`, value: usd(n(p, 'approve')) },
            { label: `Per day (was ${usd(n(p, 'fromDaily'))})`, value: usd(n(p, 'daily')) },
            { label: `Per payment (was ${usd(n(p, 'fromPerTx'))})`, value: usd(n(p, 'perTx')) },
          ],
          submitted: 'Saved new limits',
        },
      }),
    },
  },

  /** OpenAI's dot: casual, lowercase, upbeat. */
  dot: {
    name: 'dot',
    wallet: 'Dots balance',
    lines: {
      greeting: () => 'hey! i can pay people, buy stuff and collect money for you. what do you need?',
      'connect.intro': () => 'ooh yes. i’ll need a Dots balance for that, with limits you pick. here’s what i’m asking for:',
      'connect.done': () => 'done! your **Dots balance** is on, and i can only spend what you put in it.',
      'fund.ask': () => 'pick what’s easiest:',
      'fund.done': (p) => `${usd(n(p, 'amount'))} landed! you’ve got ${usd2(n(p, 'balance'))} now.`,
      'pay.done': () => `sent! ${SOFIA.first.toLowerCase()} has it.`,
      'getpaid.ask': () => `how does ${LUCIA.first.toLowerCase()} want to pay?`,
      'getpaid.done': () => `${LUCIA.first.toLowerCase()} paid! ${usd2(LUCIA.amount)} is in your account. i sent her a receipt and marked the invoice paid.`,
      'cashout.ask': () => 'where to?',
      'buy.intro': () => `found three that fit! the **${RING_LIGHT.merchant} RP10-H** is the best one, ${usd2(RING_LIGHT.amount)} with standard shipping:`,
      'buy.card': () => 'i’ll pay from your **Dots balance** with a one-time card, so the store never sees your real card. opening the checkout for you',
      'buy.done': () => 'ordered! it arrives **thursday**, and the card closed itself after the charge.',
      'pay.intro': () => `${SOFIA.first.toLowerCase()} banks with **${SOFIA.bank}**, so i’ll send it over PIX. ${SOFIA.local.replace('.00', '')} is **${usd2(SOFIA.usd)}** right now.`,
      fallback: () => 'i can only help with your account here! try one of the flows on the left.',
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
          { text: `Acts alone up to ${usd(n(p, 'approve'))}`, sub: `Was ${usd(n(p, 'fromApprove'))}.`, icon: 'lock' },
          { text: `${usd(n(p, 'daily'))} a day`, sub: `Was ${usd(n(p, 'fromDaily'))}.`, icon: 'gauge' },
          { text: `${usd(n(p, 'perTx'))} a payment`, sub: `Was ${usd(n(p, 'fromPerTx'))}.`, icon: 'gauge' },
        ],
        allow: 'Save limits',
        allowed: 'Limits saved',
      }),
    },
  },

  /** Instinct over iMessage: short texts, a lot more action than talk. */
  instinct: {
    name: 'Instinct',
    wallet: 'Instinct balance',
    lines: {
      greeting: () => 'hey, it’s Instinct. text me what you need and i’ll handle it',
      'connect.intro': () => 'i’ll need an Instinct balance for that. set it up in your vault:',
      'connect.done': () => 'done. your Instinct balance is on, and i’ll stay inside your limits',
      'connect.denied': () => 'ok, no money stuff then',
      'fund.ask': () => 'how do you want to send it?',
      'fund.done': (p) => `got it. ${usd2(n(p, 'balance'))} in the account`,
      'limits.intro': () => 'i can’t change my own limits. confirm them in your vault:',
      'limits.done': (p) => `done. i’ll ask you for anything over ${usd(n(p, 'approve'))}`,
      'pay.intro': () => `${SOFIA.first} banks with ${SOFIA.bank}, so PIX. ${SOFIA.local.replace('.00', '')} ≈ ${usd2(SOFIA.usd)}`,
      'pay.done': () => `sent, ${SOFIA.first} has it`,
      'pay.denied': () => 'ok, not sending',
      'buy.card': () => 'i’ll pay from your Instinct balance with a one-time card for exactly this order',
      'buy.intro': () => `found 3. the ${RING_LIGHT.merchant} RP10-H is the best one, ${usd2(RING_LIGHT.amount)} with standard shipping`,
      'buy.done': () => 'ordered, arrives thursday',
      'agent.intro': () => `talked to ${HOTEL.name}’s agent. ${usd2(HOTEL.amount)} for 2 nights if we pay direct, 10% off`,
      'agent.done': () => 'booked. confirmation’s in your email',
      'getpaid.done': () => `${LUCIA.first} paid, ${usd2(LUCIA.amount)}`,
      'cashout.done': () => 'done, it’s in your bank',
      'balance.answer': () => 'here’s where you’re at',
      'history.answer': () => 'here’s this week',
      fallback: () => 'i can only help with your account here. try a flow on the left',
    },
    asks: {
      connect: (p) => ({
        ...ASKS.connect(p),
        title: 'Turn on Instinct balance',
        rows: [
          { text: 'Per payment', sub: usd(n(p, 'perTx')), icon: 'gauge' },
          { text: 'Per day', sub: usd(n(p, 'daily')), icon: 'gauge' },
          { text: 'Ask me above', sub: usd(n(p, 'approve')), icon: 'lock' },
        ],
        allow: 'Save to vault',
        allowed: 'Saved',
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
      bank: () => ({
        ...ASKS.bank(),
        title: 'Link your bank',
        rows: [
          { text: 'Bank', sub: `${BANK.name} · ${BANK.type}`, icon: 'wallet' },
          { text: 'Routing number', sub: BANK.routing, icon: 'lock' },
          { text: 'Account number', sub: `•••• ${BANK.last4}`, icon: 'lock' },
          { text: 'Account holder', sub: PERSON.full, icon: 'lock' },
        ],
        allow: 'Save to vault',
        allowed: 'Saved',
      }),
      limits: (p) => ({
        ...ASKS.limits(p),
        title: 'Update your limits',
        rows: [
          { text: `Acts alone up to (was ${usd(n(p, 'fromApprove'))})`, sub: usd(n(p, 'approve')), icon: 'lock' },
          { text: `Per day (was ${usd(n(p, 'fromDaily'))})`, sub: usd(n(p, 'daily')), icon: 'gauge' },
          { text: `Per payment (was ${usd(n(p, 'fromPerTx'))})`, sub: usd(n(p, 'perTx')), icon: 'gauge' },
        ],
        allow: 'Save to vault',
        allowed: 'Saved',
      }),
    },
  },

  /** Anthropic's Duet: measured, organized, the one that briefs you. */
  claude: {
    name: 'Claude',
    wallet: 'Duet balance',
    lines: {
      greeting: () => 'Payroll ran at 6 AM, all 14 people are paid. What can I take on?',
      'connect.intro': () => 'I’ll need my own account for this, with limits you set. Here’s exactly what I’m asking for.',
      'connect.done': () => 'Connected. I have my own account now, and I’ll stay inside the limits you set.',
      'pay.intro': () => `${SOFIA.first} banks with ${SOFIA.bank}, so I’ll send it over PIX in reais. ${SOFIA.local.replace('.00', '')} comes to ${usd2(SOFIA.usd)} at today’s rate.`,
      'buy.card': () => 'I’ll pay with a virtual card locked to this one order.',
      'buy.done': () => 'Done. It ships Monday, and the card closed itself after the charge.',
      'sub.card': () => `I’ll use a card only ${SUBSCRIPTION.merchant} can charge, capped at ${usd2(SUBSCRIPTION.amount)} a month.`,
      'agent.done': () => 'Booked. I added it to your calendar and filed the receipt.',
      'history.answer': () => 'Here’s what moved this week.',
      fallback: () => 'I can only help with your account here. Try one of the flows on the left.',
    },
    asks: {
      pay: duetSpend('pay'),
      cashout: duetSpend('cashout'),
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
