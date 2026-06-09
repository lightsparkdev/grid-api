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
   * Inset (px) from the screen edges, for a floating sheet. Drives the concentric
   * bottom-corner radius: bottomRadius = screenCornerRadius − inset, so the sheet's
   * bottom corners stay concentric with the phone screen they sit in. Default 0
   * (full-bleed, flush to the screen edge).
   */
  inset?: number;
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
}: BottomSheetProps) {
  const overlayGlass = useOverlayGlass();
  const sheetGlass = glass ?? overlayGlass.sheet;

  // The refracted copy bleeds this far past the lens on the sides/bottom so the
  // blur/displacement sample opaque pixels at the edges (sampling past the copy
  // reads transparent → a dark fringe). Scales with blur so it always exceeds the
  // lens filter's own edge-sample margin (~blur*3 + scale + …).
  const screenBleed = Math.ceil((sheetGlass.blur ?? 0) * 3 + 48);

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

  // Bottom corners hug the screen (concentric): bottomRadius = screenRadius − inset.
  // Top corners keep the sheet's own radius. Skipped (uniform glass) when there's no
  // screen radius to read — e.g. a sheet used outside the phone shell.
  const cornerRadii: [number, number, number, number] | undefined =
    screenCornerRadius != null
      ? (() => {
          const top = sheetGlass.radius;
          const bottom = Math.max(0, screenCornerRadius - inset);
          return [top, top, bottom, bottom];
        })()
      : undefined;

  // A copy of the behind-UI for the lens to refract. It must stay fixed in screen
  // space while the sheet slides, so the glass slides *over* the static UI instead
  // of dragging it along. The outer wrapper counter-animates the sheet's slide:
  // it fills the glass, so its `-100%` exactly cancels the sheet's `100%` translate
  // (no measuring needed). The inner copy is anchored to the screen bottom and
  // spans the full screen so it registers with the real one; the sheet's
  // overflow:hidden clips it to the sheet.
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
            copy would read transparent → a dark fringe). The copy stays inset to
            its true screen rect so it still lines up with the real screen. */}
        <div
          style={{
            position: 'absolute',
            left: -screenBleed,
            right: -screenBleed,
            bottom: -screenBleed,
            height: screenH + screenBleed,
            background: 'var(--app-bg)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: screenBleed,
              right: screenBleed,
              top: 0,
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
