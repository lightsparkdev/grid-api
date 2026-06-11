'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import styles from './ScrollSyncedBackdrop.module.scss';

interface ScrollSyncedBackdropProps {
  /** Selector for the LIVE element the copy mirrors (position + width source). */
  anchorSelector: string;
  /** Selector for the scroll container whose scrolling moves the anchor. */
  scrollSelector: string;
  /** The copy of the behind-UI to refract (rendered inside the lens). */
  children: ReactNode;
}

/** Painted margin past the lens so edge blur/chroma samples real pixels (matches
 *  the glass's own bleed scale). Also bounds the SVG filter's source graphic:
 *  Safari drops the filter entirely past a source-size ceiling, so the copy MUST
 *  be clipped to a small window rather than painting the whole page. */
const BLEED = 64;

/**
 * Aave's `refractionTarget` pattern for a SCROLLING page: positions a copy of
 * the UI behind a glass lens so the lens refracts "the page", and re-aligns the
 * copy every scroll/resize frame so it stays pixel-locked to the real content.
 *
 * Mount as a `backdropNode` inside `GlassOver`. The window div clips the copy to
 * lens + BLEED (Safari's filter source-size ceiling — Aave: "we stay conservative
 * with the size and complexity of the DOM we refract"), and the copy is
 * translated by the live anchor delta (in local px — rect deltas are divided by
 * the AppShell's fit scale). Inert/aria-hidden: refraction texture only.
 *
 * Safari also caches filter OUTPUT by id, so the owning glass must bump its
 * `refreshKey` per scroll frame or the lens shows stale pixels.
 */
export function ScrollSyncedBackdrop({
  anchorSelector,
  scrollSelector,
  children,
}: ScrollSyncedBackdropProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const win = windowRef.current;
    const copy = copyRef.current;
    if (!win || !copy) return;
    // Keep the duplicated buttons/links out of the a11y tree and tab order.
    copy.setAttribute('inert', '');

    const anchor = document.querySelector<HTMLElement>(anchorSelector);
    const scroller = document.querySelector<HTMLElement>(scrollSelector);
    if (!anchor) return;

    let raf = 0;
    const sync = () => {
      raf = 0;
      const a = anchor.getBoundingClientRect();
      const o = win.getBoundingClientRect();
      // Rects are in screen px; transforms apply in local px. The AppShell scales
      // the phone with transform: scale(), so divide deltas by that fit scale.
      const scale = anchor.offsetWidth > 0 ? a.width / anchor.offsetWidth : 1;
      const x = (a.left - o.left) / scale;
      const y = (a.top - o.top) / scale;
      copy.style.width = `${anchor.offsetWidth}px`;
      // 2D translate on purpose — translate3d would promote the copy to its own
      // composited layer, which Safari can't feed through the SVG filter.
      copy.style.transform = `translate(${x}px, ${y}px)`;
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    sync();
    scroller?.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    const ro = new ResizeObserver(queue);
    ro.observe(anchor);

    return () => {
      cancelAnimationFrame(raf);
      scroller?.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      ro.disconnect();
    };
  }, [anchorSelector, scrollSelector]);

  return (
    // Clip window: lens + BLEED. Bounds the filter's source graphic so Safari
    // doesn't hit its size ceiling and drop the effect.
    <div
      ref={windowRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: -BLEED,
        overflow: 'hidden',
        // Bound the subtree for real: overflow clips PAINT, but Safari sizes the
        // SVG filter's source region from LAYOUT bounds — containment caps those
        // at this window so the tall copy can't trip the source-size ceiling.
        contain: 'layout paint',
        pointerEvents: 'none',
      }}
    >
      {/* No top/left compensation: the sync measures the WINDOW's rect (which
          already sits at -BLEED), so the computed delta lands the copy correctly
          in window coordinates. No will-change/translate3d either — forcing a
          composited layer INSIDE an SVG-filtered subtree makes Safari rasterize
          it separately, and the filter can't consume it (same class of failure
          as canvas/video: content goes missing/stale). Plain 2D translate keeps
          the copy in the filter's paint tree. */}
      <div
        ref={copyRef}
        className={styles.copy}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
