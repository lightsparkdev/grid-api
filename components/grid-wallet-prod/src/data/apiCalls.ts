/* ============================================================
   Accurate Grid API call sequences shown in the panel.
   Shapes/paths/headers mirror the real sandbox API (verified
   against api.lightspark.com/grid/2025-10-13). The demo renders
   these alongside the on-phone flow; the ceremonies (Touch ID,
   Google) are real, the calls here are representative.
   ============================================================ */

import type { ApiCall, AuthMethod } from './flow';

// Realistic placeholder ids (same formats the sandbox returns).
const ACCOUNT = 'InternalAccount:019e8f48-1135-438c-0000-8b9d28990463';
const AUTH_METHOD = 'AuthMethod:019e8f48-11a8-0dca-0000-947363f18d5a';
const BANK = 'ExternalAccount:019e8f4a-781d-7e0c-0000-a0d9afbf1314';
const CRYPTO = 'ExternalAccount:019e8f4a-9b2e-71f4-0000-3c5e7a2b9f08';
const CUSTOMER = 'Customer:019e8f47-2a3d-1d02-0000-6b1f0c4e2a91';
const QUOTE = 'Quote:019e8f49-3c8f-5246-0000-4d75f9a6d1d1';
const TXN = 'Transaction:019e8f49-3ca4-b78f-0000-1d3e9a411168';
const WEBHOOK = 'Webhook:019e8f49-7b3e-1d02-0000-9a4c2e7f1d05';
const PUBKEY = '04f45f2a22c908b9ce09a7150e514afd24627c401c38a4afc164e1ea783ad…';

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

/** Link a recipient — POST /customers/external-accounts. Fires when a bank or
 *  crypto address is added; returns an ExternalAccount the transfer references. */
export function externalAccountCreateCall(input: ExternalAccountInput): ApiCall {
  if (input.kind === 'crypto') {
    return {
      method: 'POST',
      path: '/customers/external-accounts',
      title: 'Create external account',
      reqBody: {
        customerId: CUSTOMER,
        currency: input.currency,
        accountInfo: { accountType: input.accountType, address: input.address },
      },
      status: '201 Created',
      note: `Linked ${input.network} wallet (${input.currency}) — returns an ExternalAccount id.`,
    };
  }
  return {
    method: 'POST',
    path: '/customers/external-accounts',
    title: 'Create external account',
    reqBody: {
      customerId: CUSTOMER,
      currency: input.currency,
      accountInfo: {
        accountType: input.accountType,
        ...input.fields,
        beneficiary: { beneficiaryType: 'INDIVIDUAL', fullName: input.beneficiary },
      },
    },
    status: '201 Created',
    note: `Linked ${input.bankName} (${input.currency}) — returns an ExternalAccount id.`,
  };
}

/** OTP request (challenge) — fires the moment the phone/email is submitted. */
export function otpRequestCall(method: 'email_otp' | 'sms', contact?: string): ApiCall {
  const where =
    method === 'sms' ? `by SMS to ${contact || 'your phone'}` : `to ${contact || 'your email'}`;
  return {
    method: 'POST',
    path: `/auth/credentials/${AUTH_METHOD}/challenge`,
    title: 'Request OTP',
    reqBody: {},
    status: '200 OK',
    note: `One-time code sent ${where}.`,
  };
}

function otpVerifyRequestBody(method: 'email_otp' | 'sms'): Record<string, unknown> {
  return {
    type: method === 'sms' ? 'SMS_OTP' : 'EMAIL_OTP',
    encryptedOtpBundle: '<HPKE encrypted OTP bundle>',
  };
}

/** OTP verify — first leg after the code is submitted. */
export function otpVerifyCall(method: 'email_otp' | 'sms'): ApiCall {
  return {
    method: 'POST',
    path: `/auth/credentials/${AUTH_METHOD}/verify`,
    title: 'Verify OTP',
    reqBody: otpVerifyRequestBody(method),
    status: '202 Accepted',
    note: 'Returns a verificationToken to sign with the TEK keypair.',
  };
}

