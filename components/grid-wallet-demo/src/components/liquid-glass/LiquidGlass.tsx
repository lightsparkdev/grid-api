'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { displacementMapToDataURL } from './displacement';
import { squirclePath } from './squircle';
import { useGlassEngine } from './useGlassEngine';

/** `corner-shape` isn't in React's CSSProperties typings yet. */
type GlassCSS = React.CSSProperties & { cornerShape?: 'squircle' | 'round' | 'bevel' };

/**
 * True when the browser can render `corner-shape: squircle` natively (Chromium
 * 139+). On Safari/Firefox this is false and we fall back to a circular corner
 * — mirroring the design system's `@supports (corner-shape: squircle)` token
 * mapping so the glass matches the rest of the app on every browser.
 */
function useSquircleSupport(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    setOk(typeof window !== 'undefined' && !!window.CSS?.supports?.('corner-shape', 'squircle'));
  }, []);
  return ok;
}

/**
 * LiquidGlass — a faithful, cross-browser reproduction of Aave's "glass" effect.
 *
 * The effect works directly on the live DOM you nest inside it: the content
 * renders normally, and an SVG `feDisplacementMap` bends the real pixels under
 * a rounded-rect "lens" to recreate light refracting through curved glass.
 * Text stays selectable, links stay clickable.
 *
 * Pipeline (matches Aave's shipped filter graph):
 *   feFlood gray ─┐
 *   feImage(map) ─┴► "map"  ─► [feColorMatrix ratio] ─► displacement (×3 for
 *   chromatic aberration) ─► specular highlight (B channel) ─► mask to lens ─►
 *   composite over the untouched source.
 */

export interface GlassConfig {
  /** Corner radius of the lens, in px. */
  radius: number;
  /** Refraction band width — how far in from the edge the bend ramps, px. */
  depth: number;
  /** Peak refraction strength (the `feDisplacementMap` scale), px. */
  scale: number;
  /** Chromatic aberration amount (per-channel displacement split). */
  chromaticAberration: number;
  /** Gaussian blur applied to the refracted content inside the lens, px. */
  blur: number;
  /** Spherical curvature (dome sagitta), px. 0 == flat/linear refraction. */
  domeDepth: number;
  /** Flatten the bend near edges so content stays readable. 1 == off. */
  splay: number;
  /** Specular highlight direction, degrees. */
  specularRotation: number;
  /** How strongly the specular highlight is added. */
  specularStrength: number;
  /** Broad glow highlight strength. */
  glowStrength: number;
  glowSpread: number;
  glowExponent: number;
  /** Thin rim-light strength. */
  edgeStrength: number;
  edgeWidth: number;
  edgeExponent: number;
  /** Subtle lens-only brightness overlay, -1..1. */
  brightness: number;
  /** Corner smoothing, 0..1. 0 = circular corner, ~0.6 = iOS squircle. */
  cornerSmoothing: number;
  /** Frosted fill painted over the refraction (any CSS color — e.g. a translucent
   *  white) for the iOS "material" look. Pair with `tintBlur`. Omit = clear glass. */
  tint?: string;
  /**
   * Frost blur (px) painted as a CSS `backdrop-filter` on the tint layer, instead
   * of an in-filter `feGaussianBlur`. This is how Aave ships the "material" look:
   * `backdrop-filter` is GPU-accelerated (cheap on WebKit, where SVG blur is the
   * most expensive primitive), so it gives the heavy frost without bloating the
   * filter's source graphic. Pair with `tint`; prefer this over `blur` for sheets.
   */
  tintBlur?: number;
  /** Outer drop shadow under the lens rim (CSS box-shadow value). */
  edgeShadow?: string;
  /** Inner shadow that gives the glass thickness (CSS box-shadow value, no `inset`). */
  insetShadow?: string;
  /** Swag drop-shadow components — AppShell builds these into a box-shadow so the
   *  shadow is tunable live (offset Y / blur / spread / opacity). */
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowOpacity?: number;
  /** Resolution of the generated displacement map. */
  mapSize: number;
  /**
   * Bump to mint a fresh SVG filter id. Safari caches filter OUTPUT by id, so
   * content animating INSIDE the lens (e.g. a live backdrop copy) ghosts/
   * freezes until the id changes — callers bump this per content frame on
   * Safari only. Shape/position changes already refresh automatically.
   */
  refreshKey?: number | string;
}

export interface LensRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

