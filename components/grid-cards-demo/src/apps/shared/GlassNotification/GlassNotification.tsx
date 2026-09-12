'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
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
// The lift is a spring so a swipe's velocity carries straight into it (the
// timer's dismiss starts from rest and reads the same as the ease did).
const EXIT_TUCK = { ...motionTransition(easeOutQuick, 0.25), y: { type: 'spring' as const, visualDuration: 0.25, bounce: 0 } };
/** A swipe let go short of dismissing: back into the slot on the swoop's own spring. */
const SNAP_BACK = ENTER_TRANSITION.y;
// Starts fully OFF-SCREEN above the phone (clears the 70px slot + capsule +
// shadow), hard-squished on the horizontal axis.
// Base swoop, transforms only: a `filter` OR an `opacity` below 1 on the
// capsule makes it a backdrop root, which walls its frost's backdrop-filter
// off from the screen behind — the glass would read clear in flight and snap
// to frosted on landing (and go clear again the instant a dismiss began).
// Frost capsules fly on transforms alone, off-screen to off-screen, so the
// blur is live the WHOLE flight; the lens paths (GlassOver / WebGL, which
// don't use backdrop-filter) layer their fade and blur back on below.
const HIDDEN = { y: -150, scaleX: 0.25, scaleY: 0.55 };
const SHOWN = { y: 0, scaleX: 1, scaleY: 1 };
const DISMISSED = { y: -150, scaleX: 0.5, scaleY: 0.7 };
const LENS_HIDDEN = { ...HIDDEN, opacity: 0, filter: 'blur(10px)' };
// The resting capsule must still carry NO filter (a lingering blur(0px) is the
// same backdrop-root trap) — transitionEnd strips it when the swoop lands.
const LENS_SHOWN = {
  ...SHOWN,
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' as const },
};
const LENS_DISMISSED = { ...DISMISSED, opacity: 0, filter: 'blur(8px)' };
// A newer notification is taking the slot: the one there dissolves in place
// (blur-fade, a touch smaller) under the newcomer's swoop instead of tucking
// away first. The frost drops for the fade's 0.25s; the newcomer covers it.
const REPLACED = { scaleX: 0.92, scaleY: 0.92, opacity: 0, filter: 'blur(8px)' };
const REPLACE_OUT = motionTransition(easeOutQuick, 0.25);

/** What the variants read: the glass path, and whether an exit is a dismiss
 *  (the slot empties) or a hand-over (another notification is showing). */
interface CapsuleCustom {
  lens: boolean;
  replaced: boolean;
}
const CAPSULE_VARIANTS = {
  hidden: ({ lens }: CapsuleCustom) => (lens ? LENS_HIDDEN : HIDDEN),
  shown: ({ lens }: CapsuleCustom) => (lens ? LENS_SHOWN : SHOWN),
  exit: ({ lens, replaced }: CapsuleCustom) =>
    replaced
      ? { ...REPLACED, transition: REPLACE_OUT }
      : { ...(lens ? LENS_DISMISSED : DISMISSED), transition: EXIT_TUCK },
};
const REDUCED_VARIANTS = {
  hidden: { opacity: 0 },
  shown: { opacity: 1 },
  exit: { opacity: 0, transition: EXIT_TUCK },
};

/** A swipe up dismisses once it has come this far, or is this quick. */
const SWIPE_DISMISS_PX = 40;
const SWIPE_DISMISS_VELOCITY = 500;
/** Where along the dismiss a lift of `y` puts the capsule: 0 in its slot, 1 at
 *  the dismissed point. The drag scrubs the dismiss's own squash. */
const dismissProgress = (y: number) => Math.min(1, Math.max(0, y / DISMISSED.y));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

interface GlassNotificationProps {
  show: boolean;
  /** Which notification this is. A new id while one is showing brings a new
   *  capsule in over the old one dissolving; the same id swaps the text in
   *  place. Without it every show is the same capsule. */
  id?: string | number;
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
  /** The cardholder swipes the capsule up: the caller clears `show`. Without
   *  it the capsule doesn't drag. */
  onDismiss?: () => void;
}

