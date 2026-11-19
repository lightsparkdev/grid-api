import { BANK_COUNTRIES } from '@/data/bankCountries';
import { CONNECTORS, type ConnectorId } from '@/data/connectors';
import { MODES, type Mode } from '@/data/mode';

/* The agent's tools: what the model can do, each checked and carried out in the phone (apps/agents/tools). The
   model runs the conversation and writes every line; a tool does one thing in the app (a screen, an action) and
   answers with what happened, what it's waiting on, or an error the model can act on. */

export const TOOL_NAMES = [
  'reply',
  'offer_choices',
  'wait',
  'answer',
  'switch_account',
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
  'setup_company',
  'set_team_budget',
  'add_teammate',
  'issue_employee_card',
  'send_invoice',
  'list_invoices',
  'pay_bill',
  'pay_contractor',
  'run_payroll',
] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

/** What each account can do: a business invoices, pays bills, contractors and payroll, and doesn't shop. */
const PERSONAL_ONLY = new Set<ToolName>(['setup_balance', 'add_card', 'search', 'checkout', 'subscribe', 'request_payment', 'book_stay']);
const BUSINESS_ONLY = new Set<ToolName>(['setup_company', 'add_teammate', 'set_team_budget', 'issue_employee_card', 'send_invoice', 'list_invoices', 'pay_bill', 'pay_contractor', 'run_payroll']);
const TOOLS_IN: Record<Mode, ReadonlySet<ToolName>> = {
  personal: new Set(TOOL_NAMES.filter((t) => !BUSINESS_ONLY.has(t))),
  business: new Set(TOOL_NAMES.filter((t) => !PERSONAL_ONLY.has(t))),
};
export const toolsIn = (mode: Mode) => TOOLS_IN[mode];

/** Tools that end the turn: the person acts next. */
export const ENDS_TURN = new Set<ToolName>(['reply', 'offer_choices', 'wait', 'switch_account']);
/** Tools with no line of their own: what they lead to is what there is to say, once their result is in. */
export const SAYS_NOTHING = new Set<ToolName>(['wait', 'answer']);

/** A line to the person, written once per app: they can switch apps mid-conversation, and the thread follows in that app's voice. */
export type Say = Partial<Record<ConnectorId, string>>;
export const CONNECTOR_IDS = CONNECTORS.map((c) => c.id);

