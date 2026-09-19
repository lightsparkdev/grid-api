'use client';

import { useLayoutEffect, useRef, useState } from 'react';

export type AppShellDevice = 'phone' | 'duo-landscape';

export interface AppShellGeometry {
  outerWidth: number;
  outerHeight: number;
  screenWidth: number;
  screenHeight: number;
  screenRadius: number;
  shellRadius: number;
}

/** Wallet phone-gga and the open iPhone Duo landscape display. */
export const APP_SHELL_GEOMETRY: Record<AppShellDevice, AppShellGeometry> = {
  phone: {
    outerWidth: 434,
    outerHeight: 906,
    screenWidth: 402,
    screenHeight: 874,
    screenRadius: 60,
    shellRadius: 76,
  },
  'duo-landscape': {
    outerWidth: 922,
    outerHeight: 658,
    screenWidth: 890,
    screenHeight: 626,
    screenRadius: 54,
    shellRadius: 70,
  },
};

export const APP_SHELL_OUTER_WIDTH = APP_SHELL_GEOMETRY.phone.outerWidth;
export const APP_SHELL_OUTER_HEIGHT = APP_SHELL_GEOMETRY.phone.outerHeight;

/** Minimum inset around the phone when fitting inside the dot-grid stage. */
export const PHONE_FIT_PAD_INLINE = 16;
export const PHONE_FIT_PAD_BLOCK = 48;

export function usePhoneFitScale(device: AppShellDevice = 'phone') {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Live stage size — consumers use it to place a backdrop copy inside the glass.
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const geometry = APP_SHELL_GEOMETRY[device];

    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      setSize((p) => (p.w === cw && p.h === ch ? p : { w: cw, h: ch }));
      const availW = cw - PHONE_FIT_PAD_INLINE * 2;
      const availH = ch - PHONE_FIT_PAD_BLOCK * 2;
      const s = Math.min(
        1,
        availW / geometry.outerWidth,
        availH / geometry.outerHeight,
      );
      setScale(s > 0 ? s : 1);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [device]);

  return { wrapRef, scale, size };
}