export interface LiquidGlassProps extends Partial<GlassConfig> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Restrict the glass to a sub-region; defaults to the whole element. */
  lens?: LensRect;
  /** Draw a faint outline around the lens (debugging / showcase). */
  showOutline?: boolean;
  /**
   * Per-corner clip radii `[topLeft, topRight, bottomRight, bottomLeft]`, for a
   * surface whose corners differ (e.g. a bottom sheet whose bottom corners hug a
   * phone screen while the top stays a smaller sheet radius). Overrides the
   * uniform `radius` for the clip/edge/specular layers (cross-browser via
   * clip-path), so the glass chrome — including the bright edge rim — traces these
   * corners. The displacement map itself stays uniform (`radius`); fine in
   * practice, and especially under blur.
   */
  cornerRadii?: [number, number, number, number];
}

const DEFAULTS: GlassConfig = {
  radius: 44,
  depth: 16,
  scale: 26,
  chromaticAberration: 0.2,
  blur: 0,
  domeDepth: 40,
  splay: 1,
  specularRotation: 45,
  specularStrength: 1,
  glowStrength: 0.12,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0.25,
  edgeWidth: 2,
  edgeExponent: 1.5,
  brightness: 0.05,
  cornerSmoothing: 0.6,
  edgeShadow: '0 10px 30px -6px rgba(0,0,0,0.28)',
  insetShadow: undefined,
  mapSize: 256,
};

function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      // offsetWidth/Height are layout px (ignore ancestor CSS transforms), so the
      // filter's userSpaceOnUse region matches the element's own coordinate space
      // even when a parent is scaled (e.g. the phone's fit-to-fit transform).
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

