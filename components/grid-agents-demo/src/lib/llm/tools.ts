import { BANK_COUNTRIES } from '@/data/bankCountries';
import { CONNECTORS, type ConnectorId } from '@/data/connectors';

/* The agent's tools: what the model can do, each checked and carried out in the phone (apps/agents/tools). The
   model plans; the tools own prices, limits, approvals and the Grid calls, and answer with a result or an error
   it can act on. */

export const TOOL_NAMES = [
  'reply',
  'offer_choices',
  'setup_balance',
  'add_card',
  'link_bank',
  'fund',
  'search',
  'checkout',
  'subscribe',
  'quote_payment',
  'send_payment',
  'request_payment',
  'raise_limit',
  'withdraw',
  'send_stablecoins',
  'book_stay',
  'show_account',
] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

/** Tools that end the turn: the person answers next. */
export const ENDS_TURN = new Set<ToolName>(['reply', 'offer_choices']);
/** Tools whose result the model reads before the turn can end: they find or price something. */
export const READS_RESULT = new Set<ToolName>(['search', 'quote_payment']);

export type Say = Partial<Record<ConnectorId, string>>;

/** One tool call as the model made it. */
export interface ToolCall {
  id: string;
  name: ToolName;
  input: Record<string, unknown> & { say?: Say; more?: boolean };
}

/** What a tool sends back: anything JSON, with `error` when it couldn't run. */
export type ToolResult = Record<string, unknown>;

/** One block of the conversation as the provider reads it. */
export type Block =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string; is_error?: boolean };
export interface Turn {
  role: 'user' | 'assistant';
  content: Block[];
}

export const CONNECTOR_IDS = CONNECTORS.map((c) => c.id);
export const STABLE_ASSETS = ['USDC', 'USDT', 'USDB'] as const;
export const STABLE_NETWORKS = ['BASE', 'SOLANA', 'ETHEREUM', 'POLYGON', 'ARBITRUM', 'TRON', 'SPARK'] as const;
export const OWN_BANK_HOMES = ['us', 'mx', 'br', 'other'] as const;

const str = (description: string, extra: Record<string, unknown> = {}) => ({ type: 'string', description, ...extra });
const num = (description: string) => ({ type: 'number', description });
const say = {
  type: 'object',
  description:
    'What you text the person as this starts, once per app in its own voice: a warm sentence or two saying you’re on it, the same meaning, facts and amounts in each.',
  properties: Object.fromEntries(CONNECTOR_IDS.map((c) => [c, { type: 'string' }])),
  required: CONNECTOR_IDS,
};
const more = { type: 'boolean', description: 'True when you have more to do after this in the same turn (another task they asked for, or what this setup is for). Otherwise the turn ends once it’s done.' };

interface ToolDef {
  name: ToolName;
  description: string;
  input_schema: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
}

const tool = (name: ToolName, description: string, properties: Record<string, unknown>, required: string[] = [], opts: { more?: boolean; sayRequired?: boolean } = {}): ToolDef => ({
  name,
  description,
  input_schema: {
    type: 'object',
    properties: { say, ...properties, ...(opts.more === false ? {} : { more }) },
    required: [...(opts.sayRequired ? ['say'] : []), ...required],
  },
});

const COUNTRY_CODES = BANK_COUNTRIES.map((c) => c.code);

