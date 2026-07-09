'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export type Theme = 'light' | 'dark';
/** What the user picked — mirrors the docs' Mintlify switcher (system/light/
 *  dark). `system` resolves live against the OS preference. */
export type ThemePref = 'system' | Theme;

const resolve = (pref: ThemePref): Theme =>
  pref === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : pref;

const isPref = (v: unknown): v is ThemePref =>
  v === 'system' || v === 'light' || v === 'dark';

export function useTheme() {
  const [pref, setPrefState] = useState<ThemePref>('system');
  const [theme, setThemeState] = useState<Theme>('light');
  const prefRef = useRef(pref);

  const apply = useCallback((p: ThemePref) => {
    const t = resolve(p);
    prefRef.current = p;
    setPrefState(p);
    setThemeState(t);
    // data-theme drives ALL styling (resolved); data-theme-pref drives the
    // footer toggle's active state (what's selected, incl. system).
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.setAttribute('data-theme-pref', p);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramPref = params.get('theme');
    const stored = localStorage.getItem('grid-theme');
    apply(isPref(paramPref) ? paramPref : isPref(stored) ? stored : 'system');

    // While on `system`, follow the OS live — same as the docs switcher.
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (prefRef.current === 'system') apply('system');
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [apply]);

  const setPref = useCallback(
    (p: ThemePref) => {
      apply(p);
      localStorage.setItem('grid-theme', p);
    },
    [apply],
  );

  return { theme, pref, setPref };
}
