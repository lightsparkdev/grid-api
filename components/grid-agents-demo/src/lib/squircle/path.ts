/*
 * Continuous-corner ("squircle") path geometry.
 *
 * First-party implementation of the corner construction Figma documented in
 * "Desperately Seeking Squircles" (the same continuous curvature iOS uses):
 * each corner is a cubic bezier easing off the straight edge, a central
 * circular arc, and a mirrored bezier easing into the next edge. Unlike a
 * plain border-radius arc (curvature jumps 0 -> 1/r at the corner), the
 * curvature ramps up and back down across a (1 + smoothing) * radius
 * footprint along each edge.
 *
 * Written from the published geometry -- no third-party code. Output is
 * verified against the figma-squircle reference in path.test.ts (dev-only).
 */

/** Figma 60% smoothing -- the profile that matches iOS continuous corners. */
export const DEFAULT_SMOOTHING = 0.6;

interface CornerGeometry {
  radius: number;
  /** p: how far the corner extends along each edge from the corner point. */
  footprint: number;
  /** a, b: spacing of the ease-in cubic's control points along the edge. */
  a: number;
  b: number;
  /** c, d: bezier endpoint offset -- the tangent handoff into the arc. */
  c: number;
  d: number;
  /** Per-axis displacement of the (45deg-symmetric) central arc. */
  arcChord: number;
}

/**
 * Derive one corner's segment lengths for a given radius/smoothing.
 *
 * The central arc sweeps 90(1 - s) degrees, leaving 45s degrees of turn for
 * each bezier. The bezier ends where the arc's tangent (at angle beta = 45s
 * degrees off the edge) meets it, a tangent-length r*tan(beta/2) back from
 * the arc endpoint; (c, d) is that tangent segment resolved onto the
 * edge/normal axes. The remaining footprint splits 2:1 between the first
 * and second control point (Figma's ratio), giving a = 2b.
 *
 * When the footprint wouldn't fit (radius near half the short side), the
 * smoothing is trimmed toward a plain arc so the corner never overruns its
 * budget -- at radius == budget it degenerates to exactly border-radius.
 * With `preserve` (figma-squircle's preserveSmoothing), the smoothing's
 * angles are kept and the ease-in cubic is compressed into the budget
 * instead, which is how iOS keeps a short bubble's corners continuous.
 */
function cornerGeometry(radius: number, smoothing: number, budget: number, preserve = false): CornerGeometry {
  const full = Math.max(0, Math.min(1, smoothing));
  const s = preserve ? full : Math.min(full, budget / radius - 1);
  let footprint = preserve ? (1 + s) * radius : Math.min((1 + s) * radius, budget);
  const arcSweep = (Math.PI / 2) * (1 - s);
  const arcChord = Math.SQRT2 * radius * Math.sin(arcSweep / 2);
  const beta = (Math.PI / 4) * s;
  const tangent = radius * Math.tan(beta / 2);
  const c = tangent * Math.cos(beta);
  const d = tangent * Math.sin(beta);
  let b = (footprint - arcChord - c - d) / 3;
  let a = 2 * b;
  if (preserve && footprint > budget) {
    const room = budget - d - arcChord - c;
    b = Math.min(b, room - room / 6);
    a = room - b;
    footprint = budget;
  }
  return { radius, footprint, a, b, c, d, arcChord };
}

/* Corner frames, clockwise. `i` is the direction of travel entering the
   corner (along the previous edge), `o` the direction leaving it. */
const CORNER_FRAMES = [
  { ix: 1, iy: 0, ox: 0, oy: 1 }, // top-right
  { ix: 0, iy: 1, ox: -1, oy: 0 }, // bottom-right
  { ix: -1, iy: 0, ox: 0, oy: -1 }, // bottom-left
  { ix: 0, iy: -1, ox: 1, oy: 0 }, // top-left
] as const;

/** 3-decimal formatting: 1/1000px is far below visibility, and short strings
    keep per-frame clip-path writes cheap. */
function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
}

/**
 * SVG path (`d` string) for a w x h rounded rect with continuous corners.
 * Uniform radius; radius is clamped to half the short side.
 */
export function continuousCornerPath(
  width: number,
  height: number,
  radius: number,
  smoothing: number = DEFAULT_SMOOTHING,
): string {
  return continuousCornerPathAt(0, 0, width, height, radius, smoothing);
}

/**
 * Same silhouette with its top-left corner at (x, y) -- used for inset
 * strokes (border/ring overlays) that must sit fully inside an element.
 */