export const TOOL_DEFS: ToolDef[] = [
  tool(
    'reply',
    'Text the person and end your turn: an answer, a question, or why you can’t do something. Use when nothing else fits.',
    { suggestions: { type: 'array', items: { type: 'string' }, maxItems: 4, description: 'Only under a question about a country or a choice: up to 4 replies they can tap, each 1 to 3 words, written as they’d say it back. Never names; never bare amounts.' } },
    [],
    { more: false, sayRequired: true },
  ),
  tool(
    'offer_choices',
    'Ask the person to pick, with 2 to 4 tappable options, and end your turn. Their pick comes back as their next message. Use for a choice you need (which way to add money, which network) or an offer (add money now?).',
    { options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4, description: 'Each 1 to 4 words, as they’d say it back ("My card", "Not now", "$50").' } },
    ['options'],
    { more: false, sayRequired: true },
  ),
  tool('setup_balance', 'Turn on their balance (and your account with it, at the default limits): the app shows its own consent sheet. Needed before adding money, getting paid, paying someone, withdrawing or sending stablecoins.', {}),
  tool('add_card', 'Save their credit or debit card to your vault, in the app’s own card sheet, so you can pay with it or add money from it. Works without a balance.', {}),
  tool('link_bank', 'Link their own bank so money can move in and out. A US bank links through Plaid; elsewhere the app’s form.', {
    home: str('Where their bank is, if they said: "us", "mx", "br", or "other". Leave out to let the app ask.', { enum: OWN_BANK_HOMES }),
  }),
  tool(
    'fund',
    'Add money to their balance: from their card (saved first if it isn’t), their bank (linked first if it isn’t), or stablecoins (shows deposit details). Pass only what they said; the app asks how much and where from with its own taps.',
    {
      amount_usd: num('How much, USD, if they said.'),
      cover: str('Instead of an amount: a quote_id or an option_id (or "chosen"); adds exactly what the balance is short of it.'),
      method: str('Where it comes from, if they said.', { enum: ['card', 'bank', 'stablecoins'] }),
      asset: str('stablecoins: the coin.', { enum: ['USDC', 'USDT'] }),
      network: str('stablecoins: the network. USDC: BASE, SOLANA, ETHEREUM, POLYGON, ARBITRUM. USDT: TRON, ETHEREUM, SOLANA, POLYGON, ARBITRUM.', { enum: STABLE_NETWORKS.filter((n) => n !== 'SPARK') }),
    },
  ),
  tool(
    'search',
    `Find something to buy and show it on a product card with real prices. Pass on exactly what they said; never invent a product, brand or price. A product they named comes back as the only option; anything vaguer comes back as three, and the app asks them to pick: they_picked in the result is their choice, so never ask again which one. Call checkout with option_id "chosen" in the same step.
- They named an exact product ("airpods pro", "a ps5"): product as they said it, brand (its maker), typical_price_usd (your estimate of its usual US price), query with what kind of thing it is.
- A brand or store ("nike", "a dyson vacuum"): brand, and typical_price_usd for that brand's.
- Vague ("a coffee maker", "sneakers"): query, typical_price_usd. Never ask what kind, which brand or how much. A present, a surprise or "you choose": one common, concrete thing as the query ("scented candle"), never a gift card unless they said gift card.
- budget_usd only if they said how much to spend.
- A gift card: kind "gift", brand (the store) and value_usd. Without a store or a value, ask instead of searching.
- A game, app or download: kind "digital".
- Food or coffee delivered now: query, brand if they named the place. Never ask which restaurant.
- A ride: query "ride to <where they said>", brand if they named the service. Never ask from where.
- Tickets: query with how many and what ("2 tickets to the knicks game"). A table: query "dinner reservation for <how many> at <time>". Never ask which venue.
- Prepaid phone credit: kind "topup", value_usd and query "phone top-up in <country>". Without a country or value, ask.
- A bill: query "<which> bill" ("electric bill"), brand if they named the company, value_usd only if they said. Rent or anyone they owe is send_payment, not this.
- The ring light they saved: query "ring light".
- "Buy it if it drops under $X" or "when it's on sale for less than $X": search, then checkout with buy_when_below_usd X, in one step.
- Wine, beer and spirits are fine: they're an adult.`,
    {
      query: str('What kind of thing they want, in a few words, with no prices or budgets in it ("apple headphones", not "apple under $300").'),
      kind: str('gift, digital, topup, or physical (anything else).', { enum: ['physical', 'gift', 'digital', 'topup'] }),
      product: str('The exact product, only if they named one, in their words with the maker’s spelling ("AirPods Pro"). New products exist that you don’t know ("iPhone Duo"): never swap in one you do.'),
      brand: str('The brand or store they named, or the maker of the product they named.'),
      budget_usd: num('The most they want to spend, only if they said.'),
      typical_price_usd: num('Your best estimate of what it usually costs in the US.'),
      value_usd: num('A gift card’s or phone top-up’s value; a bill’s amount only if they said it.'),
    },
    ['query'],
    { more: false },
  ),
  tool(
    'checkout',
    'Buy one of the options search showed, on a single-use card scoped to the order. The app works out what pays, raises the limit with them if it’s over, shows its checkout, and asks them to approve when the policy needs it.',
    {
      option_id: str('An option_id from search, or "chosen": the one they picked from the latest search, or the one they named.'),
      pay_with: str('Only if they said, or to fix an error: "card" (their saved card; saved first if it isn’t) or "balance". Otherwise the app uses what covers it.', { enum: ['balance', 'card'] }),
      buy_when_below_usd: num('Only when they want it bought once its price drops under this ("if it goes under $250"): you watch the price and buy it then, approved now.'),
    },
    ['option_id'],
  ),
  tool('subscribe', 'Subscribe them to a well-known service with a card only that service can charge, monthly. Always asks them to approve.', {
    merchant: str('The service, as it brands itself ("Spotify Premium").'),
    monthly_price_usd: num('Its usual monthly price, USD. Ask if you don’t know it.'),
    pay_with: str('"card" only if they want it on their card.', { enum: ['balance', 'card'] }),
  }, ['merchant', 'monthly_price_usd']),
  tool(
    'quote_payment',
    'Price a payment to someone’s bank without sending it: the result has the quote_id, what they receive in their currency, and whether it fits the limits and the balance. Use when they only want to know, or you need the numbers before deciding. To pay, call send_payment directly.',
    {
      name: str('Who, as they named them (a first name is enough).'),
      country: str('Where they bank (ISO code). Not needed for someone already saved.', { enum: COUNTRY_CODES }),
      amount: num('How much, in currency.'),
      currency: str('"USD", or the ISO code of their local currency if they said it in that currency.'),
    },
    ['name', 'amount'],
    { more: false },
  ),
  tool(
    'send_payment',
    'Send money to someone’s bank in one of the countries listed, from the balance. Pass quote_id, or the details (it quotes first). Someone new gets their bank added in the app’s form. Over the limit it asks them to raise it; short, it asks where to add the rest from; above your approval limit they approve. Monthly: monthly_on_day schedules it every month, the first now.',
    {
      quote_id: str('A quote from quote_payment or an earlier error.'),
      name: str('Their name (a first name is enough). "My landlord" or "my sister" isn’t a name: ask for it.'),
      country: str('Where they bank (ISO code). Not needed for someone already saved.', { enum: COUNTRY_CODES }),
      amount: num('How much, in currency.'),
      currency: str('"USD", or the ISO code of their local currency if they said it in that currency.'),
      note: str('What it’s for, a few words, only if they said.'),
      monthly_on_day: num('Every month on this day (1–28), the first now. "On the 1st" for rent means 1.'),
    },
  ),
  tool(
    'request_payment',
    'Get paid: someone pays them into the balance. Either from (who) and amount_usd, or split_with and total_usd to split a bill they paid (the app works out the shares). Their client Lucía’s invoice is on file: from "Lucía" alone plays it.',
    {
      from: str('Who’s paying.'),
      amount_usd: num('How much they pay, USD.'),
      split_with: { type: 'array', items: { type: 'string' }, description: 'Splitting a bill they paid: the others, by first name.' },
      total_usd: num('Splitting: the whole bill, USD.'),
    },
  ),
  tool(
    'raise_limit',
    'Change your spending limits: the app shows the change for them to approve with Face ID. "Raise my limit" means per_payment_usd. Set ask_above_usd only when they talk about asking them first or doing things alone. With for, one approval also covers that payment or purchase, so it doesn’t ask twice; call checkout or send_payment for it next.',
    {
      per_payment_usd: num('The most per payment.'),
      daily_usd: num('The most per day.'),
      ask_above_usd: num('You act alone up to this; above it, they approve.'),
      for: str('A quote_id or option_id this raise is for.'),
    },
  ),
  tool('withdraw', 'Move money from the balance to their own bank (the app links one first if they have none). Instant.', {
    amount_usd: num('How much, USD.'),
    everything: { type: 'boolean', description: 'The whole balance.' },
  }),
  tool(
    'send_stablecoins',
    'Send stablecoins from the balance to a wallet: USDC or USDT on Base, Ethereum, Solana, Polygon, Arbitrum or Tron (Base takes USDC only, Tron USDT only), or USDB to a Spark address. Errors say what’s missing (which network, which coin) or why the address won’t work; the limit and a short balance it handles itself.',
    {
      address: str('Exactly as they gave it, even if it looks incomplete.'),
      amount_usd: num('How much, USD.'),
      asset: str('The coin, if they said.', { enum: STABLE_ASSETS }),
      network: str('The network, if they said.', { enum: STABLE_NETWORKS }),
    },
    ['address', 'amount_usd'],
  ),
  tool('book_stay', 'Book a hotel in any city by paying the hotel’s own agent, which finds the hotel and quotes the rate. Never name a hotel or a price yourself.', {
    city: str('The city, as people name it.'),
    check_in: str('YYYY-MM-DD.'),
    check_out: str('YYYY-MM-DD.'),
    guests: num('How many are staying, only if they said.'),
  }, ['city', 'check_in', 'check_out']),
  tool('show_account', 'Show the balance card (balance and limits) or recent activity.', { show: str('Which.', { enum: ['balance', 'history'] }) }, ['show'], { more: false }),
];
