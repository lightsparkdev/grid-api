/**
 * SVG path for a squircle (rounded rectangle whose corners follow a
 * superellipse). Used as a `clip-path: path(...)` so the glass chrome matches
 * the exact corner baked into the displacement map at any `cornerSmoothing`.
 *
 * `smoothing` 0..1 maps to the same exponent the map uses (2 = circular arc,
 * up to 6 = strong squircle); 0.6 ≈ exponent 4.4 ≈ CSS `corner-shape: squircle`.
 *
 * `radius` is either a single value (all corners) or per-corner
 * `[topLeft, topRight, bottomRight, bottomLeft]` — e.g. a bottom sheet whose
 * bottom corners hug a phone screen while the top stays a smaller sheet radius.
 */
export function squirclePath(
  width: number,
  height: number,
  radius: number | [number, number, number, number],
  smoothing = 0,
  samplesPerCorner = 22,
  offsetX = 0,
  offsetY = 0,
): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const clamp = (rr: number) => Math.max(0, Math.min(rr, Math.min(w, h) / 2));
  const [rTL, rTR, rBR, rBL] = (
    Array.isArray(radius) ? radius : [radius, radius, radius, radius]
  ).map(clamp);
  const exp = 2 + Math.max(0, Math.min(1, smoothing)) * 4;
  const p = 2 / exp;
  const k = Math.max(2, samplesPerCorner);

  const cos = (t: number) => Math.pow(Math.cos(t), p);
  const sin = (t: number) => Math.pow(Math.sin(t), p);

  const pts: Array<[number, number]> = [];
  const arc = (cx: number, cy: number, sx: number, sy: number, swap: boolean, r: number) => {
    for (let i = 0; i <= k; i++) {
      const t = (i / k) * (Math.PI / 2);
      const u = swap ? sin(t) : cos(t);
      const v = swap ? cos(t) : sin(t);
      pts.push([offsetX + cx + sx * r * u, offsetY + cy + sy * r * v]);
    }
  };

  // Clockwise from the top edge.
  arc(w - rTR, rTR, 1, -1, true, rTR); // top-right
  arc(w - rBR, h - rBR, 1, 1, false, rBR); // bottom-right
  arc(rBL, h - rBL, -1, 1, true, rBL); // bottom-left
  arc(rTL, rTL, -1, -1, false, rTL); // top-left

  let d = `M ${fmt(offsetX + rTL)} ${fmt(offsetY)}`;
  for (const [x, y] of pts) d += ` L ${fmt(x)} ${fmt(y)}`;
  return d + ' Z';
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}
