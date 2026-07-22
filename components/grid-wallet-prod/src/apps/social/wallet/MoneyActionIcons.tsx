'use client';

import { useEffect, useId, useRef } from 'react';
import { animate, cubicBezier } from 'motion/react';

/**
 * Self-animating Deposit / Withdraw / Send glyphs for the money action chips.
 *
 * Each icon is a faithful rebuild of its central icon (same 24×24 geometry,
 * stroke 2, round caps) split into animatable parts. Bumping `playKey` plays
 * one loop cycle:
 *
 * - Deposit: the arrow dives into the tray (clipped at the rim so it reads as
 *   going *inside*), the tray widens to swallow it, and a twin arrow drops in
 *   from above to land in the rest pose.
 * - Withdraw: the arrow launches out the top, the tray pinches narrower, and a
 *   twin arrow rises out of the box mouth into the rest pose.
 * - Send: the plane rolls 360° about its crease line (rotate→scaleY→unrotate,
 *   Safari-safe fake 3D) while flying off along its nose direction; a twin
 *   flies in from the opposite side and lands at rest.
 *
 * Cycles always run to completion (end state is visually identical to rest),
 * and re-triggers mid-flight are ignored so the choreography never snaps.
 */

const STROKE = {
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

// Exact path data from @central-icons-react round-outlined-radius-2-stroke-2.
const TRAY_IN = 'M20 15V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V15';
const ARROW_IN = 'M12 14.5V4M12 14.5L8.5 11M12 14.5L15.5 11';
const TRAY_OUT = 'M20 14.75V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V14.75';
const ARROW_OUT = 'M12 4V15.25M12 4L16.5 8.5M12 4L7.5 8.5';
const PLANE =
  'M9.61946 10.8613L20.9997 4.55422M9.04735 10.9043L4.10061 5.68812C3.49632 5.05091 3.94803 4 4.82621 4H20.2513C21.0247 4 21.5054 4.84039 21.1132 5.50702L13.1902 18.9762C12.7433 19.7358 11.6035 19.5879 11.3654 18.7393L9.28458 11.3223C9.24066 11.1658 9.15923 11.0223 9.04735 10.9043Z';

// Arrow travel with a whisper of overshoot — the landing arrow dips a hair
// past rest (into the box mouth) and settles back.
const travelEase = cubicBezier(0.6, 0.05, 0.25, 1.12);
const flightEase = cubicBezier(0.55, 0.05, 0.3, 1);

/** Half-sine pulse: 0 outside [a, b], peaking at 1 in the middle. */
function pulse(t: number, a: number, b: number) {
  if (t <= a || t >= b) return 0;
  return Math.sin(Math.PI * ((t - a) / (b - a)));
}

/** Horizontal scale about the icon's center line (x = 12). */
function trayScale(s: number) {
  return `translate(${12 * (1 - s)} 0) scale(${s} 1)`;
}

/**
 * Drives one animation cycle per distinct `playKey` (0 = idle). A running
 * cycle is never restarted or stopped by a new key — it finishes first.
 */
function useIconCycle(playKey: number, duration: number, apply: (t: number) => void) {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    if (!playKey || playingRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    playingRef.current = true;
    controlsRef.current = animate(0, 1, {
      duration,
      ease: 'linear',
      onUpdate: (t) => applyRef.current(t),
      onComplete: () => {
        playingRef.current = false;
      },
    });
  }, [playKey, duration]);

  useEffect(() => () => controlsRef.current?.stop(), []);
}

interface ActionIconProps {
  size?: number;
  playKey?: number;
}

