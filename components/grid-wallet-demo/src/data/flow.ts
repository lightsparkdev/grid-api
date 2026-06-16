/* ============================================================
   Core types + Grid API call shapes for the playground.
   The demo is action-driven (like the flow builder): the user
   picks a use case + sign-in method, creates a Global Account,
   then freely triggers actions on the app.
   ============================================================ */

export type Persona = 'fintech' | 'social' | 'marketplace' | 'creator';
export type AuthMethod = 'passkey' | 'oauth' | 'apple' | 'email_otp' | 'sms';

/** Full API base for cURL — version lives here, not in operation paths. */
export const GRID_API_BASE_URL = 'https://api.lightspark.com/grid/2025-10-13';

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
  /** Short step label shown above the description. */
  title?: string;
  headers?: Record<string, string>;
  reqBody?: Record<string, unknown>;
  status: string;
  /** Longer explanatory copy under the title. */
  note?: string;
  /** Inbound webhook (Grid → your endpoint): `path` is your full URL, and the
   *  curl drops the Grid `Authorization` header (Grid signs it instead). */
  inbound?: boolean;
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

// Brand names stay capitalized; generic methods read lowercase in the CTA.
const BRAND_METHODS: AuthMethod[] = ['oauth', 'apple'];

export function authCta(m: AuthMethod) {
  const label = BRAND_METHODS.includes(m) ? AUTH_LABEL[m] : AUTH_LABEL[m].toLowerCase();
  return `Continue with ${label}`;
}

const CUSTOMER = 'Customer:019542f5-b3e7-1d02-0000-000000000001';

/** Credential registration call(s) by method. */
export function credentialCalls(method: AuthMethod): ApiCall[] {
  if (method === 'passkey') {
    return [
      {
        method: 'POST',
        path: `/auth/credentials`,
        title: 'Register passkey',
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
        path: `/auth/credentials`,
        title: 'Register OAuth credential',
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
        path: `/auth/credentials`,
        title: 'Register SMS credential',
        reqBody: { customerId: CUSTOMER, credentialType: 'SMS_OTP', phone: '+1 415 555 0148' },
        status: '202 Accepted',
        note: 'OTP sent by SMS.',
      },
      {
        method: 'POST',
        path: `/auth/verify`,
        title: 'Verify SMS OTP',
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
      path: `/auth/credentials`,
      title: 'Register email credential',
      reqBody: { customerId: CUSTOMER, credentialType: 'EMAIL_OTP', email: 'ava@example.com' },
      status: '202 Accepted',
      note: 'OTP dispatched to the customer’s email.',
    },
    {
      method: 'POST',
      path: `/auth/verify`,
      title: 'Verify email OTP',
      reqBody: { requestId: 'AuthRequest:01954…', otp: '123456' },
      status: '200 OK',
      note: 'OTP verified; credential active.',
    },
  ];
}

export { CUSTOMER };