/** OTP verify — signed retry that issues the auth session. */
export function otpSessionIssueCall(method: 'email_otp' | 'sms'): ApiCall {
  return {
    method: 'POST',
    path: `/auth/credentials/${AUTH_METHOD}/verify`,
    title: 'Issue auth session',
    headers: {
      'Grid-Wallet-Signature': '<TEK signature>',
      'Request-Id': '<requestId>',
    },
    reqBody: otpVerifyRequestBody(method),
    status: '200 OK',
    note: 'Signed retry issues the session; the TEK private key is the session signing key.',
  };
}

export function otpVerifyCalls(method: 'email_otp' | 'sms'): ApiCall[] {
  return [otpVerifyCall(method), otpSessionIssueCall(method)];
}

/** Passkey challenge — fires when the passkey ceremony starts. */
export function passkeyChallengeCall(): ApiCall {
  return {
    method: 'POST',
    path: `/auth/credentials/${AUTH_METHOD}/challenge`,
    title: 'Start passkey challenge',
    reqBody: { clientPublicKey: PUBKEY },
    status: '200 OK',
    note: 'Returns a WebAuthn challenge + requestId.',
  };
}

/** Passkey verify — fires after the assertion (Face ID) completes. */
export function passkeyVerifyCall(): ApiCall {
  return {
    method: 'POST',
    path: `/auth/credentials/${AUTH_METHOD}/verify`,
    title: 'Verify passkey',
    headers: { 'Request-Id': '<requestId>' },
    reqBody: { type: 'PASSKEY', assertion: '<webauthn assertion>' },
    status: '200 OK',
    note: 'Assertion verified; encryptedSessionSigningKey returned.',
  };
}

/** OAuth verify — fires after the provider returns an id_token. */
export function oauthVerifyCall(method: 'oauth' | 'apple'): ApiCall {
  return {
    method: 'POST',
    path: `/auth/credentials/${AUTH_METHOD}/verify`,
    title: 'Verify OAuth token',
    reqBody: {
      type: 'OAUTH',
      oidcToken: method === 'apple' ? '<Apple id_token>' : '<Google id_token>',
      clientPublicKey: PUBKEY,
    },
    status: '200 OK',
    note: 'Fresh OIDC token verified; encryptedSessionSigningKey returned.',
  };
}

/** Full sign-in sequence for a method — used for the fast-forward setup group. */
export function signInCalls(method: AuthMethod, contact?: string): ApiCall[] {
  if (method === 'email_otp') return [otpRequestCall('email_otp', contact), ...otpVerifyCalls('email_otp')];
  if (method === 'sms') return [otpRequestCall('sms', contact), ...otpVerifyCalls('sms')];
  if (method === 'passkey') return [passkeyChallengeCall(), passkeyVerifyCall()];
  return [oauthVerifyCall(method)];
}

export type TransferMode = 'add' | 'withdraw' | 'send';

/** Step 1 of a transfer — POST /quotes. Fires when the amount is committed.
 *  `dest` lets a send reference the recipient's bank or crypto wallet. */
