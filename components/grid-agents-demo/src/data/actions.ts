/* The six flows a visitor can run with any connector. Each plays one episode in
   the agent's chat and the Grid calls behind it. */

export type ActionId = 'connect' | 'fund' | 'limits' | 'pay' | 'buy' | 'agent';

/** The playground's mirror of the agent account (the chat owns the live UI). */
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
};

export interface ActionDef {
  id: ActionId;
  /** The tile's label, and the API panel's group label for the flow's calls. */
  label: string;
  desc: string;
}

/** In the Figma's grid order: two columns, read across. */
export const ACTIONS: ActionDef[] = [
  { id: 'connect', label: 'Connect', desc: 'Install the agent and give it a policy' },
  { id: 'fund', label: 'Fund', desc: 'Add money to the account over stablecoins or Lightning' },
  { id: 'limits', label: 'Set limits', desc: 'Cap what the agent can spend, and when it asks' },
  { id: 'pay', label: 'Pay someone', desc: 'Pay out to a bank account on a local rail' },
  { id: 'buy', label: 'Buy online', desc: 'A single-use card for one purchase, after approval' },
  { id: 'agent', label: 'Pay an agent', desc: 'Pay another agent account directly' },
];

export function actionLabel(id: ActionId): string {
  return ACTIONS.find((a) => a.id === id)!.label;
}
