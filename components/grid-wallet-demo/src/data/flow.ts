/* ============================================================
   Core types + Grid API call shapes for the playground.
   The demo is action-driven (like the flow builder): the user
   picks a use case + sign-in method, creates a Global Account,
   then freely triggers actions on the app.
   ============================================================ */

export type Persona = 'fintech' | 'social' | 'marketplace';
export type AuthMethod = 'passkey' | 'oauth' | 'apple' | 'email_otp' | 'sms';

export const GRID_BASE = '/grid/2025-10-13';

export type ScreenId =
  | 'auth'
  | 'creating'
  | 'credential'
  | 'wallet'
  | 'addmoney'
  | 'send'
  | 'withdraw'
  | 'card'
  | 'card-reveal'
  | 'tap';

export interface Tx {
  kind: 'bank' | 'card' | 'coffee' | 'send';
  name: string;
  sub: string;
  amount: string;
  positive?: boolean;
}

export interface PhoneState {
  screen: ScreenId;
  balance: string;
  hasCard: boolean;
  cardActivated: boolean;
  activity: Tx[];
  note?: string;
}

export interface ApiCall {
  method: 'GET' | 'POST';
  path: string;
  reqBody?: Record<string, unknown>;
  status: string;
  note?: string;
}

const AUTH_LABEL: Record<AuthMethod, string> = {
  passkey: 'Passkey',
  oauth: 'Google',
  apple: 'Apple',
  email_otp: 'Email',
  sms: 'Phone',
};

export function authLabel(m: AuthMethod) {
  return AUTH_LABEL[m];
}

export function authCta(m: AuthMethod) {
  return `Continue with ${AUTH_LABEL[m].toLowerCase()}`;
}

const CUSTOMER = 'Customer:019542f5-b3e7-1d02-0000-000000000001';

/** Credential registration call(s) by method. */
export function credentialCalls(method: AuthMethod): ApiCall[] {
  if (method === 'passkey') {
    return [
      {
        method: 'POST',
        path: `${GRID_BASE}/auth/credentials`,
        reqBody: {
          customerId: CUSTOMER,
          credentialType: 'PASSKEY',
          challenge: 'ArkQi2yAYHPlgnJNFBlneIwchQdWX…',
          attestation: '<webauthn attestation>',
        },
        status: '201 Created',
        note: 'Passkey bound to the account. Returns AuthMethod id + first-auth challenge.',
      },
    ];
  }
  if (method === 'oauth' || method === 'apple') {
    return [
      {
        method: 'POST',
        path: `${GRID_BASE}/auth/credentials`,
        reqBody: {
          customerId: CUSTOMER,
          credentialType: 'OAUTH',
          provider: method === 'apple' ? 'apple' : 'google',
          idToken: '<OIDC id_token>',
        },
        status: '201 Created',
        note: 'OIDC identity verified and bound to the account.',
      },
    ];
  }
  if (method === 'sms') {
    return [
      {
        method: 'POST',
        path: `${GRID_BASE}/auth/credentials`,
        reqBody: { customerId: CUSTOMER, credentialType: 'SMS_OTP', phone: '+1 415 555 0148' },
        status: '202 Accepted',
        note: 'OTP sent by SMS.',
      },
      {
        method: 'POST',
        path: `${GRID_BASE}/auth/verify`,
        reqBody: { requestId: 'AuthRequest:01954…', otp: '123456' },
        status: '200 OK',
        note: 'OTP verified; credential active.',
      },
    ];
  }
  // email_otp
  return [
    {
      method: 'POST',
      path: `${GRID_BASE}/auth/credentials`,
      reqBody: { customerId: CUSTOMER, credentialType: 'EMAIL_OTP', email: 'ava@example.com' },
      status: '202 Accepted',
      note: 'OTP dispatched to the customer’s email.',
    },
    {
      method: 'POST',
      path: `${GRID_BASE}/auth/verify`,
      reqBody: { requestId: 'AuthRequest:01954…', otp: '123456' },
      status: '200 OK',
      note: 'OTP verified; credential active.',
    },
  ];
}

export { CUSTOMER };
