'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

// Matches $layout-laptop-config-width — the compact configure column is the
// default at every breakpoint.
const CONFIGURE_WIDTH = 400;
const MIN_APP = 320;
// Never resize the API column below the configure column width; dragging only
// widens it from there.
const MIN_API = CONFIGURE_WIDTH;
const SNAP_THRESHOLD = 28;

/** SSR/first-paint fallback — replaced by the 50/50 split once the layout
 *  measures (pre-paint, in the layout effect below). */
export const API_DEFAULT_WIDTH = CONFIGURE_WIDTH;

function clampApiWidth(width: number, totalMiddle: number): number {
  return Math.max(MIN_API, Math.min(totalMiddle - MIN_APP, width));
}

/** Default + snap target — the app and API panels split the space right of
 *  the configure column 50/50. */
function defaultApiWidth(totalMiddle: number): number {
  return clampApiWidth(Math.round(totalMiddle / 2), totalMiddle);
}

export function useColumnResize() {
  const layoutRef = useRef<HTMLElement>(null);
  const apiColRef = useRef<HTMLDivElement>(null);
  const [apiWidth, setApiWidth] = useState(API_DEFAULT_WIDTH);
  // While the column sits at the default split, window resizes keep it AT the
  // split (both panels breathe together). A custom drag pins it to a px width
  // until the user snaps it back to the split.
  const userResized = useRef(false);

  useLayoutEffect(() => {
    const fitToLayout = () => {
      const layout = layoutRef.current;
      if (!layout) return;
      const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_WIDTH;
      setApiWidth((w) =>
        userResized.current ? clampApiWidth(w, totalMiddle) : defaultApiWidth(totalMiddle),
      );
    };

    fitToLayout();
    window.addEventListener('resize', fitToLayout);
    return () => window.removeEventListener('resize', fitToLayout);
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
      const target = defaultApiWidth(totalMiddle);
      const snapped = Math.abs(raw - target) <= SNAP_THRESHOLD ? target : raw;
      // Snapping back to the split resumes 50/50 tracking on window resize.
      userResized.current = snapped !== target;
      setApiWidth(snapped);
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
