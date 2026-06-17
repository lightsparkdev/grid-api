'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { GlassOver } from '@/components/liquid-glass';
import { headerGlassBrightness, useOverlayGlass } from '@/apps/shared/glass';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import styles from './GlassToast.module.scss';

/** iOS banner beat — settle, hold, exit back up. */
const HOLD_MS = 2200;
/** Off-screen start: clears the 62px resting slot + pill + the 40px-blur drop
 *  shadow above the screen edge (the phone screen's overflow does the clip). */
const ENTER_Y = -150;

// Drop in with the swift overshoot (the pill settles like an iOS banner); leave
// on the plain snappy curve so the exit never dips back into view.
const ENTER = motionTransition(easeOutSwift, 0.55);
const EXIT = motionTransition(easeOutSnappy, 0.4);

export interface GlassToastData {
  /** Re-trigger token — a new id restarts the hold even while visible. */
  id: number;
  text: string;
}

interface GlassToastProps {
  toast: GlassToastData | null;
  /** Hold elapsed — parent clears `toast`, which plays the exit. */
  onDismiss: () => void;
}

/**
 * GlassToast — a text-only liquid-glass pill that drops in from the top of the
 * phone screen, settles below the status bar (iOS banners land under the
 * Dynamic Island), holds for a beat, and slides back out. Render it in
 * AppShell's overlay layer (next to Face ID) so it rides above all screen
 * content; it's non-interactive, so the layer's pointer-events: none stands.
 *
 * Glass: the established small-pill recipe — GlassOver refracting the themed
 * neutral `--glass-symbol-backdrop` (same as the header symbol buttons).
 * Refracting the live UI behind a moving toast isn't portable (the lens bends
 * its own children, not the page — see the liquid-glass README).
 */
export function GlassToast({ toast, onDismiss }: GlassToastProps) {
  const reduceMotion = useReducedMotion();
  const overlayGlass = useOverlayGlass();
  const theme = useThemeMode();

  // Auto-dismiss on the toast's id (not the object): a re-trigger while visible
  // swaps the text in place and restarts the hold from zero.
  const holdTimer = useRef(0);
  useEffect(() => {
    if (!toast) return;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(onDismiss, HOLD_MS);
    return () => window.clearTimeout(holdTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);

  return (
    <div className={styles.layer} aria-live="polite">
      <AnimatePresence initial={false}>
        {toast && (
          <motion.div
            // ONE stable key: re-triggering keeps the element (text swaps, no
            // exit/enter crossfire), and a re-trigger mid-exit re-enters from
            // wherever the interrupted slide left the pill.
            key="toast"
            className={styles.pill}
            initial={reduceMotion ? { opacity: 0 } : { y: ENTER_Y }}
            animate={
              reduceMotion
                ? { opacity: 1, transition: ENTER }
                : { y: 0, transition: ENTER }
            }
            exit={
              reduceMotion
                ? { opacity: 0, transition: EXIT }
                : { y: ENTER_Y, transition: EXIT }
            }
          >
            <GlassOver
              className={styles.glass}
              backdrop="var(--glass-symbol-backdrop)"
              {...overlayGlass.text}
              // Same lens brightness as the header buttons (gear) — full white
              // soft-light on light, none on dark — so the pills read as one set.
              brightness={headerGlassBrightness(theme)}
            >
              <span className={styles.label}>{toast.text}</span>
            </GlassOver>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
