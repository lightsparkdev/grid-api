'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { FrostConfig } from '@/components/liquid-glass';
import { FrostPanel } from '@/components/liquid-glass';
import { useOverlayGlass } from '@/apps/shared/glass/OverlayGlassContext';
import { useRegisterSheet } from '@/apps/shared/SheetPresentation';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import styles from './BottomSheet.module.scss';

const SHEET_DURATION = 0.35;

interface BottomSheetProps {
  open: boolean;
  onDismiss: () => void;
  children: ReactNode;
  /** Override the sheet's frost preset (dev tuning uses context by default). */
  glass?: FrostConfig;
  /**
   * Inset (px) from the screen edges, for a floating sheet. Two effects:
   *  - floats the sheet that many px off the left/right/bottom screen edges, and
   *  - drives the concentric bottom-corner radius (bottomRadius = screenCornerRadius
   *    − inset) so the bottom corners stay concentric with the phone screen.
   * Default 0 (full-bleed, flush to the screen edge).
   */
  inset?: number;
  /**
   * Top corner radius (px). Defaults to the glass preset's `radius`. The bottom
   * corners always hug the screen (screenCornerRadius − inset); this only sets the
   * top — e.g. a floating sheet with rounder top corners.
   */
  topRadius?: number;
  /**
   * Whether this sheet drives the stacked-sheet effect (scales the presenting
   * content back under a SheetPresentationProvider). Default true; set false for
   * small action/chooser sheets that shouldn't push the whole screen back.
   */
  scalesBackground?: boolean;
  /**
   * Slide/scrim duration in seconds. Default 0.35. Bump it (e.g. creator's
   * stacked sheets at 0.5) to slow the presentation — keep it equal to the
   * PresentationStage transition so the scale stays in lockstep with the slide.
   */
  duration?: number;
  /**
   * Keep the sheet's subtree mounted while closed (hidden + inert instead of
   * unmounted). For sheets with expensive content — e.g. Z's card sheet keeps
   * its WebGL canvas alive so reopening never pays context init + shader
   * compile again. Default false (closed sheets unmount, as before).
   */
  keepMounted?: boolean;
}

/**
 * iOS-style frosted bottom sheet — composable content slot.
 *
 * The sheet is a non-refractive `FrostPanel` (CSS `backdrop-filter` + specular
 * edge), not a displacement lens: a large lens re-runs its whole SVG filter every
 * frame as the sheet slides, which tanks Safari. The frost blurs the real screen,
 * costs nothing per-frame, and the glassy read comes from the edge — refraction is
 * reserved for the small, tactile glass buttons that sit on top.
 */
export function BottomSheet({
  open,
  onDismiss,
  children,
  glass,
  inset = 0,
  topRadius,
  scalesBackground = true,
  duration = SHEET_DURATION,
  keepMounted = false,
}: BottomSheetProps) {
  const overlayGlass = useOverlayGlass();
  const sheetGlass = glass ?? overlayGlass.sheet;

  const sheetTransition = motionTransition(easeOutSnappy, duration);
  const scrimTransition = { duration, ease: 'easeOut' as const };

  // Drive the stacked-sheet effect: under a SheetPresentationProvider, the
  // presenting screen scales back while this sheet is open. No-op otherwise, or
  // when this sheet opts out (small chooser/action sheets).
  useRegisterSheet(open && scalesBackground);

  // Read the inherited --screen-corner-radius (set by AppShell) so the sheet's
  // bottom corners can hug the phone screen concentrically.
  const [screenCornerRadius, setScreenCornerRadius] = useState<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const overlayRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!el) return;
    const measure = () => {
      const raw = getComputedStyle(el).getPropertyValue('--screen-corner-radius').trim();
      const r = raw ? Number.parseFloat(raw) : Number.NaN;
      setScreenCornerRadius(Number.isFinite(r) ? r : null);
    };
    measure();
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);
  }, []);

  // Bottom corners hug the screen (concentric): bottomRadius = screenRadius − inset.
  // Top corners keep the sheet's own radius. Skipped (uniform frost) when there's no
  // screen radius to read — e.g. a sheet used outside the phone shell.
  const cornerRadii: [number, number, number, number] | undefined =
    screenCornerRadius != null
      ? (() => {
          const top = topRadius ?? sheetGlass.radius;
          const bottom = Math.max(0, screenCornerRadius - inset);
          return [top, top, bottom, bottom];
        })()
      : undefined;

  const panel = (
    <FrostPanel
      className={styles.sheet}
      tint={sheetGlass.tint}
      tintBlur={sheetGlass.tintBlur}
      edge={sheetGlass.edge}
      edgeGlint={sheetGlass.edgeGlint}
      edgeWidth={sheetGlass.edgeWidth}
      shadow={sheetGlass.shadow}
      radius={topRadius ?? sheetGlass.radius}
      cornerSmoothing={sheetGlass.cornerSmoothing}
      cornerRadii={cornerRadii}
    >
      <div className={styles.sheetInner}>{children}</div>
    </FrostPanel>
  );

  // keepMounted: the sheet never unmounts — closed just slides it off and makes
  // it inert (scrim fades, pointer events off). Expensive content (e.g. the Z
  // card's WebGL canvas) survives close/reopen with zero re-init.
  if (keepMounted) {
    return (
      <div
        ref={overlayRef}
        className={styles.overlay}
        style={{
          paddingLeft: inset,
          paddingRight: inset,
          paddingBottom: inset,
          pointerEvents: open ? 'auto' : 'none',
        }}
        role="presentation"
        aria-hidden={!open}
      >
        <motion.button
          type="button"
          className={styles.scrim}
          aria-label="Dismiss"
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={scrimTransition}
          onClick={onDismiss}
          tabIndex={open ? 0 : -1}
        />
        <motion.div
          className={styles.sheetMotion}
          initial={false}
          animate={{ y: open ? 0 : '110%' }}
          transition={sheetTransition}
        >
          {panel}
        </motion.div>
      </div>
    );
  }

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
          exit={{ opacity: 1, transition: { ...sheetTransition, when: 'afterChildren' } }}
        >
          <motion.button
            type="button"
            className={styles.scrim}
            aria-label="Dismiss"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={scrimTransition}
            onClick={onDismiss}
          />
          <motion.div
            className={styles.sheetMotion}
            // 110% (not 100%): inset sheets float above the screen bottom, so
            // a plain full-height travel leaves a sliver of the sheet's top
            // on screen until unmount.
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={sheetTransition}
          >
            {panel}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
