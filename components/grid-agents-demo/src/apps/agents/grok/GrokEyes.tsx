import { useEffect, useId, useRef } from 'react';
import styles from './GrokEyes.module.scss';

/*
 * Grok Bot's face: two white capsules on a black disc, driven frame by frame
 * from the recordings (60fps, recordings 10-13). The eyes drift together and
 * tilt as they look around, morph between tall capsules, dots and tilted ovals,
 * blink with a ~90ms squash, and while the bot works they roll up and out of
 * the top, leave the face empty for ~80ms, and come back in from the bottom.
 * Everything runs on one requestAnimationFrame loop writing SVG attributes, so
 * nothing re-renders.
 */

type Mode = 'idle' | 'working';

/** One eye pose in the 26-unit face. */
interface Pose {
  dx: number;
  dy: number;
  rot: number;
  w: number;
  h: number;
}

const REST: Pose = { dx: 0, dy: 0, rot: 0, w: 4, h: 8 };
/** The header avatar looks up and to the right, as the app's icon does. */
const HEADER: Pose = { dx: 2.6, dy: -3, rot: 18, w: 3.8, h: 7 };
const SHAPES: Pick<Pose, 'w' | 'h' | 'rot'>[] = [
  { w: 4, h: 8, rot: 0 },
  { w: 4.4, h: 4.4, rot: 0 },
  { w: 5, h: 7, rot: 22 },
  { w: 3.6, h: 8.6, rot: -12 },
];

const GAP = 3.6;
const CENTER_Y = 12.5;

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Pose, b: Pose, t: number): Pose => ({
  dx: lerp(a.dx, b.dx, t),
  dy: lerp(a.dy, b.dy, t),
  rot: lerp(a.rot, b.rot, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

export function GrokEyes({
  size = 26,
  mode = 'idle',
  header = false,
  live = false,
  className,
}: {
  size?: number;
  mode?: Mode;
  /** The header's slower, upward-looking face. */
  header?: boolean;
  /** The green dot the header avatar wears while the bot works. */
  live?: boolean;
  className?: string;
}) {
  const clip = `grok-face-${useId().replace(/:/g, '')}`;
  const left = useRef<SVGRectElement>(null);
  const right = useRef<SVGRectElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const base = header ? HEADER : REST;
    let from: Pose = base;
    let to: Pose = base;
    let moveStart = 0;
    let moveDur = 1;
    let nextMove = performance.now() + rand(600, 1400);
    let blinkAt = performance.now() + rand(1800, 3800);
    let rollAt = performance.now() + rand(2600, 4200);
    let roll: { start: number } | null = null;
    let raf = 0;

    const draw = (p: Pose, lift: number, squash: number) => {
      const h = Math.max(0.6, p.h * squash);
      for (const [el, side] of [
        [left.current, -1],
        [right.current, 1],
      ] as const) {
        if (!el) continue;
        const cx = 13 + side * GAP + p.dx;
        const cy = CENTER_Y + p.dy + lift;
        el.setAttribute('x', String(cx - p.w / 2));
        el.setAttribute('y', String(cy - h / 2));
        el.setAttribute('width', String(p.w));
        el.setAttribute('height', String(h));
        el.setAttribute('rx', String(Math.min(p.w, h) / 2));
        el.setAttribute('transform', `rotate(${p.rot} ${cx} ${cy})`);
      }
    };

    const tick = (now: number) => {
      const working = modeRef.current === 'working';
      const pace = header ? 1.8 : working ? 0.75 : 1.2;

      if (now >= nextMove) {
        from = mix(from, to, ease(Math.min(1, (now - moveStart) / moveDur)));
        const shape = Math.random() < (working ? 0.45 : 0.25) ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : null;
        const reach = header ? 1.2 : 3;
        to = {
          dx: base.dx + rand(-reach, reach),
          dy: base.dy + rand(-reach, reach) * 0.8,
          rot: shape ? shape.rot : header ? base.rot + rand(-6, 6) : rand(-25, 25) * (working ? 1 : 0.4),
          w: shape ? shape.w : base.w,
          h: shape ? shape.h : base.h,
        };
        moveStart = now;
        moveDur = rand(180, 260) * (header ? 1.5 : 1);
        nextMove = now + rand(700, 1900) * pace;
      }
      const pose = mix(from, to, ease(Math.min(1, (now - moveStart) / moveDur)));

      // Blink: a 90ms vertical squash.
      let squash = 1;
      if (now >= blinkAt) {
        const t = (now - blinkAt) / 90;
        if (t >= 1) blinkAt = now + rand(2400, 5200) * pace;
        else squash = t < 0.5 ? 1 - t * 1.8 : 0.1 + (t - 0.5) * 1.8;
      }

      // Roll: out the top in 250ms, empty for 80ms, back from the bottom in 150ms.
      let lift = 0;
      if (working && !header && !roll && now >= rollAt) roll = { start: now };
      if (roll) {
        const t = now - roll.start;
        if (t < 250) lift = -26 * easeIn(t / 250);
        else if (t < 330) lift = -40;
        else if (t < 480) lift = 26 * (1 - easeOut((t - 330) / 150));
        else {
          roll = null;
          rollAt = now + rand(3800, 6500);
        }
      }

      draw(pose, lift, squash);
      raf = requestAnimationFrame(tick);
    };

    draw(base, 0, 1);
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [header]);

  return (
    <span className={`${styles.face} ${className ?? ''}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 26 26" width={size} height={size}>
        <defs>
          <clipPath id={clip}>
            <circle cx="13" cy="13" r="13" />
          </clipPath>
        </defs>
        <circle cx="13" cy="13" r="13" className={styles.disc} />
        <g clipPath={`url(#${clip})`} className={styles.eyes}>
          <rect ref={left} />
          <rect ref={right} />
        </g>
      </svg>
      {live && <span className={styles.live} />}
    </span>
  );
}
