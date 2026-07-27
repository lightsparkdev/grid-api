'use client';

import { useEffect, useState } from 'react';

/**
 * Which rendering engine is under us. The glass effect leans on SVG
 * `feDisplacementMap`, which WebKit (Safari + every iOS browser) runs on the CPU
 * and mishandles past a source-graphic size ceiling — so we trim the filter graph
 * there (drop chromatic aberration, read the specular off the raw map). This is
 * NOT a feature gate (Safari *supports* the filter); it's an engine gate, so it
 * has to sniff the engine rather than `CSS.supports`.
 */
export interface GlassEngine {
  /** WebKit (desktop Safari or any iOS browser — all iOS browsers are WebKit). */
  isSafari: boolean;
  /** iOS / iPadOS specifically (incl. iPad reporting as desktop Safari). */
  isIOS: boolean;
}

const SSR_DEFAULT: GlassEngine = { isSafari: false, isIOS: false };

/**
 * Detect the engine on the client. Mirrors Aave's shipped check
 * (`/^((?!chrome|chromium|android).)*safari/i` + an iPadOS-as-desktop touch test).
 *
 * A `?glass=` query param forces a path for QA: `safari` (WebKit path) or
 * `full`/`chromium` (the unrestricted path) — handy because Cursor's browser is
 * Chromium and can't reproduce Safari on its own.
 */
function detectGlassEngine(): GlassEngine {
  if (typeof navigator === 'undefined') return SSR_DEFAULT;
  if (typeof window !== 'undefined') {
    const override = new URLSearchParams(window.location.search).get('glass');
    if (override === 'safari') return { isSafari: true, isIOS: true };
    if (override === 'full' || override === 'chromium') return SSR_DEFAULT;
  }
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = isIOS || /^((?!chrome|chromium|android).)*safari/i.test(ua);
  return { isSafari, isIOS };
}

/**
 * SSR-safe engine signal. Renders as Chromium first (the unrestricted path) to
 * match the server output, then upgrades to the real engine after mount — so
 * Safari never gets the heavy filter for more than the first paint, and there's
 * no hydration mismatch.
 */
export function useGlassEngine(): GlassEngine {
  const [engine, setEngine] = useState<GlassEngine>(SSR_DEFAULT);
  useEffect(() => {
    setEngine(detectGlassEngine());
  }, []);
  return engine;
}
