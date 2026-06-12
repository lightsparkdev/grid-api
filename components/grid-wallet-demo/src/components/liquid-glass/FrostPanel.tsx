'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { squirclePath } from './squircle';

/**
 * FrostPanel — a cheap, non-refractive "glass" surface.
 *
 * Unlike `Glass`/`GlassOver` (which bend their content through an SVG
 * `feDisplacementMap`), this just frosts the real backdrop with a GPU
 * `backdrop-filter: blur()` and traces a bright specular rim. No SVG filter, no
 * refracted copy, nothing per-frame — so it stays smooth while it animates (the
 * displacement path re-runs the whole filter every frame as a surface slides,
 * which is what tanks large sheets on WebKit).
 *
 * Use it for big surfaces where refraction isn't the point (a bottom sheet,
 * a modal) and the "glassy" read comes from the frost + edge. Keep `Glass` for
 * the small, tactile elements (buttons, switches, handles) where the lens shines.
 *
 * Shape & edge — true squircle on EVERY browser (so a sheet matches the phone
 * shell on Safari too, where `corner-shape` falls back to a circle):
 *  - the frost is clipped with `clip-path: path(squircle)` (cross-browser, same
 *    trick the shell screen uses), with a matching `border-radius` as belt-and-
 *    suspenders so the `backdrop-filter` is always clipped.
 *  - the specular rim is an SVG `<path>` STROKE of that same squircle — not an
 *    inset `box-shadow` (which follows `border-radius`, never `clip-path`, so it
 *    can't trace a squircle and gets sliced at the corners on WebKit).
 *
 * The frost + edge sit on their own layers; children render on top, un-clipped —
 * so a button's press-bloom inside isn't sliced by the panel's rounding.
 */

/**
 * The "look" config for a frosted surface — the data half of FrostPanel, so
 * presets (e.g. `SHEET_GLASS`) declare only the knobs that actually apply. Unlike
 * `GlassConfig` (the refraction engine, ~25 fields), a frost has no displacement —
 * just shape, tint, blur, and the specular edge color. Build sheets/modals from
 * this; `FrostPanel` also accepts `cornerRadii` + `children`.
 */
export interface FrostConfig {
  /** Uniform corner radius (px). */
  radius: number;
  /** Corner smoothing 0..1 — the squircle exponent (default 0). */
  cornerSmoothing?: number;
  /** Frost fill — any CSS color (e.g. a translucent themed token). */
  tint?: string;
  /** GPU `backdrop-filter` blur (px); 0 = none. */
  tintBlur?: number;
  /** Specular edge color (defaults to `--glass-sheet-edge`); `'none'` skips the
   *  rim entirely — a flat (non-glassy) surface. */
  edge?: string;
  /** Glassy top glint on the edge (default). false = a uniform hairline stroke
   *  of `edge` — e.g. a flat sheet's subtle dark-mode outline. */
  edgeGlint?: boolean;
  /** Edge stroke width in px (default 1). */
  edgeWidth?: number;
  /** Outer drop shadow (CSS box-shadow value) — e.g. a flat sheet's elevation. */
  shadow?: string;
}

