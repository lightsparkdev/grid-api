'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { PHONE_SHELL_GLASS, squirclePath } from '@/components/liquid-glass';
import { easeOutSnappy, easeOutSwift } from '@/lib/easing';
import styles from './FaceIdAuth.module.scss';

/**
 * FaceIdAuth — the iOS "authenticate from the Dynamic Island" moment.
 *
 * A black pill (the Dynamic Island) fades in, springs open into the square Face
 * ID bezel, plays the scan → checkmark clip, then collapses back to the pill and
 * fades out. Driven once per `active` rising edge; calls `onDone` when the whole
 * sequence (including the exit) has finished, so the caller can sequence what
 * comes next (e.g. reveal the wallet).
 *
 * Shape — faithful iOS superellipse on EVERY browser, using the SAME tuned curve
 * as the phone bezel and bottom sheet (`PHONE_SHELL_GLASS.cornerSmoothing`). The
 * corner is traced with `clip-path: path()` (Safari ignores `corner-shape`, so the
 * same clip-path hack the shell/sheet use). The scan video has a black background,
 * so it blends seamlessly into the black bezel as it cross-fades in and out.
 * A progressive backdrop blur (2px → 0) grows behind the island during expand.
 */

// iPhone 16 Pro Dynamic Island ≈ 125 × 37, 11px from the top.
const PILL_W = 125;
const PILL_H = 37;
const PILL_R = PILL_H / 2; // full pill — circular ends
const ISLAND_TOP = 11;

// Frosted band behind the island — status bar down through the bezel + this much.
const BLUR_EXTEND_BELOW = 40;

// Figma 2204:48169 — official Apple Face ID bezel.
const BEZEL = 151;
const BEZEL_R = 48; // Figma 40, ×1.2 by eye
// Same tuned superellipse as the phone shell + bottom sheet, so the Face ID card's
// corners read identically to the bezel it sits inside.
const BEZEL_SMOOTHING = PHONE_SHELL_GLASS.cornerSmoothing;
// box-shadow (not filter: drop-shadow): a drop-shadow filter re-rasterizes + re-
// blurs the whole clipped shape every frame as the bezel morphs, which stutters
// the exit. box-shadow follows the (animated) border-radius and composites cheaply;
// at 0.12 smoothing + a 37px blur the circular-vs-superellipse corner is invisible.
const BEZEL_SHADOW = '0px 12px 37px rgba(0, 0, 0, 0.22)';

const VIDEO_SRC = '/refs/face-id.mp4';
// Pre-blurred last frame (checkmark). Cross-faded in on exit so the checkmark can
// "blur out" with zero runtime filter — a CSS blur() on a <video> drops frames.
const VIDEO_BLUR_SRC = '/refs/face-id-check-blur.png';
// The clip was screen-recorded @3x (240px native), so it's meant to render at its
// 1x size — 240 ÷ 3 = 80px — centered in the bezel, like the Figma symbol, rather
// than stretched edge-to-edge.
const VIDEO_SIZE = 80;
// The checkmark is fully drawn by ~0.95s; the rest of the clip is a frozen tail.
// Start the exit the moment it lands so the bezel never sits on the static frame.
const CHECKMARK_AT = 1.0; // seconds into playback
const CHECKMARK_CAP_MS = 1700; // safety cap if currentTime never reaches it

const COLLAPSE_DUR = 0.42;
// Checkmark fully invisible this far into the collapse (opacity track, not scale).
const MARK_GONE_AT = COLLAPSE_DUR * 0.15;
// Scale the checkmark down to roughly pill-sized by collapse end.
const MARK_SCALE_END = 0.38;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const delay = (s: number) => new Promise<void>((r) => setTimeout(r, s * 1000));

/** Resolves once the video reaches `t` seconds (checkmark landed), or it ends, or
 *  the cap elapses — so the exit never waits on the clip's frozen tail. */
