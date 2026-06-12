'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FrostPanel, PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import styles from './GlassNotification.module.scss';

// Swoop-in: starts far (small), SQUISHED (flatter than wide) and blurred, and
// arcs down out of the Z axis — the bouncy springs overshoot past 1 so it
// lands with a squash before settling crisp (the backward-J side profile).
// Dismiss tucks back up quickly.
const ENTER_TRANSITION = {
  y: { type: 'spring' as const, visualDuration: 0.55, bounce: 0.45 },
  // Wide-squash lands with only a whisper of overshoot so the capsule never
  // pokes past the screen edges (it's 20px off them).
  scaleX: { type: 'spring' as const, visualDuration: 0.6, bounce: 0.3 },
  scaleY: { type: 'spring' as const, visualDuration: 0.55, bounce: 0.4 },
  opacity: motionTransition(easeOutQuick, 0.2),
  filter: motionTransition(easeOutQuick, 0.3),
};
const EXIT_TUCK = motionTransition(easeOutQuick, 0.25);
// Starts fully OFF-SCREEN above the phone (clears the 70px slot + capsule +
// shadow), hard-squished on the horizontal axis.
const HIDDEN = { y: -150, scaleX: 0.25, scaleY: 0.55, opacity: 0, filter: 'blur(10px)' };
const SHOWN = { y: 0, scaleX: 1, scaleY: 1, opacity: 1, filter: 'blur(0px)' };
const DISMISSED = { y: -150, scaleX: 0.5, scaleY: 0.7, opacity: 0, filter: 'blur(8px)' };

interface GlassNotificationProps {
  show: boolean;
  /** App icon image (rounded-square, rendered at 38px). */
  icon: string;
  title: string;
  body: string;
  /** Trailing timestamp label, e.g. "now". */
  time?: string;
  onTap?: () => void;
}

/**
 * Figma 2343:49986 — the iOS 26 collapsed notification: a clear-glass capsule
 * with the app icon, title + one-line body, and a "now" stamp. Renders into
 * a full-screen layer (portal it into AppShell's overlay element to sit above
 * the status bar); the capsule itself is the tap target.
 */
export function GlassNotification({
  show,
  icon,
  title,
  body,
  time = 'now',
  onTap,
}: GlassNotificationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.layer} aria-live="polite">
      <AnimatePresence initial={false}>
        {show && (
          <motion.button
            key="notification"
            type="button"
            className={styles.capsule}
            initial={reduceMotion ? { opacity: 0 } : HIDDEN}
            animate={reduceMotion ? { opacity: 1 } : SHOWN}
            exit={
              reduceMotion
                ? { opacity: 0, transition: EXIT_TUCK }
                : { ...DISMISSED, transition: EXIT_TUCK }
            }
            transition={ENTER_TRANSITION}
            onClick={onTap}
          >
            {/* Real glass: FrostPanel clips with the true squircle path (the
                shell's corner smoothing) and carries the tint + frost. The
                drop shadow lives on the button wrapper, outside the clip. */}
            <FrostPanel
              className={styles.glass}
              // 24 × 1.2 — the superellipse smoothing reads tighter than the
              // nominal radius, so Figma's 24 needs the compensation.
              radius={28.8}
              cornerSmoothing={PHONE_SHELL_GLASS.cornerSmoothing}
              tint="rgba(255, 255, 255, 0.14)"
              tintBlur={28}
              // Quiet rim body so the bright top glint reads as a specular
              // highlight rather than a uniform stroke.
              edge="rgba(255, 255, 255, 0.16)"
            >
              <span className={styles.inner}>
                <img className={styles.icon} src={icon} alt="" draggable={false} />
                <span className={styles.texts}>
                  <span className={styles.titleRow}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.time}>{time}</span>
                  </span>
                  <span className={styles.body}>{body}</span>
                </span>
              </span>
            </FrostPanel>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
