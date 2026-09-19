'use client';

import { createContext, useContext } from 'react';

/**
 * DOM node of AppShell's overlay layer — it sits at a z-index *above* the status
 * bar, so overlays portaled here (e.g. the Face ID progressive blur) frost the
 * status bar too. A normal screen-body element sits below the status bar and
 * cannot. Null when rendered outside an AppShell.
 */
export const ScreenOverlayContext = createContext<HTMLElement | null>(null);

export function useScreenOverlay(): HTMLElement | null {
  return useContext(ScreenOverlayContext);
}
