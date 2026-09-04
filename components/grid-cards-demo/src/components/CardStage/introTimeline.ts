/**
 * The card's intro: a blueprint of the card draws itself on the stage
 * (registration ticks, the squircle outline, dimensions, the chip and brand
 * skeleton), then the blueprint blurs and fades out as the real card blurs
 * and fades in behind it. The blueprint is an SVG in card px riding in the
 * card's hit box; the card is the stage canvas. Both are stepped from the
 * stage's frame loop off one clock so they never drift apart.
 *
 * Geometry is the Figma spec (1536-wide artboard) through `fig()`, so the
 * skeleton lands exactly where the face painter puts the chip and the brand.
 */

import { CARD_H, CARD_W, fig } from '@/apps/card/cardMetrics';
import { squirclePath } from '@/components/liquid-glass';
import { CARD_R } from './card3d/cardGeometry';

const W = CARD_W;
const H = CARD_H;

/** Room around the card for ticks and dimension lines, card px. */
export const INTRO_PAD = fig(200);

/* ── Geometry (card px) ───────────────────────────────────────────────────── */

const TICK_GAP = fig(28);
const TICK_LEN = fig(72);
const CROSS_ARM = fig(40);
const RING_R = fig(14);
const DIM_OFF = fig(90);
const DIM_TICK = fig(24);
const CHIP_W = fig(197);
const CHIP_H = fig(149);
const CHIP = { x: fig(172), y: fig(334), w: CHIP_W, h: CHIP_H, r: (CHIP_W * 19.5) / 151 };
const BRAND = { right: fig(1384), cy: CHIP.y + CHIP.h / 2, w: fig(410), h: fig(90) };
/** Where the corner arc's midpoint sits in from the corner. */
const ARC_IN = CARD_R * (1 - Math.SQRT1_2);
const LEADER_DIAG = fig(100);
const LEADER_RUN = fig(220);

const f = (n: number) => (Math.round(n * 100) / 100).toString();

/** A dimension line with end ticks: horizontal when `y` is given. */
function hdim(x1: number, x2: number, y: number, tick: number) {
  const t = tick / 2;
  return `M ${f(x1)} ${f(y - t)} L ${f(x1)} ${f(y + t)} M ${f(x1)} ${f(y)} L ${f(x2)} ${f(y)} M ${f(x2)} ${f(y - t)} L ${f(x2)} ${f(y + t)}`;
}
function vdim(y1: number, y2: number, x: number, tick: number) {
  const t = tick / 2;
  return `M ${f(x - t)} ${f(y1)} L ${f(x + t)} ${f(y1)} M ${f(x)} ${f(y1)} L ${f(x)} ${f(y2)} M ${f(x - t)} ${f(y2)} L ${f(x + t)} ${f(y2)}`;
}

const g = TICK_GAP;
const L = TICK_LEN;
const cx = W / 2;
const cy = H / 2;
const padSX = CHIP.w / 151;
const padSY = CHIP.h / 101;

