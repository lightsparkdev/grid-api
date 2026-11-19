import type { ActionId } from '@/data/actions';
import { payoutFee, type AccountSnapshot } from '@/data/agentApiCalls';
import { purchaseSpendLimit, type DepositNetwork, type SendNetwork } from '@/data/agentEvents';
import { BANK_COUNTRIES, currencyFor } from '@/data/bankCountries';
import { addressKind, NETWORKS_FOR, SENDS_ON, type SendAsset } from '@/data/cryptoSend';
import { cleanName } from '@/data/mode';
import { ENDS_TURN, type ToolCall, type ToolResult } from '@/lib/llm/tools';
import type { Beat } from '../conversation';
import {
  addShort,
  balanceParams,
  balanceShown,
  getpaid,
  historyShown,
  hotelQuote,
  FLOWS,
  limitsFor,
  linkOwnBank,
  noBalanceToMove,
  offerBalance,
  offerFunds,
  offerFundsFrom,
  overLimit,
  paid,
  payerFor,
  payHotel,
  payQuote,
  paySend,
  placeOrder,
  payWith,
  placeSubscription,
  raisedFor,
  recipientParams,
  split,
  stableQuote,
  stableSend,
  topicFor,
  watched,
  type FlowContext,
  type FlowParams,
} from '../flows';
import { memberOf, payrollTotal } from '../business';
import { addTeammate, companySetup, employeeCard, payBill, payContractor, runPayroll, sendInvoice, teamBudget, trackInvoices } from '../businessFlows';
import { stayFor, type Stay } from '../hotels';
import { purchaseFor, requestParams, shelfFor, shelfParams, shelfWith, type BuyKind, type BuyRequest, type Shelf } from '../products';
import { draftRecipient, recipientNamed, type Recipient } from '../recipients';
import { NETWORK_NAME, usd2 } from '../story';

/* Each tool, carried out in the phone: its inputs checked against the account as it is, then the same cards, sheets,
   approvals and Grid calls the flows use. A tool that can't run says why, in terms the model can act on. The model
   writes what's said: a flow's own lines reach it as plain notes, and each point the flow waits on the person is
   reported as it's reached (brain/useAgentBrain). */

interface PayRecord {
  recipient: Recipient;
  params: FlowParams;
  quote: ReturnType<typeof payQuote>;
}

/** What the tools remember across a conversation: what search showed, the quotes, and what a raised limit approved. */
export interface ToolMemory {
  seq: number;
  options: Map<string, Shelf>;
  /** The option the person picked from the latest search, or the one they named. */
  chosen?: string;
  quotes: Map<string, PayRecord>;
  stays: Map<string, Stay>;
  /** Payments and purchases a raised limit already approved: they go through without asking again. */
  approved: Set<string>;
  /** Quotes already on screen: sending one again doesn't show it twice. */
  shown: Set<string>;
  /** Quotes whose payment went out: a quote pays once. */
  sent: Set<string>;
  /** The company's name and the owner's, as far as they've given them. */
  naming: { company?: string; owner?: string };
  /** The team budget they asked for, USD: read when its approval is built, so it can change until then. */
  budget?: number;
}

export const newToolMemory = (): ToolMemory => ({ seq: 0, options: new Map(), quotes: new Map(), stays: new Map(), approved: new Set(), shown: new Set(), sent: new Set(), naming: {} });

export type Outcome = { error: ToolResult } | { beats: Beat[]; result: ToolResult };

export interface ToolEnv {
  ctx: FlowContext;
  memory: ToolMemory;
  /** The call after this one in the same step, for what a no to a setup puts on hold. */
  next?: ToolCall;
  /** The tool whose step is open on screen right now, if one is. */
  openFor?: string;
}

const usd = (cents: number) => Math.round(cents) / 100;
const cents = (dollars: number) => Math.round(dollars * 100);
const fail = (error: string, extra: ToolResult = {}): { error: ToolResult } => ({ error: { error, ...extra } });
/** A beat that writes what happened into the tool's result as it plays. */
const record = (result: ToolResult, patch: () => ToolResult): Beat => ({
  when: () => {
    Object.assign(result, patch());
    return [];
  },
});

