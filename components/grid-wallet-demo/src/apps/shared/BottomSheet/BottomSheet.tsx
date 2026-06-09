'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { GlassConfig } from '@/components/liquid-glass';
import { GlassOver } from '@/components/liquid-glass';
import { AUTH_GLASS_BACKDROP } from '@/apps/shared/glass/presets';
import { useOverlayGlass } from '@/apps/shared/glass/OverlayGlassContext';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './BottomSheet.module.scss';

const SHEET_TRANSITION = motionTransition(easeOutSnappy, 0.35);
const SCRIM_TRANSITION = { duration: 0.35, ease: 'easeOut' as const };

interface BottomSheetProps {
  open: boolean;
  onDismiss: () => void;
  children: ReactNode;
  /** Override sheet glass preset (dev tuning uses context by default). */
  glass?: GlassConfig;
  /** Static CSS background to refract when `behind` isn't supplied. */
  backdrop?: string;
  /**
   * Live UI behind the sheet to refract — pass a copy of the screen the sheet
   * covers. When set, the lens bends this instead of the static `backdrop`, so the
   * sheet appears to refract the actual screen. The copy is anchored to the sheet's
   * bottom (= the screen's bottom) and spans the measured screen height so it lines
   * up with the real screen. Assumes the behind-UI is static while the sheet is open.
   */
  behind?: ReactNode;
  /**
   * Inset (px) from the screen edges, for a floating sheet. Two effects:
   *  - floats the sheet that many px off the left/right/bottom screen edges, and
   *  - drives the concentric bottom-corner radius (bottomRadius = screenCornerRadius
   *    − inset) so the bottom corners stay concentric with the phone screen.
   * The refraction copy is offset by the same inset so it still lines up with the
   * real screen. Default 0 (full-bleed, flush to the screen edge).
   */
  inset?: number;
  /**
   * Top corner radius (px). Defaults to the glass preset's `radius`. The bottom
   * corners always hug the screen (screenCornerRadius − inset); this only sets the
   * top — e.g. a floating sheet with rounder top corners.
   */
  topRadius?: number;
}