export const INTRO_GEOMETRY = {
  viewBox: `${f(-INTRO_PAD)} ${f(-INTRO_PAD)} ${f(W + INTRO_PAD * 2)} ${f(H + INTRO_PAD * 2)}`,
  ticks: [
    `M ${f(-g)} ${f(-g + L)} L ${f(-g)} ${f(-g)} L ${f(-g + L)} ${f(-g)}`,
    `M ${f(W + g - L)} ${f(-g)} L ${f(W + g)} ${f(-g)} L ${f(W + g)} ${f(-g + L)}`,
    `M ${f(W + g)} ${f(H + g - L)} L ${f(W + g)} ${f(H + g)} L ${f(W + g - L)} ${f(H + g)}`,
    `M ${f(-g + L)} ${f(H + g)} L ${f(-g)} ${f(H + g)} L ${f(-g)} ${f(H + g - L)}`,
  ],
  /** Each tick's corner point, as a vector from the card's center. */
  tickVectors: [
    [-g - cx, -g - cy],
    [W + g - cx, -g - cy],
    [W + g - cx, H + g - cy],
    [-g - cx, H + g - cy],
  ] as Array<[number, number]>,
  /** Four arms, each from the center out. */
  crossArms: [
    `M ${f(cx)} ${f(cy)} L ${f(cx - CROSS_ARM)} ${f(cy)}`,
    `M ${f(cx)} ${f(cy)} L ${f(cx + CROSS_ARM)} ${f(cy)}`,
    `M ${f(cx)} ${f(cy)} L ${f(cx)} ${f(cy - CROSS_ARM)}`,
    `M ${f(cx)} ${f(cy)} L ${f(cx)} ${f(cy + CROSS_ARM)}`,
  ],
  ring: { cx, cy, r: RING_R },
  centerlines: `M 0 ${f(cy)} L ${f(W)} ${f(cy)} M ${f(cx)} 0 L ${f(cx)} ${f(H)}`,
  outline: squirclePath(W, H, CARD_R, 0.12),
  dimW: hdim(0, W, -DIM_OFF, DIM_TICK),
  extW: `M 0 ${f(-DIM_OFF)} L 0 ${f(-fig(12))} M ${f(W)} ${f(-DIM_OFF)} L ${f(W)} ${f(-fig(12))}`,
  labelW: { x: cx, y: -DIM_OFF - fig(30) },
  dimH: vdim(0, H, W + DIM_OFF, DIM_TICK),
  extH: `M ${f(W + fig(12))} 0 L ${f(W + DIM_OFF)} 0 M ${f(W + fig(12))} ${f(H)} L ${f(W + DIM_OFF)} ${f(H)}`,
  labelH: { x: W + DIM_OFF + fig(34), y: cy },
  leaderR: `M ${f(W - ARC_IN)} ${f(ARC_IN)} L ${f(W - ARC_IN - LEADER_DIAG)} ${f(ARC_IN + LEADER_DIAG)} L ${f(W - ARC_IN - LEADER_DIAG - LEADER_RUN)} ${f(ARC_IN + LEADER_DIAG)}`,
  circleR: { cx: W - CARD_R, cy: CARD_R, r: CARD_R },
  labelR: { x: W - ARC_IN - LEADER_DIAG, y: ARC_IN + LEADER_DIAG - fig(18) },
  chipPlate: squirclePath(CHIP.w, CHIP.h, CHIP.r, 0, 10, CHIP.x, CHIP.y),
  pads: [8.5, 83.5332].flatMap((px) =>
    [8.5, 37.8633, 67.2266].map((py) =>
      squirclePath(58.0332 * padSX, 24.3633 * padSY, 12.1816 * padSY, 0, 8, CHIP.x + px * padSX, CHIP.y + py * padSY),
    ),
  ),
  dimCX: hdim(0, CHIP.x, CHIP.y + CHIP.h / 2, fig(18)),
  labelCX: { x: CHIP.x / 2, y: CHIP.y + CHIP.h / 2 - fig(18) },
  dimCY: vdim(0, CHIP.y, CHIP.x + CHIP.w / 2, fig(18)),
  labelCY: { x: CHIP.x + CHIP.w / 2 + fig(16), y: CHIP.y / 2 },
  labelChip: { x: CHIP.x, y: CHIP.y + CHIP.h + fig(38) },
  brandBox: { x: BRAND.right - BRAND.w, y: BRAND.cy - BRAND.h / 2, w: BRAND.w, h: BRAND.h },
  brandText: { x: BRAND.right, y: BRAND.cy + fig(72) * 0.35, size: fig(72) },
  /** Label sizes, card px. */
  fontDim: fig(28),
  fontSmall: fig(24),
};

/* ── Timeline (seconds) ───────────────────────────────────────────────────── */

type Cue = { kind: 'draw' | 'fade'; at: number; dur: number };

/** Each `data-intro` element's cue. Draws run stroke-dashoffset 1 → 0 over a
 *  `pathLength` of 1; fades run opacity 0 → the element's own `data-opacity`. */
const CUES: Record<string, Cue> = {
  'tick-0': { kind: 'fade', at: 0.0, dur: 0.45 },
  'tick-1': { kind: 'fade', at: 0.0, dur: 0.45 },
  'tick-2': { kind: 'fade', at: 0.0, dur: 0.45 },
  'tick-3': { kind: 'fade', at: 0.0, dur: 0.45 },
  'cross-0': { kind: 'draw', at: 0.2, dur: 0.3 },
  'cross-1': { kind: 'draw', at: 0.2, dur: 0.3 },
  'cross-2': { kind: 'draw', at: 0.2, dur: 0.3 },
  'cross-3': { kind: 'draw', at: 0.2, dur: 0.3 },
  ring: { kind: 'draw', at: 0.2, dur: 0.3 },
  outline: { kind: 'draw', at: 0.35, dur: 0.95 },
  centerlines: { kind: 'fade', at: 0.75, dur: 0.4 },
  'dim-w': { kind: 'draw', at: 1.05, dur: 0.35 },
  'ext-w': { kind: 'fade', at: 1.05, dur: 0.3 },
  'label-w': { kind: 'fade', at: 1.3, dur: 0.25 },
  'dim-h': { kind: 'draw', at: 1.2, dur: 0.35 },
  'ext-h': { kind: 'fade', at: 1.2, dur: 0.3 },
  'label-h': { kind: 'fade', at: 1.45, dur: 0.25 },
  'leader-r': { kind: 'draw', at: 1.4, dur: 0.3 },
  'circle-r': { kind: 'fade', at: 1.4, dur: 0.3 },
  'label-r': { kind: 'fade', at: 1.62, dur: 0.25 },
  'chip-plate': { kind: 'draw', at: 1.5, dur: 0.4 },
  'pad-0': { kind: 'draw', at: 1.75, dur: 0.25 },
  'pad-1': { kind: 'draw', at: 1.81, dur: 0.25 },
  'pad-2': { kind: 'draw', at: 1.87, dur: 0.25 },
  'pad-3': { kind: 'draw', at: 1.93, dur: 0.25 },
  'pad-4': { kind: 'draw', at: 1.99, dur: 0.25 },
  'pad-5': { kind: 'draw', at: 2.05, dur: 0.25 },
  'dim-cx': { kind: 'draw', at: 1.85, dur: 0.25 },
  'label-cx': { kind: 'fade', at: 2.02, dur: 0.2 },
  'dim-cy': { kind: 'draw', at: 1.95, dur: 0.25 },
  'label-cy': { kind: 'fade', at: 2.12, dur: 0.2 },
  'label-chip': { kind: 'fade', at: 2.15, dur: 0.2 },
  'brand-box': { kind: 'fade', at: 1.95, dur: 0.3 },
  'brand-text': { kind: 'fade', at: 2.1, dur: 0.3 },
};