export function continuousCornerPathAt(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  smoothing: number = DEFAULT_SMOOTHING,
): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const budget = Math.min(w, h) / 2;
  const r = Math.min(Math.max(0, radius), budget);

  if (r <= 0) {
    return `M ${fmt(x)} ${fmt(y)} L ${fmt(x + w)} ${fmt(y)} L ${fmt(x + w)} ${fmt(y + h)} L ${fmt(x)} ${fmt(y + h)} Z`;
  }

  const g = cornerGeometry(r, smoothing, budget);
  const cornerPoints = [
    { qx: x + w, qy: y },
    { qx: x + w, qy: y + h },
    { qx: x, qy: y + h },
    { qx: x, qy: y },
  ];

  const parts: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const { qx, qy } = cornerPoints[i];
    const { ix, iy, ox, oy } = CORNER_FRAMES[i];

    const entryX = qx - g.footprint * ix;
    const entryY = qy - g.footprint * iy;
    parts.push(`${i === 0 ? "M" : "L"} ${fmt(entryX)} ${fmt(entryY)}`);

    // Ease-in cubic: both control points on the edge, endpoint lifting off
    // onto the arc's tangent.
    const p3x = entryX + (g.a + g.b + g.c) * ix + g.d * ox;
    const p3y = entryY + (g.a + g.b + g.c) * iy + g.d * oy;
    parts.push(
      `C ${fmt(entryX + g.a * ix)} ${fmt(entryY + g.a * iy)}` +
        ` ${fmt(entryX + (g.a + g.b) * ix)} ${fmt(entryY + (g.a + g.b) * iy)}` +
        ` ${fmt(p3x)} ${fmt(p3y)}`,
    );

    // Central circular arc.
    const p4x = p3x + g.arcChord * (ix + ox);
    const p4y = p3y + g.arcChord * (iy + oy);
    parts.push(`A ${fmt(g.radius)} ${fmt(g.radius)} 0 0 1 ${fmt(p4x)} ${fmt(p4y)}`);

    // Ease-out cubic: the ease-in mirrored across the corner's diagonal.
    const exitX = qx + g.footprint * ox;
    const exitY = qy + g.footprint * oy;
    parts.push(
      `C ${fmt(p4x + g.d * ix + g.c * ox)} ${fmt(p4y + g.d * iy + g.c * oy)}` +
        ` ${fmt(p4x + g.d * ix + (g.b + g.c) * ox)} ${fmt(p4y + g.d * iy + (g.b + g.c) * oy)}` +
        ` ${fmt(exitX)} ${fmt(exitY)}`,
    );
  }
  parts.push("Z");
  return parts.join(" ");
}

/** A shape's quarters (its corners), clockwise from the top-right. */
export type CapsuleQuarter = "tr" | "br" | "bl" | "tl";
const QUARTERS: readonly CapsuleQuarter[] = ["tr", "br", "bl", "tl"];

/**
 * SVG path for a rect with its own radius at each corner (clockwise from the
 * top-right), every corner continuous -- including a pill's.
 *
 * A corner below half the short side is the continuous corner above. One
 * that reaches it is a smooth capsule quarter (Lisse's capsule geometry,
 * github.com/JaceThings/Lisse/pull/90): the continuous corner's cubic easing
 * off the long edge, starting (1 + s) * R back, then a radius-R arc sweeping
 * the remaining 90 - 45s degrees to the short edge's midpoint, so the middle
 * of a cap stays truly circular. Figma, CSS corner-shape and the uniform path
 * all degenerate to a bare semicircle there, because a corner at R = h/2 has
 * no room on the short edge to smooth into. A capsule's smoothing shrinks to
 * fit the straight run between its caps (a circle has none and stays round).
 *
 * Radius 0 leaves the box corner square: a corner the path shouldn't shape
 * (a tail drawn to meet the element's own border-radius). `preserveSmoothing`
 * keeps a corner's smoothing when it's short on room (see cornerGeometry).
 */
