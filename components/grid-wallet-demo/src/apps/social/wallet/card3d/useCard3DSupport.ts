'use client';

import { useEffect, useState } from 'react';

export interface Card3DSupport {
  webgl: boolean;
  reducedMotion: boolean;
}

/**
 * Client-only probe for whether to render the 3D card: WebGL availability +
 * prefers-reduced-motion. Returns null until mounted so SSR / first paint show
 * the flat fallback (no Canvas).
 */
export function useCard3DSupport(): Card3DSupport | null {
  const [support, setSupport] = useState<Card3DSupport | null>(null);
  useEffect(() => {
    let webgl = false;
    try {
      const canvas = document.createElement('canvas');
      webgl = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
      );
    } catch {
      webgl = false;
    }
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    setSupport({ webgl, reducedMotion });
  }, []);
  return support;
}