/** The ticks arrive from part way toward the center, settling as they fade in. */
const TICK_START = 0.5;
const TICK_TRAVEL = 0.7;

/** The reveal: the blueprint blurs out while the card blurs in. */
const REVEAL_AT = 2.55;
const BLUEPRINT_OUT = 0.8;
const CARD_IN = 1.0;
/** As the card comes in, the ticks tuck toward it and the outer dimensions
 *  push away (card px). */
const TICK_EXIT = 8;
const DIM_EXIT = 10;
/** Where the card starts, stage px of blur. */
const CARD_BLUR = 16;
/** Where the blueprint ends, card px of blur (it scales with the hit box, so
 *  this lands near the card's 16 stage px at the desktop scale). */
const BLUEPRINT_BLUR = 12;
export const INTRO_END = REVEAL_AT + CARD_IN;

const clamp01 = (u: number) => Math.min(1, Math.max(0, u));
const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);

/** The card's look at `t`: hidden until the reveal, then fading in as the blur clears. */
export function introCard(t: number): { opacity: number; blur: number } {
  const u = clamp01((t - REVEAL_AT) / CARD_IN);
  return { opacity: easeOutCubic(u), blur: CARD_BLUR * (1 - easeInOutCubic(u)) };
}

const cache = new WeakMap<Element, Map<string, SVGElement>>();

function elements(root: Element): Map<string, SVGElement> {
  let m = cache.get(root);
  if (!m) {
    m = new Map();
    root.querySelectorAll<SVGElement>('[data-intro]').forEach((el) => m!.set(el.dataset.intro!, el));
    cache.set(root, m);
  }
  return m;
}

/** Pose every blueprint element for time `t`. `root` is the overlay itself. */
export function stepIntro(root: HTMLElement | SVGElement, t: number) {
  const out = easeInOutCubic(clamp01((t - REVEAL_AT) / BLUEPRINT_OUT));
  root.style.opacity = String(1 - out);
  root.style.filter = out > 0 ? `blur(${(BLUEPRINT_BLUR * out).toFixed(2)}px)` : '';
  const els = elements(root);
  for (const [key, cue] of Object.entries(CUES)) {
    const el = els.get(key);
    if (!el) continue;
    const u = clamp01((t - cue.at) / cue.dur);
    if (cue.kind === 'draw') {
      el.style.opacity = u > 0 ? '1' : '0';
      el.style.strokeDashoffset = String(1 - easeInOutCubic(u));
    } else {
      const peak = Number(el.dataset.opacity ?? '1');
      el.style.opacity = String(peak * easeOutCubic(u));
    }
  }

  // Motion. Ticks: in from TICK_START of the way to the center as they fade
  // in, then a small tuck toward the card on the reveal. Outer dimensions:
  // a small push away on the reveal.
  const exit = easeOutCubic(clamp01((t - REVEAL_AT) / BLUEPRINT_OUT));
  INTRO_GEOMETRY.tickVectors.forEach(([vx, vy], i) => {
    const el = els.get(`tick-${i}`);
    const cue = CUES[`tick-${i}`];
    if (!el || !cue) return;
    const enter = 1 - easeOutCubic(clamp01((t - cue.at) / TICK_TRAVEL));
    const k = TICK_START * enter + (TICK_EXIT / Math.hypot(vx, vy)) * exit;
    el.setAttribute('transform', `translate(${f(-vx * k)} ${f(-vy * k)})`);
  });
  els.get('dims-w')?.setAttribute('transform', `translate(0 ${f(-DIM_EXIT * exit)})`);
  els.get('dims-h')?.setAttribute('transform', `translate(${f(DIM_EXIT * exit)} 0)`);
}
