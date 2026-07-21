'use client';

import { useSyncExternalStore } from 'react';
import type { Theme } from './useTheme';

function getSnapshot(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function subscribe(callback: () => void) {
  if (typeof document === 'undefined') return () => {};
  const obs = new MutationObserver(callback);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => obs.disconnect();
}

/**
 * Read-only current theme, mirrored from `data-theme` on <html>.
 *
 * Unlike {@link useTheme}, this only *observes* the resolved theme (no query-param
 * parsing or parent postMessage), so leaf components can adapt to it cheaply
 * without each spinning up the embed handshake.
 */
export function useThemeMode(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'light');
}
