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
  phase: number; // twinkle phase bucket (which group it shimmers with)
}

const RAY_COUNT = 180;
const VIEW = 1500; // 1:1 with the .burstRotate square (origin at viewBox center)
const HALF = VIEW / 2;
const DEAD_ZONE = 88; // clear middle (px radius) — rays start outside it
// Per-bucket blur (px), soft → very soft. No truly-sharp tier, so no crisp
// hairlines. Rays are biased toward the blurrier buckets (see buildRays).
const BLUR_STD = [1.6, 3.5, 6.5, 11, 17];
// Twinkle is done per GROUP, not per rect: rays are split into BLUR_STD × PHASES
// scattered groups, each an outer <g> whose opacity animates over a STATIC, already-
// blurred inner <g>. The Gaussian blur rasterizes once and is cached; only the cheap
// group opacity composites per frame (vs. re-running the blur on 540 animating rects
// every frame). PHASES gives several independent shimmer cycles so it still reads as
// a scattered twinkle, not one pulsing fan.
const PHASES = 3;
const GROUPS = BLUR_STD.length * PHASES;
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
    // Thickness ~ normal(2.8, 1.4), min 1.2: most mid-weight, no ultra-thin.
    const w = clamp(2.8 + gaussian(rnd) * 1.4, 1.2, 8.5);
    const op = 0.1 + Math.pow(rnd(), 1.2) * 0.78;
    // Bias toward the blurrier buckets (pow < 1), and force thin rays to be soft —
    // so there are no thin, crisp lines.
    let tier = Math.floor(Math.pow(rnd(), 0.6) * BLUR_STD.length);
    if (w < 2) tier = Math.max(tier, 2);
    // Which shimmer group this ray belongs to (scattered, not spatial).
    const phase = Math.floor(rnd() * PHASES);
    return { a, len, w, r0, op, tier, phase };
  });
}

interface GroupTwinkle {
  tw: number; // fade duration (s)
  td: number; // start delay (s, negative to desync)
}

/** One twinkle timing per group, shared across the R/G/B channels so the chroma
 *  copies shimmer together (consistent fringe), each group on its own cycle. */
function buildGroupTwinkle(seed: number): GroupTwinkle[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: GROUPS }, () => ({
    tw: +(0.55 + rnd() * 0.4).toFixed(2), // ~750ms, varied so periods drift
    td: +(-rnd() * 2).toFixed(2), // phase spread across a full cycle
  }));
}

function RayChannel({
  rays,
  color,
  idBase,
  groupTw,
}: {
  rays: Ray[];
  color: string;
  idBase: string;
  groupTw: GroupTwinkle[];
}) {
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
      {BLUR_STD.map((_, tier) =>
        Array.from({ length: PHASES }, (_unused, ph) => {
          const groupRays = rays.filter((r) => r.tier === tier && r.phase === ph);
          if (groupRays.length === 0) return null;
          const gi = tier * PHASES + ph;
          const { tw, td } = groupTw[gi];
          // Outer <g>: the cheap, animated opacity (twinkle). Inner <g>: the STATIC
          // blurred rays — the Gaussian filter rasterizes once and is cached, so the
          // shimmer never re-runs the blur.
          return (
            <g
              key={gi}
              className={styles.twinkle}
              style={{ ['--tw' as string]: `${tw}s`, ['--td' as string]: `${td}s` }}
            >
              <g filter={`url(#${idBase}-b${tier})`}>
                {groupRays.map((r, i) => (
                  <rect
                    key={i}
                    x={-r.w / 2}
                    y={-(r.r0 + r.len)}
                    width={r.w}
                    height={r.len}
                    rx={r.w / 2}
                    fill={`url(#${grad})`}
                    fillOpacity={r.op}
                    transform={`rotate(${r.a})`}
                  />
                ))}
              </g>
            </g>
          );
        }),
      )}
    </svg>
  );
}

/** Procedural radial speed-line burst: rays randomized in length, thickness,
 *  spacing, intensity and blur, rendered three times — tinted R/G/B and radially
 *  offset — and screen-blended for an apparent chromatic aberration. */
export function SpeedRays() {
  const uid = useId().replace(/[:]/g, '');
  const rays = useMemo<Ray[]>(() => buildRays(0x5eed1, RAY_COUNT, DEAD_ZONE), []);
  const groupTw = useMemo<GroupTwinkle[]>(() => buildGroupTwinkle(0x71717), []);

  return (
    <>
      {CHANNELS.map((ch) => (
        <div key={ch.key} className={clsx(styles.ray, styles[ch.cls])}>
          <RayChannel rays={rays} color={ch.color} idBase={`${uid}-${ch.key}`} groupTw={groupTw} />
        </div>
      ))}
    </>
  );
}
