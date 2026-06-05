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

/** Sign-in (returning user) — authenticate an existing credential → session. */
export function signInCalls(method: AuthMethod, email?: string): ApiCall[] {
  if (method === 'email_otp') {
    return [
      {
        method: 'POST',
        path: `/auth/credentials/${AUTH_METHOD}/challenge`,
        title: 'Request OTP',
        reqBody: {},
        status: '200 OK',
        note: `OTP sent to ${email || 'your email'}.`,
      },
      {
        method: 'POST',
        path: `/auth/credentials/${AUTH_METHOD}/verify`,
        title: 'Verify OTP',
        reqBody: { type: 'EMAIL_OTP', otp: '000000', clientPublicKey: PUBKEY },
        status: '200 OK',
        note: 'Returns the HPKE-sealed session signing key + 15-min expiry.',
      },
    ];
  }
  if (method === 'passkey') {
    return [
      {
        method: 'POST',
        path: `/auth/credentials/${AUTH_METHOD}/challenge`,
        title: 'Start passkey challenge',
        reqBody: { clientPublicKey: PUBKEY },
        status: '200 OK',
        note: 'Returns a WebAuthn challenge + requestId.',
      },
      {
        method: 'POST',
        path: `/auth/credentials/${AUTH_METHOD}/verify`,
        title: 'Verify passkey',
        headers: { 'Request-Id': '<requestId>' },
        reqBody: { type: 'PASSKEY', assertion: '<webauthn assertion>' },
        status: '200 OK',
        note: 'Assertion verified; session signing key returned.',
      },
    ];
  }
  // oauth (Google) / apple
  return [
    {
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
    },
  ];
}

/** Add money — platform-funded on-ramp into the USDB Global Account. */
export function addMoneyCalls(cents: number): ApiCall[] {
  return [
    {
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
    },
    {
      method: 'POST',
      path: `/quotes/${QUOTE}/execute`,
      title: 'Execute quote',
      reqBody: {},
      status: '200 OK',
      note: 'Incoming funds; no customer session or wallet signature required.',
    },
    {
      method: 'GET',
      path: `/transactions/${TXN}`,
      title: 'Get transaction',
      status: '200 OK',
      note: 'Funds settle to the balance — COMPLETED.',
    },
  ];
}

/** Send — pay a UMA address from the embedded wallet (signed). */
export function sendCalls(usdbUnits: number): ApiCall[] {
  return [
    {
      method: 'POST',
      path: `/quotes`,
      title: 'Create quote',
      reqBody: {
        source: { sourceType: 'ACCOUNT', accountId: ACCOUNT },
        destination: { destinationType: 'UMA_ADDRESS', umaAddress: '$leo@grid.app' },
        lockedCurrencySide: 'SENDING',
        lockedCurrencyAmount: usdbUnits,
      },
      status: '201 Created',
      note: 'Quote returns a payloadToSign for the embedded wallet.',
    },
    {
      method: 'POST',
      path: `/quotes/${QUOTE}/execute`,
      title: 'Execute quote',
      headers: { 'Grid-Wallet-Signature': '<signature>' },
      reqBody: {},
      status: '200 OK',
      note: 'Grid-Wallet-Signature header — stamped by the session key.',
    },
    {
      method: 'GET',
      path: `/transactions/${TXN}`,
      title: 'Get transaction',
      status: '200 OK',
      note: 'Delivered — COMPLETED.',
    },
  ];
}

/** Withdraw — cash out to a linked bank (signed). */
export function withdrawCalls(usdbUnits: number): ApiCall[] {
  return [
    {
      method: 'POST',
      path: `/quotes`,
      title: 'Create quote',
      reqBody: {
        source: { sourceType: 'ACCOUNT', accountId: ACCOUNT },
        destination: { destinationType: 'ACCOUNT', accountId: BANK, currency: 'USD' },
        lockedCurrencySide: 'SENDING',
        lockedCurrencyAmount: usdbUnits,
      },
      status: '201 Created',
      note: 'Off-ramp quote (USDB → USD) with a payloadToSign.',
    },
    {
      method: 'POST',
      path: `/quotes/${QUOTE}/execute`,
      title: 'Execute quote',
      headers: { 'Grid-Wallet-Signature': '<signature>' },
      reqBody: {},
      status: '200 OK',
      note: 'Grid-Wallet-Signature header — stamped by the session key.',
    },
    {
      method: 'GET',
      path: `/transactions/${TXN}`,
      title: 'Get transaction',
      status: '200 OK',
      note: 'Paid out via RTP — COMPLETED.',
    },
  ];
}