export interface FrostPanelProps {
  /** Uniform corner radius (px). Used when `cornerRadii` isn't supplied. */
  radius?: number;
  /** Corner smoothing 0..1 — the squircle exponent, matching the shell's curve. */
  cornerSmoothing?: number;
  /** Per-corner radii `[tl, tr, br, bl]` — e.g. a sheet whose bottom corners hug
   *  the phone screen while the top keeps the sheet radius. Overrides `radius`. */
  cornerRadii?: [number, number, number, number];
  /** Frost fill — any CSS color (e.g. a translucent themed token). */
  tint?: string;
  /** GPU `backdrop-filter` blur (px) — the cheap iOS "material" frost. 0 = none. */
  tintBlur?: number;
  /** Specular edge color — the bright glassy rim traced around the shape.
   *  `'none'` skips the rim (flat surface). */
  edge?: string;
  /** Glassy top glint on the edge (default). false = uniform hairline stroke. */
  edgeGlint?: boolean;
  /** Edge stroke width in px (default 1). */
  edgeWidth?: number;
  /** Outer drop shadow (CSS box-shadow value), traced at the panel's radius. */
  shadow?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const DEFAULT_RADIUS = 22;
const DEFAULT_EDGE = 'var(--glass-sheet-edge)';

/** Layout-px size (offset*, so an ancestor CSS transform — the phone fit-scale —
 *  doesn't distort the squircle path, which lives in the element's own space). */
function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setSize((p) => (p.w === w && p.h === h ? p : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  return { ref, size };
}

export function FrostPanel({
  radius = DEFAULT_RADIUS,
  cornerSmoothing = 0,
  cornerRadii,
  tint,
  tintBlur = 0,
  edge = DEFAULT_EDGE,
  edgeGlint = true,
  edgeWidth = 1,
  shadow,
  className,
  style,
  children,
}: FrostPanelProps) {
  const { ref, size } = useElementSize();
  const { w, h } = size;
  const ready = w > 0 && h > 0;
  const gradId = `fp-${useId().replace(/:/g, '')}`;

  // SAME-FRAME shape tracking for ANIMATED panels: the React path (RO →
  // setState → re-render) lags a live height tween by a frame+, so the fill's
  // clip rides a frame behind the panel — on a bottom-anchored sheet that
  // opens a visible gap at the bottom edge ("the fill jumps"). ResizeObserver
  // callbacks fire after layout but BEFORE paint, so applying the clip + edge
  // path imperatively there keeps them glued to the real size every frame.
  // (The state-driven render below still provides the initial values; the
  // observer re-applies after any re-render too, since it observes the same
  // box.)
  const frostRef = useRef<HTMLDivElement>(null);
  const edgeSvgRef = useRef<SVGSVGElement>(null);
  const edgePathRef = useRef<SVGPathElement>(null);
  const radiiKey = Array.isArray(cornerRadii) ? cornerRadii.join(',') : String(radius);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width <= 0 || height <= 0) return;
      const base = cornerRadii ?? radius;
      const inset: number | [number, number, number, number] = Array.isArray(base)
        ? (base.map((r) => Math.max(0, r - 0.5)) as [number, number, number, number])
        : Math.max(0, base - 0.5);
      const frost = frostRef.current;
      if (frost) {
        const p = `path('${squirclePath(width, height, base, cornerSmoothing)}')`;
        frost.style.clipPath = p;
        frost.style.setProperty('-webkit-clip-path', p);
      }
      edgeSvgRef.current?.setAttribute('viewBox', `0 0 ${width} ${height}`);
      edgePathRef.current?.setAttribute(
        'd',
        squirclePath(width - 1, height - 1, inset, cornerSmoothing, 22, 0.5, 0.5),
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiiKey, cornerSmoothing]);

  const baseRadii = cornerRadii ?? radius;
  // Frost shape: the full squircle, via `clip-path: path()` ONLY. clip-path is a
  // true squircle on every browser (Safari included) — matching the shell — and it
  // clips the tint AND the backdrop-filter to that exact path. We deliberately do
  // NOT also set `border-radius`: on Safari `corner-shape` is unsupported so the
  // radius is circular, and the rendered fill becomes the intersection (circle) —
  // which no longer matches the squircle edge stroke (the corner mismatch).
  const clip = ready
    ? `path('${squirclePath(w, h, baseRadii, cornerSmoothing)}')`
    : undefined;

  // Edge path: the same squircle inset 0.5px so the 1px stroke sits just inside the
  // frost rather than straddling its outer edge.
  const insetRadii: number | [number, number, number, number] = Array.isArray(baseRadii)
    ? (baseRadii.map((r) => Math.max(0, r - 0.5)) as [number, number, number, number])
    : Math.max(0, baseRadii - 0.5);
  const edgePath = ready
    ? squirclePath(w - 1, h - 1, insetRadii, cornerSmoothing, 22, 0.5, 0.5)
    : '';

  const blur = tintBlur > 0 ? `blur(${tintBlur}px)` : undefined;

  // box-shadow follows border-radius (not the clip-path), so give the root the
  // panel's radius when a shadow is set — at these blur sizes the circular-vs-
  // squircle corner difference is invisible.
  const shadowStyle: CSSProperties = shadow
    ? {
        boxShadow: shadow,
        borderRadius: Array.isArray(baseRadii)
          ? baseRadii.map((r) => `${r}px`).join(' ')
          : baseRadii,
      }
    : {};

  return (
    <div ref={ref} className={className} style={{ position: 'relative', ...shadowStyle, ...style }}>
      <div
        ref={frostRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: tint,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          clipPath: clip,
          WebkitClipPath: clip,
          pointerEvents: 'none',
        }}
      />

      {/* Specular rim — an SVG stroke of the squircle so it traces the corners on
          every browser (a brighter top stop reads as light catching the top edge).
          edge="none" skips it for flat surfaces. */}
      {ready && edge !== 'none' && (
        <svg
          ref={edgeSvgRef}
          aria-hidden
          width="100%"
          height="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          {edgeGlint && (
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity={0.6} />
                <stop offset="0.14" style={{ stopColor: edge }} />
                <stop offset="1" style={{ stopColor: edge }} />
              </linearGradient>
            </defs>
          )}
          <path
            ref={edgePathRef}
            d={edgePath}
            fill="none"
            stroke={edgeGlint ? `url(#${gradId})` : edge}
            strokeWidth={edgeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

export default FrostPanel;
