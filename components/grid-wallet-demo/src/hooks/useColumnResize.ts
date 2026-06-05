'use client';

import { useCallback, useRef, useState } from 'react';

const CONFIGURE_WIDTH = 475;
const MIN_APP = 320;
const MIN_API = 320;
const EQUAL_SNAP_THRESHOLD = 28;

function snapToEqualWidth(width: number, totalMiddle: number): number {
  const equal = totalMiddle / 2;
  const min = MIN_APP;
  const max = totalMiddle - MIN_API;
  if (equal < min || equal > max) return width;
  if (Math.abs(width - equal) <= EQUAL_SNAP_THRESHOLD) return equal;
  return width;
}

export function useColumnResize() {
  const layoutRef = useRef<HTMLElement>(null);
  const appColRef = useRef<HTMLDivElement>(null);
  const [appWidth, setAppWidth] = useState<number | null>(null);
  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = appColRef.current?.getBoundingClientRect().width ?? 400;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMove = (ev: MouseEvent) => {
        const layout = layoutRef.current;
        if (!layout) return;
        const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_WIDTH;
        const delta = ev.clientX - startX;
        const raw = Math.max(MIN_APP, Math.min(totalMiddle - MIN_API, startWidth + delta));
        setAppWidth(snapToEqualWidth(raw, totalMiddle));
      };

      const onUp = (ev: MouseEvent) => {
        const layout = layoutRef.current;
        if (layout) {
          const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_WIDTH;
          const delta = ev.clientX - startX;
          const raw = Math.max(MIN_APP, Math.min(totalMiddle - MIN_API, startWidth + delta));
          setAppWidth(snapToEqualWidth(raw, totalMiddle));
        }
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [],
  );

  return { layoutRef, appColRef, appWidth, onResizeStart };
}
