'use client';

import { useId, useMemo } from 'react';
import clsx from 'clsx';
import styles from './SpeedLines.module.scss';

/** Tiny deterministic PRNG (seeded) so the ray field is identical on server and
 *  client — no hydration mismatch, and a stable layout between renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-normal sample (Box–Muller) for a bell-curve thickness — most rays
 *  cluster around the mean, only a few are thin (or thick). */
function gaussian(rnd: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

interface Ray {
  a: number; // angle (deg)
  len: number; // streak length (px)
  w: number; // thickness (px)
  r0: number; // inner gap from the burst center (px)
  op: number; // intensity
  tier: number; // blur bucket
  twinkles: boolean; // only a few rays twinkle at a time
  tw: number; // opacity-twinkle duration (s)
  td: number; // twinkle delay (s, negative to desync)
}

const RAY_COUNT = 132;
const VIEW = 1500; // 1:1 with the .burstRotate square (origin at viewBox center)
const HALF = VIEW / 2;
const DEAD_ZONE = 104; // clear middle (px radius) — rays start outside it
// Per-bucket blur (px), sharp → very soft. Rays are randomly assigned, so blur
// varies widely across the field.
const BLUR_STD = [1, 3.5, 7, 12, 18];
const CHANNELS = [
  { key: 'r', color: '#ff2f22', cls: 'rayR' },
  { key: 'g', color: '#1dff58', cls: 'rayG' },
  { key: 'b', color: '#356bff', cls: 'rayB' },
] as const;
function buildRays(seed: number, count: number, deadZone: number): Ray[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => {
    const a = rnd() * 360;
    // Dead zone in the middle (the card's space); rays start outside it.
    const r0 = deadZone + rnd() * 110;
    // Mostly short with a few long streaks (pow biases the distribution).
    const len = 90 + Math.pow(rnd(), 1.6) * 560;
    // Thickness ~ normal(2.8, 1.3): most rays mid-weight, only a few thin.
    const w = clamp(2.8 + gaussian(rnd) * 1.3, 0.7, 8);
    const op = 0.1 + Math.pow(rnd(), 1.2) * 0.78;
    const tier = Math.floor(rnd() * BLUR_STD.length);
    // Only a FEW rays fade at a time (the dense rest stay solid), each fully fading
    // 100%→0%→100% on its own cycle (negative delay desyncs them).
    const twinkles = rnd() < 0.12;
    const tw = 1 + rnd() * 1.4;
    const td = -rnd() * 2.4;
    return { a, len, w, r0, op, tier, twinkles, tw, td };
  });
}

function RayChannel({ rays, color, idBase }: { rays: Ray[]; color: string; idBase: string }) {
  const grad = `${idBase}-g`;
  return (
    <svg
      className={styles.raySvg}
      viewBox={`${-HALF} ${-HALF} ${VIEW} ${VIEW}`}
      aria-hidden
    >
      <defs>
        {/* Streak falloff: faded at the very base, brightest just out from the
            core, fading to nothing at the tip. */}
        <linearGradient id={grad} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={color} stopOpacity="0.1" />
          <stop offset="0.22" stopColor={color} stopOpacity="1" />
          <stop offset="0.62" stopColor={color} stopOpacity="0.4" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        {BLUR_STD.map((s, i) => (
          <filter key={i} id={`${idBase}-b${i}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={s} />
          </filter>
        ))}
      </defs>
      {BLUR_STD.map((_, tier) => (
        <g key={tier} filter={`url(#${idBase}-b${tier})`}>
          {rays
            .filter((r) => r.tier === tier)
            .map((r, i) => (
              <rect
                key={i}
                className={r.twinkles ? styles.twinkle : undefined}
                x={-r.w / 2}
                y={-(r.r0 + r.len)}
                width={r.w}
                height={r.len}
                rx={r.w / 2}
                fill={`url(#${grad})`}
                fillOpacity={r.op}
                transform={`rotate(${r.a})`}
                style={
                  r.twinkles ? { ['--tw' as string]: `${r.tw}s`, ['--td' as string]: `${r.td}s` } : undefined
                }
              />
            ))}
        </g>
      ))}
    </svg>
  );
}

/** Procedural radial speed-line burst: rays randomized in length, thickness,
 *  spacing, intensity and blur, rendered three times — tinted R/G/B and radially
 *  offset — and screen-blended for an apparent chromatic aberration. */
export function SpeedRays() {
  const uid = useId().replace(/[:]/g, '');
  const rays = useMemo<Ray[]>(() => buildRays(0x5eed1, RAY_COUNT, DEAD_ZONE), []);

  return (
    <>
      {CHANNELS.map((ch) => (
        <div key={ch.key} className={clsx(styles.ray, styles[ch.cls])}>
          <RayChannel rays={rays} color={ch.color} idBase={`${uid}-${ch.key}`} />
        </div>
      ))}
    </>
  );
}
