/* The scripted conversations: one persona per connector, six flows each. A
   flow's shape is shared (see the templates below); the persona supplies who
   is talking and what they want. The scripts read the agent's policy, so a
   payment over the approval threshold asks the person and one under it
   doesn't, exactly as Grid would decide. */

import type { AgentAsk, AgentNote, BrainStep, Chip, Episode } from '@/apps/agents/conversation';
import type { BrainContext } from '@/lib/chatBrain';
import type { ActionId } from './actions';
import {
  purchaseSpendLimit,
  type DepositNetwork,
  type Limits,
  type MerchantAgent,
  type Payee,
  type Purchase,
} from './agentEvents';
import type { ConnectorId } from './connectors';

/* ── Formatting ───────────────────────────────────────────────────────── */

function usd(cents: number) {
  const whole = cents % 100 === 0;
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
function usd2(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const A = '/assets/agents';

/* ── Personas ─────────────────────────────────────────────────────────── */

interface FundStory {
  ask: string;
  intro: string;
  /** dot offers the networks as chips; the others are asked for one. */
  chips?: { options: Chip[]; pick: number };
  network: DepositNetwork;
  currency: string;
  amount: number;
  /** How the address card is titled, such as "USDC on Base". */
  label: string;
}

interface PayStory {
  ask: string;
  intro: string[];
  payee: Payee;
  flag: string;
  /** "R$2,500.00", as the person reads it. */
  local: string;
  done: string;
}

interface BuyStory {
  ask: string;
  intro: string[];
  purchase: Purchase;
  /** The approval sheet as this app draws it. */
  approval: (purchase: Purchase, ctx: BrainContext) => AgentAsk;
  done: string;
}

interface DealStory {
  ask: string;
  intro: string[];
  to: MerchantAgent;
  /** The price before paying directly. */
  listed: number;
  offer: string;
  accept: string;
  done: string;
}

interface Persona {
  /** What the agent calls itself in the thread. */
  agent: string;
  /** The person's name, as the agent addresses them. */
  person: string;
  /** Group chats tag each of the agent's lines with its name. */
  sender?: string;
  history: Episode;
  connectAsk: string;
  fund: FundStory;
  limits: { ask: string; to: Limits };
  pay: PayStory;
  buy: BuyStory;
  deal: DealStory;
}

/** A plain approval that names what it's for and how much. */
function plainApproval(title: string, amount: string, method: string): AgentAsk {
  return { title, amount, method, allow: 'Approve', allowed: 'Approved' };
}

const MUSE_CONTACT = { email: 'alex.rivera@gmail.com', phone: '+1 (310) 555-0142' };
const MUSE_ADDRESS = '2140 Ocean Park Blvd, Apt 4, Santa Monica CA 90405, US';

const PERSONAS: Record<ConnectorId, Persona> = {
  muse: {
    agent: 'Muse',
    person: 'Alex',
    history: [
      { them: 'Morning, Alex. Your Thursday is clear after 2.' },
      { me: 'Remind me to call Mom at 6' },
      { them: 'Done. I’ll nudge you at 6.' },
    ],
    connectAsk: 'Can you pay for things for me now?',
    fund: {
      ask: 'Add $250 from my Coinbase',
      intro: 'Here’s your address on Base. Send USDC and it lands as dollars in a few seconds.',
      network: 'BASE',
      currency: 'USDC',
      amount: 25_000,
      label: 'USDC on Base',
    },
    limits: {
      ask: 'Handle anything under $100 yourself, and keep it under $1,000 a day',
      to: { perTransaction: 50_000, daily: 100_000, approvalAbove: 10_000 },
    },
    pay: {
      ask: 'Send Sofia R$250 for the concert tickets',
      intro: ['Sofia banks with Nubank, so I’ll send it over PIX. R$250 is $45.20 right now.'],
      payee: { name: 'Sofia Almeida', currency: 'BRL', amount: 25_000, usd: 4_520, rail: 'PIX', bank: 'Nubank' },
      flag: 'br',
      local: 'R$250.00',
      done: 'Sent. Sofia has it, and I told her it’s from you.',
    },
    buy: {
      ask: 'Order the ring light I saved yesterday',
      intro: [
        'Found it at NEEWER: the RP10-H, $48.75 with standard shipping.',
        'I’ll get a one-time card for exactly this order, so NEEWER never sees your real card.',
      ],
      purchase: { merchant: 'NEEWER', description: 'NEEWER BASICS RP10-H 10" ring light, standard shipping', amount: 4_875 },
      approval: (p, ctx) => ({
        title: 'The agent wants to place an order at NEEWER',
        badge: 'N',
        rows: [
          { text: 'NEEWER BASICS RP10-H 10" Selfie Ring Light', sub: 'Qty: 1', image: `${A}/muse/product.png` },
          { text: 'Standard by 2 to 5 business days', sub: MUSE_ADDRESS, icon: 'truck' },
          { text: MUSE_CONTACT.email, sub: MUSE_CONTACT.phone, icon: 'envelope' },
          { text: 'Meta Pay balance', sub: 'Pay with Meta Pay', icon: 'meta' },
        ],
        total: usd2(p.amount),
        method: `${usd2(ctx.wallet.balanceCents)} available`,
        legal: 'NEEWER',
        allow: 'Allow',
        allowed: 'Allowed',
        deny: 'Deny',
      }),
      done: 'Ordered. It arrives Thursday, and the card closed itself after the charge.',
    },
    deal: {
      ask: 'Book Hotel Alma in Lisbon for the 12th to the 14th',
      intro: ['Hotel Alma’s agent quoted $412 for the two nights.'],
      to: { name: 'Hotel Alma', amount: 37_080, description: '2 nights, June 12 to 14, paid agent to agent' },
      listed: 41_200,
      offer: 'Pay me directly, get 10% off.',
      accept: 'Deal. Paying directly.',
      done: 'Booked. The confirmation is in your inbox.',
    },
  },

  grok: {
    agent: 'Grok',
    person: 'Cole',
    history: [
      { them: 'Booked Taberna da Rua for Friday at 8. The confirmation is in your inbox.' },
      { them: 'Done. Your flight to Lisbon is checked in and the boarding pass is in your Wallet.' },
    ],
    connectAsk: 'Set yourself up to pay my invoices',
    fund: {
      ask: 'Top up $100 from my Strike wallet',
      intro: 'Here’s a Lightning invoice for $100. Pay it from Strike and it lands in a second.',
      network: 'LIGHTNING',
      currency: 'USD',
      amount: 10_000,
      label: 'Lightning invoice',
    },
    limits: {
      ask: 'Pay invoices under $500 without asking. Cap it at $2,000 a day',
      to: { perTransaction: 200_000, daily: 200_000, approvalAbove: 50_000 },
    },
    pay: {
      ask: 'Pay Mariana’s invoice',
      intro: [
        'Mariana sent her invoice for the logo work: R$2,500, about $452.',
        'She banks with Nubank in São Paulo, so I’ll send it over PIX in reais.',
      ],
      payee: { name: 'Mariana Costa', currency: 'BRL', amount: 250_000, usd: 45_200, rail: 'PIX', bank: 'Nubank' },
      flag: 'br',
      local: 'R$2,500.00',
      done: 'Sent. Mariana has it, and the receipt is in her inbox.',
    },
    buy: {
      ask: 'Renew the domain for my portfolio',
      intro: ['cole.studio renews at Porkbun for $18.00 a year.', 'I’ll use a one-time card for it.'],
      purchase: { merchant: 'Porkbun', description: 'cole.studio renewal, 1 year', amount: 1_800 },
      approval: (p) => ({
        title: 'Renew cole.studio',
        who: { name: 'Porkbun', detail: `${usd2(p.amount)} on a one-time card` },
        allow: 'Approve',
        allowed: 'Paid',
      }),
      done: 'Renewed through next November.',
    },
    deal: {
      ask: 'Get me B-roll of Lisbon trams for the edit',
      intro: ['Frameway’s agent has 12 clips that fit, $36 for the set.'],
      to: { name: 'Frameway', amount: 3_240, description: '12 clips, Lisbon trams, 4K license' },
      listed: 3_600,
      offer: 'Pay my account directly and it’s 10% off.',
      accept: 'Paying directly.',
      done: 'The clips are in your Downloads folder.',
    },
  },

  dot: {
    agent: 'dot',
    person: 'Lucía',
    history: [
      { stamp: 'Today 2:53 PM' },
      { them: 'Your Stripe payout of $1,240 landed this morning.' },
      { me: 'Perfect, thank you' },
    ],
    connectAsk: 'Can you handle my money stuff now?',
    fund: {
      ask: 'I want to add money',
      intro: 'Pick what’s easiest:',
      chips: {
        options: [
          { label: 'USDC on Base' },
          { label: 'Bitcoin over Lightning' },
          { label: 'USDC on Solana' },
          { label: 'USDT on Tron' },
        ],
        pick: 0,
      },
      network: 'BASE',
      currency: 'USDC',
      amount: 50_000,
      label: 'USDC on Base',
    },
    limits: {
      ask: 'You can pay people up to $250 without asking me',
      to: { perTransaction: 100_000, daily: 250_000, approvalAbove: 25_000 },
    },
    pay: {
      ask: 'Pay Diego for the product shoot',
      intro: ['Diego’s invoice is MX$3,200, about $186. He banks with BBVA, so it goes over SPEI.'],
      payee: { name: 'Diego Ruiz', currency: 'MXN', amount: 320_000, usd: 18_600, rail: 'SPEI', bank: 'BBVA' },
      flag: 'mx',
      local: 'MX$3,200.00',
      done: 'Paid. He has it already.',
    },
    buy: {
      ask: 'Buy the stock photo pack I liked',
      intro: ['The Golden Hour pack is $14 at Unsplash+. I’ll pay with a one-time card.'],
      purchase: { merchant: 'Unsplash+', description: 'Golden Hour photo pack, commercial license', amount: 1_400 },
      approval: (p) => plainApproval('Buy the Golden Hour pack', usd2(p.amount), 'One-time card · Unsplash+'),
      done: 'Downloaded. It’s in your Assets folder.',
    },
    deal: {
      ask: 'Order 50 prints of the portfolio book',
      intro: ['Printwell’s agent quoted $640 for 50 copies.'],
      to: { name: 'Printwell', amount: 60_800, description: '50 portfolio books, matte, 5% off for paying directly' },
      listed: 64_000,
      offer: 'Pay my account directly and I’ll take 5% off.',
      accept: 'Done, paying directly.',
      done: 'Ordered. They ship Friday.',
    },
  },

  instinct: {
    agent: 'Instinct',
    person: 'you',
    sender: 'Instinct',
    history: [
      { stamp: 'Yesterday 9:41 PM' },
      { them: 'Landing at 10, who’s grabbing the keys?', sender: 'Sam' },
      { them: 'Me! See you at the flat', sender: 'Marta' },
      { me: 'Bringing pastéis de nata' },
    ],
    connectAsk: 'Instinct, can you handle money for the trip?',
    fund: {
      ask: 'Instinct, put $300 in the trip fund',
      intro: 'Here’s the trip fund’s Lightning invoice. Pay it and it lands in a second.',
      network: 'LIGHTNING',
      currency: 'USD',
      amount: 30_000,
      label: 'Lightning invoice',
    },
    limits: {
      ask: 'Instinct, settle anything under $100 without asking',
      to: { perTransaction: 50_000, daily: 100_000, approvalAbove: 10_000 },
    },
    pay: {
      ask: 'Instinct, pay Marta back for dinner',
      intro: ['Your share of Taberna da Rua is €46. Marta banks with Millennium, so it goes over SEPA Instant.'],
      payee: { name: 'Marta Silva', currency: 'EUR', amount: 4_600, usd: 4_990, rail: 'SEPA_INSTANT', bank: 'Millennium BCP' },
      flag: 'pt',
      local: '€46.00',
      done: 'Marta’s paid back. You’re square.',
    },
    buy: {
      ask: 'Instinct, grab the boat tour tickets for all four',
      intro: ['Four tickets for tomorrow at 11 are €180 at Lisbon Boat Tours.'],
      purchase: { merchant: 'Lisbon Boat Tours', description: '4 tickets, sunset tour, June 13 at 11:00', amount: 19_500 },
      approval: (p) => plainApproval('Boat tour, 4 tickets', usd2(p.amount), 'One-time card · Lisbon Boat Tours'),
      done: 'Booked. Tickets are in everyone’s Wallet.',
    },
    deal: {
      ask: 'Instinct, hold the big table at Taberna for Saturday',
      intro: ['Taberna da Rua’s agent wants a €60 deposit for eight.'],
      to: { name: 'Taberna da Rua', amount: 5_850, description: 'Deposit, table for 8, Saturday 9 PM' },
      listed: 6_500,
      offer: 'Pay us directly and the deposit is 10% off.',
      accept: 'Paying directly.',
      done: 'Table for eight, Saturday at 9. It’s on the calendar.',
    },
  },

  claude: {
    agent: 'Claude',
    person: 'Maya',
    history: [
      { them: 'Morning, Maya. Three things today, and one needs you.' },
      { them: 'Payroll ran at 6 AM. All 14 people are paid.' },
    ],
    connectAsk: 'Set yourself up to buy for the restaurants',
    fund: {
      ask: 'Move $5,000 of USDC from the treasury on Base',
      intro: 'Here’s the address on Base. Send the USDC and it lands as dollars.',
      network: 'BASE',
      currency: 'USDC',
      amount: 500_000,
      label: 'USDC on Base',
    },
    limits: {
      ask: 'You can spend up to $4,000 on supplies without asking',
      to: { perTransaction: 1_000_000, daily: 2_000_000, approvalAbove: 400_000 },
    },
    pay: {
      ask: 'Lock in the Lisbon pop-up space',
      intro: ['Mercado da Ribeira holds the stall with a €1,800 deposit. I’ll send it over SEPA Instant.'],
      payee: {
        name: 'Mercado da Ribeira',
        currency: 'EUR',
        amount: 180_000,
        usd: 195_400,
        rail: 'SEPA_INSTANT',
        bank: 'Caixa Geral',
      },
      flag: 'pt',
      local: '€1,800.00',
      done: 'Sent. They confirmed June 12 to 20.',
    },
    buy: {
      ask: 'Order the kitchen line for Chicago',
      intro: [
        'The Chicago location opens in 26 days. The cooking line is the last big item.',
        'WebstaurantStore has it for $3,412, under your $4,000 supplies budget.',
        'I’ll pay with a virtual card locked to this one order.',
      ],
      purchase: { merchant: 'WebstaurantStore', description: 'Chicago kitchen line: range, fryer, prep tables', amount: 341_200 },
      approval: (p) => ({
        title: 'Kitchen line · WebstaurantStore',
        amount: usd2(p.amount),
        expires: 'Expires in 8 min',
        method: 'Single-use card ending 4821',
        allow: 'Approve',
        allowed: 'Approved',
      }),
      done: 'Done. It ships Monday, and the card closed itself after the charge.',
    },
    deal: {
      ask: 'Reorder produce for the week',
      intro: ['Green Acres’ agent has the usual order ready: $840.'],
      to: { name: 'Green Acres Farm', amount: 79_800, description: 'Weekly produce, 3 locations' },
      listed: 84_000,
      offer: 'Pay my account directly and it’s 5% off, every week.',
      accept: 'Deal. Paying directly from now on.',
      done: 'Delivered Tuesday by 7 AM, all three kitchens.',
    },
  },

  yourapp: {
    agent: 'Your agent',
    person: 'Sam',
    history: [{ them: 'Hi Sam. I can pay, buy and get paid for you. What do you need?' }],
    connectAsk: 'Get your own account',
    fund: {
      ask: 'Add $200',
      intro: 'Here’s your address on Base. Send USDC and it lands as dollars.',
      network: 'BASE',
      currency: 'USDC',
      amount: 20_000,
      label: 'USDC on Base',
    },
    limits: {
      ask: 'Spend up to $100 without asking me',
      to: { perTransaction: 50_000, daily: 100_000, approvalAbove: 10_000 },
    },
    pay: {
      ask: 'Pay Priya ₹6,000 for the illustrations',
      intro: ['Priya banks with HDFC, so I’ll send it over UPI. ₹6,000 is $71.80.'],
      payee: { name: 'Priya Nair', currency: 'INR', amount: 600_000, usd: 7_180, rail: 'UPI', bank: 'HDFC Bank' },
      flag: 'in',
      local: '₹6,000.00',
      done: 'Sent. Priya has it.',
    },
    buy: {
      ask: 'Buy the headphones in my cart',
      intro: ['They’re $79 at Best Buy. I’ll use a one-time card for exactly this order.'],
      purchase: { merchant: 'Best Buy', description: 'Wireless headphones, pickup today', amount: 7_900 },
      approval: (p) => plainApproval('Headphones at Best Buy', usd2(p.amount), 'One-time card'),
      done: 'Ordered. Ready for pickup at 4.',
    },
    deal: {
      ask: 'Book a car to the airport for 6 AM',
      intro: ['Metro Cars’ agent quoted $64.'],
      to: { name: 'Metro Cars', amount: 5_760, description: 'Airport ride, 6:00 AM' },
      listed: 6_400,
      offer: 'Pay me directly, get 10% off.',
      accept: 'Paying directly.',
      done: 'Booked. Your driver arrives at 5:50.',
    },
  },
};

/* ── Templates ────────────────────────────────────────────────────────── */

type Script = BrainStep[];

function say(p: Persona, text: string, bullets?: string[]): BrainStep {
  return { them: text, sender: p.sender, ...(bullets ? { bullets } : {}) };
}
function card(p: Persona, note: AgentNote, moment = false): BrainStep {
  return { card: note, sender: p.sender, moment };
}

function connect(p: Persona, ctx: BrainContext): Script {
  const l = ctx.limits;
  return [
    { me: p.connectAsk },
    say(p, 'I’ll need my own account for that, with limits you set. Here’s what I’m asking for.'),
    {
      faceId: true,
      ask: {
        title: `${p.agent} wants its own account`,
        badge: 'L',
        rows: [
          { text: 'Its own balance', sub: 'Funded by you, separate from your bank', icon: 'wallet' },
          { text: `Up to ${usd(l.perTransaction)} a payment`, sub: `${usd(l.daily)} a day`, icon: 'gauge' },
          { text: `Asks you above ${usd(l.approvalAbove)}`, sub: 'Face ID to approve', icon: 'lock' },
        ],
        allow: 'Connect',
        allowed: 'Connected',
        deny: 'Not now',
      },
    },
    { emit: { type: 'connect' } },
    say(p, 'Connected. I have my own account now, and I can only spend what you put in it.'),
    card(p, {
      title: 'Account ready',
      lines: [`${p.agent} · •••• 4417`, `Balance ${usd2(ctx.wallet.balanceCents)}`],
      done: true,
    }),
  ];
}

function fund(p: Persona, ctx: BrainContext): Script {
  const f = p.fund;
  const lightning = f.network === 'LIGHTNING';
  const offer: Script = f.chips
    ? [
        say(p, f.intro),
        { chips: f.chips.options, pick: f.chips.pick },
        { me: f.chips.options[f.chips.pick].label, quick: true },
        say(p, 'Here’s your address. Anything sent to it lands as dollars in seconds.'),
      ]
    : [say(p, f.intro)];
  return [
    { me: f.ask },
    ...offer,
    { emit: { type: 'fund.deposit', network: f.network, currency: f.currency, amount: f.amount } },
    card(p, {
      title: f.label,
      code: lightning ? 'lnbc1pn5x9…q7mxt0' : f.network === 'BASE' ? '0x4f2a…9c1e' : '7xKX…dA9q',
      lines: lightning ? [`${usd2(f.amount)} · expires in 10 min`] : [`Send ${f.currency} only`, 'This address never expires'],
    }),
    { pause: 1600 },
    { emit: { type: 'fund.received' } },
    say(p, `${usd(f.amount)} landed. You have ${usd2(ctx.wallet.balanceCents + f.amount)} for me to work with.`),
  ];
}

function limits(p: Persona, ctx: BrainContext): Script {
  const from = ctx.limits;
  const to = p.limits.to;
  return [
    { me: p.limits.ask },
    say(p, 'I can’t change my own limits, so I sent it to you to confirm.'),
    {
      faceId: true,
      ask: {
        title: `Update ${p.agent}’s limits`,
        badge: 'L',
        rows: [
          { text: `Acts alone up to ${usd(to.approvalAbove)}`, sub: `Was ${usd(from.approvalAbove)}`, icon: 'lock' },
          { text: `${usd(to.daily)} a day`, sub: `Was ${usd(from.daily)}`, icon: 'gauge' },
          { text: `${usd(to.perTransaction)} a payment`, sub: `Was ${usd(from.perTransaction)}`, icon: 'gauge' },
        ],
        allow: 'Save',
        allowed: 'Saved',
        deny: 'Cancel',
      },
    },
    { emit: { type: 'limits.update', limits: to } },
    say(p, `Done. I’ll handle anything up to ${usd(to.approvalAbove)} and ask you above it.`),
  ];
}

/** The approval when a payment is over the threshold; a line saying why not when it isn't. */
function approvalOr(p: Persona, ctx: BrainContext, usdCents: number, ask: AgentAsk): Script {
  return ctx.needsApproval(usdCents)
    ? [{ ask, faceId: true }, { emit: { type: 'action.approve' } }]
    : [say(p, `It’s under your ${usd(ctx.limits.approvalAbove)} limit, so I’m taking care of it.`)];
}

function pay(p: Persona, ctx: BrainContext): Script {
  const s = p.pay;
  const rail = s.payee.rail.replace('_', ' ');
  return [
    { me: s.ask },
    ...s.intro.map((line) => say(p, line)),
    { emit: { type: 'pay.quote', payee: s.payee } },
    { emit: { type: 'pay.execute' } },
    ...approvalOr(p, ctx, s.payee.usd, {
      title: `Send ${s.local} to ${s.payee.name.split(' ')[0]}`,
      who: { name: s.payee.name, flag: s.flag, detail: `${s.local} to ${s.payee.bank} via ${rail}` },
      amount: s.local,
      method: `From ${p.agent}’s balance · ${usd2(s.payee.usd)}`,
      allow: 'Approve',
      allowed: 'Paid',
    }),
    card(p, {
      title: `${s.local} to ${s.payee.name}`,
      lines: [`${s.payee.bank} · ${rail}`, `${usd2(s.payee.usd)} from the balance`],
      done: true,
    }),
    say(p, s.done),
  ];
}

function buy(p: Persona, ctx: BrainContext): Script {
  const s = p.buy;
  return [
    { me: s.ask },
    ...s.intro.map((line) => say(p, line)),
    { emit: { type: 'buy.request', purchase: s.purchase } },
    ...approvalOr(p, ctx, purchaseSpendLimit(s.purchase.amount), s.approval(s.purchase, ctx)),
    { emit: { type: 'buy.checkout' } },
    card(p, {
      title: `${usd2(s.purchase.amount)} at ${s.purchase.merchant}`,
      lines: ['Single-use card · closed after the charge'],
      done: true,
    }),
    say(p, s.done),
  ];
}

function deal(p: Persona, ctx: BrainContext): Script {
  const s = p.deal;
  const saved = usd2(s.listed - s.to.amount);
  return [
    { me: s.ask },
    ...s.intro.map((line) => say(p, line)),
    { them: s.offer, sender: `${s.to.name}’s agent` },
    say(p, s.accept),
    { emit: { type: 'agent.quote', to: s.to } },
    { emit: { type: 'agent.execute' } },
    ...approvalOr(p, ctx, s.to.amount, {
      title: `Pay ${s.to.name}’s agent`,
      who: { name: s.to.name, detail: s.to.description },
      amount: usd2(s.to.amount),
      method: `Account to account · you save ${saved}`,
      allow: 'Approve',
      allowed: 'Paid',
    }),
    card(
      p,
      {
        title: `Settled, instant and final · ${usd2(s.to.amount)}`,
        lines: [`To ${s.to.name}’s account`, `Saved ${saved} by skipping the card`],
        done: true,
      },
      true,
    ),
    say(p, s.done),
  ];
}

const FLOWS: Record<ActionId, (p: Persona, ctx: BrainContext) => Script> = {
  connect,
  fund,
  limits,
  pay,
  buy,
  agent: deal,
};

/** A connector's flow, as it plays now. */
export function scriptFor(ctx: BrainContext): Script {
  return FLOWS[ctx.flow](PERSONAS[ctx.connector], ctx);
}

/** What's in a connector's thread before the first flow. */
export function historyFor(connector: ConnectorId): Episode {
  return PERSONAS[connector].history;
}

/** The agent's name for `POST /agents`. */
export function agentNameFor(connector: ConnectorId): string {
  return PERSONAS[connector].agent;
}
