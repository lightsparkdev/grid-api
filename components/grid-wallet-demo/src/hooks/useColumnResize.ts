'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Matches $layout-laptop-config-width — the compact configure column is the
// default at every breakpoint.
const CONFIGURE_WIDTH = 400;
const MIN_APP = 320;
// Never resize the API column below the configure column width; dragging only
// widens it from there.
const MIN_API = CONFIGURE_WIDTH;
// The DEFAULT width + snap target: the docs sidebar plus the configure column —
// the combined chrome flanking the embedded playground. Standalone (and until
// the docs parent reports in) this assumes the expanded sidebar: 280px
// (--ls-sidebar-width) + 400 = 680 = $layout-laptop-api-content-max-width.
// Embedded, the docs page posts `nav-sync` with the live sidebar width (48px
// rail when collapsed, drag-resized values too) and the default follows.
// Dragging can still grow the panel freely up to (middle − MIN_APP).
const DOCS_SIDEBAR_DEFAULT = 280;
const SNAP_THRESHOLD = 28;

/** SSR/first-paint fallback — replaced by the chrome-width default once the
 *  layout measures (pre-paint, in the layout effect below). */
export const API_DEFAULT_WIDTH = DOCS_SIDEBAR_DEFAULT + CONFIGURE_WIDTH;

function clampApiWidth(width: number, totalMiddle: number): number {
  return Math.max(MIN_API, Math.min(totalMiddle - MIN_APP, width));
}

export function useColumnResize() {
  const layoutRef = useRef<HTMLElement>(null);
  const apiColRef = useRef<HTMLDivElement>(null);
  const [defaultApi, setDefaultApi] = useState(API_DEFAULT_WIDTH);
  const [apiWidth, setApiWidth] = useState(API_DEFAULT_WIDTH);
  // While the column sits at the default, window resizes (and nav-sync
  // updates) keep it there. A custom drag pins it to a px width until the
  // user snaps it back to the default.
  const userResized = useRef(false);

  // Embed contract (same shape as theme-sync): the docs page reports its
  // sidebar width on request and whenever it changes (collapse / drag-resize).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'nav-sync' && typeof e.data.sidebarWidth === 'number') {
        setDefaultApi(Math.round(e.data.sidebarWidth) + CONFIGURE_WIDTH);
      }
    };
    window.addEventListener('message', onMessage);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'nav-request' }, '*');
    }
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useLayoutEffect(() => {
    const fitToLayout = () => {
      const layout = layoutRef.current;
      if (!layout) return;
      const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_WIDTH;
      setApiWidth((w) =>
        clampApiWidth(userResized.current ? w : defaultApi, totalMiddle),
      );
    };

    fitToLayout();
    window.addEventListener('resize', fitToLayout);
    return () => window.removeEventListener('resize', fitToLayout);
  }, [defaultApi]);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startApiWidth = apiColRef.current?.getBoundingClientRect().width ?? defaultApi;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const applyWidth = (clientX: number) => {
        const layout = layoutRef.current;
        if (!layout) return;
        const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_WIDTH;
        const delta = clientX - startX;
        const raw = clampApiWidth(startApiWidth - delta, totalMiddle);
        const target = clampApiWidth(defaultApi, totalMiddle);
        const snapped = Math.abs(raw - target) <= SNAP_THRESHOLD ? target : raw;
        // Snapping back to the default resumes default tracking on resize.
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
    },
    [defaultApi],
  );

  return { layoutRef, apiColRef, apiWidth, onResizeStart };
}
