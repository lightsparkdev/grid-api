import type { ConnectorId } from '@/data/connectors';
import type { Params } from '../conversation';
import { HOTEL, LUCIA, PERSON, RING_LIGHT, SOFIA, SUBSCRIPTION, usd, usd2 } from '../story';
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
      greeting: () => `Morning, ${PERSON.first}. Your Thursday is clear after 2. Anything you want me to take care of?`,
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
  },

  /** xAI's bot: direct, a little dry. */
  grok: {
    name: 'Grok Bot',
    wallet: 'Bot balance',
    lines: {
      greeting: () => `Hey ${PERSON.first}. Give me the money chores. I’ll stay inside your limits and ask when it matters.`,
      'connect.intro': () => 'Sure. I need my own account and a leash. Here’s what I’m asking for.',
      'connect.done': () => 'Connected. My own account, your rules.',
      'pay.intro': () => `${SOFIA.first} banks with ${SOFIA.bank} in São Paulo, so PIX in reais. ${SOFIA.local.replace('.00', '')} is about ${usd(SOFIA.usd)}.`,
      'pay.done': () => `Sent. ${SOFIA.first}’s got it, and the receipt is in her inbox.`,
      'buy.done': () => 'Ordered. Arrives Thursday. The card already self-destructed.',
      'agent.accept': () => 'Taking the 10%. Paying directly.',
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
      greeting: () => `hey ${PERSON.first.toLowerCase()}! i can pay people, buy stuff and collect money for you. what do you need?`,
      'connect.intro': () => 'ooh yes. i’ll need my own account for that, with limits you pick. here’s what i’m asking for:',
      'connect.done': () => 'connected! i have my own account now and i can only spend what you put in it.',
      'fund.ask': () => 'pick what’s easiest:',
      'fund.done': (p) => `${usd(n(p, 'amount'))} landed! you’ve got ${usd2(n(p, 'balance'))} now.`,
      'pay.done': () => `sent! ${SOFIA.first.toLowerCase()} has it.`,
      'getpaid.ask': () => `how does ${LUCIA.first.toLowerCase()} want to pay?`,
      'getpaid.done': () => `${LUCIA.first.toLowerCase()} paid! ${usd2(LUCIA.amount)} is in your account. i sent her a receipt and marked the invoice paid.`,
      'cashout.ask': () => 'where to?',
      fallback: () => 'i can only help with your account here! try one of the flows on the left.',
    },
  },

  /** Instinct over iMessage: short texts, a lot more action than talk. */
  instinct: {
    name: 'Instinct',
    wallet: 'Instinct balance',
    lines: {
      greeting: () => `hey ${PERSON.first}, it’s Instinct. text me what you need and i’ll handle it`,
      'connect.intro': () => 'i need my own account for that. approve it here:',
      'connect.done': () => 'connected. i’ll stay inside your limits',
      'connect.denied': () => 'ok, no money stuff then',
      'fund.ask': () => 'how do you want to send it?',
      'fund.done': (p) => `got it. ${usd2(n(p, 'balance'))} in the account`,
      'limits.intro': () => 'i can’t change my own limits. confirm here:',
      'limits.done': (p) => `done. i’ll ask you for anything over ${usd(n(p, 'approve'))}`,
      'pay.intro': () => `${SOFIA.first} banks with ${SOFIA.bank}, so PIX. ${SOFIA.local.replace('.00', '')} ≈ ${usd2(SOFIA.usd)}`,
      'pay.done': () => `sent, ${SOFIA.first} has it`,
      'pay.denied': () => 'ok, not sending',
      'buy.card': () => 'i’ll use a one-time card for exactly this order. approve here:',
      'buy.done': () => 'ordered, arrives thursday',
      'agent.intro': () => `talked to ${HOTEL.name}’s agent. ${usd(HOTEL.listed)} for 2 nights`,
      'agent.done': () => 'booked. confirmation’s in your email',
      'getpaid.done': () => `${LUCIA.first} paid, ${usd2(LUCIA.amount)}`,
      'cashout.done': () => 'done, it’s in your bank',
      'balance.answer': (p) => `${usd2(n(p, 'balance'))}`,
      'history.answer': () => 'here’s this week',
      fallback: () => 'i can only help with your account here. try a flow on the left',
    },
  },

  /** Anthropic's Duet: measured, organized, the one that briefs you. */
  claude: {
    name: 'Claude',
    wallet: 'Duet balance',
    lines: {
      greeting: () => `Morning, ${PERSON.first}. Payroll ran at 6 AM, all 14 people are paid. What can I take on?`,
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
