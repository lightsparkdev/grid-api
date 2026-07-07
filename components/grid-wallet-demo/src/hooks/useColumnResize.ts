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
  // docs sidebar wipe); everything else — drags, window resizes, and above
  // all the stacked ⇄ 3-col breakpoint flip — snaps. The ease is opted into
  // right here, in the same commit as the width change, instead of being an
  // always-on transition suppressed around crossings: an always-on transition
  // races the media flip by a task, and for that 1–2 frame window the API
  // column still holds its full stacked width inside a row layout — crushing
  // the app column to zero and blinking the phone out (the ghost frame).
  const easeTimer = useRef(0);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'nav-sync' && typeof e.data.sidebarWidth === 'number') {
        // Ease only when the column is ALREADY laid out at its tracked inline
        // width — i.e. the row layout is settled. A viewport check
        // (min-width: 1600px) is not enough: the embed re-sends nav-sync every
        // frame of the sidebar wipe, and once the growing iframe crosses the
        // breakpoint those messages race the stacked → wide attribute flip. If
        // the easing attribute is live at the flip's style recalc, the width
        // transition starts from the STACKED computed width (100% of the row)
        // and the API column spends 240ms nearly full-width, crushing the app
        // column to zero (the phone blinks out). Mid-flip the painted width is
        // that full row — miles from the inline width — so this guard skips
        // the ease; once settled they match and nav glides ease as intended.
        const el = apiColRef.current;
        const painted = el ? el.getBoundingClientRect().width : NaN;
        const tracked = el ? parseFloat(el.style.width) : NaN;
        if (el && Math.abs(painted - tracked) < 2) {
          el.setAttribute('data-easing', '');
          window.clearTimeout(easeTimer.current);
          easeTimer.current = window.setTimeout(() => el.removeAttribute('data-easing'), 300);
        }
        setDefaultApi(Math.round(e.data.sidebarWidth) + CONFIGURE_WIDTH);
      }
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
      setResizing(true);

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