function waitForVideoTime(v: HTMLVideoElement | null, t: number, capMs: number): Promise<void> {
  return new Promise((resolve) => {
    if (!v) {
      setTimeout(resolve, capMs);
      return;
    }
    const start = performance.now();
    const tick = () => {
      if (v.currentTime >= t || v.ended || performance.now() - start > capMs) {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

interface FaceIdAuthProps {
  /** Rising edge runs the full pill → Face ID → pill sequence once. */
  active: boolean;
  /** Fired after the exit animation completes. */
  onDone: () => void;
}

export function FaceIdAuth({ active, onDone }: FaceIdAuthProps) {
  // 0 = Dynamic Island pill, 1 = Face ID bezel.
  const progress = useMotionValue(0);
  const width = useTransform(progress, (v) => lerp(PILL_W, BEZEL, v));
  const height = useTransform(progress, (v) => lerp(PILL_H, BEZEL, v));
  const blurHeight = useTransform(height, (h) => ISLAND_TOP + h + BLUR_EXTEND_BELOW);
  // 0 → 1 with expand/collapse — scales backdrop blur from 0 to max.
  const blurStrength = useTransform(progress, (v) => v);
  // Drives the box-shadow corner (the visible bezel is the squircle clip below).
  const radius = useTransform(progress, (v) => lerp(PILL_R, BEZEL_R, v));
  const shellOpacity = useMotionValue(0);
  const videoOpacity = useMotionValue(0);
  // Wrapper opacity — fades the checkmark layer on its own track while scale tracks
  // the bezel collapse. Prevents the sharp <video> bleeding through the blur still.
  const markOpacity = useMotionValue(1);
  const videoScaleV = useMotionValue(1);
  const blurOpacity = useMotionValue(0);

  const innerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Recompute the superellipse clip each frame so the corner stays a true squircle
  // on every browser as it morphs (pill: r=h/2, smoothing 0 → bezel: r=40, the
  // shell's tuned smoothing). Imperative so the path stays in lockstep with size.
  const applyClip = (v: number) => {
    const el = innerRef.current;
    if (!el) return;
    const w = lerp(PILL_W, BEZEL, v);
    const h = lerp(PILL_H, BEZEL, v);
    const r = lerp(PILL_R, BEZEL_R, v);
    const smoothing = BEZEL_SMOOTHING * v;
    // 16 samples/corner — plenty smooth at this size, and a shorter path string is
    // cheaper to re-clip each frame during the morph.
    const path = `path('${squirclePath(w, h, r, smoothing, 16)}')`;
    el.style.clipPath = path;
    el.style.setProperty('-webkit-clip-path', path);
  };
  useMotionValueEvent(progress, 'change', applyClip);
  useLayoutEffect(() => {
    applyClip(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const video = videoRef.current;

    const cycle = async () => {
      // Reset to the idle pill.
      progress.set(0);
      shellOpacity.set(0);
      videoOpacity.set(0);
      markOpacity.set(1);
      videoScaleV.set(1);
      blurOpacity.set(0);
      applyClip(0);
      if (video) {
        try {
          video.pause();
          video.currentTime = 0;
        } catch {}
      }

      // 1 — Dynamic Island pill fades in.
      await animate(shellOpacity, 1, { duration: 0.22, ease: 'easeOut' }).finished;
      if (cancelled) return;

      // 2 — pill springs open into the Face ID bezel (slight iOS overshoot). Don't
      //     fully await it — kick the scan off partway through so the video is
      //     already going as the bezel finishes opening.
      const expand = animate(progress, 1, { duration: 0.5, ease: easeOutSwift });
      await delay(0.3);
      if (cancelled) return;

      // 3 — scan video plays + cross-fades in. Fire play() without awaiting so a
      //     slow or blocked play can never hang the sequence.
      if (video) {
        try {
          video.currentTime = 0;
        } catch {}
        void video.play().catch(() => {});
      }
      animate(videoOpacity, 1, { duration: 0.25, ease: 'easeOut' });
      await expand.finished;
      if (cancelled) return;

      // 4 — wait only until the checkmark has landed (skip the frozen tail).
      await waitForVideoTime(video, CHECKMARK_AT, CHECKMARK_CAP_MS);
      if (cancelled) return;

      // 5 — exit. Opacity and scale are on separate tracks: the checkmark blurs out
      //     and fades away early (gone by ~30% of the collapse), while scale runs
      //     the full collapse alongside the bezel. Only one layer is visible at a
      //     time so the sharp <video> never bleeds through the blur still.
      if (video) {
        try {
          video.pause();
        } catch {}
      }
      videoOpacity.set(0);
      blurOpacity.set(1);

      const collapse = animate(progress, 0, { duration: COLLAPSE_DUR, ease: easeOutSnappy });
      animate(videoScaleV, MARK_SCALE_END, { duration: COLLAPSE_DUR, ease: easeOutSnappy });
      animate(markOpacity, 0, { duration: MARK_GONE_AT, ease: 'easeIn' });

      await collapse.finished;
      if (cancelled) return;

      // Hard reset so nothing ghosts into the next cycle.
      blurOpacity.set(0);
      markOpacity.set(0);
      videoOpacity.set(0);
      videoScaleV.set(1);

      // 6 — pill fades out.
      await animate(shellOpacity, 0, { duration: 0.22, ease: 'easeIn' }).finished;
    };

    const run = async () => {
      try {
        await cycle();
      } catch {
        // An interrupted animation can reject its `.finished`; fall through so
        // onDone still fires and the sign-in flow never hangs.
      }
      if (!cancelled) onDone();
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <>
      <motion.div
        aria-hidden
        className={styles.progressiveBlur}
        style={{
          height: blurHeight,
          ['--face-id-blur-strength' as string]: blurStrength,
          willChange: 'height',
        }}
      >
        <div className={`${styles.blurLayer} ${styles.blurStrong}`} />
        <div className={`${styles.blurLayer} ${styles.blurMid}`} />
        <div className={`${styles.blurLayer} ${styles.blurSoft}`} />
      </motion.div>
      <motion.div
        aria-hidden
        className={styles.bezel}
        style={{
          top: ISLAND_TOP,
          left: '50%',
          x: '-50%',
          width,
          height,
          borderRadius: radius,
          boxShadow: BEZEL_SHADOW,
          opacity: shellOpacity,
          willChange: 'width, height, opacity',
        }}
      >
        <div
          ref={innerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            style={{
              position: 'relative',
              width: VIDEO_SIZE,
              height: VIDEO_SIZE,
              flexShrink: 0,
              scale: videoScaleV,
              opacity: markOpacity,
              willChange: 'transform, opacity',
            }}
          >
            <motion.video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: videoOpacity,
                pointerEvents: 'none',
              }}
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </motion.video>
            <motion.img
              src={VIDEO_BLUR_SRC}
              alt=""
              aria-hidden
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: blurOpacity,
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
