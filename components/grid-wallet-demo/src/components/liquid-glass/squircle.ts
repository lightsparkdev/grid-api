/**
 * SVG path for a squircle (rounded rectangle whose corners follow a
 * superellipse). Used as a `clip-path: path(...)` so the glass chrome matches
 * the exact corner baked into the displacement map at any `cornerSmoothing`.
 *
 * `smoothing` 0..1 maps to the same exponent the map uses (2 = circular arc,
 * up to 6 = strong squircle); 0.6 ≈ exponent 4.4 ≈ CSS `corner-shape: squircle`.
 */
export function squirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing = 0,
  samplesPerCorner = 22,
  offsetX = 0,
  offsetY = 0,
): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  const exp = 2 + Math.max(0, Math.min(1, smoothing)) * 4;
  const p = 2 / exp;
  const k = Math.max(2, samplesPerCorner);

  const cos = (t: number) => Math.pow(Math.cos(t), p);
  const sin = (t: number) => Math.pow(Math.sin(t), p);

  const pts: Array<[number, number]> = [];
  const arc = (cx: number, cy: number, sx: number, sy: number, swap: boolean) => {
    for (let i = 0; i <= k; i++) {
      const t = (i / k) * (Math.PI / 2);
      const u = swap ? sin(t) : cos(t);
      const v = swap ? cos(t) : sin(t);
      pts.push([offsetX + cx + sx * r * u, offsetY + cy + sy * r * v]);
    }
  };

  // Clockwise from the top edge.
  arc(w - r, r, 1, -1, true); // top-right
  arc(w - r, h - r, 1, 1, false); // bottom-right
  arc(r, h - r, -1, 1, true); // bottom-left
  arc(r, r, -1, -1, false); // top-left

  let d = `M ${fmt(offsetX + r)} ${fmt(offsetY)}`;
  for (const [x, y] of pts) d += ` L ${fmt(x)} ${fmt(y)}`;
  return d + ' Z';
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}
