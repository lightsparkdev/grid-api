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
}

/** iOS-style glass bottom sheet — composable content slot. */
export function BottomSheet({
  open,
  onDismiss,
  children,
  glass,
  backdrop = AUTH_GLASS_BACKDROP,
  behind,
}: BottomSheetProps) {
  const overlayGlass = useOverlayGlass();
  const sheetGlass = glass ?? overlayGlass.sheet;

  // Measure the overlay (= the screen the sheet covers) so the refracted copy can
  // span it and register with the real screen behind. offsetHeight is the layout
  // height (pre-transform), the value we need in the glass's local space.
  const [screenH, setScreenH] = useState(0);
  const roRef = useRef<ResizeObserver | null>(null);
  const overlayRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    if (!el) return;
    const measure = () => setScreenH(el.offsetHeight);
    measure();
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);
  }, []);

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
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: screenH,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {behind}
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
