/* What a conversation asks Grid to do, in its own terms. The chat scripts emit
   these; `agentApiCalls.ts` turns each into the requests and webhooks the API
   panel shows. Nothing here names a path or a field, so the calls can follow
   the spec without touching a script. */

export type DepositNetwork = 'LIGHTNING' | 'BASE' | 'SOLANA' | 'TRON';

/** Someone the agent pays out to: a person's bank account on a local rail. */
export interface Payee {
  name: string;
  /** ISO 4217, the currency they receive. */
  currency: string;
  /** Minor units of `currency`. */
  amount: number;
  /** What it costs in the policy's currency, USD cents. */
  usd: number;
  rail: 'PIX' | 'SPEI' | 'SEPA_INSTANT' | 'UPI' | 'FASTER_PAYMENTS';
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
}

/** What a single-use card for `amount` may be charged: the amount plus 15% for
 *  tax and shipping, at most $10 more. The policy checks this, not the amount. */
export function purchaseSpendLimit(amount: number): number {
  return amount + Math.min(1000, Math.round(amount * 0.15));
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
  /** The platform changes the agent's policy. */
  | { type: 'limits.update'; limits: Limits }
  /** The agent quotes a payout, then executes it: on its own under the threshold, held above it. */
  | { type: 'pay.quote'; payee: Payee }
  | { type: 'pay.execute' }
  /** The agent asks for a single-use card for one purchase. */
  | { type: 'buy.request'; purchase: Purchase }
  /** The agent reads the card and checks out; the merchant charges it. */
  | { type: 'buy.checkout' }
  /** The agent quotes a payment to another agent's account, then executes it. */
  | { type: 'agent.quote'; to: MerchantAgent }
  | { type: 'agent.execute' }
  /** The person allowed the held action; the platform approves it and Grid carries it out. */
  | { type: 'action.approve' };
