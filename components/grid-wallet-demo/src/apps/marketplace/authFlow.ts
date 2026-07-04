'use client';

import { useSyncExternalStore } from 'react';

/** The OTP-flow surface DemoPhone hands the skin's AuthSheet. The marketplace
 *  renders that flow INSIDE its auth screen's permanent sheet (the confirm step
 *  pushes in from the right within the same clipped surface), so the AuthSheet
 *  component is a bridge: it mirrors its props here and renders nothing.
 *  MarketplaceAuthScreen subscribes and drives the UI. */
export interface MarketplaceAuthFlow {
  method: 'email' | 'phone';
  open: boolean;
  sending: boolean;
  codeActive: boolean;
  onSubmit: (value: string) => void;
  onSubmitCode?: (code: string) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

let flow: MarketplaceAuthFlow | null = null;
const listeners = new Set<() => void>();

export function setAuthFlow(next: MarketplaceAuthFlow | null) {
  flow = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthFlow(): MarketplaceAuthFlow | null {
  return useSyncExternalStore(
    subscribe,
    () => flow,
    () => null,
  );
}

/** The value typed on the auth screen, stashed across the onSignIn → entry-step
 *  handoff (the SkinAuthScreen/SkinAuthSheet contracts don't carry it). The
 *  entry step is invisible in this skin — the screen auto-submits the stash the
 *  moment the flow arms, jumping straight to the confirm screen. Consumed
 *  one-shot so a "back" from the code step doesn't re-submit. */
let stashedValue: string | null = null;

export function stashAuthValue(value: string) {
  stashedValue = value;
}

export function takeAuthValue(): string | null {
  const v = stashedValue;
  stashedValue = null;
  return v;
}
