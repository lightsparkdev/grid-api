'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const CONFIGURE_WIDTH = 475;
const MIN_APP = 320;
const MIN_API = 320;
const SNAP_THRESHOLD = 28;

/** Former list content max (680px) + horizontal padding (spacing-xl × 2). */
export const API_DEFAULT_WIDTH = 680 + 24 * 2;

function clampApiWidth(width: number, totalMiddle: number): number {
  return Math.max(MIN_API, Math.min(totalMiddle - MIN_APP, width));
}

function snapApiWidth(width: number, totalMiddle: number): number {
  const target = clampApiWidth(API_DEFAULT_WIDTH, totalMiddle);
  if (Math.abs(width - target) <= SNAP_THRESHOLD) return target;
  return width;
}

export function useColumnResize() {
  const layoutRef = useRef<HTMLElement>(null);
  const apiColRef = useRef<HTMLDivElement>(null);
  const [apiWidth, setApiWidth] = useState(API_DEFAULT_WIDTH);

  useLayoutEffect(() => {
    const clampToLayout = () => {
      const layout = layoutRef.current;
      if (!layout) return;
      const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_WIDTH;
      setApiWidth((w) => clampApiWidth(w, totalMiddle));
    };

    clampToLayout();
    window.addEventListener('resize', clampToLayout);
    return () => window.removeEventListener('resize', clampToLayout);
  }, []);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startApiWidth = apiColRef.current?.getBoundingClientRect().width ?? API_DEFAULT_WIDTH;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const applyWidth = (clientX: number) => {
      const layout = layoutRef.current;
      if (!layout) return;
      const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_WIDTH;
      const delta = clientX - startX;
      const raw = clampApiWidth(startApiWidth - delta, totalMiddle);
      setApiWidth(snapApiWidth(raw, totalMiddle));
    };

    const onMove = (ev: MouseEvent) => applyWidth(ev.clientX);

    const onUp = (ev: MouseEvent) => {
      applyWidth(ev.clientX);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  return { layoutRef, apiColRef, apiWidth, onResizeStart };
}