/**
 * Figma 2343:49986 — the iOS 26 collapsed notification: a clear-glass capsule
 * with the app icon, title + one-line body, and a "now" stamp. Renders into
 * a full-screen layer (portal it into AppShell's overlay element to sit above
 * the status bar); the capsule itself is the tap target.
 */
export function GlassNotification({
  show,
  id,
  icon,
  badge,
  title,
  body,
  bodyLines = 1,
  time = 'now',
  backdropNode,
  renderSafariLens,
  onTap,
  onDismiss,
}: GlassNotificationProps) {
  const reduceMotion = useReducedMotion();
  const theme = useThemeMode();

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

  const glass = refract ? (
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
      tintBlur={4}
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
  );

  // One capsule per notification: a new id while one is up brings its own
  // capsule swooping in while the old one dissolves (the exit reads
  // `replaced` from the presence's custom at the moment it leaves).
  const custom: CapsuleCustom = { lens: lensMode, replaced: show };
  return (
    <div className={styles.layer} aria-live="polite">
      <AnimatePresence initial={false} custom={custom}>
        {show && (
          <Capsule key={id ?? 'notification'} custom={custom} reduceMotion={reduceMotion} onTap={onTap} onDismiss={onDismiss}>
            {glass}
          </Capsule>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CapsuleProps {
  custom: CapsuleCustom;
  reduceMotion: boolean | null;
  onTap?: () => void;
  onDismiss?: () => void;
  children: ReactNode;
}

/** The flying, draggable capsule: its own motion values, so two of them (one
 *  leaving, one arriving) never share a lift. */
function Capsule({ custom, reduceMotion, onTap, onDismiss, children }: CapsuleProps) {
  // The lift and squash, shared by the swoop, the drag, and the dismiss: the
  // drag sets them along the dismiss's path, and a release hands them,
  // position and speed, straight to whichever comes next.
  const y = useMotionValue(0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const scrubDismiss = () => {
    const t = dismissProgress(y.get());
    scaleX.set(lerp(SHOWN.scaleX, DISMISSED.scaleX, t));
    scaleY.set(lerp(SHOWN.scaleY, DISMISSED.scaleY, t));
  };
  // The shadow underlay carries the glass's exact squircle (blur runs after
  // the clip), so its corners agree in every browser.
  const { ref: shadowRef, style: shadowClipStyle } = useSquircleClip<HTMLSpanElement>({
    cornerRadii: [28.8, 28.8, 28.8, 28.8],
  });

  return (
    <motion.button
      type="button"
      className={styles.capsule}
      style={{ y, scaleX, scaleY }}
      custom={custom}
      variants={reduceMotion ? REDUCED_VARIANTS : CAPSULE_VARIANTS}
      initial="hidden"
      animate="shown"
      exit="exit"
      transition={ENTER_TRANSITION}
      // iOS: the banner swipes up and away. Free upward, a stiff rubber band
      // downward; the pull scrubs along the dismiss's own path (it squashes
      // as it goes, not a bare slide). Let go far or fast enough, the
      // dismiss finishes from where it is, at the speed it was going; let go
      // short, it springs back into its slot the way it arrived. A tap (not
      // a drag) is the tap.
      drag={onDismiss ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 1, bottom: 0.08 }}
      dragMomentum={false}
      onDrag={scrubDismiss}
      onDragEnd={(_, info) => {
        if (info.offset.y < -SWIPE_DISMISS_PX || info.velocity.y < -SWIPE_DISMISS_VELOCITY) {
          onDismiss?.();
          return;
        }
        animate(y, 0, SNAP_BACK);
        animate(scaleX, SHOWN.scaleX, ENTER_TRANSITION.scaleX);
        animate(scaleY, SHOWN.scaleY, ENTER_TRANSITION.scaleY);
      }}
      onTap={onTap}
    >
      {/* Blur on the OUTER span, clip on the INNER: clip-path applies after
          filters, so clipping the blurred element itself would re-harden the
          edge. */}
      <span className={styles.shadowBlob} aria-hidden>
        <span ref={shadowRef} className={styles.shadowShape} style={shadowClipStyle} />
      </span>
      {children}
    </motion.button>
  );
}
