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
}

export const USE_CASES: UseCaseOption[] = [
  {
    id: 'fintech',
    persona: 'fintech',
    label: 'Financial app',
    iconSrc: '/refs/app-icon-wallet.png',
    enabled: true,
  },
  {
    id: 'creator',
    label: 'Creator platform',
    iconSrc: '/refs/app-icon-creator.png',
    enabled: true,
  },
  {
    id: 'social',
    persona: 'social',
    label: 'Social platform',
    iconSrc: '/refs/app-icon-social.png',
    enabled: true,
  },
  {
    id: 'marketplace',
    persona: 'marketplace',
    label: 'Marketplace',
    iconSrc: '/refs/app-icon-marketplace.png',
    enabled: true,
  },
  {
    id: 'ondemand',
    label: 'On-demand platform',
    iconSrc: '/refs/app-icon-ondemand.png',
    enabled: true,
  },
  {
    id: 'messaging',
    label: 'Messaging platform',
    iconSrc: '/refs/app-icon-messaging.png',
    enabled: true,
  },
];

export interface AuthMethodOption {
  id: AuthMethod;
  label: string;
  enabled: boolean;
}

export const AUTH_METHODS: AuthMethodOption[] = [
  { id: 'oauth', label: 'Google', enabled: true },
  { id: 'passkey', label: 'Passkey', enabled: true },
  { id: 'apple', label: 'Apple', enabled: true },
  { id: 'sms', label: 'Phone / SMS', enabled: true },
  { id: 'email_otp', label: 'Email', enabled: true },
];

export function useCaseIdFromPersona(persona: Persona): UseCaseId {
  return persona;
}

/** First selected method in picker order — used for sign-in demo flow. */
export function primaryAuthMethod(methods: AuthMethod[]): AuthMethod {
  return AUTH_METHODS.find((a) => methods.includes(a.id))?.id ?? 'oauth';
}