/** One tool call as the model made it. */
export interface ToolCall {
  id: string;
  name: ToolName;
  input: Record<string, unknown> & { say?: Say };
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

export const STABLE_ASSETS = ['USDC', 'USDT', 'USDB'] as const;
export const STABLE_NETWORKS = ['BASE', 'SOLANA', 'ETHEREUM', 'POLYGON', 'ARBITRUM', 'TRON', 'SPARK'] as const;
export const OWN_BANK_HOMES = ['us', 'mx', 'br', 'other'] as const;

const str = (description: string, extra: Record<string, unknown> = {}) => ({ type: 'string', description, ...extra });
const num = (description: string) => ({ type: 'number', description });
const voices = { properties: Object.fromEntries(CONNECTOR_IDS.map((c) => [c, { type: 'string' }])), required: CONNECTOR_IDS };
/** What a reply says: the one message, once per app. */
const line = { type: 'object', description: 'Your message, written once per app in that app’s own voice: the same meaning, facts, amounts and question in each.', ...voices };
/** A word before a tool's work, for the rare time there's something to say first. */
const say = {
  type: 'object',
  description:
    'Usually leave this out: the app shows what you’re doing, and you speak once the result is in. Only for something they need to hear before the work (a part of what they asked that you can’t do). Once per app, in each app’s voice.',
  ...voices,
};

interface ToolDef {
  name: ToolName;
  description: string;
  input_schema: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
}

const tool = (name: ToolName, description: string, properties: Record<string, unknown>, required: string[] = [], opts: { say?: 'required' | 'none' } = {}): ToolDef => ({
  name,
  description,
  input_schema: {
    type: 'object',
    properties: { ...(opts.say === 'none' ? {} : { say: opts.say === 'required' ? line : say }), ...properties },
    required: [...(opts.say === 'required' ? ['say'] : []), ...required],
  },
});

const COUNTRY_CODES = BANK_COUNTRIES.map((c) => c.code);

export const TOOL_DEFS: ToolDef[] = [
  tool(
    'reply',
    'Text the person and end your turn: what just happened, an answer, a question, the line that leads into what the app is about to put on screen, or why you can’t do something. Whatever is open on screen stays open.',
    { suggestions: { type: 'array', items: { type: 'string' }, maxItems: 4, description: 'Up to 4 replies they can tap, each 1 to 4 words, written as they’d say it back: under a question about a country or a choice, or a next step worth offering. Never names; never bare amounts. Leave out when the app is about to show its own taps (a result’s waiting).' } },
    [],
    { say: 'required' },
  ),
  tool(
    'offer_choices',
    'Ask the person to pick, with 2 to 4 tappable options, and end your turn. Their pick comes back as their next message. Use for a choice of your own (which country, an offer: add money now?). Never for something a result is waiting on: the app shows its own taps for that.',
    { options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4, description: 'Each 1 to 4 words, as they’d say it back ("My card", "Not now", "$50").' } },
    ['options'],
    { say: 'required' },
  ),
  tool('wait', 'End your turn without texting anything more: what’s on screen already says it. Rare; when there’s news (something done, something needed), say it with reply.', {}, [], { say: 'none' }),
  tool(
    'answer',
    'Answer what’s open on screen for them, when what they typed does that: approve or decline the approval or form, pick one of the options, or give the amount or the name it asks for. The app carries on exactly as if they had tapped, and the result is what happened next. Only for what "On screen" lists right now, and only when their words clearly mean it. A question about it, or a change to it, is not an answer.',
    {
      decision: str('An approval or a form: approve it, or decline it.', { enum: ['approve', 'decline'] }),
      option: { type: 'integer', description: 'Options: which one they mean, counting from 1.' },
      amount_usd: num('An amount: how much, USD.'),
      name: str('A name: just the name, written as a name ("pat capulong" is "Pat Capulong"); several people as they listed them.'),
    },
    [],
    { say: 'none' },
  ),
  tool(
    'switch_account',
    'Take them to their other account in the app: its own conversation, balance and tools. The business account sets up a company and handles invoices, bills, contractors, payroll and the team’s budget and cards; the personal account shops, subscribes, books hotels and pays friends. Call it when they ask for something that lives on the other account, or say yes to switching. Ends your turn here.',
    {
      to: str('The account to go to.', { enum: MODES }),
      carry: str('What they asked for that belongs there, in their own words, so it’s picked up there ("run payroll for my team"). Leave out when they only want to switch.'),
    },
    ['to'],
    { say: 'required' },
  ),
  tool('setup_balance', 'Turn on their balance (and your account with it, at the default limits): the app shows its own consent sheet. Needed before adding money, getting paid, paying someone, withdrawing or sending stablecoins.', {}),
  tool('add_card', 'Save their credit or debit card to your vault, in the app’s own card sheet, so you can pay with it or add money from it. Works without a balance.', {}),
  tool('link_bank', 'Link their own bank so money can move in and out. A US bank links through Plaid; elsewhere the app’s form.', {
    home: str('Where their bank is, if they said: "us", "mx", "br", or "other". Left out, the result waits on which country.', { enum: OWN_BANK_HOMES }),
  }),
  tool(
    'fund',
    'Add money to their balance: from their card (saved first if it isn’t), their bank (linked first if it isn’t), or stablecoins (shows deposit details). Saving the card or linking a US bank for this is the go-ahead: the amount is taken right then, with no second confirmation. Adding money has no fee. Pass only what they said; what’s missing (how much, where from) comes back as waiting, with the app’s own taps.',
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
    `Find something to buy and show it on a product card with real prices. Pass on exactly what they said; never invent a product, brand or price. A product they named comes back as the only option (they_picked): call checkout with option_id "chosen" in the same step. Anything vaguer comes back as three and waits on their pick: once they’ve picked (they_picked), call checkout with option_id "chosen"; never ask again which one.
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
  tool('show_account', 'Show the balance card (balance and limits) or recent activity.', { show: str('Which.', { enum: ['balance', 'history'] }) }, ['show']),
  tool('setup_company', 'Set up the business’s own account, verified, with US bank details clients pay, at the default limits. It needs the company’s name and the owner’s: pass what they said, and whatever’s missing comes back as waiting; then the app shows its consent sheet. Needed before anything else on the business.', {
    company: str('The company’s name, only if they said it.'),
    owner: str('The owner’s full name, only if they said it.'),
  }),
  tool('add_teammate', 'Add someone to the team. It needs their name, role, pay each payroll and the bank payroll pays: pass the name if they said it, and the rest comes back as waiting, one at a time, with the app’s own taps and sheet. Team budgets, team cards and payroll cover whoever is on the team.', {
    name: str('Their full name, only if the owner said it.'),
  }),
  tool('set_team_budget', 'Give everyone on the team their own agent, sharing one monthly budget from the business’s account. The owner approves it.', {
    monthly_usd: num('The team’s monthly budget, USD, only if they said.'),
  }),
  tool('issue_employee_card', 'Issue a Visa in a teammate’s name, spending from the business’s account (inside the team budget once there is one). For someone not on the team yet, the app adds them first. The owner approves it.', {
    name: str('The teammate, as they named them.'),
    purpose: str('What it’s for, a few words, only if they said ("travel").'),
  }, ['name']),
  tool('send_invoice', 'Write an invoice in the app and send it to a client, with the business’s bank details and the invoice number on it; the app matches the client’s bank transfer to it when it lands.', {
    client: str('Who’s paying: the client, as they named them.'),
    amount_usd: num('How much, USD.'),
    memo: str('What it’s for, a few words, only if they said.'),
  }, ['client', 'amount_usd']),
  tool('list_invoices', 'Show the invoices: which are paid and which are still open, with a reminder to send for an open one.', {}),
  tool('pay_bill', 'Pay a company’s bill (internet, software, utilities, office rent, a supplier) to its bank from the business’s account. A company paid for the first time gets its bank added in the app’s form, as a business.', {
    vendor: str('The company, as it brands itself ("Wavelink Fiber").'),
    amount_usd: num('How much, USD.'),
    note: str('What it’s for, a few words, only if they said.'),
    country: str('Where the company banks (ISO code), only if it isn’t the US.', { enum: COUNTRY_CODES }),
  }, ['vendor', 'amount_usd']),
  tool('pay_contractor', 'Pay a freelancer or contractor who isn’t on the team, straight to their own bank, at home or abroad, in their currency. The app adds their bank in its own sheet the first time. Above the approval limit the owner approves.', {
    name: str('Their name, as the owner said it.'),
    country: str('Where they’re paid (ISO code), only if it isn’t the US.', { enum: COUNTRY_CODES }),
    amount_usd: num('How much, USD.'),
    note: str('What it’s for, a few words, only if they said.'),
  }, ['name', 'amount_usd']),
  tool('run_payroll', 'Pay everyone on the team their usual pay in one run: the app shows the preview, and the owner approves it once.', {}),
];
