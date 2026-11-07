'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { displacementMapToDataURL } from './displacement';
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

/**
 * Geometry-aware specular for a `FrostPanel` — the SAME highlight the refractive
 * glass buttons use (`SYMBOL_GLASS`), minus the refraction. We render the
 * displacement map purely for its B channel (the per-corner specular term),
 * pull that out with the exact `feColorMatrix` `LiquidGlass` uses, and
 * `screen`-blend it over the frost. So a frosted pill catches light on the two
 * lit corners along `rotation` (true to its shape on any aspect), reading like a
 * real glass button instead of a flat left/right gradient — while the frost
 * still lets the backdrop show through. Static (regenerates only on resize), so
 * it's cheap even on WebKit. Defaults mirror `SYMBOL_GLASS`.
 */
export interface FrostSpecular {
  /** Highlight direction in degrees (default 45 — the diagonal two-corner look). */
  rotation?: number;
  /** Broad glow strength, 0..1 (default 0.06). */
  glowStrength?: number;
  /** How tightly the glow hugs the specular axis, 0..1 (default 0.5). */
  glowSpread?: number;
  glowExponent?: number;
  /** Thin rim-light strength, 0..1 (default 1) — the bright corner edge. */
  edgeStrength?: number;
  /** Rim band width in px (default 2). */
  edgeWidth?: number;
  edgeExponent?: number;
  /** Glow falloff band in px (default 0.5). */
  depth?: number;
  /** Map resolution cap on the long side, CSS px (default 512). */
  mapSize?: number;
  /** Gain on the baked highlight (default 1 = buttons-faithful). Multiplies the
   *  additive rim/glow, so >1 pushes a hotter glass edge (baked into the
   *  feColorMatrix, not capped like opacity). */
  strength?: number;
}

