/** Keep in sync with `--corner-superellipse-scale` in globals.scss. */
export const CORNER_SUPERELLIPSE_SCALE = 1.2;

export type SquircleRadii = [number, number, number, number];

/** Figma corner radius (pt/px) → squircle clip / superellipse border-radius. */
export function figmaSquircleRadius(figmaPx: number): number {
  return figmaPx * CORNER_SUPERELLIPSE_SCALE;
}

/** Per-corner Figma radii → scaled squircle radii `[tl, tr, br, bl]`. */
export function figmaSquircleRadii(
  figma: number | SquircleRadii,
): number | SquircleRadii {
  if (typeof figma === 'number') {
    return figmaSquircleRadius(figma);
  }
  return figma.map(figmaSquircleRadius) as SquircleRadii;
}

/**
 * Read an inherited CSS custom property as computed px.
 * `getPropertyValue()` returns `calc()` verbatim — this resolves it.
 */
export function readCssVarPx(el: Element, varName: string): number {
  if (typeof document === 'undefined') return Number.NaN;

  const doc = el.ownerDocument;
  const probe = doc.createElement('div');
  probe.style.setProperty('position', 'absolute');
  probe.style.setProperty('visibility', 'hidden');
  probe.style.setProperty('pointer-events', 'none');
  probe.style.setProperty('width', `var(${varName})`);
  doc.body.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px > 0 && Number.isFinite(px) ? px : Number.NaN;
}
