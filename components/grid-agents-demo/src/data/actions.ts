/* The flows a visitor can start from the left panel. A tile doesn't play a
   flow: it sets up what the flow needs and puts its opening line in the
   composer. The visitor sends it and makes every choice after that. */

import type { Mode } from './mode';

export type ActionId =
  | 'connect'
  | 'card'
  | 'bank'
  | 'fund'
  | 'limits'
  | 'pay'
  | 'crypto'
  | 'buy'
  | 'agent'
  | 'getpaid'
  | 'cashout'
  | 'balance'
  | 'history'
  // The business account's own flows.
  | 'company'
  | 'teammate'
  | 'team'
  | 'empcard'
  | 'invoice'
  | 'invoices'
  | 'bill'
  | 'contractor'
  | 'payroll';

export const ACTION_IDS: ActionId[] = [
  'connect',
  'card',
  'bank',
  'fund',
  'limits',
  'pay',
  'crypto',
  'buy',
  'agent',
  'getpaid',
  'cashout',
  'balance',
  'history',
  'company',
  'teammate',
  'team',
  'empcard',
  'invoice',
  'invoices',
  'bill',
  'contractor',
  'payroll',
];

/** No tile run yet: each flow's next prompt is its first. */
export const NO_RUNS = (): Record<ActionId, number> => Object.fromEntries(ACTION_IDS.map((id) => [id, 0])) as Record<ActionId, number>;

/** The playground's mirror of the agent account, for gating and the flows' wording. */
export interface WalletState {
  /** The agent is installed: created, and its device code redeemed. */
  connected: boolean;
  /** The customer's wallet the agent spends from, USD cents. */
  balanceCents: number;
}

/** What the customer's wallet holds before the visitor funds it. */
const OPENING_BALANCE_CENTS = 0;

export const initialWallet: WalletState = {
  connected: false,
  balanceCents: OPENING_BALANCE_CENTS,
};

export interface ActionDef {
  id: ActionId;
  /** The tile's label, and the API panel's group label for the flow's calls. */
  label: string;
  desc: string;
  /** What the tile puts in the composer: the next one each time the flow completes. */
  prompts: string[];
}

/** Every flow. `FLOW_GROUPS` sets the picker's sections and their order. */
export const ACTIONS: ActionDef[] = [
  {
    id: 'connect',
    label: 'Connect',
    desc: 'Give the agent its own account, with a policy',
    prompts: ['Set up a balance so you can pay for things'],
  },
  {
    id: 'card',
    label: 'Add card',
    desc: 'Save a card to the vault to top up from',
    prompts: ['Save my card so you can pay with it'],
  },
  {
    id: 'bank',
    label: 'Link bank',
    desc: 'Link a bank to move money in and out',
    prompts: ['Link my bank account'],
  },
  {
    id: 'fund',
    label: 'Add funds',
    desc: 'Top up from a card, a bank or stablecoins',
    prompts: ['Add money to my account'],
  },
  {
    id: 'limits',
    label: 'Set limits',
    desc: 'Cap what the agent spends, and when it asks',
    prompts: ['Handle anything under $100 without asking me'],
  },
  {
    id: 'pay',
    label: 'Pay someone',
    desc: 'Pay out to a bank account on a local rail',
    prompts: ['Send Sofia R$250 for the concert tickets'],
  },
  {
    id: 'crypto',
    label: 'Send stablecoins',
    desc: 'Pay out stablecoins to a wallet address',
    prompts: ['Send 50 USDC to 0x8C1d4bE27a9F3c05D6e1b2A4f7C9d0E3b5A6c2F1'],
  },
  {
    id: 'buy',
    label: 'Buy online',
    desc: 'A single-use virtual Visa for one purchase',
    prompts: ['Order the ring light I saved yesterday', 'Subscribe me to Duolingo Max'],
  },
  {
    id: 'agent',
    label: 'Pay an agent',
    desc: 'Pay another agent’s account directly',
    prompts: ['Book Hotel Alma in Lisbon for the 12th to the 14th'],
  },
  {
    id: 'getpaid',
    label: 'Get paid',
    desc: 'A client pays the account in stablecoins',
    prompts: ['Lucía wants to pay my invoice. Where should she send it?'],
  },
  {
    id: 'cashout',
    label: 'Withdraw',
    desc: 'Move money to a bank or mobile wallet',
    prompts: ['Move money to my bank'],
  },
  {
    id: 'balance',
    label: 'Balance',
    desc: 'What the account holds and what’s left to spend',
    prompts: ['What’s my balance?'],
  },
  {
    id: 'history',
    label: 'History',
    desc: 'What the agent spent and received',
    prompts: ['What did you spend this week?'],
  },
  {
    id: 'company',
    label: 'Company',
    desc: 'A business account, with US bank details',
    prompts: ['Set up an account for my business'],
  },
  {
    id: 'teammate',
    label: 'Add member',
    desc: 'Their role, pay and bank, for payroll and cards',
    prompts: ['Add someone to the team'],
  },
  {
    id: 'team',
    label: 'Team budget',
    desc: 'An agent per teammate, on one shared budget',
    prompts: ['Give the team agents with a $5,000 monthly budget'],
  },
  {
    id: 'empcard',
    label: 'Team card',
    desc: 'A card in a teammate’s name',
    prompts: ['Give a teammate a card for travel'],
  },
  {
    id: 'invoice',
    label: 'Send invoice',
    desc: 'Bill a client, paid by bank transfer',
    prompts: ['Invoice Northwind Coffee $2,400 for the brand refresh'],
  },
  {
    id: 'invoices',
    label: 'Track invoices',
    desc: 'What’s been paid and what’s still open',
    prompts: ['Which invoices are still unpaid?'],
  },
  {
    id: 'bill',
    label: 'Pay a bill',
    desc: 'Pay a vendor’s bank account',
    prompts: ['Pay the Wavelink Fiber internet bill, $189'],
  },
  {
    id: 'contractor',
    label: 'Pay a contractor',
    desc: 'Paid to their bank, anywhere, in their currency',
    prompts: ['Pay a contractor'],
  },
  {
    id: 'payroll',
    label: 'Run payroll',
    desc: 'Pay the team in one approved run',
    prompts: ['Run payroll for the team'],
  },
];

export function actionLabel(id: ActionId): string {
  return ACTIONS.find((a) => a.id === id)!.label;
}

export type FlowGroup = { label: string; flows: ActionId[]; columns?: 1 | 2 };

/** The picker's sections for each account: its account flows as a two-column grid read across, related flows sharing
 *  a row, then its payments as a list. */
export const FLOW_GROUPS: Record<Mode, FlowGroup[]> = {
  personal: [
    { label: 'Explore account flows', flows: ['connect', 'limits', 'card', 'bank', 'fund', 'cashout', 'balance', 'history'] },
    { label: 'Explore payment flows', flows: ['pay', 'getpaid', 'buy', 'agent'], columns: 1 },
  ],
  business: [
    { label: 'Explore account flows', flows: ['company', 'teammate', 'team', 'empcard', 'fund', 'balance', 'history'] },
    { label: 'Explore payment flows', flows: ['invoice', 'invoices', 'bill', 'contractor', 'payroll'], columns: 1 },
  ],
};
