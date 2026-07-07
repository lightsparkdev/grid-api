'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CONFIGURE_COL_PX } from '@/lib/layout';

const MIN_APP = 320;
// Never resize the API column below the configure column width; dragging only
// widens it from there.
const MIN_API = CONFIGURE_COL_PX;
// The DEFAULT width + snap target: the docs sidebar plus the configure column —
// the combined chrome flanking the embedded playground. Standalone (and until
// the docs parent reports in) this assumes the expanded sidebar: 280px
// (--ls-sidebar-width) + 400 = 680 = $layout-laptop-api-content-max-width.
// Embedded, the docs page posts `nav-sync` with the live sidebar width (48px
// rail when collapsed, drag-resized values too) and the default follows.
// Dragging can still grow the panel freely up to (middle − MIN_APP).
const DOCS_SIDEBAR_DEFAULT = 280;
const SNAP_THRESHOLD = 28;

/** Standalone fallback — the embed overrides it via the ?nav URL param.
 *  Kept in sync with the --api-col-default fallback in page.module.scss. */
export const API_DEFAULT_WIDTH = DOCS_SIDEBAR_DEFAULT + CONFIGURE_COL_PX;

/** The embed bakes the live sidebar width into the iframe URL so the very
 *  first paint uses the real default: the pre-paint script in layout.tsx
 *  turns it into the --api-col-default CSS var (which styles the column
 *  until React takes over below), and this seeds the same value into state
 *  so the JS width agrees with that paint instead of re-fitting to the
 *  expanded-sidebar assumption a beat later. */
function initialDefaultApi(): number {
  if (typeof window === 'undefined') return API_DEFAULT_WIDTH;
  const nav = parseFloat(new URLSearchParams(window.location.search).get('nav') ?? '');
  return Number.isFinite(nav) && nav >= 0 ? Math.round(nav) + CONFIGURE_COL_PX : API_DEFAULT_WIDTH;
}

function clampApiWidth(width: number, totalMiddle: number): number {
  return Math.max(MIN_API, Math.min(totalMiddle - MIN_APP, width));
}

export function useColumnResize() {
  const layoutRef = useRef<HTMLElement>(null);
  const apiColRef = useRef<HTMLDivElement>(null);
  const [defaultApi, setDefaultApi] = useState(initialDefaultApi);
  // null until the post-hydration measure: SSR and the hydration render emit
  // NO inline width, leaving the stylesheet's var(--api-col-default) in
  // charge — which the pre-paint script already set to the true default. An
  // inline SSR width would paint the wrong column for the whole JS load.
  const [apiWidth, setApiWidth] = useState<number | null>(null);
  // True while the user drags the divider — the column's width transition is
  // disabled so the drag tracks the pointer 1:1 (it only eases programmatic
  // changes, e.g. the default following a docs-sidebar collapse).
  const [resizing, setResizing] = useState(false);
  // While the column sits at the default, window resizes (and nav-sync
  // updates) keep it there. A custom drag pins it to a px width until the
  // user snaps it back to the default.
  const userResized = useRef(false);

  // Embed contract (same shape as theme-sync): the docs page reports its
  // sidebar width on request and whenever it changes (collapse / drag-resize).
  //
  // A nav-driven width change EASES (the glide that runs in parallel with the
  // docs sidebar wipe); everything else — drags, window resizes, breakpoint
  // flips — snaps. The ease is opted into per-message via data-easing rather
  // than an always-on transition, and only when the column is already painted
  // at its tracked inline width (i.e. the row layout is settled). That guard
  // is load-bearing: the embed re-sends nav-sync every frame of the sidebar
  // wipe, and once the growing iframe crosses the breakpoint those messages
  // race the stacked → wide flip. If the transition arms during the flip's
  // style recalc, it starts from the STACKED computed width — 100% of the
  // row — and the column spends 240ms nearly full-width, crushing the app
  // column to zero (the phone blinks out).
  const easeTimer = useRef(0);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e.data || e.data.type !== 'nav-sync' || typeof e.data.sidebarWidth !== 'number') return;
      const el = apiColRef.current;
      if (el && Math.abs(el.getBoundingClientRect().width - parseFloat(el.style.width)) < 2) {
        el.setAttribute('data-easing', '');
        window.clearTimeout(easeTimer.current);
        easeTimer.current = window.setTimeout(() => el.removeAttribute('data-easing'), 300);
      }
      setDefaultApi(Math.round(e.data.sidebarWidth) + CONFIGURE_COL_PX);
    };
    window.addEventListener('message', onMessage);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'nav-request' }, '*');
    }
    return () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(easeTimer.current);
    };
  }, []);

  useLayoutEffect(() => {
    const fitToLayout = () => {
      const layout = layoutRef.current;
      if (!layout) return;
      const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_COL_PX;
      setApiWidth((w) =>
        clampApiWidth(userResized.current && w !== null ? w : defaultApi, totalMiddle),
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
      setResizing(true);

      const applyWidth = (clientX: number) => {
        const layout = layoutRef.current;
        if (!layout) return;
        const totalMiddle = layout.getBoundingClientRect().width - CONFIGURE_COL_PX;
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
        setResizing(false);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [defaultApi],
  );

  return { layoutRef, apiColRef, apiWidth, resizing, onResizeStart };
}