export default function LiquidGlass(props: LiquidGlassProps) {
  const cfg: GlassConfig = { ...DEFAULTS, ...stripUndefined(props) };
  const { children, className, style, lens, showOutline, cornerRadii } = props;

  const { ref: containerRef, size } = useElementSize();
  const W = size.w;
  const H = size.h;

  // Squircle only where the platform supports it; circular fallback elsewhere.
  // EXCEPT with per-corner radii: that route clips via path() — which squircles
  // in every browser — so the MAP must keep the real smoothing too, or Safari
  // draws a circular rim/glow inside a squircle clip (mismatched arcs).
  const squircleOK = useSquircleSupport();
  const effSmoothing = squircleOK || cornerRadii ? cfg.cornerSmoothing : 0;

  // WebKit needs a trimmed filter graph (see useGlassEngine): the specular pass
  // reads the raw map (Aave's Safari path) to dodge a feComposite-over-flood
  // quirk, and the fresh-id signature includes the engine so the swap repaints.
  const { isSafari } = useGlassEngine();

  // Resolve the lens rectangle (defaults to the whole element).
  const lx = lens?.x ?? 0;
  const ly = lens?.y ?? 0;
  const lw = lens?.width ?? W;
  const lh = lens?.height ?? H;
  const lr = lens?.radius ?? cfg.radius;
  // Stable key so the per-corner radii (a fresh array each render) don't retrigger
  // the map effect unless their values actually change.
  const cornerKey = cornerRadii ? cornerRadii.join(',') : '';

  // Generate the displacement map whenever the lens shape/look changes (not on
  // mere position changes — those only shift the filter region, keeping FPS up).
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  useEffect(() => {
    if (lw <= 0 || lh <= 0) return;
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    // Render the map at the lens's own pixel density (capped by mapSize) so the
    // rounded corner stays crisp instead of getting upscaled and blocky.
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    // Aspect-correct buffer that matches the lens proportions (so a tall lens
    // doesn't squash the corner onto a square grid). `mapSize` caps the long
    // side in CSS px; we then render at device-pixel density so the map stays
    // crisp on retina (a 512 cap becomes a 1024px buffer at dpr 2).
    const longCss = Math.min(cfg.mapSize, Math.max(lw, lh));
    const longPx = Math.max(32, Math.round(longCss * dpr));
    let mapW: number;
    let mapH: number;
    if (lw >= lh) {
      mapW = longPx;
      mapH = Math.max(16, Math.round((longPx * lh) / lw));
    } else {
      mapH = longPx;
      mapW = Math.max(16, Math.round((longPx * lw) / lh));
    }
    const url = displacementMapToDataURL(
      {
        width: mapW,
        height: mapH,
        lensHalfWidth: lw / 2,
        lensHalfHeight: lh / 2,
        borderRadius: lr,
        cornerRadii,
        depth: cfg.depth,
        sdfBoundary: true,
        edgeFalloff: true,
        specularRotation: cfg.specularRotation,
        glowStrength: cfg.glowStrength,
        glowSpread: cfg.glowSpread,
        glowExponent: cfg.glowExponent,
        edgeStrength: cfg.edgeStrength,
        edgeWidth: cfg.edgeWidth,
        edgeExponent: cfg.edgeExponent,
        domeDepth: cfg.domeDepth,
        splayAmount: cfg.splay,
        cornerSmoothing: effSmoothing,
      },
      canvasRef.current,
    );
    setMapUrl(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lw,
    lh,
    lr,
    cornerKey,
    cfg.depth,
    cfg.domeDepth,
    cfg.splay,
    cfg.specularRotation,
    cfg.glowStrength,
    cfg.glowSpread,
    cfg.glowExponent,
    cfg.edgeStrength,
    cfg.edgeWidth,
    cfg.edgeExponent,
    effSmoothing,
    cfg.mapSize,
  ]);

  // Squircle is active only where the platform supports it and the user asked
  // for it. Fill/outline layers are clipped to the *exact* superellipse the map
  // uses (so they always agree); when circular we force `corner-shape: round` to
  // override any global `* { corner-shape: squircle }` rule. The soft drop
  // shadow can't be clip-path'd (that would erase the shadow) so it leans on the
  // native corner-shape, which is fine because it's blurred.
  // Per-corner radii (e.g. a bottom sheet) always clip via path() — which works in
  // every browser — so the chrome traces those corners even where `corner-shape`
  // isn't supported. Uniform glass keeps the support-gated squircle/circle fallback.
  const squircleActive = squircleOK && cfg.cornerSmoothing > 0;
  const clipPath =
    cornerRadii && lw > 0 && lh > 0
      ? `path('${squirclePath(lw, lh, cornerRadii, cfg.cornerSmoothing)}')`
      : squircleActive && lw > 0 && lh > 0
        ? `path('${squirclePath(lw, lh, lr, cfg.cornerSmoothing)}')`
        : undefined;
  const clipStyle: GlassCSS = clipPath
    ? { clipPath, WebkitClipPath: clipPath }
    : { cornerShape: 'round' };
  // The drop shadow can't be clip-path'd (that erases it), so it leans on
  // `corner-shape`. Trace the SAME superellipse the map/clip use (exponent
  // 2 + smoothing*4 ⇒ CSS superellipse(1 + smoothing*2)) rather than a hardcoded
  // `squircle` (exponent 4): at large per-corner radii (e.g. a sheet's bottom
  // corners) a mismatched exponent makes the shadow corner poke past the body.
  const shadowCornerStyle: GlassCSS = {
    cornerShape: squircleActive
      ? `superellipse(${(1 + cfg.cornerSmoothing * 2).toFixed(3)})`
      : 'round',
  };

  // Safari caches SVG filter output by filter id and ignores attribute changes
  // (including the lens x/y), so it freezes the glass mid-drag while the plain
  // CSS shadow keeps moving. The fix (straight from Aave's writeup) is to mint a
  // FRESH id on every update — position included — which forces a clean repaint.
  const baseId = useRef(`lg-${Math.random().toString(36).slice(2)}`).current;
  const sig = `${mapUrl}|${lx}|${ly}|${lw}|${lh}|${cfg.scale}|${cfg.chromaticAberration}|${cfg.blur}|${cfg.specularStrength}|${cfg.glowStrength}|${cfg.edgeStrength}|${cfg.refreshKey ?? ''}|${isSafari ? 's' : 'c'}`;
  const verRef = useRef(0);
  const lastSig = useRef<string | null>(null);
  if (lastSig.current !== sig) {
    lastSig.current = sig;
    verRef.current += 1;
  }
  const filterId = `${baseId}-${verRef.current}`;

  const ready = W > 0 && H > 0 && lw > 0 && lh > 0 && !!mapUrl;
  const chroma = cfg.chromaticAberration;
  const src = cfg.blur > 0 ? 'blurred' : 'SourceGraphic';
  const wantSpecular = cfg.glowStrength > 0 || cfg.edgeStrength > 0;
  const lensRegion = { x: lx, y: ly, width: lw, height: lh };

  // When the lens fills the whole element (e.g. the phone shell), blur / chroma /
  // displacement near the edge would sample transparent black just past the
  // content and draw a dark rim. Fix: grow the filter region by `bleed` (so it
  // reads the content that bleeds beyond the silhouette) and clip the output
  // back to the lens shape. Sub-region lenses are surrounded by content already,
  // so they skip this.
  const fullLens = !lens;
  const bleed = fullLens
    ? Math.ceil(cfg.blur * 3 + cfg.scale * (1 + 0.2 * Math.max(chroma, 0)) + cfg.edgeWidth + 4)
    : 0;
  const outputClip: GlassCSS = !fullLens
    ? {}
    : clipPath
      ? { clipPath, WebkitClipPath: clipPath }
      : { borderRadius: lr, overflow: 'hidden' };

  // Inset-shadow / drop-shadow overlays follow the border-radius, so when the lens
  // has per-corner radii give them the matching per-corner CSS (top-left, top-right,
  // bottom-right, bottom-left) — otherwise the edge highlight rounds at the uniform
  // radius and gets sliced by the per-corner clip instead of hugging the corners.
  const overlayBase: React.CSSProperties = {
    position: 'absolute',
    left: lx,
    top: ly,
    width: lw,
    height: lh,
    borderRadius: cornerRadii
      ? `${cornerRadii[0]}px ${cornerRadii[1]}px ${cornerRadii[2]}px ${cornerRadii[3]}px`
      : lr,
    pointerEvents: 'none',
  };
  // Clipped overlays (tint/brightness/inset). PER-CORNER radii only: the
  // path() clip is the single source of shape and the overlay must NOT also
  // round itself — Safari renders a fill as the INTERSECTION of border-radius
  // (circular there) and clip-path, leaving squircle corners unfilled inside
  // the correctly-shaped rim. Uniform glass keeps border-radius: inset
  // box-shadows DRAW from it (zeroing it straightens them), and on Chromium
  // its superellipse matches the clip anyway.
  const overlayClipped: GlassCSS =
    cornerRadii && clipPath
      ? { ...overlayBase, borderRadius: 0, clipPath, WebkitClipPath: clipPath }
      : { ...overlayBase, ...clipStyle };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {/* The content is filtered in place (region anchored at 0,0). The filter
          composites the refracted lens back over the untouched source, so the
          background always lines up — and WebKit handles this correctly, unlike
          an offset filter region. */}
      {/* Outer layer trims the refracted output back to the lens silhouette
          (clip-path is GPU-anti-aliased, so the corner stays crisp and the
          bleed margin used for edge sampling is hidden). `isolation` pins the
          composited filtered child INSIDE this clip on Safari — without it the
          will-change:filter layer escapes the path() and rounds itself (the
          scroll-refraction experiment's critical fix). */}
      <div style={{ width: '100%', height: '100%', isolation: 'isolate', ...outputClip }}>
        {/* Fill the glass region so the filter has a sized source to rasterize.
            A `filter` makes this a containing block whose children are absolute,
            leaving it 0-height otherwise — and Chrome then renders the filter
            empty (the glass goes blank). */}
        <div
          style={{
            width: '100%',
            height: '100%',
            // Safari: a will-change-composited filter layer escapes the
            // ancestor clip-path and rounds itself (the experiment's lesson) —
            // keep the hint Chromium-only.
            willChange: isSafari ? undefined : 'filter',
            filter: ready ? `url(#${filterId})` : undefined,
          }}
        >
          {children}
        </div>
      </div>

      {/* Frosted fill over the refraction (the iOS "material" look) — clipped to the
          lens shape. The blur is a GPU `backdrop-filter` (Aave's approach), not an
          in-filter feGaussianBlur, so the heavy frost costs nothing on the SVG
          filter and stays cheap on WebKit. Highlights/shadow below sit on top. */}
      {ready && (cfg.tint || (cfg.tintBlur ?? 0) > 0) && (
        // FrostPanel's proven Safari pattern: clip-path + tint + backdrop-
        // filter all on ONE element, and NO border-radius — Safari renders a
        // fill as the INTERSECTION of border-radius (circular there) and
        // clip-path, and won't bound a backdrop-filter child by an ancestor's
        // clip-path either.
        <div
          aria-hidden
          style={{
            ...overlayClipped,
            background: cfg.tint,
            ...((cfg.tintBlur ?? 0) > 0
              ? {
                  backdropFilter: `blur(${cfg.tintBlur}px)`,
                  WebkitBackdropFilter: `blur(${cfg.tintBlur}px)`,
                }
              : null),
          }}
        />
      )}

      {/* Soft outer drop shadow — uses native corner-shape (blurred, so the
          fixed squircle exponent is imperceptible) and falls back to circular. */}
      {ready && cfg.edgeShadow && (
        <div aria-hidden style={{ ...overlayBase, ...shadowCornerStyle, boxShadow: cfg.edgeShadow }} />
      )}

      {/* Lens-only brightness, clipped to the exact squircle (or circular) the
          map uses so its edge lines up with the refraction boundary. */}
      {ready && cfg.brightness !== 0 && (
        <div
          aria-hidden
          style={{
            ...overlayClipped,
            background: cfg.brightness > 0 ? '#fff' : '#000',
            opacity: Math.min(1, Math.abs(cfg.brightness)),
            mixBlendMode: cfg.brightness > 0 ? 'soft-light' : 'multiply',
          }}
        />
      )}

      {/* Inner thickness / inset highlight. */}
      {ready && cfg.insetShadow && (
        <div aria-hidden style={{ ...overlayClipped, boxShadow: `inset ${cfg.insetShadow}` }} />
      )}

      {showOutline && (
        <div
          aria-hidden
          style={{ ...overlayClipped, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)' }}
        />
      )}

      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
      >
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
            x={-bleed}
            y={-bleed}
            width={W + 2 * bleed}
            height={H + 2 * bleed}
          >
            {ready && (
              <>
                {/* Neutral-gray base + the displacement map placed over the lens. */}
                <feFlood floodColor="rgb(128,128,128)" floodOpacity="1" result="mapBg" />
                <feImage
                  href={mapUrl ?? undefined}
                  {...lensRegion}
                  preserveAspectRatio="none"
                  result="rawMap"
                />
                <feComposite in="rawMap" in2="mapBg" operator="over" result="map" />

                {cfg.blur > 0 && (
                  <feGaussianBlur in="SourceGraphic" stdDeviation={cfg.blur} result="blurred" />
                )}

                {chroma > 0 ? (
                  <>
                    {/* Red bends most, green a touch less, blue baseline → fringe. */}
                    <feDisplacementMap
                      in={src}
                      in2="map"
                      scale={cfg.scale * (1 + 0.2 * chroma)}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      {...lensRegion}
                    />
                    <feColorMatrix
                      type="matrix"
                      values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                      result="dispR"
                    />
                    <feDisplacementMap
                      in={src}
                      in2="map"
                      scale={cfg.scale * (1 + 0.1 * chroma)}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      {...lensRegion}
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                      result="dispG"
                    />
                    <feDisplacementMap
                      in={src}
                      in2="map"
                      scale={cfg.scale}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      {...lensRegion}
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                      result="dispB"
                    />
                    <feComposite
                      in="dispR"
                      in2="dispG"
                      operator="arithmetic"
                      k1="0"
                      k2="1"
                      k3="1"
                      k4="0"
                    />
                    <feComposite
                      in2="dispB"
                      operator="arithmetic"
                      k1="0"
                      k2="1"
                      k3="1"
                      k4="0"
                      result="lensResult"
                    />
                  </>
                ) : (
                  <feDisplacementMap
                    in={src}
                    in2="map"
                    scale={cfg.scale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="lensResult"
                    {...lensRegion}
                  />
                )}

                {wantSpecular && (
                  <>
                    {/* Pull the specular term out of the map's B channel (white,
                        alpha ∝ highlight) and add it onto the refracted content.
                        Restricted to the lens region so Safari doesn't run the
                        highlight pass over the whole filter area. */}
                    <feColorMatrix
                      in={isSafari ? 'rawMap' : 'map'}
                      type="matrix"
                      values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 ${-128 / 255}`}
                      result="specMask"
                      {...lensRegion}
                    />
                    <feComposite
                      in="specMask"
                      in2="lensResult"
                      operator="arithmetic"
                      k1="0"
                      k2={cfg.specularStrength}
                      k3="1"
                      k4="0"
                      result="lensResult"
                      {...lensRegion}
                    />
                  </>
                )}

                {/* Punch the lens region out of the source and drop the
                    refracted lens back in its place, so the rest of the content
                    is the original, perfectly aligned pixels. */}
                <feFlood floodColor="black" floodOpacity="1" result="lensMask" {...lensRegion} />
                <feComposite in="SourceGraphic" in2="lensMask" operator="out" result="holedSG" />
                <feComposite in="lensResult" in2="holedSG" operator="over" />
              </>
            )}
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const k in obj) {
    const v = obj[k];
    if (v !== undefined && k !== 'children' && k !== 'className' && k !== 'style' && k !== 'lens' && k !== 'showOutline') {
      out[k] = v;
    }
  }
  return out;
}
