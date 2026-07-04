'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FrostPanel, GlassOver, PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { TEXT_GLASS } from '@/apps/shared/glass';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { useThemeMode } from '@/hooks/useThemeMode';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import styles from './GlassNotification.module.scss';

/** The capsule's resting slot — callers building a refraction copy offset
 *  their screen-aligned content by these (keep in sync with .layer padding). */
export const NOTIFICATION_TOP_PX = 64;
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
// Base swoop (no self-blur): any `filter` on the capsule makes it a backdrop
// root, which kills the frost path's backdrop-filter — the glass would only
// come alive once the spring settled. Frost capsules fly filter-free so the
// blur is live the WHOLE flight; the lens paths (GlassOver / WebGL, which
// don't use backdrop-filter) layer their entrance blur back on below.
const HIDDEN = { y: -150, scaleX: 0.25, scaleY: 0.55, opacity: 0 };
const SHOWN = { y: 0, scaleX: 1, scaleY: 1, opacity: 1 };
const DISMISSED = { y: -150, scaleX: 0.5, scaleY: 0.7, opacity: 0 };
const LENS_HIDDEN = { ...HIDDEN, filter: 'blur(10px)' };
// The resting capsule must still carry NO filter (a lingering blur(0px) is the
// same backdrop-root trap) — transitionEnd strips it when the swoop lands.
const LENS_SHOWN = {
  ...SHOWN,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' as const },
};
const LENS_DISMISSED = { ...DISMISSED, filter: 'blur(8px)' };

interface GlassNotificationProps {
  show: boolean;
  /** App icon image (rounded-square, rendered at 38px). */
  icon: string;
  /**
   * Overlaps the icon's bottom-right corner at 20px (the iOS sender-avatar
   * badge — e.g. the Messages app icon on an SMS). A string renders as an
   * image; a node renders as-is.
   */
  badge?: ReactNode | string;
  title: string;
  body: string;
  /** Body line budget — 1 (default) keeps the nowrap ellipsis; more lines
   *  wrap and clamp (the SMS notification's two-line body). */
  bodyLines?: number;
  /** Trailing timestamp label, e.g. "now". */
  time?: string;
  /**
   * TRUE refraction source: a positioned copy of the screen behind the capsule
   * (offset by the slot constants above). When provided the capsule is a real
   * displacement lens (GlassOver) instead of the frosted FrostPanel.
   */
  backdropNode?: ReactNode;
  /** Safari-only injected WebGL lens. Skins with a live refraction field (e.g.
   *  Aurora) provide it; others omit it and the capsule frosts. Keeps this
   *  shared component skin-blind — no skin-specific effect lives here. */
  renderSafariLens?: (args: {
    inner: ReactNode;
    className?: string;
    radius: number;
    cornerSmoothing: number;
    tint: string;
    onUnavailable: () => void;
  }) => ReactNode;
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
  badge,
  title,
  body,
  bodyLines = 1,
  time = 'now',
  backdropNode,
  renderSafariLens,
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
  // specular ring). Safari instead uses a caller-injected WebGL lens
  // (`renderSafariLens`) when the skin supplies one; otherwise it frosts.
  // Chromium keeps the SVG displacement lens.
  const refract = Boolean(backdropNode) && !IS_SAFARI;
  // Runtime fallback: if WebGL context creation fails, drop to the frost.
  const [lensFailed, setLensFailed] = useState(false);
  const webglLens =
    Boolean(backdropNode) && IS_SAFARI && !lensFailed && Boolean(renderSafariLens);
  // Lens capsules (no backdrop-filter involved) keep the entrance self-blur;
  // frost capsules must fly filter-free — see the variant comment above.
  const lensMode = refract || webglLens;

  const multiline = bodyLines > 1;
  const inner = (
    <span className={styles.inner} data-multiline={multiline || undefined}>
      <span className={styles.iconWrap}>
        <img className={styles.icon} src={icon} alt="" draggable={false} />
        {badge != null && (
          <span className={styles.badge} aria-hidden>
            {typeof badge === 'string' ? (
              <img src={badge} alt="" draggable={false} />
            ) : (
              badge
            )}
          </span>
        )}
      </span>
      <span className={styles.texts}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          <span className={styles.time}>{time}</span>
        </span>
        <span
          className={styles.body}
          data-clamp={multiline || undefined}
          style={multiline ? { WebkitLineClamp: bodyLines } : undefined}
        >
          {body}
        </span>
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
            initial={reduceMotion ? { opacity: 0 } : lensMode ? LENS_HIDDEN : HIDDEN}
            animate={reduceMotion ? { opacity: 1 } : lensMode ? LENS_SHOWN : SHOWN}
            exit={
              reduceMotion
                ? { opacity: 0, transition: EXIT_TUCK }
                : { ...(lensMode ? LENS_DISMISSED : DISMISSED), transition: EXIT_TUCK }
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
            ) : webglLens ? (
              // Safari: the skin's injected WebGL lens (recomputes its refraction
              // without the SVG filter). Same capsule shape + themed tint as the
              // GlassOver above; the skin owns the field-specific optics.
              renderSafariLens!({
                inner,
                className: styles.glass,
                radius: 28.8,
                cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
                tint: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.55)',
                onUnavailable: () => setLensFailed(true),
              })
            ) : (
              // Frost (Safari + no-backdrop callers): backdrop-filter over the
              // REAL screen — live-synced, squircle-clipped, iOS material.
              // Light tint carries a hint of iOS systemGray so the capsule
              // reads as a distinct translucent layer even over a flat white
              // app (pure white milk on white looked opaque).
              <FrostPanel
                className={styles.glass}
                radius={28.8}
                cornerSmoothing={PHONE_SHELL_GLASS.cornerSmoothing}
                tint={theme === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(242, 242, 247, 0.7)'}
                tintBlur={24}
                // Baked geometry-aware specular (the glass buttons' highlight):
                // hot rim on the lit corners along the diagonal, so the frost
                // reads as glass rather than a flat material. Replaces the flat
                // hairline stroke (edge) so the rim isn't doubled.
                edge="none"
                specular={{
                  rotation: 45,
                  edgeStrength: 1.7,
                  edgeWidth: 1.5,
                  glowStrength: 0.1,
                  strength: 1.6,
                }}
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
