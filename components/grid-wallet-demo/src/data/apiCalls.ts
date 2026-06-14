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
const PLATFORM_USD = 'InternalAccount:019e8f47-0b4f-4b8d-0000-6c37ad0a58fb';
const BANK = 'ExternalAccount:019e8f4a-781d-7e0c-0000-a0d9afbf1314';
const QUOTE = 'Quote:019e8f49-3c8f-5246-0000-4d75f9a6d1d1';
const TXN = 'Transaction:019e8f49-3ca4-b78f-0000-1d3e9a411168';
const PUBKEY = '04f45f2a22c908b9ce09a7150e514afd24627c401c38a4afc164e1ea783ad…';

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

/** OTP verify — fires when the code is submitted. */
export function otpVerifyCall(method: 'email_otp' | 'sms'): ApiCall {
  return {
    method: 'POST',
    path: `/auth/credentials/${AUTH_METHOD}/verify`,
    title: 'Verify OTP',
    reqBody: {
      type: method === 'sms' ? 'SMS_OTP' : 'EMAIL_OTP',
      otp: '000000',
      clientPublicKey: PUBKEY,
    },
    status: '200 OK',
    note: 'Returns the HPKE-sealed session signing key + 15-min expiry.',
  };
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
    note: 'Assertion verified; session signing key returned.',
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
    note: 'Fresh OIDC token verified; session signing key returned.',
  };
}

/** Full sign-in sequence for a method — used for the fast-forward setup group. */
export function signInCalls(method: AuthMethod, contact?: string): ApiCall[] {
  if (method === 'email_otp') return [otpRequestCall('email_otp', contact), otpVerifyCall('email_otp')];
  if (method === 'sms') return [otpRequestCall('sms', contact), otpVerifyCall('sms')];
  if (method === 'passkey') return [passkeyChallengeCall(), passkeyVerifyCall()];
  return [oauthVerifyCall(method)];
}

export type TransferMode = 'add' | 'withdraw' | 'send';

/** Step 1 of a transfer — POST /quotes. Fires when the amount is committed. */
export function transferQuoteCall(mode: TransferMode, cents: number): ApiCall {
  if (mode === 'add') {
    return {
      method: 'POST',
      path: `/quotes`,
      title: 'Create quote',
      reqBody: {
        source: { sourceType: 'ACCOUNT', accountId: PLATFORM_USD },
        destination: { destinationType: 'ACCOUNT', accountId: ACCOUNT, currency: 'USDB' },
        lockedCurrencySide: 'SENDING',
        lockedCurrencyAmount: cents,
      },
      status: '201 Created',
      note: 'Locked platform-funded on-ramp quote (USD → USDB).',
    };
  }
  if (mode === 'withdraw') {
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
  return {
    method: 'POST',
    path: `/quotes`,
    title: 'Create quote',
    reqBody: {
      source: { sourceType: 'ACCOUNT', accountId: ACCOUNT },
      destination: { destinationType: 'UMA_ADDRESS', umaAddress: '$leo@grid.app' },
      lockedCurrencySide: 'SENDING',
      lockedCurrencyAmount: cents,
    },
    status: '201 Created',
    note: 'Quote returns a payloadToSign for the embedded wallet.',
  };
}

/** Step 2 of a transfer — execute + settle. Fires on Face ID confirm. */
export function transferExecuteCalls(mode: TransferMode): ApiCall[] {
  const execute: ApiCall =
    mode === 'add'
      ? {
          method: 'POST',
          path: `/quotes/${QUOTE}/execute`,
          title: 'Execute quote',
          reqBody: {},
          status: '200 OK',
          note: 'Incoming funds; no customer session or wallet signature required.',
        }
      : {
          method: 'POST',
          path: `/quotes/${QUOTE}/execute`,
          title: 'Execute quote',
          headers: { 'Grid-Wallet-Signature': '<signature>' },
          reqBody: {},
          status: '200 OK',
          note: 'Grid-Wallet-Signature header — stamped by the session key.',
        };
  const settleNote =
    mode === 'add'
      ? 'Funds settle to the balance — COMPLETED.'
      : mode === 'withdraw'
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

/** Add money — platform-funded on-ramp into the USDB Global Account. */
export function addMoneyCalls(cents: number): ApiCall[] {
  return [transferQuoteCall('add', cents), ...transferExecuteCalls('add')];
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