export function DepositIcon({ size = 20, playKey = 0 }: ActionIconProps) {
  const clipId = useId();
  const trayRef = useRef<SVGPathElement>(null);
  const arrowsRef = useRef<SVGGElement>(null);

  useIconCycle(playKey, 0.6, (t) => {
    const y = 18 * travelEase(t);
    const s = 1 + 0.14 * pulse(t, 0.15, 0.8);
    arrowsRef.current?.setAttribute('transform', `translate(0 ${y})`);
    trayRef.current?.setAttribute('transform', trayScale(s));
  });

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        {/* The arrow stays visible through the open box (outline only) and
            vanishes at the inner edge of the box floor (y = 19). */}
        <clipPath id={clipId}>
          <rect x="-12" y="-30" width="48" height="49" />
        </clipPath>
      </defs>
      <path ref={trayRef} d={TRAY_IN} {...STROKE} />
      <g clipPath={`url(#${clipId})`}>
        <g ref={arrowsRef}>
          <path d={ARROW_IN} {...STROKE} />
          <path d={ARROW_IN} transform="translate(0 -18)" {...STROKE} />
        </g>
      </g>
    </svg>
  );
}

export function WithdrawIcon({ size = 20, playKey = 0 }: ActionIconProps) {
  const clipId = useId();
  const trayRef = useRef<SVGPathElement>(null);
  const arrowsRef = useRef<SVGGElement>(null);

  useIconCycle(playKey, 0.6, (t) => {
    const y = -18 * travelEase(t);
    const s = 1 - 0.13 * pulse(t, 0.05, 0.7);
    arrowsRef.current?.setAttribute('transform', `translate(0 ${y})`);
    trayRef.current?.setAttribute('transform', trayScale(s));
  });

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        {/* Cut just below the resting tail cap (y ≈ 16.25) — the rising twin
            arrow stays hidden until it emerges from the box mouth. */}
        <clipPath id={clipId}>
          <rect x="-12" y="-30" width="48" height="46.5" />
        </clipPath>
      </defs>
      <path ref={trayRef} d={TRAY_OUT} {...STROKE} />
      <g clipPath={`url(#${clipId})`}>
        <g ref={arrowsRef}>
          <path d={ARROW_OUT} {...STROKE} />
          <path d={ARROW_OUT} transform="translate(0 18)" {...STROKE} />
        </g>
      </g>
    </svg>
  );
}

// Crease line of the paper plane: (9.619, 10.861) → (21.000, 4.554); the roll
// axis. Flight direction is along this line, out the nose.
const CREASE_DEG = -28.99;
const CREASE_X = 15.31;
const CREASE_Y = 7.708;
// 26 units along the crease direction — far enough that both planes are fully
// outside the viewBox at their off-screen ends (stroke included).
const FLY_X = 22.74;
const FLY_Y = -12.61;

/** Roll about the crease line: rotate it level, squash, rotate back. */
function planeRoll(s: number) {
  return (
    `rotate(${CREASE_DEG} ${CREASE_X} ${CREASE_Y}) ` +
    `translate(${CREASE_X} ${CREASE_Y}) scale(1 ${s}) translate(${-CREASE_X} ${-CREASE_Y}) ` +
    `rotate(${-CREASE_DEG} ${CREASE_X} ${CREASE_Y})`
  );
}

export function SendIcon({ size = 20, playKey = 0 }: ActionIconProps) {
  const flyRef = useRef<SVGGElement>(null);
  const rollARef = useRef<SVGGElement>(null);
  const rollBRef = useRef<SVGGElement>(null);

  useIconCycle(playKey, 0.72, (t) => {
    const f = flightEase(t);
    // Wing fold, no flip: the outgoing plane tucks its sides in toward the
    // crease as it streamlines away (1 → 0.08), the incoming one arrives
    // tucked and unfolds to full spread as it lands (0.08 → 1).
    flyRef.current?.setAttribute('transform', `translate(${FLY_X * f} ${FLY_Y * f})`);
    rollARef.current?.setAttribute('transform', planeRoll(1 - 0.92 * f));
    rollBRef.current?.setAttribute('transform', planeRoll(0.08 + 0.92 * f));
  });

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g ref={flyRef}>
        <g ref={rollARef}>
          <path d={PLANE} {...STROKE} />
        </g>
        <g transform={`translate(${-FLY_X} ${-FLY_Y})`}>
          <g ref={rollBRef}>
            <path d={PLANE} {...STROKE} />
          </g>
        </g>
      </g>
    </svg>
  );
}
