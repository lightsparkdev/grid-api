/* The flows a visitor can start from the left panel. A tile doesn't play a
   flow: it sets up what the flow needs and puts its opening line in the
   composer. The visitor sends it and makes every choice after that. */

export type ActionId =
  | 'connect'
  | 'fund'
  | 'limits'
  | 'pay'
  | 'buy'
  | 'agent'
  | 'getpaid'
  | 'cashout'
  | 'balance'
  | 'history';

/** The playground's mirror of the agent account, for gating and the flows' wording. */
export interface WalletState {
  /** The agent is installed: created, and its device code redeemed. */
  connected: boolean;
  /** The customer's wallet the agent spends from, USD cents. */
  balanceCents: number;
}

/** What the customer's wallet holds before the visitor funds it. */
const OPENING_BALANCE_CENTS = 125_000;

export const initialWallet: WalletState = {
  connected: false,
  balanceCents: OPENING_BALANCE_CENTS,
};

export type CompletedFlows = Record<ActionId, boolean>;

export const initialCompleted: CompletedFlows = {
  connect: false,
  fund: false,
  limits: false,
  pay: false,
  buy: false,
  agent: false,
  getpaid: false,
  cashout: false,
  balance: false,
  history: false,
};

export interface ActionDef {
  id: ActionId;
  /** The tile's label, and the API panel's group label for the flow's calls. */
  label: string;
  desc: string;
  /** What the tile puts in the composer: the next one each time the flow completes. */
  prompts: string[];
}

/** In grid order: two columns, read across. */
export const ACTIONS: ActionDef[] = [
  {
    id: 'connect',
    label: 'Connect',
    desc: 'Give the agent its own account, with a policy',
    prompts: ['Connect my Lightspark account'],
  },
  {
    id: 'fund',
    label: 'Add funds',
    desc: 'Top up over Lightning or stablecoins',
    prompts: ['Add $50 to my account'],
  },
  {
    id: 'limits',
    label: 'Set limits',
    desc: 'Cap what the agent spends, and when it asks',
    prompts: ['Handle anything under $100 without asking me'],
  },
  {
    id: 'pay',
    label: 'Send',
    desc: 'Pay out to a bank account on a local rail',
    prompts: ['Send Sofia R$250 for the concert tickets'],
  },
  {
    id: 'buy',
    label: 'Buy online',
    desc: 'A single-use virtual Visa for one purchase',
    prompts: ['Order the ring light I saved yesterday', 'Subscribe me to Duolingo Max'],
  },
  {
    id: 'agent',
    label: 'Pay agent',
    desc: 'Pay another agent’s account directly',
    prompts: ['Book Hotel Alma in Lisbon for the 12th to the 14th'],
  },
  {
    id: 'getpaid',
    label: 'Receive',
    desc: 'A client pays the account in stablecoins or BTC',
    prompts: ['Lucía wants to pay my invoice. Where should she send it?'],
  },
  {
    id: 'cashout',
    label: 'Withdraw',
    desc: 'Move money to a bank or mobile wallet',
    prompts: ['Move $200 to my bank'],
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
];

export function actionLabel(id: ActionId): string {
  return ACTIONS.find((a) => a.id === id)!.label;
}
