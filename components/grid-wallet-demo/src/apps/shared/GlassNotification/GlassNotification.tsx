'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FrostPanel, GlassOver, PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { TEXT_GLASS } from '@/apps/shared/glass';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import styles from './GlassNotification.module.scss';

/** The capsule's resting slot — callers building a refraction copy offset
 *  their screen-aligned content by these (keep in sync with .layer padding). */
export const NOTIFICATION_TOP_PX = 70;
export const NOTIFICATION_INSET_PX = 20;

const IS_SAFARI =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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
  /**
   * TRUE refraction source: a positioned copy of the screen behind the capsule
   * (offset by the slot constants above). When provided the capsule is a real
   * displacement lens (GlassOver) instead of the frosted FrostPanel.
   */
  backdropNode?: ReactNode;
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
  backdropNode,
  onTap,
}: GlassNotificationProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();
  // The shadow underlay carries the glass's exact squircle (blur runs after
  // the clip), so its corners agree in every browser.
  const { ref: shadowRef, style: shadowClipStyle } = useSquircleClip<HTMLSpanElement>({
    cornerRadii: [28.8, 28.8, 28.8, 28.8],
  });

  // WebKit can't run the displacement filter over a copied subtree at all
  // (verified: the filter output renders EMPTY except a dark premultiplied
  // specular ring — the parked refraction experiment's conclusion). Safari
  // gets the TRUE frosted material instead: backdrop-filter over the real,
  // live screen — perfectly synced by definition. Chromium keeps the lens.
  const refract = Boolean(backdropNode) && !IS_SAFARI;

  const inner = (
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
  );

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
            {/* Blur on the OUTER span, clip on the INNER: clip-path applies
                after filters, so clipping the blurred element itself would
                re-harden the edge. */}
            <span className={styles.shadowBlob} aria-hidden>
              <span ref={shadowRef} className={styles.shadowShape} style={shadowClipStyle} />
            </span>
            {refract ? (
              // TRUE refraction (Chromium): a displacement lens over the
              // caller-supplied screen copy. Per-corner radii route the glass
              // through its cross-browser squircle clip-path.
              <GlassOver
                className={styles.glass}
                backdropNode={backdropNode}
                {...TEXT_GLASS}
                // 24 × 1.2 superellipse compensation.
                radius={28.8}
                cornerRadii={[28.8, 28.8, 28.8, 28.8]}
                cornerSmoothing={PHONE_SHELL_GLASS.cornerSmoothing}
                // Pronounced lensing (the issuance X's tuning family) — the
                // aurora is soft, so the bend needs muscle to read.
                depth={2}
                scale={22}
                splay={0.7}
                chromaticAberration={0.5}
                // Prominent specular highlight on a hairline rim.
                edgeStrength={1.6}
                edgeWidth={1}
                specularStrength={1.6}
                // TEXT_GLASS's 128px map is built for small pills — stretched
                // across the 362px capsule it goes blocky. Full-res map here.
                mapSize={512}
                // iOS-material frost over the refraction (GPU backdrop-filter,
                // not the SVG blur). Milkier on light so the dark ink reads
                // against the vivid field.
                tint={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.55)'}
                tintBlur={1}
              >
                {inner}
              </GlassOver>
            ) : (
              // Frost (Safari + no-backdrop callers): backdrop-filter over the
              // REAL screen — live-synced, squircle-clipped, iOS material.
              <FrostPanel
                className={styles.glass}
                radius={28.8}
                cornerSmoothing={PHONE_SHELL_GLASS.cornerSmoothing}
                tint={theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.62)'}
                tintBlur={24}
                // Quiet rim body so the bright top glint reads specular, not
                // like a uniform stroke.
                edge="rgba(255, 255, 255, 0.16)"
              >
                {inner}
              </FrostPanel>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
