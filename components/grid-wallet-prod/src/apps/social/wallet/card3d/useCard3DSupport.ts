'use client';

import { useEffect, useState } from 'react';

export interface Card3DSupport {
  webgl: boolean;
  reducedMotion: boolean;
}

// Probe ONCE per session: creating a WebGL context just to feature-test is
// expensive on Safari (tens of ms), and the sheet can mount at the exact moment
// it opens (sidebar flow) — re-probing there janks the open slide.
let webglProbe: boolean | null = null;

function probeWebgl(): boolean {
  if (webglProbe !== null) return webglProbe;
  try {
    const canvas = document.createElement('canvas');
    // webgl2 first; only fall back to webgl1 if it's unavailable, so the common
    // path creates a single context (not two).
    webglProbe = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}

/**
 * Client-only probe for whether to render the 3D card: WebGL availability +
 * prefers-reduced-motion. Returns null until mounted so SSR / first paint show
 * the flat fallback (no Canvas).
 */
export function useCard3DSupport(): Card3DSupport | null {
  const [support, setSupport] = useState<Card3DSupport | null>(null);
  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    setSupport({ webgl: probeWebgl(), reducedMotion });
  }, []);
  return support;
}