const SPECULAR_DEFAULTS: Required<FrostSpecular> = {
  rotation: 45,
  glowStrength: 0.06,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 1,
  edgeWidth: 2,
  edgeExponent: 1.5,
  depth: 0.5,
  mapSize: 512,
  strength: 1,
};

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
  /** Angle (deg) for the specular glint, 0 = top (default). Rotates where the
   *  bright highlight sits around the panel (e.g. -45 = top-left). */
  specularAngle?: number;
  /** Glint BOTH opposite corners along the panel's diagonal (top-left +
   *  bottom-right) rather than one edge — the lit-glass look. */
  specularCorners?: boolean;
  /** Bake the buttons' geometry-aware specular highlight onto the frost (the
   *  displacement map's B channel, shape-true on any aspect). Opt-in: when set,
   *  the panel reads like a real glass button. Pair with `edge="none"` so the
   *  baked rim isn't doubled by the flat stroke. See `FrostSpecular`. */
  specular?: FrostSpecular;
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
  specularAngle,
  specularCorners,
  specular,
  shadow,
  className,
  style,
  children,
}: FrostPanelProps) {
  const { ref, size } = useElementSize();
  const { w, h } = size;
  const ready = w > 0 && h > 0;
  const gradId = `fp-${useId().replace(/:/g, '')}`;
  const radiiKey = Array.isArray(cornerRadii) ? cornerRadii.join(',') : String(radius);

  // Round, uniform panels clip the frost with `border-radius` instead of
  // `clip-path`. A plain round corner is identical on every browser (no squircle,
  // so none of the Safari `corner-shape` mismatch clip-path was added to dodge) —
  // AND, crucially, `clip-path` + `backdrop-filter` on one element silently DROPS
  // the blur when the panel is nested in a composited context (e.g. the pinned
  // search pill over a scrolling, masked list), while `border-radius` clipping
  // keeps it. Squircles / per-corner radii still need clip-path for their shape.
  const roundUniform = cornerSmoothing < 0.001 && !Array.isArray(cornerRadii);

  // Baked geometry-aware specular (opt-in). Mirrors LiquidGlass: render the
  // displacement map for THIS shape, then read its B channel (the per-corner
  // highlight) — so the frost catches light exactly like the glass buttons.
  const specOn = !!specular;
  const spec = { ...SPECULAR_DEFAULTS, ...specular };
  const specCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [specUrl, setSpecUrl] = useState<string | null>(null);
  const specSig = specOn
    ? [
        spec.rotation,
        spec.glowStrength,
        spec.glowSpread,
        spec.glowExponent,
        spec.edgeStrength,
        spec.edgeWidth,
        spec.edgeExponent,
        spec.depth,
        spec.mapSize,
      ].join(',')
    : '';
  useEffect(() => {
    if (!specOn || w <= 0 || h <= 0) {
      setSpecUrl(null);
      return;
    }
    if (!specCanvasRef.current) specCanvasRef.current = document.createElement('canvas');
    // Aspect-correct buffer at device density (capped), so the thin rim stays
    // crisp on a wide pill instead of getting upscaled and blocky.
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const longCss = Math.min(spec.mapSize, Math.max(w, h));
    const longPx = Math.max(32, Math.round(longCss * dpr));
    let mapW: number;
    let mapH: number;
    if (w >= h) {
      mapW = longPx;
      mapH = Math.max(16, Math.round((longPx * h) / w));
    } else {
      mapH = longPx;
      mapW = Math.max(16, Math.round((longPx * w) / h));
    }
    const url = displacementMapToDataURL(
      {
        width: mapW,
        height: mapH,
        lensHalfWidth: w / 2,
        lensHalfHeight: h / 2,
        borderRadius: radius,
        cornerRadii,
        // Specular-only: the bend channels (R/G) go unused, so the refraction
        // knobs (scale/dome/splay/chroma) are irrelevant — only the B-channel
        // highlight params matter.
        depth: spec.depth,
        sdfBoundary: true,
        edgeFalloff: true,
        specularRotation: spec.rotation,
        glowStrength: spec.glowStrength,
        glowSpread: spec.glowSpread,
        glowExponent: spec.glowExponent,
        edgeStrength: spec.edgeStrength,
        edgeWidth: spec.edgeWidth,
        edgeExponent: spec.edgeExponent,
        domeDepth: 0,
        splayAmount: 1,
        cornerSmoothing,
      },
      specCanvasRef.current,
    );
    setSpecUrl(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specOn, w, h, radiiKey, cornerSmoothing, specSig]);

  // Safari caches SVG filter output by id; mint a fresh one whenever the map
  // changes (resize) so the highlight repaints instead of ghosting.
  const specVerRef = useRef(0);
  const lastSpecUrl = useRef<string | null>(null);
  if (lastSpecUrl.current !== specUrl) {
    lastSpecUrl.current = specUrl;
    specVerRef.current += 1;
  }
  const specId = `${gradId}-spec-${specVerRef.current}`;

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
        if (roundUniform) {
          // Round capsule/rect — border-radius keeps backdrop-filter alive.
          frost.style.borderRadius = `${radius}px`;
          frost.style.clipPath = '';
          frost.style.removeProperty('-webkit-clip-path');
        } else {
          const p = `path('${squirclePath(width, height, base, cornerSmoothing)}')`;
          frost.style.clipPath = p;
          frost.style.setProperty('-webkit-clip-path', p);
          frost.style.borderRadius = '';
        }
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
  // Frost shape. Squircle / per-corner: `clip-path: path()` ONLY — it's a true
  // squircle on every browser (Safari included) and clips the tint AND the
  // backdrop-filter to that exact path. We deliberately do NOT also set
  // `border-radius` there: on Safari `corner-shape` is unsupported so the radius
  // is circular and the fill becomes the intersection (circle), mismatching the
  // squircle edge stroke. Round/uniform panels (roundUniform) take the
  // border-radius path instead — see the note above (keeps backdrop-filter).
  const clip = ready && !roundUniform
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

  // Specular glint geometry. Default = the vertical top glint. specularCorners
  // runs the gradient along the panel's diagonal (top-left → bottom-right) so
  // both opposite corners catch the light. specularAngle builds a TRUE-angle
  // line in user space (px) so it isn't squished by the aspect ratio (0 = top,
  // +cw / -ccw). All fall back to objectBoundingBox until measured.
  let glint: {
    units: 'objectBoundingBox' | 'userSpaceOnUse';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  if (specularCorners && ready) {
    glint = { units: 'userSpaceOnUse', x1: 0, y1: 0, x2: w, y2: h };
  } else if (specularAngle != null && ready) {
    const a = (specularAngle * Math.PI) / 180;
    const ux = Math.sin(a);
    const uy = -Math.cos(a); // SVG y is down; 0° points up
    const len = Math.abs(w * ux) + Math.abs(h * uy);
    const cx = w / 2;
    const cy = h / 2;
    glint = {
      units: 'userSpaceOnUse',
      x1: cx + (ux * len) / 2,
      y1: cy + (uy * len) / 2,
      x2: cx - (ux * len) / 2,
      y2: cy - (uy * len) / 2,
    };
  } else {
    glint = { units: 'objectBoundingBox', x1: 0, y1: 0, x2: 0, y2: 1 };
  }

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
          // Round/uniform → border-radius (keeps backdrop-filter); squircle /
          // per-corner → clip-path. See `roundUniform` above.
          ...(roundUniform
            ? { borderRadius: radius }
            : { clipPath: clip, WebkitClipPath: clip }),
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
              <linearGradient
                id={gradId}
                gradientUnits={glint.units}
                x1={glint.x1}
                y1={glint.y1}
                x2={glint.x2}
                y2={glint.y2}
              >
                {specularCorners ? (
                  <>
                    <stop offset="0" stopColor="#ffffff" stopOpacity={0.6} />
                    <stop offset="0.14" style={{ stopColor: edge }} />
                    <stop offset="0.86" style={{ stopColor: edge }} />
                    <stop offset="1" stopColor="#ffffff" stopOpacity={0.6} />
                  </>
                ) : (
                  <>
                    <stop offset="0" stopColor="#ffffff" stopOpacity={0.6} />
                    <stop offset="0.14" style={{ stopColor: edge }} />
                    <stop offset="1" style={{ stopColor: edge }} />
                  </>
                )}
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

      {/* Baked geometry-aware specular — the displacement map's B channel pulled
          with the exact feColorMatrix LiquidGlass uses (white, alpha ∝ the
          per-corner highlight), additively blended so it lifts the frost on the
          lit corners like a real glass button. Shape lives in the map (neutral
          128 → alpha 0 outside), so it needs no clip. Static (resize only). */}
      {specOn && ready && specUrl && (
        <svg
          aria-hidden
          width="100%"
          height="100%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            // Composite the specular NORMALLY (alpha-over), NOT with a blend mode:
            // a blended child forces the panel to render as a group, and that group
            // becomes a backdrop boundary that kills the frost's backdrop-filter
            // (the same trap as `isolation`). The map is white + transparent
            // outside the rim, so alpha-over still reads as a clean lit edge; the
            // `strength` gain rides the feColorMatrix below, not opacity.
          }}
        >
          <defs>
            <filter
              id={specId}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
              x={0}
              y={0}
              width={w}
              height={h}
            >
              <feImage
                href={specUrl}
                x={0}
                y={0}
                width={w}
                height={h}
                preserveAspectRatio="none"
                result="m"
              />
              <feColorMatrix
                in="m"
                type="matrix"
                values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 ${spec.strength} 0 ${(-128 / 255) * spec.strength}`}
              />
            </filter>
          </defs>
          <rect x={0} y={0} width={w} height={h} filter={`url(#${specId})`} />
        </svg>
      )}

      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

export default FrostPanel;
