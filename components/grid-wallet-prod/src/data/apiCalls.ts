/* ============================================================
   Shapes the wallet flows pass around: an external account to
   link, a transfer's destination, a received payment.

   This file used to also BUILD synthesized `ApiCall` entries for
   the API panel — fabricated quotes, executes, card
   authorizations, and an inbound webhook to a fictional
   https://your-app.com/webhooks/grid. All of it is gone. The
   panel shows real traffic only: request/response envelopes from
   the /api/grid proxy, and webhooks Grid actually delivered to
   /api/webhooks. A flow with no client call behind it (card
   issuance, tap to pay, the Receive demo event) logs nothing
   rather than inventing a request.
   ============================================================ */

/** A linked external account to create — a bank (account fields + beneficiary)
 *  or a crypto wallet (just the address). Built by the sheet from the saved
 *  recipient; drives the POST /customers/external-accounts body. */
export type ExternalAccountInput =
  | {
      kind: 'bank';
      accountType: string;
      currency: string;
      bankName: string;
      fields: Record<string, string>;
      beneficiary: string;
    }
  | { kind: 'crypto'; address: string; network: string; accountType: string; currency: string };

/** Where a transfer is going — lets the quote reference the real destination
 *  (a recipient's bank for off-ramp, or a crypto wallet) instead of a UMA. */
export type TransferDest =
  | { kind: 'bank'; currency: string }
  | { kind: 'crypto'; currency: string };

export type TransferMode = 'add' | 'withdraw' | 'send';

/** An inbound payment the customer received. There's no client-initiated call to
 *  "receive" — Grid POSTs an INCOMING_PAYMENT webhook to your endpoint when funds
 *  land, and the panel shows that delivery when it arrives. */
export interface ReceivePaymentInfo {
  amountCents: number;
  /** Crypto deposit (USDC; sender = wallet address) vs. fiat (sender = name). */
  viaCrypto: boolean;
  /** Fiat funding currency for the incoming source; defaults to USD. */
  sourceCurrency?: string;
  /** Sender wallet address (crypto) or sender's full name (fiat). */
  counterparty: string;
  /** The fiat rail the funds arrived on (PaymentRail enum) — omitted for crypto. */
  paymentRail?: string;
  /** 'add' = topping up your own balance from a crypto wallet; 'receive' = a
   *  payment from someone else. Drives the sidebar checkmark. */
  intent?: 'add' | 'receive';
}
