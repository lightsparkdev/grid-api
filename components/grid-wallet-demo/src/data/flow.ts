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

