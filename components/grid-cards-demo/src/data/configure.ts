import type { Persona } from './flow';

export type UseCaseId =
  | 'custom'
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
    id: 'custom',
    persona: 'custom',
    label: 'Your brand',
    iconSrc: '/assets/app-icon-custom.png',
    enabled: true,
    built: true,
  },
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
    built: true,
  },
  {
    id: 'ondemand',
    persona: 'ondemand',
    label: 'On-demand',
    iconSrc: '/assets/app-icon-ondemand.png',
    enabled: true,
    built: true,
  },
  {
    id: 'messaging',
    persona: 'messaging',
    label: 'Messaging',
    iconSrc: '/assets/app-icon-messaging.png',
    enabled: true,
    built: true,
  },
];

export function useCaseIdFromPersona(persona: Persona): UseCaseId {
  return persona;
}