export function transferQuoteCall(mode: TransferMode, cents: number, dest?: TransferDest): ApiCall {
  if (mode === 'add') {
    const fundingCurrency = dest?.kind === 'bank' ? dest.currency : 'USD';
    return {
      method: 'POST',
      path: `/quotes`,
      title: 'Create pay-in quote',
      reqBody: {
        source: { sourceType: 'REALTIME_FUNDING', customerId: CUSTOMER, currency: fundingCurrency },
        destination: { destinationType: 'ACCOUNT', accountId: ACCOUNT },
        lockedCurrencySide: 'RECEIVING',
        lockedCurrencyAmount: cents,
      },
      status: '201 Created',
      note: `Pay-in quote funded by ${fundingCurrency} payment instructions; credits the Global Account in USDB.`,
    };
  }
  if (mode === 'withdraw') {
    if (dest?.kind === 'crypto') {
      return {
        method: 'POST',
        path: `/quotes`,
        title: 'Create quote',
        reqBody: {
          source: { sourceType: 'ACCOUNT', accountId: ACCOUNT },
          destination: { destinationType: 'ACCOUNT', accountId: CRYPTO, currency: dest.currency },
          lockedCurrencySide: 'SENDING',
          lockedCurrencyAmount: cents,
        },
        status: '201 Created',
        note: `Withdrawal to a crypto wallet (USDB → ${dest.currency}) with a payloadToSign.`,
      };
    }
    return {
      method: 'POST',
      path: `/quotes`,
      title: 'Create quote',
      reqBody: {
        source: { sourceType: 'ACCOUNT', accountId: ACCOUNT },
        destination: { destinationType: 'ACCOUNT', accountId: BANK, currency: 'USD' },
        lockedCurrencySide: 'SENDING',
        lockedCurrencyAmount: cents,
      },
      status: '201 Created',
      note: 'Off-ramp quote (USDB → USD) with a payloadToSign.',
    };
  }
  // Send: off-ramp to the recipient's bank, or USDC to their crypto wallet. No
  // dest = the seed's historical UMA send.
  const sendDestination =
    dest?.kind === 'bank'
      ? { destinationType: 'ACCOUNT', accountId: BANK, currency: dest.currency }
      : dest?.kind === 'crypto'
        ? { destinationType: 'ACCOUNT', accountId: CRYPTO, currency: dest.currency }
        : { destinationType: 'UMA_ADDRESS', umaAddress: '$leo@grid.app' };
  const sendNote =
    dest?.kind === 'bank'
      ? "Off-ramp quote to the recipient's bank, with a payloadToSign."
      : dest?.kind === 'crypto'
        ? `${dest.currency} quote to the recipient wallet, with a payloadToSign.`
        : 'Quote returns a payloadToSign for the embedded wallet.';
  return {
    method: 'POST',
    path: `/quotes`,
    title: 'Create quote',
    reqBody: {
      source: { sourceType: 'ACCOUNT', accountId: ACCOUNT },
      destination: sendDestination,
      lockedCurrencySide: 'SENDING',
      lockedCurrencyAmount: cents,
    },
    status: '201 Created',
    note: sendNote,
  };
}

/** Step 2 of an outbound transfer — execute + settle. Fires on Face ID confirm. */
export function transferExecuteCalls(mode: Exclude<TransferMode, 'add'>): ApiCall[] {
  const execute: ApiCall = {
    method: 'POST',
    path: `/quotes/${QUOTE}/execute`,
    title: 'Execute quote',
    headers: { 'Grid-Wallet-Signature': '<signature>' },
    reqBody: {},
    status: '200 OK',
    note: 'Grid-Wallet-Signature header — stamped by the session key.',
  };
  const settleNote =
    mode === 'withdraw'
        ? 'Paid out via RTP — COMPLETED.'
        : 'Delivered — COMPLETED.';
  return [
    execute,
    {
      method: 'GET',
      path: `/transactions/${TXN}`,
      title: 'Get transaction',
      status: '200 OK',
      note: settleNote,
    },
  ];
}

/** Add money — after the pay-in quote, Grid detects the external deposit and
 *  posts the incoming-payment webhook; there is no quote execute call. */
export function addMoneySettlementCalls(cents: number, fundingCurrency = 'USD'): ApiCall[] {
  return receivePaymentCalls({
    amountCents: cents,
    viaCrypto: false,
    sourceCurrency: fundingCurrency,
    counterparty: 'Pat Teehantri',
    paymentRail: 'RTP',
    intent: 'add',
  });
}

/** Add money — external real-time funding into the USDB Global Account. */
export function addMoneyCalls(cents: number): ApiCall[] {
  return [transferQuoteCall('add', cents), ...addMoneySettlementCalls(cents)];
}

