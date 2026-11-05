/* What a conversation asks Grid to do, in its own terms. The flows emit these;
   `agentApiCalls.ts` turns each into the agent's tool call and the Grid
   requests and webhooks behind it. Nothing here names a path or a field, so
   the calls can follow the spec without touching a flow. */

export type DepositNetwork = 'LIGHTNING' | 'BASE' | 'SOLANA' | 'TRON';

/** A bank account or mobile wallet the agent pays out to, on a local rail. */
export interface Payee {
  name: string;
  /** ISO 4217, the currency they receive. */
  currency: string;
  /** Minor units of `currency`. */
  amount: number;
  /** What it costs in the policy's currency, USD cents. */
  usd: number;
  rail: 'PIX' | 'SPEI' | 'SEPA_INSTANT' | 'UPI' | 'RTP' | 'MPESA';
  bank: string;
}

/** Another agent, on its own account, that this one pays directly. */
export interface MerchantAgent {
  name: string;
  /** USD cents. */
  amount: number;
  description: string;
}

export interface Purchase {
  merchant: string;
  description: string;
  /** USD cents. */
  amount: number;
  /** A card that locks to the first merchant that charges it and renews monthly. */
  recurring?: boolean;
}

/** What a single-use card for `amount` may be charged: the amount plus 15% for
 *  tax and shipping, at most $10 more. The policy checks this, not the amount.
 *  A recurring card's limit is the amount itself. */
export function purchaseSpendLimit(amount: number, recurring = false): number {
  return recurring ? amount : amount + Math.min(1000, Math.round(amount * 0.15));
}

export interface Limits {
  /** USD cents. */
  perTransaction: number;
  daily: number;
  /** Anything above this waits for the person's approval. */
  approvalAbove: number;
}

export type AgentEvent =
  /** The platform creates the agent with its policy, and the agent redeems its device code. */
  | { type: 'connect' }
  /** The agent asks for a deposit address or invoice. */
  | { type: 'fund.deposit'; network: DepositNetwork; currency: string; amount: number }
  /** The deposit landed. */
  | { type: 'fund.received' }
  /** The person's credit or debit card goes into the account's PCI vault (the agent only ever sees its id). */
  | { type: 'card.vault' }
  /** A top-up charged to the vaulted card. */
  | { type: 'fund.card'; amount: number }
  /** The agent shares where someone can pay the account. */
  | { type: 'getpaid.address'; network: DepositNetwork; currency: string }
  /** Someone paid it. */
  | { type: 'getpaid.received'; from: string; amount: number }
  /** The platform changes the agent's policy. */
  | { type: 'limits.update'; limits: Limits }
  /** The agent quotes a payout, then executes it: on its own under the threshold, held above it. */
  | { type: 'pay.quote'; payee: Payee }
  | { type: 'pay.execute' }
  /** The agent quotes moving money to the person's own bank or wallet, then executes it. */
  | { type: 'cashout.quote'; payee: Payee }
  | { type: 'cashout.execute' }
  /** The agent asks for a purchase card for one purchase (or one subscription). */
  | { type: 'buy.request'; purchase: Purchase }
  /** The agent reads the card and checks out; the merchant charges it. */
  | { type: 'buy.checkout' }
  /** The agent quotes a payment to another agent's account, then executes it. */
  | { type: 'agent.quote'; to: MerchantAgent }
  | { type: 'agent.execute' }
  /** The person allowed the held action; the platform approves it and Grid carries it out. */
  | { type: 'action.approve' }
  /** The person said no; the platform rejects it and nothing moves. */
  | { type: 'action.reject' }
  /** The agent reads the account: balances, what's left to spend, its policy. */
  | { type: 'account.overview' }
  /** The agent lists recent transactions. */
  | { type: 'transactions.list' };
