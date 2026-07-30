'use client';

import { useState, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Theme state for the demo.
 *
 * Embed contract (identical to grid-visualizer / flow-builder):
 *  - Initial theme comes from the `?theme=` query param the docs page sets on the iframe src.
 *  - On mount we post `{ type: 'theme-request' }` to the parent, which replies with
 *    `{ type: 'theme-sync', theme }`.
 *  - The parent also pushes `theme-sync` whenever the docs theme toggles.
 *  - We mirror the resolved theme onto `data-theme` for CSS.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  const apply = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramTheme = params.get('theme');
    const stored = localStorage.getItem('grid-wallet-theme') as Theme | null;
    const resolved: Theme =
      paramTheme === 'dark' || paramTheme === 'light'
        ? paramTheme
        : stored === 'dark' || stored === 'light'
          ? stored
          : window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    apply(resolved);

    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'theme-sync') {
        const t: Theme = e.data.theme === 'dark' ? 'dark' : 'light';
        apply(t);
      }
    };
    window.addEventListener('message', onMessage);

    // Ask the parent (if embedded) for the current theme.
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'theme-request' }, '*');
    }

    return () => window.removeEventListener('message', onMessage);
  }, [apply]);

  const setTheme = useCallback(
    (t: Theme) => {
      apply(t);
      localStorage.setItem('grid-wallet-theme', t);
      // Tell the parent so the docs page stays in sync when toggled from inside.
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'theme-sync', theme: t }, '*');
      }
    },
    [apply],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