export function smoothShapePath(
  width: number,
  height: number,
  radii: readonly [number, number, number, number],
  smoothing: number = DEFAULT_SMOOTHING,
  preserveSmoothing = false,
): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const half = Math.min(w, h) / 2;
  const longIsHorizontal = w >= h;
  const capS = Math.max(0, Math.min(smoothing, 1, (Math.abs(w - h)) / (2 * half || 1)));
  const corners = [
    { qx: w, qy: 0 },
    { qx: w, qy: h },
    { qx: 0, qy: h },
    { qx: 0, qy: 0 },
  ];
  const parts: string[] = [];
  const to = (x: number, y: number) => parts.push(`${parts.length ? "L" : "M"} ${fmt(x)} ${fmt(y)}`);
  const arc = (r: number, x: number, y: number) => parts.push(`A ${fmt(r)} ${fmt(r)} 0 0 1 ${fmt(x)} ${fmt(y)}`);
  const cubic = (x1: number, y1: number, x2: number, y2: number, x: number, y: number) =>
    parts.push(`C ${fmt(x1)} ${fmt(y1)} ${fmt(x2)} ${fmt(y2)} ${fmt(x)} ${fmt(y)}`);

  for (let i = 0; i < 4; i += 1) {
    const { qx, qy } = corners[i];
    const { ix, iy, ox, oy } = CORNER_FRAMES[i];
    const r = Math.min(Math.max(0, radii[i]), half);
    if (r <= 0) {
      to(qx, qy);
      continue;
    }
    const capsule = r >= half - 1e-6 && w !== h;
    const g = capsule ? cornerGeometry(r, capS, (1 + capS) * r) : cornerGeometry(r, smoothing, half, preserveSmoothing);
    const shoulder = g.a + g.b + g.c;
    // Ease-in: off the entering edge onto the arc.
    const easeIn = () => {
      const ex = qx - g.footprint * ix;
      const ey = qy - g.footprint * iy;
      to(ex, ey);
      const p3x = ex + shoulder * ix + g.d * ox;
      const p3y = ey + shoulder * iy + g.d * oy;
      cubic(ex + g.a * ix, ey + g.a * iy, ex + (g.a + g.b) * ix, ey + (g.a + g.b) * iy, p3x, p3y);
      return [p3x, p3y];
    };
    // Ease-out: from the arc onto the leaving edge (the ease-in mirrored across the corner's diagonal).
    const outStart = () => [qx + (g.footprint - shoulder) * ox - g.d * ix, qy + (g.footprint - shoulder) * oy - g.d * iy];
    const easeOut = (px: number, py: number) =>
      cubic(
        px + g.d * ix + g.c * ox,
        py + g.d * iy + g.c * oy,
        px + g.d * ix + (g.b + g.c) * ox,
        py + g.d * iy + (g.b + g.c) * oy,
        qx + g.footprint * ox,
        qy + g.footprint * oy,
      );
    if (!capsule) {
      const [p3x, p3y] = easeIn();
      arc(r, p3x + g.arcChord * (ix + ox), p3y + g.arcChord * (iy + oy));
      const [px, py] = outStart();
      easeOut(px, py);
    } else if ((iy === 0) === longIsHorizontal) {
      // Entering along the long edge: shoulder, then the arc down to the short edge's midpoint.
      easeIn();
      arc(r, qx + r * ox, qy + r * oy);
    } else {
      // Entering along the short edge from its midpoint: the arc, then the shoulder out along the long edge.
      to(qx - r * ix, qy - r * iy);
      const [px, py] = outStart();
      arc(r, px, py);
      easeOut(px, py);
    }
  }
  parts.push("Z");
  return parts.join(" ");
}

/**
 * A smooth capsule: a pill whose ends ease off its long edges (see
 * smoothShapePath). Quarters in `square` stay at the box corner.
 */
export function smoothCapsulePath(
  width: number,
  height: number,
  smoothing: number = DEFAULT_SMOOTHING,
  square: readonly CapsuleQuarter[] = [],
): string {
  const radii = QUARTERS.map((q) => (square.includes(q) ? 0 : Infinity)) as [number, number, number, number];
  return smoothShapePath(width, height, radii, smoothing);
}

/**
 * clip-path for smoothShapePath that only trims the element's own corners:
 * an even-odd union of a frame far outside the box, the box, and the shape.
 * Paint outside the box (tails, badges, reactions, shadows) stays visible, so
 * this is safe on hosts with decorations hanging off them -- a plain
 * `path("<shape>")` would cut those off. Give it the element's exact
 * (fractional) border-box size, not offsetWidth/offsetHeight: a rounded size
 * shaves a flat off a pill's end. The element's own border-radius must
 * contain the shape (round at the same radii does), since the clip can only
 * take paint away.
 */
export function smoothShapeClip(
  width: number,
  height: number,
  radii: readonly [number, number, number, number],
  smoothing: number = DEFAULT_SMOOTHING,
  preserveSmoothing = false,
): string {
  const m = 4096;
  const frame = `M ${-m} ${-m} H ${fmt(width + m)} V ${fmt(height + m)} H ${-m} Z`;
  const box = `M 0 0 H ${fmt(width)} V ${fmt(height)} H 0 Z`;
  return `path(evenodd, "${frame} ${box} ${smoothShapePath(width, height, radii, smoothing, preserveSmoothing)}")`;
}

/** smoothShapeClip for a smooth capsule; quarters in `square` stay at the box corner. */
export function smoothCapsuleClip(
  width: number,
  height: number,
  smoothing: number = DEFAULT_SMOOTHING,
  square: readonly CapsuleQuarter[] = [],
): string {
  const radii = QUARTERS.map((q) => (square.includes(q) ? 0 : Infinity)) as [number, number, number, number];
  return smoothShapeClip(width, height, radii, smoothing);
}

/** The same path wrapped as a CSS `clip-path` value. */
export function continuousCornerClip(
  width: number,
  height: number,
  radius: number,
  smoothing: number = DEFAULT_SMOOTHING,
): string {
  return `path("${continuousCornerPath(width, height, radius, smoothing)}")`;
}
