'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/** Outer phone-gga bounds from Figma 2121:17475 (402×874 screen + 16px pad). */
export const APP_SHELL_OUTER_WIDTH = 434;
export const APP_SHELL_OUTER_HEIGHT = 906;

export function usePhoneFitScale() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Live stage size — consumers use it to place a backdrop copy inside the glass.
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      setSize((p) => (p.w === cw && p.h === ch ? p : { w: cw, h: ch }));
      const availW = cw - 32;
      const availH = ch - 32;
      const s = Math.min(
        1,
        availW / APP_SHELL_OUTER_WIDTH,
        availH / APP_SHELL_OUTER_HEIGHT,
      );
      setScale(s > 0 ? s : 1);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { wrapRef, scale, size };
}
