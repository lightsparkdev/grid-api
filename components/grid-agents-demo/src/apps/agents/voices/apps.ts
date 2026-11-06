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
const s = (p: Params | undefined, k: string) => String(p?.[k] ?? '');
const lower = (p: Params | undefined, k: string) => s(p, k).toLowerCase();

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
      greeting: () => `Hey! I can pay people in ${BANK_REACH} countries, shop and collect money for you. I’ll just need a Muse balance first, with limits you set. Tap below to start.`,
      'setup.auto': (p) => `Quick note: ${setupDone(p)}, so we can dive right in.`,
      'connect.already': () => 'Already set! Here’s your Muse balance.',
      'connect.intro': () => 'First I’ll set up a Muse balance for it, with limits you choose.',
      'connect.done': () => 'All set. Your Muse balance is ready, and I’ll always stay inside your limits.',
      'buy.intro': (p) => `Here are a few picks. The ${s(p, 'merchant')} ${s(p, 'model')} is the one I’d get: ${usd2(n(p, 'amount'))} with standard shipping.`,
      'buy.card': (p) => `${short(p)}Here’s the final quote. Do these details look correct, and should I place the order with your ${n(p, 'card') ? CARD : 'Muse balance'}?`,
      'buy.done': () => 'Ordered. It arrives Thursday, and tracking is in your inbox.',
      'pay.newRecipient': (p) => `I don’t have ${s(p, 'first')}’s bank yet. Add it once and I’ll take it from there.`,
      'pay.done': (p) => `Sent! ${s(p, 'first')} has it, and I let them know it’s from you.`,
      'agent.done': () => 'You’re booked. The confirmation is in your inbox.',
      fallback: () => 'I can help with your Muse balance here. Try one of the flows on the left.',
    },
    asks: {
      buy: (p) => MUSE_ORDER(p),
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
    wallet: 'Bot balance',
    lines: {
      greeting: () => `Hey. Give me the money chores: paying people in ${BANK_REACH} countries, subscriptions, getting paid. First I need my own account and a leash. Pick one.`,
      'setup.auto': (p) => `FYI: ${setupDone(p)}. Skipped the paperwork.`,
      'connect.already': () => 'Already connected. Here’s the account.',
      'connect.intro': () => 'First I need my own account and a leash. Here’s what I’m asking for.',
      'connect.done': () => 'Connected. My own account, your rules.',
      'pay.newRecipient': (p) => `No bank on file for ${s(p, 'first')}. Add it once and I’ll send it.`,
      'pay.intro': (p) => `${s(p, 'first')} banks with ${s(p, 'bank')}, so ${s(p, 'rail')}.${n(p, 'converted') ? ` ${s(p, 'local')} is about ${usd(n(p, 'usd'))}.` : ''}`,
      'pay.done': (p) => `Sent. ${s(p, 'first')}’s got it. Receipt’s in your inbox.`,
      'buy.done': () => 'Ordered. Arrives Thursday. The card already self-destructed.',
      'agent.intro': (p) => `${s(p, 'hotel')}’s agent wanted ${usd(n(p, 'listed'))}. Paying directly knocks off 10%: ${usd2(n(p, 'amount'))}.`,
      'getpaid.done': (p) => `${s(p, 'first')} paid. ${usd2(n(p, 'amount'))} in, ${usd2(n(p, 'balance'))} total.`,
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
      bank: (p) => ({
        ...ASKS.bank(p),
        form: {
          title: 'Link your bank',
          sub: `Banks in ${BANK_REACH} countries. Never shown to your Bot.`,
          sheetTitle: 'Bank account',
          fields: [],
          submitted: 'Linked your bank',
        },
      }),
      recipient: (p) => ({
        ...ASKS.recipient(p),
        form: {
          title: `Add ${s(p, 'first')}’s bank`,
          sub: `${s(p, 'country')} · ${s(p, 'rail')}. Never shown to your Bot.`,
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
      greeting: () => `hey! i can pay people in ${BANK_REACH} countries, buy stuff and collect money for you. first i’ll need a Dots balance, with limits you pick. try one of these:`,
      'setup.auto': (p) => `heads up: ${setupDone(p).toLowerCase().replace('dots balance', 'Dots balance')}, so we can jump right in!`,
      'fund.needed': (p) => `i’ll need ${usd(n(p, 'amount'))} in your **Dots balance** to cover that. how do you want to add it?`,
      'connect.already': () => 'already on! here’s your **Dots balance**:',
      'limits.same': (p) => `those are already my limits! i handle anything up to ${usd(n(p, 'approve'))}, ${usd(n(p, 'perTx'))} a payment and ${usd(n(p, 'daily'))} a day.`,
      'agent.already': (p) => `you’re already booked at ${lower(p, 'hotel')} for ${lower(p, 'dates')}! the confirmation’s in your inbox.`,
      'getpaid.already': (p) => `${lower(p, 'first')} already paid that invoice! nothing else is outstanding.`,
      'connect.intro': () => 'first i’ll need a Dots balance for that, with limits you pick. here’s what i’m asking for:',
      'connect.done': () => 'done! your **Dots balance** is on, and i’ll stay inside your limits.',
      'fund.amount': () => 'sure! how much should i add?',
      'fund.ask': () => 'pick what’s easiest:',
      'fund.done': (p) => `${usd(n(p, 'amount'))} landed! you’ve got ${usd2(n(p, 'balance'))} now.`,
      'pay.newRecipient': (p) => `i don’t have ${lower(p, 'first')}’s bank yet! add it here once and i’ll send it.`,
      'pay.done': (p) => `sent! ${lower(p, 'first')} has it.`,
      'pay.over': (p) => `that’s more than the ${usd(n(p, 'perTx'))} i can send at once. raise my limit and i’ll send it!`,
      'getpaid.ask': (p) => `how does ${lower(p, 'first')} want to pay?`,
      'getpaid.done': (p) => `${lower(p, 'first')} paid! ${usd2(n(p, 'amount'))} is in your account. i sent a receipt and marked the invoice paid.`,
      'cashout.amount': () => 'sure! how much should i move to your bank?',
      'cashout.bank': () => 'i’ll need your bank first! link it once and i can send money there any time.',
      'buy.intro': (p) => `found three that fit! the **${s(p, 'merchant')} ${s(p, 'model')}** is the best one, ${usd2(n(p, 'amount'))} with standard shipping:`,
      'buy.card': (p) =>
        n(p, 'card')
          ? `${n(p, 'short') ? 'your **Dots balance** won’t cover it, so ' : ''}i’ll put it on your **${CARD}** through a one-time card for exactly this order. opening the checkout for you`
          : 'i’ll pay from your **Dots balance** with a one-time card, so the store never sees your real card. opening the checkout for you',
      'buy.payWith': () => `want me to pay from your **Dots balance** or your **${CARD}**?`,
      'buy.short': (p) => `you’ve got ${usd2(n(p, 'balance'))} in your **Dots balance**. i can put this on your card instead, or you can add ${usd(n(p, 'amount'))} first!`,
      'card.forBuy': () => 'add your card once and i’ll put this on it!',
      'card.done': () => `saved! i can pay with your **${CARD}** now, or top up from it.`,
      'bank.kept': () => 'i’ll keep this account connected for next time, for adding money and withdrawing.',
      'bank.where': () => 'where’s your bank?',
      'buy.done': () => 'ordered! it arrives **thursday**, and the card closed itself after the charge.',
      'pay.intro': (p) => `${lower(p, 'first')} banks with **${s(p, 'bank')}**, so i’ll send it over ${s(p, 'rail')}.${n(p, 'converted') ? ` ${s(p, 'local')} is **${usd2(n(p, 'usd'))}** right now.` : ''}`,
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
      greeting: () => 'hey, it’s Instinct. text me anything money, paying someone abroad, a subscription. first i’ll need an Instinct balance',
      'setup.auto': (p) => `fyi ${setupDone(p).replace(/^I /, 'i ')}`,
      'fund.needed': (p) => `need ${usd(n(p, 'amount'))} in your Instinct balance to cover that. how do you want to send it?`,
      'connect.already': () => 'already on. here’s where you’re at',
      'limits.same': (p) => `those are already my limits, ${usd(n(p, 'approve'))} on my own, ${usd(n(p, 'perTx'))} a payment, ${usd(n(p, 'daily'))} a day`,
      'agent.already': (p) => `you’re already booked at ${s(p, 'hotel')}, ${lower(p, 'dates')}`,
      'getpaid.already': (p) => `${s(p, 'first')} already paid, nothing outstanding`,
      'connect.intro': () => 'first i’ll need an Instinct balance for that, with limits you ok',
      'connect.done': () => 'done. your Instinct balance is on, and i’ll stay inside your limits',
      'connect.denied': () => 'ok, no money stuff then',
      'fund.amount': () => 'how much?',
      'fund.ask': () => 'how do you want to send it?',
      'fund.done': (p) => `got it. ${usd2(n(p, 'balance'))} in the account`,
      'limits.intro': () => 'i can’t change my own limits, you have to ok them',
      'limits.done': (p) => `done. i’ll ask you for anything over ${usd(n(p, 'approve'))}`,
      'pay.newRecipient': (p) => `need ${lower(p, 'first')}’s bank first. add it here and i’ll send it`,
      'pay.intro': (p) => `${lower(p, 'first')} banks with ${s(p, 'bank')}, so ${s(p, 'rail')}${n(p, 'converted') ? `. ${s(p, 'local')} ≈ ${usd2(n(p, 'usd'))}` : ''}`,
      'pay.done': (p) => `sent, ${lower(p, 'first')} has it`,
      'pay.over': (p) => `that’s over the ${usd(n(p, 'perTx'))} i can send at once. raise my limit and i’ll do it`,
      'pay.denied': () => 'ok, not sending',
      'buy.card': (p) =>
        n(p, 'card')
          ? `${n(p, 'short') ? 'your Instinct balance won’t cover it, so ' : ''}i’ll put it on your ${CARD} with a one-time card for exactly this order`
          : 'i’ll pay from your Instinct balance with a one-time card for exactly this order',
      'buy.payWith': () => `your Instinct balance or your ${CARD}?`,
      'buy.short': (p) => `you’ve got ${usd2(n(p, 'balance'))} in your Instinct balance. i can put this on your card, or you can add ${usd(n(p, 'amount'))} first`,
      'card.forBuy': () => 'add your card once and i’ll put this on it',
      'buy.shortCard': (p) => `your Instinct balance won’t cover it. put it on your ${CARD}, or add ${usd(n(p, 'amount'))} first?`,
      'bank.kept': () => 'i’ll keep it connected for next time, for adding money and withdrawing',
      'bank.where': () => 'where’s your bank?',
      'buy.intro': (p) => `found 3. the ${s(p, 'merchant')} ${s(p, 'model')} is the best one, ${usd2(n(p, 'amount'))} with standard shipping`,
      'buy.done': () => 'ordered, arrives thursday',
      'agent.intro': (p) => `talked to ${s(p, 'hotel')}’s agent. ${usd2(n(p, 'amount'))} for ${nightsOf(p)} if we pay direct, 10% off`,
      'agent.done': () => 'booked. confirmation’s in your email',
      'getpaid.done': (p) => `${s(p, 'first')} paid, ${usd2(n(p, 'amount'))}`,
      'cashout.done': () => 'done, it’s in your bank',
      'cashout.amount': () => 'how much?',
      'cashout.bank': () => 'need your bank first. link it here',
      'balance.answer': () => 'here’s where you’re at',
      'history.answer': () => 'here’s this week',
      fallback: () => 'i can only help with your account here. try a flow on the left',
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
        text: `new limits: i’d act alone up to ${usd(n(p, 'approve'))} (was ${usd(n(p, 'fromApprove'))}), ${usd(n(p, 'daily'))} a day (was ${usd(n(p, 'fromDaily'))}), ${usd(n(p, 'perTx'))} a payment (was ${usd(n(p, 'fromPerTx'))}). reply yes to save them`,
      }),
    },
  },

  /** Anthropic's Duet: measured, organized, the one that briefs you. */
  claude: {
    name: 'Claude',
    wallet: 'Duet balance',
    lines: {
      greeting: () => `Payroll ran at 6 AM, all 14 people are paid. I can pay anyone in ${BANK_REACH} countries too, once I have my own account with limits you set.`,
      'setup.auto': (p) => `For the record: ${setupDone(p)}, so we could go straight to it.`,
      'connect.intro': () => 'First I’ll need my own account for this, with limits you set. Here’s exactly what I’m asking for.',
      'connect.done': () => 'Connected. I have my own account now, and I’ll stay inside the limits you set.',
      'pay.newRecipient': (p) => `I don’t have ${s(p, 'first')}’s bank details yet. Add them here once, and I’ll send it right after.`,
      'pay.intro': (p) => `${s(p, 'first')} banks with ${s(p, 'bank')}, so I’ll send it over ${s(p, 'rail')}.${n(p, 'converted') ? ` ${s(p, 'local')} comes to ${usd2(n(p, 'usd'))} at today’s rate.` : ''}`,
      'buy.card': (p) => `${short(p)}I’ll pay with a virtual card locked to this one order${n(p, 'card') ? `, charged to your ${CARD}` : ''}.`,
      'buy.done': () => 'Done. It ships Monday, and the card closed itself after the charge.',
      'sub.card': (p) => `${short(p)}I’ll use a card only ${s(p, 'merchant')} can charge, capped at ${usd2(n(p, 'amount'))} a month${n(p, 'card') ? `, billed to your ${CARD}` : ''}.`,
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