/** Send — pay a UMA address from the embedded wallet (signed). */
export function sendCalls(cents: number): ApiCall[] {
  return [transferQuoteCall('send', cents), ...transferExecuteCalls('send')];
}

/** Issue a virtual card against the Global Account. */
export function cardCalls(): ApiCall[] {
  return [
    {
      method: 'POST',
      path: `/cards`,
      title: 'Create card',
      reqBody: { accountId: ACCOUNT, type: 'VIRTUAL', currency: 'USDB' },
      status: '201 Created',
      note: 'Virtual card issued — provisionable to Apple/Google Wallet.',
    },
  ];
}

/** Tap to pay — a card authorization lands on the Global Account. */
export function tapCalls(merchant: string, cents: number): ApiCall[] {
  return [
    {
      method: 'GET',
      path: `/transactions/${TXN}`,
      title: 'Get transaction',
      status: '200 OK',
      note: `transaction.authorized — $${(cents / 100).toFixed(2)} at ${merchant}.`,
    },
  ];
}

/** Withdraw — cash out to a linked bank (signed). */
export function withdrawCalls(cents: number): ApiCall[] {
  return [transferQuoteCall('withdraw', cents), ...transferExecuteCalls('withdraw')];
}

/** Where Grid POSTs inbound webhooks — your own endpoint. Shown as a full URL so
 *  the curl reads as Grid → you, not an outbound call to the Grid API. */
const WEBHOOK_ENDPOINT = 'https://your-app.com/webhooks/grid';

/** An inbound payment the customer received. There's no client-initiated call to
 *  "receive" — Grid POSTs an INCOMING_PAYMENT webhook to your endpoint when funds
 *  land, and you read the settled transaction. */
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
   *  payment from someone else. Drives the API-panel group + sidebar checkmark. */
  intent?: 'add' | 'receive';
}

/** Receive — the inbound webhook Grid pushes to you + the GET that confirms it.
 *  The body is an IncomingTransaction (openapi/components/.../IncomingTransaction):
 *  `source` is REALTIME_FUNDING (external funds landing — the originator fields
 *  are populated best-effort). Demo: the event itself is simulated. */
export function receivePaymentCalls(info: ReceivePaymentInfo): ApiCall[] {
  const reference = `REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  // The originator (sender). Crypto: the wallet address is the account
  // identifier on its rail; fiat: the payer name + the rail it arrived on.
  const source = info.viaCrypto
    ? { sourceType: 'REALTIME_FUNDING', currency: 'USDC', accountIdentifier: info.counterparty }
    : {
        sourceType: 'REALTIME_FUNDING',
        currency: info.sourceCurrency ?? 'USD',
        accountHolderName: info.counterparty,
        paymentRail: info.paymentRail ?? 'RTP',
      };
  const data = {
    id: TXN,
    type: 'INCOMING',
    status: 'COMPLETED',
    customerId: CUSTOMER,
    platformCustomerId: '18d3e5f7b4a9c2',
    destination: { destinationType: 'ACCOUNT', accountId: ACCOUNT },
    source,
    receivedAmount: {
      amount: info.amountCents,
      currency: { code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 },
    },
    reconciliationInstructions: { reference },
  };
  return [
    {
      method: 'POST',
      path: WEBHOOK_ENDPOINT,
      inbound: true,
      title: 'Incoming payment',
      headers: { 'X-Grid-Signature': '<signature>' },
      reqBody: {
        id: WEBHOOK,
        type: 'INCOMING_PAYMENT.COMPLETED',
        timestamp: new Date().toISOString(),
        data,
      },
      status: '200 OK',
      note: 'Simulated — Grid POSTs this to your webhook endpoint when funds land.',
    },
    {
      method: 'GET',
      path: `/transactions/${TXN}`,
      title: 'Get transaction',
      status: '200 OK',
      note: 'Inbound transfer settled — COMPLETED.',
    },
  ];
}
