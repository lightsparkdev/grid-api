'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { AppShellPreset } from './devicePresets';

export const APP_SHELL_OUTER_WIDTH = 434;
export const APP_SHELL_OUTER_HEIGHT = 906;
export const PHONE_FIT_PAD_INLINE = 16;
export const PHONE_FIT_PAD_BLOCK = 48;

export function usePhoneFitScale(preset: AppShellPreset) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const compute = () => {
      const availableWidth = element.clientWidth - PHONE_FIT_PAD_INLINE * 2;
      const availableHeight = element.clientHeight - PHONE_FIT_PAD_BLOCK * 2;
      const nextScale = Math.min(
        1,
        availableWidth / preset.outerWidth,
        availableHeight / preset.outerHeight,
      );
      setScale(nextScale > 0 ? nextScale : 1);
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(element);
    return () => observer.disconnect();
  }, [preset]);

  return { wrapRef, scale };
}
