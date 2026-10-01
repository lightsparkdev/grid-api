/**
 * The selection box's cursors, drawn to the design tool's own: measured from
 * Figma's canvas cursors (32 × 32, hotspot at the center, rasterized at 8x).
 * A 1 px black stroke with a 1 px white keyline each side, round caps and
 * joins, and a soft shadow a pixel below. Both turn with the object, so they
 * are generated per angle rather than kept in the stylesheet.
 *
 *  - Rotate: a shallow arch, radius 9.65 with its center 7.35 px below the
 *    hotspot, sweeping 57° either side of the top, so its tips land 8.1 px
 *    out and 2.1 px below the hotspot. The arrowheads are right-angle
 *    chevrons with 4.6 px legs set square to the canvas (one leg back along
 *    the base, one straight up), not tangent to the arc.
 *  - Resize: a double-headed arrow 17.9 px tip to tip through the hotspot,
 *    the same chevrons at 45°.
 */

const SIZE = 32;
const C = SIZE / 2;
const LEG = 4.6;
const ARC_R = 9.65;
const ARC_CY = C + 7.35;
const ARC_HALF_SWEEP = 57.3;
const RESIZE_HALF = 17.9 / 2;

const rad = (deg: number) => (deg * Math.PI) / 180;
const f = (n: number) => n.toFixed(2);
type P = [number, number];

/** A chevron with its tip at `tip` and legs along the two unit vectors. */
function chevron(tip: P, a: P, b: P): string {
  return (
    `M${f(tip[0] + a[0] * LEG)} ${f(tip[1] + a[1] * LEG)} ` +
    `L${f(tip[0])} ${f(tip[1])} ` +
    `L${f(tip[0] + b[0] * LEG)} ${f(tip[1] + b[1] * LEG)}`
  );
}

function svg(paths: string[], deg: number): string {
  const d = paths.join(' ');
  const body =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${SIZE}' height='${SIZE}' viewBox='0 0 ${SIZE} ${SIZE}'>` +
    `<g transform='rotate(${f(deg)} ${C} ${C})' fill='none' stroke-linecap='round' stroke-linejoin='round'>` +
    // The shadow: the keyline's silhouette a pixel lower, in two faint
    // layers so its edge falls off (SVG filters are unreliable in cursors).
    `<path d='${d}' stroke='black' stroke-opacity='0.1' stroke-width='4.8' transform='translate(0 1)'/>` +
    `<path d='${d}' stroke='black' stroke-opacity='0.18' stroke-width='3.8' transform='translate(0 1)'/>` +
    `<path d='${d}' stroke='white' stroke-width='3'/>` +
    `<path d='${d}' stroke='black' stroke-width='1'/>` +
    `</g></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(body)}") ${C} ${C}, auto`;
}

const rotatePaths = (() => {
  const a0 = rad(-90 - ARC_HALF_SWEEP);
  const a1 = rad(-90 + ARC_HALF_SWEEP);
  const l: P = [C + ARC_R * Math.cos(a0), ARC_CY + ARC_R * Math.sin(a0)];
  const r: P = [C + ARC_R * Math.cos(a1), ARC_CY + ARC_R * Math.sin(a1)];
  const arc = `M${f(l[0])} ${f(l[1])} A${ARC_R} ${ARC_R} 0 0 1 ${f(r[0])} ${f(r[1])}`;
  return [arc, chevron(l, [1, 0], [0, -1]), chevron(r, [-1, 0], [0, -1])];
})();

const resizePaths = (() => {
  const l: P = [C - RESIZE_HALF, C];
  const r: P = [C + RESIZE_HALF, C];
  const s = Math.SQRT1_2;
  return [
    `M${f(l[0])} ${f(l[1])} L${f(r[0])} ${f(r[1])}`,
    chevron(l, [s, -s], [s, s]),
    chevron(r, [-s, -s], [-s, s]),
  ];
})();

const cache = new Map<string, string>();
function cached(key: string, make: () => string): string {
  let v = cache.get(key);
  if (!v) {
    v = make();
    cache.set(key, v);
  }
  return v;
}

/** The turning cursor, the arch turned by `deg` (0 = an arch over the top). */
export function rotateCursor(deg: number): string {
  const q = Math.round(deg);
  return cached(`r${q}`, () => svg(rotatePaths, q));
}

/** The resize cursor, the arrow along `deg` (0 = horizontal). */
export function resizeCursor(deg: number): string {
  const q = ((Math.round(deg) % 180) + 180) % 180;
  return cached(`s${q}`, () => svg(resizePaths, q));
}