/** iOS-style glass bottom sheet — composable content slot. */
export function BottomSheet({
  open,
  onDismiss,
  children,
  glass,
  backdrop = AUTH_GLASS_BACKDROP,
  behind,
  inset = 0,
  topRadius,
}: BottomSheetProps) {
  const overlayGlass = useOverlayGlass();
  const sheetGlass = glass ?? overlayGlass.sheet;

  // The refracted copy bleeds this far past the lens so the displacement samples
  // opaque pixels at the edges (sampling past the copy reads transparent → a dark
  // fringe). The frost is now a CSS backdrop-filter that samples the real backdrop
  // rather than this copy, so the bleed tracks the displacement reach (~the peak
  // `scale`) plus a margin, and no longer balloons with the heavy blur — it still
  // exceeds the lens filter's own edge-sample margin (scale*(1+chroma) + …).
  const screenBleed = Math.ceil((sheetGlass.scale ?? 0) + (sheetGlass.blur ?? 0) * 3 + 24);

  // Measure the overlay (= the screen the sheet covers) so the refracted copy can
  // span it and register with the real screen behind. offsetHeight is the layout
  // height (pre-transform), the value we need in the glass's local space. Also read
  // the inherited --screen-corner-radius (set by AppShell) so the sheet's bottom
  // corners can hug the phone screen concentrically.
  const [screenH, setScreenH] = useState(0);
  const [screenCornerRadius, setScreenCornerRadius] = useState<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const overlayRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!el) return;
    const measure = () => {
      setScreenH(el.offsetHeight);
      const raw = getComputedStyle(el).getPropertyValue('--screen-corner-radius').trim();
      const r = raw ? Number.parseFloat(raw) : Number.NaN;
      setScreenCornerRadius(Number.isFinite(r) ? r : null);
    };
    measure();
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);
  }, []);

  // Measure the sheet itself so the refracted copy can be clamped to just the
  // slice of screen behind it (see backdropNode below) instead of spanning the
  // whole screen — keeps the per-frame composite (and the filter source on Safari)
  // small. offsetHeight is the layout height, the value we need in the glass space.
  const [sheetH, setSheetH] = useState(0);
  const sheetRoRef = useRef<ResizeObserver | null>(null);
  const sheetRef = useCallback((el: HTMLDivElement | null) => {
    sheetRoRef.current?.disconnect();
    if (!el) return;
    const measure = () => setSheetH(el.offsetHeight);
    measure();
    sheetRoRef.current = new ResizeObserver(measure);
    sheetRoRef.current.observe(el);
  }, []);

  // Bottom corners hug the screen (concentric): bottomRadius = screenRadius − inset.
  // Top corners keep the sheet's own radius. Skipped (uniform glass) when there's no
  // screen radius to read — e.g. a sheet used outside the phone shell.
  const cornerRadii: [number, number, number, number] | undefined =
    screenCornerRadius != null
      ? (() => {
          const top = topRadius ?? sheetGlass.radius;
          const bottom = Math.max(0, screenCornerRadius - inset);
          return [top, top, bottom, bottom];
        })()
      : undefined;

  // A copy of the behind-UI for the lens to refract. It must stay fixed in screen
  // space while the sheet slides, so the glass slides *over* the static UI instead
  // of dragging it along. The outer wrapper counter-animates the sheet's slide:
  // it fills the glass, so its `-100%` exactly cancels the sheet's `100%` translate
  // (no measuring needed). The inner copy is anchored to the screen bottom so it
  // registers with the real screen behind it.
  //
  // The lens only refracts the slice of screen behind the sheet, so clamp the copy
  // to the sheet height + bleed (anchored to the screen bottom); the rest above is
  // never sampled. Shrinks the counter-animated copy from full-screen to sheet-sized
  // — cheaper to composite each frame and small enough to stay under WebKit's filter
  // source ceiling. Falls back to the full screen until the sheet is measured.
  const copyBandH = sheetH > 0 ? Math.min(screenH, sheetH + screenBleed) : screenH;
  const backdropNode =
    behind && screenH > 0 ? (
      <motion.div
        aria-hidden
        initial={{ y: '-100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '-100%' }}
        transition={SHEET_TRANSITION}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* Bleed the app background past the lens on the sides/bottom so the blur
            and displacement sample opaque pixels at the edges (sampling past the
            copy would read transparent → a dark fringe). When the sheet floats
            (`inset`), shift the copy out by that inset too so it still maps onto the
            real (full-bleed) screen rect rather than the sheet's smaller rect. */}
        <div
          style={{
            position: 'absolute',
            left: -(screenBleed + inset),
            right: -(screenBleed + inset),
            bottom: -(screenBleed + inset),
            height: copyBandH + screenBleed,
            background: 'var(--app-bg)',
            // Clip the copy to the band; the full-screen `behind` below renders its
            // real layout but only the bottom band (the part under the sheet) shows.
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: screenBleed,
              right: screenBleed,
              // Bottom-anchored so the slice under the sheet stays registered with
              // the real screen; the top overflows past the band and is clipped.
              bottom: screenBleed,
              height: screenH,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {behind}
          </div>
        </div>
      </motion.div>
    ) : undefined;

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="bottom-sheet"
          ref={overlayRef}
          className={styles.overlay}
          // Float the sheet `inset` px off the screen's left/right/bottom edges (the
          // scrim is absolute inset:0, so it still covers the full screen). At 0 this
          // is a no-op full-bleed sheet.
          style={{ paddingLeft: inset, paddingRight: inset, paddingBottom: inset }}
          role="presentation"
          initial={false}
          exit={{ opacity: 1, transition: { ...SHEET_TRANSITION, when: 'afterChildren' } }}
        >
          <motion.button
            type="button"
            className={styles.scrim}
            aria-label="Dismiss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SCRIM_TRANSITION}
            onClick={onDismiss}
          />
          <motion.div
            ref={sheetRef}
            className={styles.sheetMotion}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={SHEET_TRANSITION}
          >
            <GlassOver
              className={styles.sheet}
              backdrop={backdrop}
              backdropNode={backdropNode}
              cornerRadii={cornerRadii}
              {...sheetGlass}
            >
              <div className={styles.sheetInner}>{children}</div>
            </GlassOver>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
