import { useEffect, useId, useRef } from 'react';
import styles from './GrokEyes.module.scss';

/*
 * Grok Bot's face, measured from recording 10 at 60fps (in a 26-unit disc):
 * - The status row's face rests with two tall capsules (5.2 × 10.7, centers
 *   4.3 either side), holds still for a second or two, then looks: the pair
 *   turns ~20° and drops a little while each eye tilts ~30°. Now and then it
 *   blinks (a 90ms squash) or rolls its eyes: up and out of the top in 250ms,
 *   an empty face for 80ms, back in from the bottom in 150ms.
 * - The header's face is small and nearly still: two slanted eyes up and to
 *   the right (2.5 × 6.1, tilted -37°), blinking now and then.
 * One requestAnimationFrame loop writes the SVG attributes, so nothing re-renders.
 */

interface Eye {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
}
type Pose = [Eye, Eye];

const REST: Pose = [
  { x: 8.7, y: 12.6, w: 5.2, h: 10.7, rot: 0 },
  { x: 17.3, y: 12.6, w: 5.2, h: 10.7, rot: 0 },
];

/** The pair turned by `angle` about the face's center and shifted, each eye tilted by `tilt`. */
function look(angle: number, dx: number, dy: number, tilt: number, scale = 0.92): Pose {
  const a = (angle * Math.PI) / 180;
  return REST.map((e) => {
    const ox = e.x - 13;
    const oy = e.y - 13;
    return {
      x: 13 + ox * Math.cos(a) - oy * Math.sin(a) + dx,
      y: 13 + ox * Math.sin(a) + oy * Math.cos(a) + dy,
      w: e.w * scale,
      h: e.h * scale,
      rot: tilt,
    };
  }) as Pose;
}

const LOOKS: Pose[] = [look(20, -1.2, 2.4, 30), look(-16, 1.2, 1.6, -26), look(8, 1.6, -1.8, 12, 0.96), REST];

const HEADER: Pose = [
  { x: 13.8, y: 9.4, w: 2.5, h: 6.1, rot: -37 },
  { x: 20.3, y: 6.8, w: 2.4, h: 6.1, rot: -37 },
];

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixEye = (a: Eye, b: Eye, t: number): Eye => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  rot: lerp(a.rot, b.rot, t),
});
const mix = (a: Pose, b: Pose, t: number): Pose => [mixEye(a[0], b[0], t), mixEye(a[1], b[1], t)];

export function GrokEyes({
  size = 26,
  header = false,
  live = false,
  className,
}: {
  size?: number;
  /** The header's small, upward-looking face. */
  header?: boolean;
  /** The green dot the header avatar wears while the bot works. */
  live?: boolean;
  className?: string;
}) {
  const clip = `grok-face-${useId().replace(/:/g, '')}`;
  const left = useRef<SVGRectElement>(null);
  const right = useRef<SVGRectElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const base = header ? HEADER : REST;
    let from: Pose = base;
    let to: Pose = base;
    let moveStart = 0;
    let moveDur = 1;
    const now0 = performance.now();
    let nextMove = now0 + rand(1200, 2400);
    let blinkAt = now0 + rand(2000, 4000);
    let rollAt = now0 + rand(3500, 5500);
    let roll: number | null = null;
    let raf = 0;

    const draw = (p: Pose, lift: number, squash: number) => {
      p.forEach((e, i) => {
        const el = (i === 0 ? left : right).current;
        if (!el) return;
        const h = Math.max(0.6, e.h * squash);
        const y = e.y + lift;
        el.setAttribute('x', String(e.x - e.w / 2));
        el.setAttribute('y', String(y - h / 2));
        el.setAttribute('width', String(e.w));
        el.setAttribute('height', String(h));
        el.setAttribute('rx', String(Math.min(e.w, h) / 2));
        el.setAttribute('transform', `rotate(${e.rot} ${e.x} ${y})`);
      });
    };

    const tick = (now: number) => {
      if (!header && now >= nextMove && roll === null) {
        from = mix(from, to, ease(Math.min(1, (now - moveStart) / moveDur)));
        const options = LOOKS.filter((p) => p !== to);
        to = options[Math.floor(Math.random() * options.length)];
        moveStart = now;
        moveDur = rand(200, 260);
        nextMove = now + rand(1100, 2600);
      }
      const pose = mix(from, to, ease(Math.min(1, (now - moveStart) / moveDur)));

      let squash = 1;
      if (now >= blinkAt) {
        const t = (now - blinkAt) / 90;
        if (t >= 1) blinkAt = now + rand(header ? 3500 : 2600, header ? 7000 : 5200);
        else squash = t < 0.5 ? 1 - t * 1.8 : 0.1 + (t - 0.5) * 1.8;
      }

      let lift = 0;
      if (!header && roll === null && now >= rollAt) roll = now;
      if (roll !== null) {
        const t = now - roll;
        if (t < 250) lift = -26 * easeIn(t / 250);
        else if (t < 330) lift = -40;
        else if (t < 480) lift = 26 * (1 - easeOut((t - 330) / 150));
        else {
          roll = null;
          rollAt = now + rand(4500, 7500);
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
      {live && <span className={styles.live} style={{ width: size * 0.39, height: size * 0.39 }} />}
    </span>
  );
}
