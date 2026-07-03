import type { Persona, AuthMethod } from './flow';

export type UseCaseId =
  | 'fintech'
  | 'social'
  | 'marketplace'
  | 'creator'
  | 'ondemand'
  | 'messaging';

export interface UseCaseOption {
  id: UseCaseId;
  /** Maps to demo logic when enabled. */
  persona?: Persona;
  label: string;
  iconSrc: string;
  enabled: boolean;
  /** Whether the on-phone experience is actually built. Only the financial app
   *  (Aurora) is live today; the rest render in the picker but are no-ops — the
   *  active indicator stays on the built one, and they dim on group hover. */
  built: boolean;
}

export const USE_CASES: UseCaseOption[] = [
  {
    id: 'fintech',
    persona: 'fintech',
    label: 'Fintech',
    iconSrc: '/assets/app-icon-wallet.png',
    enabled: true,
    built: true,
  },
  {
    id: 'creator',
    persona: 'creator',
    label: 'Creator',
    iconSrc: '/assets/app-icon-creator.png',
    enabled: true,
    built: true,
  },
  {
    id: 'social',
    persona: 'social',
    label: 'Social',
    iconSrc: '/assets/app-icon-social.png',
    enabled: true,
    built: true,
  },
  {
    id: 'marketplace',
    persona: 'marketplace',
    label: 'Marketplace',
    iconSrc: '/assets/app-icon-marketplace.png',
    enabled: true,
    built: false,
  },
  {
    id: 'ondemand',
    label: 'On-demand',
    iconSrc: '/assets/app-icon-ondemand.png',
    enabled: true,
    built: false,
  },
  {
    id: 'messaging',
    label: 'Messaging',
    iconSrc: '/assets/app-icon-messaging.png',
    enabled: true,
    built: false,
  },
];

export interface AuthMethodOption {
  id: AuthMethod;
  label: string;
  /** Shorter label for narrow configure column (768px–1799px). */
  compactLabel?: string;
  enabled: boolean;
}

export const AUTH_METHODS: AuthMethodOption[] = [
  { id: 'email_otp', label: 'Email', enabled: true },
  { id: 'sms', label: 'SMS', enabled: true },
  { id: 'oauth', label: 'Google', enabled: true },
  { id: 'apple', label: 'Apple', enabled: true },
  { id: 'passkey', label: 'Passkey', enabled: true },
];

export function useCaseIdFromPersona(persona: Persona): UseCaseId {
  return persona;
}

/** First selected method in picker order — used for sign-in demo flow. */
export function primaryAuthMethod(methods: AuthMethod[]): AuthMethod {
  return AUTH_METHODS.find((a) => methods.includes(a.id))?.id ?? 'oauth';
}