const positive = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= max ? v : undefined);
/** What the model writes in a field it has nothing for ("<UNKNOWN>", "n/a"): the same as leaving it out. */
const BLANK = /^\W*(unknown|n\/?a|tbd|none|null|undefined|not (given|provided|specified|known))\W*$/i;
const text = (v: unknown, max: number) => {
  const s = typeof v === 'string' && !BLANK.test(v) ? v.replace(/[^A-Za-z\u00C0-\u024F0-9 '’&.+-]/g, '').trim() : '';
  return s && s.length <= max ? s : undefined;
};
const first = (name: unknown) => (typeof name === 'string' ? name.trim().split(' ')[0] : '');
/** Who someone is to them, not what they're called: the agent asks for a name instead. */
const RELATION =
  /^(my\s+)?(landlord|landlady|mom|mum|mother|dad|father|sister|brother|sis|bro|friend|buddy|boss|wife|husband|partner|girlfriend|boyfriend|son|daughter|aunt|uncle|cousin|grandma|grandpa|roommate|neighbor|neighbour|nanny|babysitter|cleaner|plumber|contractor|tutor|coworker|colleague)s?$/i;

/** The account, as a result reports it. */
export function accountNow(a: AccountSnapshot): ToolResult {
  return {
    balance_on: a.balanceOn,
    balance_usd: usd(a.balanceCents),
    card_saved: a.cardVaulted,
    bank_linked: a.bankLinked,
    limits: { ask_above_usd: usd(a.limits.approvalAbove), per_payment_usd: usd(a.limits.perTransaction), daily_usd: usd(a.limits.daily) },
  };
}

/** A step on the way to something else in the same step: what's worth offering once it's done is left out. */
const onTheWay = (env: ToolEnv) => !!env.next && !ENDS_TURN.has(env.next.name);

/** What a no to a setup step puts on hold, from the task that was to follow it. */
function heldFor(next?: ToolCall): string | undefined {
  switch (next?.name) {
    case 'send_payment':
    case 'quote_payment':
      return `paying ${first(next.input.name) || 'them'}`;
    case 'checkout':
      return 'the order';
    case 'subscribe':
      return 'the subscription';
    case 'fund':
      return 'adding money';
    case 'book_stay':
      return 'the booking';
    case 'withdraw':
      return 'the withdrawal';
    case 'request_payment':
      return 'the request';
    case 'send_stablecoins':
      return 'that send';
    case 'add_teammate':
      return `adding ${first(next.input.name) || 'them'} to the team`;
    case 'set_team_budget':
      return 'the team budget';
    case 'issue_employee_card':
      return `${first(next.input.name) || 'their'}’s card`;
    case 'send_invoice':
      return 'the invoice';
    case 'list_invoices':
      return 'checking invoices';
    case 'pay_bill':
      return `paying ${typeof next.input.vendor === 'string' ? next.input.vendor : 'the bill'}`;
    case 'pay_contractor':
      return `paying ${first(next.input.name) || 'them'}`;
    case 'run_payroll':
      return 'payroll';
    default:
      return undefined;
  }
}
const heldOr = (env: ToolEnv, otherwise: Beat): Beat => {
  const what = heldFor(env.next);
  return what ? { say: 'task.held', params: { what } } : otherwise;
};

const needsBalance = (env: ToolEnv) =>
  env.ctx.account().balanceOn
    ? undefined
    : env.ctx.mode === 'business'
      ? fail('no_company', { fix: 'call setup_company first, then this again once it’s set up' })
      : fail('no_balance', { fix: 'call setup_balance first, then this again once it’s on' });

/** What's worth offering once a step is done, read from the account as it is then (the flows hand it to `ctx.offer`). */
const offering = (make: () => Beat[]): Beat => ({ when: make });

/**
 * The payments that settled since `before`. A step can end without doing its job (a no to a top-up on the way), so
 * what its result reports is what the account shows happened, not how far the step got.
 */
const settledSince = (env: ToolEnv, before: AccountSnapshot) =>
  env.ctx.account().ledger.filter((l) => l.status === 'COMPLETED' && !before.ledger.some((b) => b.id === l.id && b.status === 'COMPLETED'));

/** Over the per-payment limit, today's ask to raise it (the product or quote on screen), or else straight on. */
const withinLimit = (ctx: FlowContext, spend: number, go: 'buy' | 'send' | 'book', then: (c: FlowContext) => Beat[]): Beat[] => overLimit(ctx, spend, go, then) ?? then(ctx);

/** Too little in the balance: today's top-up of exactly what's short (where from, as taps), then carry on. */
const coverThen = (ctx: FlowContext, price: number, held: string, then: (c: FlowContext) => Beat[]): Beat[] => {
  const short = price - ctx.account().balanceCents;
  return short > 0 ? addShort({ ...ctx, held })(short, () => then(ctx)) : then(ctx);
};

/** A limit raised for this one: it goes through without asking again, once. */
function approvedFor(env: ToolEnv, id: string): FlowContext {
  if (!env.memory.approved.has(id)) return env.ctx;
  env.memory.approved.delete(id);
  return { ...env.ctx, preApproved: true, needsApproval: () => false };
}

/* ── The tools ──────────────────────────────────────────────────────── */

function setupBalance(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  const result: ToolResult = {};
  const onWay = onTheWay(env);
  // Already on and on the way to something else: nothing to say, the task just carries on.
  if (a.balanceOn && onWay) return { beats: [], result: { status: 'already_on' } };
  // Already on: says so, and shows it; empty, adding money is worth offering.
  if (a.balanceOn) {
    return {
      beats: [{ say: 'connect.already' }, { when: () => [{ card: 'balance', params: balanceParams(env.ctx) }] }, offering(() => (env.ctx.account().balanceCents > 0 ? [] : offerFunds(env.ctx)))],
      result: { status: 'already_on' },
    };
  }
  const hasAgent = a.connected ? 1 : 0;
  const l = a.limits;
  // On the way to something else it's a first step; asked for itself, the agent's own line already says it's on it.
  const intro: Beat[] = onWay ? [{ say: 'connect.intro', params: { hasAgent } }] : call.input.say ? [] : [{ say: 'connect.self', params: { hasAgent } }];
  return {
    result,
    beats: [
      ...intro,
      {
        ask: 'connect',
        params: { perTx: l.perTransaction, daily: l.daily, approve: l.approvalAbove, hasAgent },
        allow: [
          { work: 'setup', ms: 1100 },
          { emit: { type: 'connect' } },
          record(result, () => ({ status: 'on' })),
          { say: 'connect.done', params: { hasAgent } },
          // Asked for itself, it starts empty, so filling it is worth offering; on the way to something else that's next.
          ...(onWay
            ? []
            : [
                { when: (): Beat[] => [{ card: 'account.ready', params: balanceParams(env.ctx) }] },
                offering(() => (env.ctx.account().balanceCents > 0 ? [] : offerFunds(env.ctx))),
              ]),
        ],
        deny: [heldOr(env, { say: 'connect.denied', params: { hasAgent } })],
      },
    ],
  };
}

function addCard(env: ToolEnv): Outcome {
  const a = env.ctx.account();
  const topUp = a.balanceOn ? 1 : 0;
  if (a.cardVaulted) return { beats: [{ say: 'card.already', params: { topUp } }], result: { status: 'already_saved' } };
  const result: ToolResult = {};
  return {
    result,
    beats: [
      { say: 'card.intro', params: { topUp } },
      {
        ask: 'vault',
        allow: [
          { emit: { type: 'connect', lite: true } },
          { emit: { type: 'card.vault' } },
          { meta: 'card.saved' },
          record(result, () => ({ status: 'saved' })),
          { say: 'card.done', params: { topUp } },
          // With a balance, filling it from the card is worth offering; without, the balance is.
          ...(onTheWay(env) ? [] : [offering(() => (env.ctx.account().balanceOn ? offerFundsFrom(env.ctx, 'card') : offerBalance(env.ctx)))]),
        ],
        deny: [heldOr(env, { say: 'card.denied' })],
      },
    ],
  };
}

function linkBank(env: ToolEnv, call: ToolCall): Outcome {
  if (env.ctx.account().bankLinked) return { beats: [{ say: 'bank.already' }], result: { status: 'already_linked' } };
  const result: ToolResult = {};
  const home = typeof call.input.home === 'string' ? call.input.home : undefined;
  const offer: Beat[] = onTheWay(env) ? [] : [offering(() => offerFundsFrom(env.ctx, 'bank'))];
  return { result, beats: linkOwnBank('bank.intro', [record(result, () => ({ status: 'linked' })), { say: 'bank.done' }, ...offer], [heldOr(env, { say: 'bank.denied' })], home) };
}

/** What an id costs (USD cents): a quote, an option, or a stay. */
function costOf(env: ToolEnv, id: string): number | undefined {
  const q = env.memory.quotes.get(id);
  if (q) return q.quote.payee.usd;
  const option = env.memory.options.get(id === 'chosen' ? (env.memory.chosen ?? '') : id);
  if (option) return purchaseFor(option).amount;
  const stay = env.memory.stays.get(id);
  return stay?.amount;
}

function fund(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  const missing = needsBalance(env);
  if (missing) return missing;
  let amount: number | undefined;
  if (typeof call.input.cover === 'string') {
    const cost = costOf(env, call.input.cover);
    if (cost === undefined) return fail('unknown_id', { cover: call.input.cover });
    amount = cost - a.balanceCents;
    if (amount <= 0) return fail('already_covered', { balance_usd: usd(a.balanceCents), cost_usd: usd(cost) });
  } else if (call.input.amount_usd !== undefined) {
    const most = env.ctx.mode === 'business' ? 100_000 : 10_000;
    const usdAmount = positive(call.input.amount_usd, most);
    if (!usdAmount) return fail('bad_amount', { fix: `up to $${most.toLocaleString('en-US')}` });
    amount = cents(usdAmount);
  }
  const { method: m, asset, network } = call.input;
  if (m === 'card' && env.ctx.mode === 'business') return fail('no_card_on_business', { fix: 'a business adds money from its bank or stablecoins' });
  const method = m === 'card' || m === 'bank' ? m : m === 'stablecoins' ? 'crypto' : undefined;
  const params: FlowParams = {
    ...(amount && { amount: amount / 100 }),
    ...(method && { method }),
    ...((asset === 'USDC' || asset === 'USDT') && { asset }),
    ...(typeof network === 'string' && network !== 'SPARK' && { network: network as DepositNetwork }),
  };
  // What's missing is waited on in turn (how much, then where from), then the top-up.
  const result: ToolResult = {
    // Said before they act, so nothing is promised that won't happen: there's no second step to confirm the amount.
    how_it_goes: 'once they’ve said how much and where from, it’s added right away: saving the card or linking the bank is the go-ahead, and nothing asks them to confirm the amount after that. All of what they add lands in the balance.',
  };
  const added = record(result, () => {
    const more = env.ctx.account().balanceCents - a.balanceCents;
    return more > 0 ? { status: 'added', added_usd: usd(more), how_it_goes: undefined } : {};
  });
  return { result, beats: [...FLOWS.fund({ ...env.ctx, params }), added] };
}

function search(env: ToolEnv, call: ToolCall): Outcome {
  const i = call.input;
  const query = text(i.query, 60);
  if (!query) return fail('need_query');
  const kind = i.kind === 'gift' || i.kind === 'digital' || i.kind === 'topup' ? (i.kind as BuyKind) : undefined;
  // A placeholder isn't a brand they named.
  const brand = text(i.brand, 32)?.replace(/^(unknown|none|any|n\/?a|tbd|store|brand)$/i, '') || undefined;
  const value = positive(i.value_usd, 2_000);
  if (kind === 'gift' && (!brand || !value)) return fail('need_gift_details', { missing: [...(brand ? [] : ['store']), ...(value ? [] : ['value'])], fix: 'ask them' });
  if (kind === 'topup' && !value) return fail('need_value', { fix: 'ask how much credit' });
  const request: BuyRequest = {
    query,
    ...(kind && { kind }),
    ...(text(i.product, 60) && { product: text(i.product, 60) }),
    ...(brand && { brand }),
    ...(positive(i.budget_usd, 5_000) && { budget: positive(i.budget_usd, 5_000) }),
    ...(positive(i.typical_price_usd, 20_000) && { typicalPrice: positive(i.typical_price_usd, 20_000) }),
    // A value is a gift card's or a top-up's; a bill's only when they said it.
    ...(value && (kind === 'gift' || kind === 'topup' || /\bbill/i.test(query)) && { amount: value }),
  };
  const shelf = shelfFor(request);
  const n = ++env.memory.seq;
  const ids = shelf.options.map((_, k) => `opt-${n}-${k + 1}`);
  ids.forEach((id, k) => env.memory.options.set(id, shelfWith(shelf, k)));
  const options = shelf.options.map((o, k) => ({ option_id: ids[k], title: o.title, price_usd: usd(shelfWith(shelf, k).pick.amount) }));
  const result: ToolResult = {
    options,
    delivery: shelf.delivery,
    ...(shelf.over && { over_budget: true }),
    ...(shelf.asked && { asked_value_usd: usd(shelf.asked), note: 'the card doesn’t come in that value; the closest is shown' }),
  };
  const found: Beat[] = [
    { work: 'searching', ms: 1800, params: shelfParams(shelf) },
    { products: 'buy.options', params: { ...requestParams(request), ...(shelf.named && { only: 1 }) } },
    ...(shelf.named && (shelf.over || shelf.asked) ? [{ say: 'buy.note', params: shelfParams(shelf) } as const] : []),
  ];
  if (shelf.named) {
    env.memory.chosen = ids[0];
    return { result: { ...result, named: true, they_picked: { option_id: ids[0], title: shelf.pick.item } }, beats: found };
  }
  env.memory.chosen = undefined;
  return {
    result,
    beats: [
      ...found,
      { say: 'buy.which', params: shelfParams(shelf) },
      {
        // What people call it ("Sonora Aura Max"), not the listing's full name.
        chips: shelf.options.map((o) => ({ label: o.model ? `${o.merchant} ${o.model}` : o.title })),
        reply: true,
        then: (picked) => {
          env.memory.chosen = ids[picked];
          return [record(result, () => ({ they_picked: { option_id: ids[picked], title: shelf.options[picked].title }, next: `they chose this one: check it out now with option_id "${ids[picked]}" (and anything else they asked to buy, by its option_id); don’t ask again` }))];
        },
        onPage: (picked) => [{ say: 'buy.picked', params: { ...shelfParams(shelf), item: shelf.options[picked].title } }],
      },
    ],
  };
}

/** What they asked to pay with, as today's checkout reads it; otherwise it works out what covers it. */
const payParams = (env: ToolEnv, call: ToolCall): FlowParams => ({
  ...env.ctx.params,
  ...(call.input.pay_with === 'card' && { method: 'card' as const }),
  ...(call.input.pay_with === 'balance' && { pay: 'balance' as const }),
});

function checkout(env: ToolEnv, call: ToolCall): Outcome {
  const raw = typeof call.input.option_id === 'string' ? call.input.option_id : '';
  const id = raw === 'chosen' ? env.memory.chosen : raw;
  const shelf = id ? env.memory.options.get(id) : undefined;
  if (!id || !shelf) {
    return raw === 'chosen' && env.memory.options.size && !env.memory.chosen
      ? fail('nothing_chosen', { fix: 'they haven’t picked one yet; wait for their pick' })
      : fail('unknown_option', { valid: Array.from(env.memory.options.keys()).slice(-6), fix: 'search first' });
  }
  const purchase = purchaseFor(shelf);
  const spend = purchaseSpendLimit(purchase.amount);
  const a = env.ctx.account();
  const what = { item: shelf.pick.item, price_usd: usd(purchase.amount) };
  const result: ToolResult = {};
  const bought = (onCard: boolean) => record(result, () => ({ status: 'bought', ...what, paid_with: onCard ? 'card' : 'balance' }));
  // No account yet: the one a card creates starts with limits that cover this, as today.
  const covering = !a.connected && spend > a.limits.perTransaction ? raisedFor(a.limits, spend) : undefined;
  const ctx: FlowContext = { ...approvedFor(env, id), params: payParams(env, call), held: 'the order', ...(covering && { limits: covering }) };
  const below = positive(call.input.buy_when_below_usd, 20_000);
  if (below) {
    if (!shelf.named) return fail('watch_needs_one_product', { fix: 'only a product they named can be watched' });
    const buyIt = (c: FlowContext, s: Shelf) => {
      const onCard = c.params?.method === 'card' || !c.account().balanceOn;
      return [...placeOrder(c, s, onCard), bought(onCard)];
    };
    return { result, beats: watched(ctx, shelf, cents(below), buyIt, []) };
  }
  // A card saved for this order: once it's through, a balance is worth offering, as when a card goes in on its own.
  const newCard = !a.cardVaulted;
  const offer = (onCard: boolean): Beat[] => (onCard && newCard && !onTheWay(env) ? [offering(() => (env.ctx.account().balanceOn ? [] : offerBalance(env.ctx)))] : []);
  const buy = (c: FlowContext) => payWith(c, purchase.amount, (onCard, short) => [...placeOrder(c, shelf, onCard, short), bought(onCard), ...offer(onCard)]);
  return { result, beats: withinLimit(ctx, spend, 'buy', buy) };
}

function subscribe(env: ToolEnv, call: ToolCall): Outcome {
  const merchant = text(call.input.merchant, 32);
  const price = positive(call.input.monthly_price_usd, 1_000);
  if (!merchant || !price) return fail('need_merchant_and_price');
  const sub = { merchant, item: merchant, description: `${merchant}, monthly`, amount: cents(price), recurring: true };
  const result: ToolResult = {};
  const ctx: FlowContext = { ...env.ctx, params: payParams(env, call), held: 'the subscription' };
  return {
    result,
    beats: payWith(ctx, sub.amount, (onCard, short) => [
      ...placeSubscription(ctx, sub, onCard, short),
      record(result, () => ({ status: 'subscribed', merchant, monthly_usd: price, paid_with: onCard ? 'card' : 'balance' })),
    ]),
  };
}

const COUNTRY_CODES = new Set(BANK_COUNTRIES.map((c) => c.code));

/** A payment priced: who (saved, or new in a country we pay), how much, in USD or their currency. */
/** Set by the last quote: the saved person a bare first name was taken to mean. */
let matchedSaved: string | undefined;

function quoted(env: ToolEnv, input: ToolCall['input']): { id: string; rec: PayRecord } | Outcome {
  matchedSaved = undefined;
  if (typeof input.quote_id === 'string') {
    const rec = env.memory.quotes.get(input.quote_id);
    return rec ? { id: input.quote_id, rec } : fail('unknown_quote', { fix: 'pass the details instead' });
  }
  const name = text(input.name, 40);
  const amount = positive(input.amount, 10_000_000);
  if (!name || RELATION.test(name)) return fail('need_name', { fix: name ? `ask their ${name.replace(/^my\s+/i, '')}'s name` : 'ask who' });
  if (!amount) return fail('need_amount', { fix: 'ask how much' });
  const known = recipientNamed(name);
  const said = typeof input.country === 'string' ? input.country.toLowerCase() : undefined;
  // Someone saved under that first name banks somewhere else: the same person, or someone new? Theirs to say.
  if (known && said && COUNTRY_CODES.has(said) && said !== known.bank.country.code) {
    return fail('saved_elsewhere', { saved: `${known.name} is saved, and banks in ${known.bank.country.name}`, fix: `ask whether they mean ${known.name}, or someone else: then pass that person’s full name` });
  }
  // Matched on a first name alone: who that is gets said, in case they meant someone else.
  matchedSaved = known && known.name.toLowerCase() !== name.toLowerCase() ? `${known.name}, already saved, who banks in ${known.bank.country.name}: name them in full so they can say if they meant someone else` : undefined;
  const code = known?.bank.country.code ?? said;
  if (!code) return fail('need_country', { fix: `ask where ${first(name)} banks` });
  if (!COUNTRY_CODES.has(code)) return fail('country_not_supported', { country: code });
  const recipient = known ?? draftRecipient(name, code)!;
  const local = currencyFor(recipient.bank.country);
  const asked = typeof input.currency === 'string' ? input.currency.toUpperCase() : 'USD';
  if (asked !== 'USD' && asked !== local) return fail('currency_not_supported', { supported: ['USD', local] });
  const day = positive(input.monthly_on_day, 31);
  const params: FlowParams = {
    name: known?.name ?? name,
    country: code,
    amount,
    currency: asked,
    ...(text(input.note, 40) && { note: text(input.note, 40) }),
    ...(day && { every: 'month' as const, day: Math.min(28, Math.round(day)) }),
  };
  const id = `q-${++env.memory.seq}`;
  const rec = { recipient, params, quote: payQuote(recipient, params) };
  env.memory.quotes.set(id, rec);
  return { id, rec };
}

/** What a fee question gets: nothing on top of what they pay; into another currency, a fee out of what lands. */
const feeOf = (payee: Parameters<typeof payoutFee>[0], who: string) =>
  payoutFee(payee) ? `${usd2(payoutFee(payee))}, taken out of what ${who} receives (what they receive is after it); nothing is added to what you pay` : 'none: dollars to a US bank arrive in full';

/** The same, for a business paying a company or a contractor in dollars: known before anything is on screen. */
function payFacts(env: ToolEnv, name: string, country: string, amount: number): ToolResult {
  const to = recipientNamed(name) ?? draftRecipient(name, country);
  if (!to) return {};
  const { payee } = payQuote(to, { name, country, amount, currency: 'USD' });
  return { fee: feeOf(payee, first(name)), they_receive: payee.local, ...asksFirst(env, payee.usd) };
}

/** Whether a payment stops for their approval, said before it's made: under the limit it goes out by itself. */
function asksFirst(env: ToolEnv, cents: number): ToolResult {
  const asks = env.ctx.needsApproval(cents);
  return {
    needs_their_approval: asks,
    ...(!asks && { goes_without_asking: `it’s within the ${usd2(env.ctx.account().limits.approvalAbove).replace(/\.00$/, '')} they let you spend alone, so once it’s covered it goes out with no approval: tell them that before it does` }),
  };
}

function quoteFacts(env: ToolEnv, id: string, rec: PayRecord): ToolResult {
  const a = env.ctx.account();
  const { payee } = rec.quote;
  const to = recipientParams(rec.recipient);
  return {
    quote_id: id,
    to: rec.recipient.first,
    ...(matchedSaved && { matched: matchedSaved }),
    they_receive: payee.local,
    you_pay_usd: usd(payee.usd),
    their_bank: to.bank,
    sent_over: to.rail,
    fee: feeOf(payee, rec.recipient.first),
    ...asksFirst(env, payee.usd),
    ...(a.connected && payee.usd > a.limits.perTransaction && { over_per_payment_limit: true, raise_to_usd: usd(raisedFor(a.limits, payee.usd).perTransaction) }),
    ...(payee.usd > a.balanceCents && { short_usd: usd(payee.usd - a.balanceCents) }),
    ...(rec.params.every === 'month' && { monthly_on_day: rec.params.day ?? 1 }),
  };
}

function quotePayment(env: ToolEnv, call: ToolCall): Outcome {
  const q = quoted(env, call.input);
  if ('error' in q) return q;
  if ('beats' in q) return q;
  // Priced here, it isn't shown again when it's sent.
  env.memory.shown.add(q.id);
  return { result: quoteFacts(env, q.id, q.rec), beats: [{ work: 'quoting', ms: 1200 }, { emit: { type: 'pay.quote', payee: q.rec.quote.payee } }] };
}

function sendPayment(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const q = quoted(env, call.input);
  if ('error' in q || 'beats' in q) return q;
  const { id, rec } = q;
  // A quote pays once: sending its ID again would price and execute a second payout.
  if (env.memory.sent.has(id)) {
    return fail('already_sent', { to: rec.recipient.first, fix: 'this quote’s payment already went out: say so. If they want to send the same again, ask first, then pass the details (name, amount) for a new payment, not this quote_id' });
  }
  const { payee } = rec.quote;
  const result: ToolResult = {};
  const ctx = approvedFor(env, id);
  const sent = record(result, () => {
    env.memory.sent.add(id);
    return { status: rec.params.every === 'month' ? 'scheduled' : 'sent', to: rec.recipient.first, they_receive: payee.local, you_paid_usd: usd(payee.usd), ...(rec.params.every === 'month' && { every_month_on_day: rec.params.day ?? 1 }) };
  });
  const go = (c: FlowContext): Beat[] => [...paySend(c, rec.quote, rec.params), sent];
  // The quote goes on screen once; then today's ask to raise the limit if it's over, and the top-up if it's short.
  const afterQuote = (): Beat[] => {
    const shown = env.memory.shown.has(id);
    env.memory.shown.add(id);
    // The session holds one payment at a time, and anything priced since (another quote, a bill, a tile's payment)
    // took its place. So a send always prices its own payment again, and that is the one executed. Shown before,
    // it's priced quietly: no second "pricing" line.
    const quote: Beat[] = shown
      ? [{ emit: { type: 'pay.quote', payee } }]
      : [{ work: 'quoting', ms: 1200 }, { emit: { type: 'pay.quote', payee } }, { say: 'pay.intro', params: rec.quote.params }];
    // In the same list as the quote line, so a top-up's first line joins its bubble, as today.
    return [...quote, ...withinLimit(ctx, payee.usd, 'send', (c) => coverThen(c, payee.usd, `paying ${rec.recipient.first}`, go))];
  };
  // Someone new gets their bank added once, in the app's own sheet, before anything is quoted to it.
  if (!recipientNamed(rec.recipient.name)) {
    return {
      result,
      beats: [
        { say: 'pay.newRecipient', params: recipientParams(rec.recipient) },
        {
          ask: 'recipient',
          params: recipientParams(rec.recipient),
          allow: [
            {
              when: () => {
                const saved = recipientNamed(rec.recipient.name) ?? rec.recipient;
                return [{ emit: { type: 'recipient.add', name: saved.name, bank: saved.bank } }, ...afterQuote()];
              },
            },
          ],
          deny: [{ say: 'pay.denied' }],
        },
      ],
    };
  }
  return { result, beats: afterQuote() };
}

function requestPayment(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const people = (Array.isArray(call.input.split_with) ? call.input.split_with : []).map((p) => text(p, 40)).filter((p): p is string => !!p).slice(0, 8);
  const result: ToolResult = {};
  if (people.length) {
    const total = positive(call.input.total_usd, 100_000);
    if (!total) return fail('need_total', { fix: 'ask how much the whole bill was' });
    const share = Math.round(cents(total) / (people.length + 1));
    Object.assign(result, { each_usd: usd(share), split: `${people.length + 1} ways, them included` });
    return { result, beats: [...split(env.ctx, people, cents(total)), record(result, () => ({ status: 'paid_back', from: people }))] };
  }
  const from = text(call.input.from, 40);
  const amount = positive(call.input.amount_usd, 100_000);
  if (!from) return fail('need_payer', { fix: 'ask who’s paying' });
  // Lucía's invoice is the one on file: naming her alone plays it.
  const params: FlowParams = /^luc[ií]a\b/i.test(from) && !amount ? {} : { name: from, ...(amount && { amount }) };
  if (!params.name && !/^luc[ií]a\b/i.test(from)) return fail('need_amount');
  if (params.name && !amount) return fail('need_amount', { fix: 'ask how much' });
  const who = payerFor(params);
  if (paid(env.ctx, who.payer, params.name ? who.amount : undefined)) return { result: { status: 'already_paid' }, beats: [{ say: 'getpaid.already', params: who }] };
  return { result, beats: [...getpaid({ ...env.ctx, params }).filter((b) => !('react' in b)), record(result, () => ({ status: 'received', from: who.first, amount_usd: usd(who.amount) }))] };
}

function raiseLimit(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  if (!a.connected) return fail('no_account', { fix: 'setup_balance first' });
  // "Ask me every time" is an approval limit of zero.
  const everyTime = call.input.ask_above_usd === 0;
  const asked: FlowParams = {
    ...(positive(call.input.ask_above_usd, 100_000) && { approve: positive(call.input.ask_above_usd, 100_000) }),
    ...(positive(call.input.per_payment_usd, 100_000) && { perTx: positive(call.input.per_payment_usd, 100_000) }),
    ...(positive(call.input.daily_usd, 100_000) && { daily: positive(call.input.daily_usd, 100_000) }),
  };
  const id = typeof call.input.for === 'string' ? call.input.for : undefined;
  const spend = id ? costOf(env, id) : undefined;
  if (id && spend === undefined) return fail('unknown_id', { for: id });
  const from = a.limits;
  const named = Object.keys(asked).length ? limitsFor({ ...env.ctx, params: asked }, from) : spend ? raisedFor(from, spend) : undefined;
  const to = everyTime ? { ...(named ?? from), approvalAbove: 0 } : named;
  if (!to) return fail('need_limits', { fix: 'say which limit and to what' });
  if (spend && to.perTransaction < spend) return fail('not_enough', { needed_usd: usd(raisedFor(from, spend).perTransaction) });
  if (to.approvalAbove === from.approvalAbove && to.daily === from.daily && to.perTransaction === from.perTransaction) {
    return { result: { status: 'unchanged' }, beats: [{ say: 'limits.same', params: { approve: to.approvalAbove, daily: to.daily, perTx: to.perTransaction } }] };
  }
  // The limits hold each other in: what's done alone can't be more than one payment, nor one payment more than a day.
  // Asked for a pair that can't both hold, it says so rather than putting up a sheet with a number nobody asked for.
  const money = (c: number) => usd2(c).replace(/\.00$/, '');
  if (asked.perTx && asked.daily && to.perTransaction !== cents(asked.perTx)) {
    return fail('per_payment_over_daily', { fix: `one payment can’t be more than the day’s limit, so ${money(cents(asked.perTx)!)} a payment needs a daily limit of at least that: ask whether to raise the daily limit to match, or keep each payment to ${money(to.daily)} or less` });
  }
  if (asked.approve && to.approvalAbove !== cents(asked.approve)) {
    return fail('ask_above_over_per_payment', { fix: `what you do alone can’t be more than one payment (${money(to.perTransaction)}): ask whether to raise the per-payment limit too, or keep it to that or less` });
  }
  // A limit they didn't name moves with the one they did: the sheet shows both, and the model can say why.
  const moved = [
    !asked.daily && to.daily !== from.daily && `the daily limit goes from ${money(from.daily)} to ${money(to.daily)} with it, because one payment can’t be more than the day’s limit`,
    !asked.perTx && !spend && to.perTransaction !== from.perTransaction && `the per-payment limit goes from ${money(from.perTransaction)} to ${money(to.perTransaction)} with it, because what you do alone can’t be more than one payment`,
  ].filter(Boolean);
  const result: ToolResult = { ...(moved.length && { also_changes: moved.join('; ') }) };
  const go = id ? (env.memory.quotes.has(id) ? 'send' : env.memory.stays.has(id) ? 'book' : 'buy') : undefined;
  return {
    result,
    beats: [
      ...(id ? [{ say: 'limit.raise', params: { perTx: from.perTransaction, to: to.perTransaction, act: go === 'send' ? 'send' : 'spend' } } as const] : []),
      {
        ask: 'limits',
        params: { approve: to.approvalAbove, daily: to.daily, perTx: to.perTransaction, fromApprove: from.approvalAbove, fromDaily: from.daily, fromPerTx: from.perTransaction, ...(go && { go }) },
        faceId: true,
        allow: [
          { emit: { type: 'limits.update', limits: to } },
          // Raised for a payment, that approval is the payment's too: it goes through next without asking again.
          record(result, () => {
            if (id) env.memory.approved.add(id);
            return { status: 'raised', also_changes: undefined, per_payment_usd: usd(to.perTransaction), daily_usd: usd(to.daily), ask_above_usd: usd(to.approvalAbove), ...(id && { approved_for: id }) };
          }),
          ...(id
            ? []
            : [{ say: 'limits.done', params: { approve: to.approvalAbove, perTx: to.perTransaction, daily: to.daily, what: to.approvalAbove !== from.approvalAbove ? 'approve' : to.perTransaction !== from.perTransaction ? 'perTx' : 'daily' } } as const]),
        ],
        deny: [{ say: id ? 'limit.kept' : 'limits.denied' }],
      },
    ],
  };
}

function withdraw(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  if (!a.balanceOn) return { result: { status: 'no_balance' }, beats: noBalanceToMove(env.ctx) };
  const amount = call.input.everything === true ? a.balanceCents : positive(call.input.amount_usd, 10_000) ? cents(call.input.amount_usd as number) : undefined;
  // Nothing in it, there's nothing to move; no amount, it waits on one; more than there is, it waits on moving the
  // whole balance instead; then the bank (linked first if it isn't), the limit, and the move.
  const result: ToolResult = a.balanceCents <= 0 ? { status: 'empty_balance' } : amount && amount > a.balanceCents ? { status: 'more_than_balance', balance_usd: usd(a.balanceCents) } : {};
  return { result, beats: FLOWS.cashout({ ...env.ctx, params: amount ? { amount: amount / 100 } : {} }) };
}

function sendStablecoins(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  const missing = needsBalance(env);
  if (missing) return missing;
  const address = typeof call.input.address === 'string' ? call.input.address.replace(/[^A-Za-z0-9.…]/g, '').slice(0, 4096) : '';
  if (!address) return fail('need_address');
  const kind = addressKind(address);
  if (kind === 'invalid') return fail('invalid_address', { fix: 'tell them it looks incomplete or mistyped' });
  if (kind === 'bitcoin' || kind === 'lightning') return fail('not_supported', { fix: 'you only send stablecoins' });
  const amountUsd = positive(call.input.amount_usd, 10_000);
  if (!amountUsd) return fail('need_amount');
  const networks = NETWORKS_FOR[kind];
  const takes = networks.flatMap((n) => SENDS_ON[n]).filter((x, k, all) => all.indexOf(x) === k);
  const asked = call.input.asset as SendAsset | undefined;
  if (asked && !takes.includes(asked)) return fail('asset_not_accepted', { address_takes: takes });
  const asset = asked ?? (takes.length === 1 ? takes[0] : undefined);
  if (!asset) return fail('need_asset', { options: takes });
  const fits = networks.filter((n) => SENDS_ON[n].includes(asset));
  const network = call.input.network && fits.includes(call.input.network as SendNetwork) ? (call.input.network as SendNetwork) : fits.length === 1 ? fits[0] : undefined;
  if (!network) return fail('need_network', { asset, options: fits.map((n) => NETWORK_NAME[n]) });
  const quote = stableQuote(address, asset, network, cents(amountUsd));
  const result: ToolResult = {};
  const go = (c: FlowContext): Beat[] => [...stableSend(c, quote), record(result, () => ({ status: 'sent', asset, network: NETWORK_NAME[network], total_usd: usd(quote.total) }))];
  return { result, beats: [...quote.beats, ...withinLimit(env.ctx, quote.total, 'send', (c) => coverThen(c, quote.total, 'that send', go))] };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 86_400_000;

/** A real calendar date as YYYY-MM-DD: Date.parse would roll 2026-02-31 over to March 3. */
const isDate = (value: unknown): value is string =>
  typeof value === 'string' && ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

function bookStay(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  const missing = needsBalance(env);
  if (missing) return missing;
  const city = text(call.input.city, 40);
  const { check_in: checkIn, check_out: checkOut } = call.input;
  if (!city) return fail('need_city');
  if (!isDate(checkIn) || !isDate(checkOut)) return fail('need_dates', { format: 'YYYY-MM-DD' });
  const from = Date.parse(`${checkIn}T00:00:00Z`);
  const nights = Math.round((Date.parse(`${checkOut}T00:00:00Z`) - from) / DAY);
  // The visitor's own today, not UTC's, which is already tomorrow for an evening in the Americas.
  const today = Date.parse(`${new Date().toLocaleDateString('en-CA')}T00:00:00Z`);
  if (!(nights >= 1 && nights <= 14) || from < today || from > today + 366 * DAY) return fail('bad_dates', { fix: 'check-in from today to a year out, 1 to 14 nights' });
  const guests = positive(call.input.guests, 8);
  const stay = stayFor({ city, checkIn, checkOut, ...(guests && { guests: Math.round(guests) }) });
  // The same stay asked for again is the same booking: its quote isn't shown twice.
  const same = (s: Stay) => s.hotel === stay.hotel && s.dates === stay.dates && s.guests === stay.guests && s.amount === stay.amount;
  const id = Array.from(env.memory.stays.entries()).find(([, s]) => same(s))?.[0] ?? `h-${++env.memory.seq}`;
  env.memory.stays.set(id, stay);
  const facts = { stay_id: id, hotel: stay.hotel, total_usd: usd(stay.amount) };
  const result: ToolResult = {};
  const ctx = approvedFor(env, id);
  const go = (c: FlowContext): Beat[] => [...payHotel(c, stay), record(result, () => ({ status: 'booked', ...facts }))];
  // The hotel's agent quotes first; only then the limit, and what's short, as today.
  return { result, beats: [...hotelQuote(ctx, stay), ...withinLimit(ctx, stay.amount, 'book', (c) => coverThen(c, stay.amount, `booking ${stay.hotel}`, go))] };
}

function showAccount(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  if (call.input.show === 'history') {
    if (!a.ledger.length) return { result: { status: 'nothing_yet' }, beats: [{ say: 'history.none' }] };
    return { result: { status: 'shown', recent: a.ledger.slice(0, 6).map((l) => ({ what: l.title, usd: usd(l.cents) })) }, beats: historyShown(env.ctx) };
  }
  if (!a.balanceOn) return { result: { status: 'no_balance' }, beats: FLOWS.balance(env.ctx) };
  return { result: { status: 'shown' }, beats: balanceShown(env.ctx) };
}

/* ── The business's tools ─────────────────────────────────────────── */

const noReact = (beats: Beat[]) => beats.filter((b) => !('react' in b));
const ownName = (v: unknown) => (typeof v === 'string' && !BLANK.test(v) && cleanName(v)) || undefined;

function setupCompany(env: ToolEnv, call: ToolCall): Outcome {
  const a = env.ctx.account();
  const onWay = onTheWay(env);
  if (a.balanceOn) return { beats: onWay ? [] : noReact(companySetup(env.ctx)), result: { status: 'already_set_up' } };
  const company = ownName(call.input.company);
  const owner = ownName(call.input.owner);
  const result: ToolResult = {};
  const held = heldFor(env.next);
  // On the way to something else, that's next once it's set up; asked for itself, it shows the account.
  const ctx: FlowContext = { ...env.ctx, naming: env.memory.naming, ...(held && { held }), ...(onWay && { then: () => [] }) };
  const done = record(result, () => ({ status: 'set_up', company: env.ctx.account().business?.company }));
  return { result, beats: noReact(companySetup(ctx, { company, owner }, [done])) };
}

function addTeammateTool(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const name = text(call.input.name, 40);
  if (name && RELATION.test(name)) return fail('need_name', { fix: 'ask their name' });
  const team = env.ctx.account().business?.team ?? [];
  if (name && memberOf(team, name)) return { result: { status: 'already_on_team', team: team.map((m) => m.name) }, beats: [] };
  const result: ToolResult = {};
  const added = record(result, () => {
    const now = env.ctx.account().business?.team ?? [];
    return now.length > team.length ? { status: 'added', team: now.map((m) => `${m.name} (${m.role})`) } : {};
  });
  return { result, beats: [...addTeammate(env.ctx, name ? { name } : {}), added] };
}

function setTeamBudget(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const monthly = positive(call.input.monthly_usd, 50_000);
  const already = env.ctx.account().business?.budget;
  const empty = !env.ctx.account().business?.team.length;
  // Asked again with another amount while the first teammate is still being added for it: the amount changes, and
  // what's open (their role, pay or bank) stays where it is. The approval comes up at the new amount.
  if (monthly && empty && !already && env.openFor === 'set_team_budget') {
    env.memory.budget = monthly;
    return { beats: [], result: { status: 'amount_updated', monthly_usd: monthly, note: 'the budget will come up for approval at this amount once the teammate is on the team: what’s open is still open, so point them back to it' } };
  }
  env.memory.budget = monthly;
  const result: ToolResult = {
    ...(empty && { not_yet: 'nothing is set and nothing is up for approval yet: the budget’s approval comes up once someone is on the team, which is what this is asking for first' }),
  };
  const set = record(result, () => {
    const now = env.ctx.account().business;
    if (!now?.budget) return {};
    result.not_yet = undefined;
    const facts = { monthly_usd: usd(now.budget), team: now.team.map((m) => m.name) };
    // Set once: there's nowhere to change it, here or anywhere they could be pointed to.
    return already ? { status: 'already_set_up', ...facts, ...(monthly && monthly * 100 !== already && { cannot_change: 'the budget can’t be changed once it’s set: say so plainly, and don’t send them anywhere else to do it' }) } : { status: 'set_up', ...facts };
  });
  // Read when the approval is built, not now: the amount can change on the way there.
  const params: FlowParams = {
    get amount() {
      return env.memory.budget;
    },
  };
  return { result, beats: [...noReact(teamBudget({ ...env.ctx, params })), set] };
}

function issueEmployeeCard(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const name = text(call.input.name, 40);
  if (!name) return fail('need_name', { fix: 'ask which teammate' });
  const team = env.ctx.account().business?.team ?? [];
  const member = memberOf(team, name);
  // Someone not on the team is added first (their role, pay and bank are waited on), then the card.
  if (!member) return { result: { status: 'not_on_team' }, beats: noReact(employeeCard({ ...env.ctx, params: { name } })) };
  const purpose = text(call.input.purpose, 30)?.toLowerCase();
  const had = env.ctx.account().business?.team.find((m) => m.name === member.name)?.hasCard;
  const result: ToolResult = {};
  const hasCard = () => env.ctx.account().business?.team.find((m) => m.name === member.name)?.hasCard;
  const issued = record(result, () => (had ? { status: 'already_has_card', to: member.name } : hasCard() ? { status: 'issued', to: member.name } : {}));
  return { result, beats: [...noReact(employeeCard({ ...env.ctx, params: { name: member.name, ...(purpose && { note: purpose }) } })), issued] };
}

function sendInvoiceTool(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const client = text(call.input.client, 40);
  const amount = positive(call.input.amount_usd, 100_000);
  if (!client) return fail('need_client', { fix: 'ask who it’s for' });
  if (!amount) return fail('need_amount', { fix: 'ask how much' });
  const memo = text(call.input.memo, 40);
  const result: ToolResult = {};
  const paidUp = record(result, () => {
    const invoice = env.ctx.account().business?.invoices.slice(-1)[0];
    return { status: 'sent_and_paid', invoice: invoice?.number, client, amount_usd: amount, note: 'the client paid it by bank transfer and the app matched it' };
  });
  return { result, beats: [...noReact(sendInvoice({ ...env.ctx, params: { name: client, amount, ...(memo && { note: memo }) } })), paidUp] };
}

function listInvoices(env: ToolEnv): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const invoices = env.ctx.account().business?.invoices ?? [];
  const result: ToolResult = {
    invoices: invoices.map((i) => ({ number: i.number, client: i.client, amount_usd: usd(i.amount), status: i.status === 'PAID' ? 'paid' : `already sent, not paid yet, due ${i.due}` })),
  };
  return { result, beats: noReact(trackInvoices(env.ctx)) };
}

function payBillTool(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const vendor = text(call.input.vendor, 40);
  const amount = positive(call.input.amount_usd, 100_000);
  if (!vendor) return fail('need_vendor', { fix: 'ask which company' });
  if (!amount) return fail('need_amount', { fix: 'ask how much' });
  const asked = typeof call.input.country === 'string' ? call.input.country.toLowerCase() : 'us';
  if (!COUNTRY_CODES.has(asked)) return fail('country_not_supported', { country: asked });
  const note = text(call.input.note, 40);
  const result: ToolResult = payFacts(env, vendor, asked, amount);
  const params: FlowParams = { name: vendor, country: asked, amount, currency: 'USD', ...(note && { note }) };
  const before = env.ctx.account();
  const paid = record(result, () => (settledSince(env, before).length ? { status: 'paid', to: vendor, amount_usd: amount } : {}));
  return { result, beats: [...noReact(payBill({ ...env.ctx, params })), paid] };
}

function payContractorTool(env: ToolEnv, call: ToolCall): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const name = text(call.input.name, 40);
  const amount = positive(call.input.amount_usd, 50_000);
  if (!name || RELATION.test(name)) return fail('need_name', { fix: 'ask their name' });
  if (!amount) return fail('need_amount', { fix: 'ask how much' });
  const country = typeof call.input.country === 'string' ? call.input.country.toLowerCase() : 'us';
  if (!COUNTRY_CODES.has(country)) return fail('country_not_supported', { country });
  const note = text(call.input.note, 40);
  const result: ToolResult = payFacts(env, name, country, amount);
  const before = env.ctx.account();
  const paid = record(result, () => (settledSince(env, before).length ? { status: 'paid', to: name, amount_usd: amount, how: 'to their own bank, in their currency' } : {}));
  return { result, beats: [...noReact(payContractor({ ...env.ctx, params: { name, country, amount, ...(note && { note }) } })), paid] };
}

function runPayrollTool(env: ToolEnv): Outcome {
  const missing = needsBalance(env);
  if (missing) return missing;
  const result: ToolResult = {};
  const team = () => env.ctx.account().business?.team ?? [];
  const before = env.ctx.account();
  const paidOut = record(result, () => (settledSince(env, before).length ? { status: 'paid', people: team().map((m) => m.name), total_usd: usd(payrollTotal(team())) } : {}));
  return { result, beats: [...noReact(runPayroll(env.ctx)), paidOut] };
}

/** What a call is about, for an app that labels runs (Duet's eyebrow): who's paid, the hotel, the service, or the flow. */
export function topicOf(call: ToolCall, ctx: FlowContext): string {
  const flow = flowOf(call);
  if (!flow) return '';
  const i = call.input;
  const s = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const params: FlowParams = {
    name: s(i.name) ?? s(i.from) ?? s(i.client) ?? s(i.vendor),
    city: s(i.city),
    checkIn: s(i.check_in),
    checkOut: s(i.check_out),
    merchant: s(i.merchant),
    price: typeof i.monthly_price_usd === 'number' ? i.monthly_price_usd : undefined,
    address: s(i.address),
    query: s(i.query),
    product: s(i.product),
    brand: s(i.brand),
    ...(Array.isArray(i.split_with) && { people: i.split_with.filter((x): x is string => typeof x === 'string') }),
  };
  return topicFor(flow, { ...ctx, params, variant: call.name === 'subscribe' ? 1 : 0 });
}

/** Which tile's flow a tool belongs to, for the panel's groups and the run's label. */
export function flowOf(call: ToolCall): ActionId | null {
  switch (call.name) {
    case 'setup_balance':
      return 'connect';
    case 'add_card':
      return 'card';
    case 'link_bank':
      return 'bank';
    case 'fund':
      return 'fund';
    case 'search':
    case 'checkout':
    case 'subscribe':
      return 'buy';
    case 'quote_payment':
    case 'send_payment':
      return 'pay';
    case 'request_payment':
      return 'getpaid';
    case 'raise_limit':
      return 'limits';
    case 'withdraw':
      return 'cashout';
    case 'send_stablecoins':
      return 'crypto';
    case 'book_stay':
      return 'agent';
    case 'show_account':
      return call.input.show === 'history' ? 'history' : 'balance';
    case 'setup_company':
      return 'company';
    case 'add_teammate':
      return 'teammate';
    case 'set_team_budget':
      return 'team';
    case 'issue_employee_card':
      return 'empcard';
    case 'send_invoice':
      return 'invoice';
    case 'list_invoices':
      return 'invoices';
    case 'pay_bill':
      return 'bill';
    case 'pay_contractor':
      return 'contractor';
    case 'run_payroll':
      return 'payroll';
    case 'reply':
    case 'offer_choices':
    case 'wait':
    case 'answer':
    case 'switch_account':
      return null;
    default: {
      const exhaustive: never = call.name;
      return exhaustive;
    }
  }
}

/** Carry out one call: an error to send back, or the beats to play and the result they fill in. */
export function runTool(env: ToolEnv, call: ToolCall): Outcome {
  switch (call.name) {
    case 'setup_balance':
      return setupBalance(env, call);
    case 'add_card':
      return addCard(env);
    case 'link_bank':
      return linkBank(env, call);
    case 'fund':
      return fund(env, call);
    case 'search':
      return search(env, call);
    case 'checkout':
      return checkout(env, call);
    case 'subscribe':
      return subscribe(env, call);
    case 'quote_payment':
      return quotePayment(env, call);
    case 'send_payment':
      return sendPayment(env, call);
    case 'request_payment':
      return requestPayment(env, call);
    case 'raise_limit':
      return raiseLimit(env, call);
    case 'withdraw':
      return withdraw(env, call);
    case 'send_stablecoins':
      return sendStablecoins(env, call);
    case 'book_stay':
      return bookStay(env, call);
    case 'show_account':
      return showAccount(env, call);
    case 'setup_company':
      return setupCompany(env, call);
    case 'add_teammate':
      return addTeammateTool(env, call);
    case 'set_team_budget':
      return setTeamBudget(env, call);
    case 'issue_employee_card':
      return issueEmployeeCard(env, call);
    case 'send_invoice':
      return sendInvoiceTool(env, call);
    case 'list_invoices':
      return listInvoices(env);
    case 'pay_bill':
      return payBillTool(env, call);
    case 'pay_contractor':
      return payContractorTool(env, call);
    case 'run_payroll':
      return runPayrollTool(env);
    // What the conversation itself carries out (a line, a pause, an answer to what's open, the other account): nothing to run here.
    case 'reply':
    case 'offer_choices':
    case 'wait':
    case 'answer':
    case 'switch_account':
      return { result: { status: 'shown' }, beats: [] };
    default: {
      const exhaustive: never = call.name;
      return exhaustive;
    }
  }
}
