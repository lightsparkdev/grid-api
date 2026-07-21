'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { computeDomeConstants, type GlassConfig } from '@/components/liquid-glass';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { observeTheme } from '@/lib/dotGridColors';
import {
  AURORA_COMMON_GLSL,
  auroraClock,
  auroraDrift,
  auroraLutKey,
  auroraPeriods,
  createAuroraLuts,
  createAuroraProgram,
  getAuroraUniformLocations,
  readAuroraPalette,
  setAuroraStaticUniforms,
  updateAuroraLuts,
  type AuroraLuts,
  type AuroraPalette,
  type AuroraUniformLocations,
} from './auroraField';

/**
 * Rectangular-squircle glass panel that refracts the LIVE aurora on the GPU —
 * AuroraLensButton's pattern generalized from a circle to a rounded-rect lens.
 *
 * Instead of SVG-filtering a DOM copy of the screen (which WebKit can't do —
 * see the liquid-glass README's Safari field notes), the fragment shader
 * RECOMPUTES the shared aurora field (auroraField.ts) at bent coordinates: same
 * palette LUTs, clock and drift as the full-screen field it sits over, so the
 * refraction is identical by construction and stays 60fps on Safari.
 *
 * The GLSL is displacement.ts's rounded-rect model ported term by term:
 * per-axis dome bend (domeGradient), splay flatten, erf edge falloff over
 * `depth`, squircle SDF via the superellipse lp-norm (cornerExp = 2 +
 * smoothing*4), and the glow + edge-rim specular. A translucent white `tint`
 * (the iOS material fill) is composited in-shader after the specular — the
 * same stacking as LiquidGlass's DOM tint layer.
 */

const LENS_FRAG = `${AURORA_COMMON_GLSL}
uniform vec2 uResolution;    // device px (this panel canvas)
uniform float uDpr;
uniform vec2 uPanelOffset;   // panel top-left in aurora-local CSS px
uniform vec2 uLensHalf;      // CSS px
uniform float uCornerExp;
uniform float uRadius;       // CSS px
uniform float uDepth;        // CSS px
uniform float uScale;        // CSS px refraction
uniform float uDomeOn;
uniform vec2 uDomeR;         // CSS px (per-axis dome radii)
uniform vec2 uDomeS;
uniform float uSplay;        // splayAmount (1 = off)
uniform float uSplayInv;     // 1 / (0.5 * min(halfW, halfH))
uniform float uEdgeStr;
uniform float uEdgeW;        // CSS px
uniform float uSpecStr;
uniform vec2 uSpecDir;
uniform float uChroma;
uniform float uGlowStr;
uniform float uGlowInner;
uniform float uGlowBand;
uniform float uGlowExp;
uniform float uEdgeExp;
uniform float uBright;
uniform vec3 uTintColor;
uniform float uTintAlpha;

void main(){
  vec2 cp = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr; // panel-local CSS px
  vec2 p = cp - uLensHalf;           // from centre
  float ax = abs(p.x);
  float ay = abs(p.y);
  float corner = min(uRadius, min(uLensHalf.x, uLensHalf.y));
  float qx = ax - uLensHalf.x + corner;
  float qy = ay - uLensHalf.y + corner;
  float sdf = lpf(max(qx, 0.0), max(qy, 0.0), uCornerExp) + min(max(qx, qy), 0.0) - corner;
  float coverage = clamp(0.5 - sdf, 0.0, 1.0); // ~1 CSS px AA (CSS clip-path also shapes)
  if (coverage <= 0.0) { gl_FragColor = vec4(0.0); return; }

  vec2 base = uPanelOffset + cp;     // aurora-local CSS px

  // Rounded-rect lens — displacement.ts's non-capsule model: per-axis bend,
  // domed when domeDepth > 0 (domeGradient), else linear in |x|/halfW.
  float dxm;
  float dym;
  if (uDomeOn > 0.5) {
    dxm = domeGrad(ax, uDomeR.x, uDomeS.x);
    dym = domeGrad(ay, uDomeR.y, uDomeS.y);
  } else {
    dxm = min(ax / uLensHalf.x, 1.0);
    dym = min(ay / uLensHalf.y, 1.0);
  }

  // Splay — flatten the bend near the edges for readability (renormalised so
  // the bend magnitude survives, only its direction flattens). displacement.ts
  // splayOn block, verbatim.
  if (uSplay < 1.0) {
    float flatY = max(0.0, 1.0 - (uLensHalf.y - ay) * uSplayInv) * (1.0 - uSplay);
    float flatX = max(0.0, 1.0 - (uLensHalf.x - ax) * uSplayInv) * (1.0 - uSplay);
    if (flatY > 0.001 || flatX > 0.001) {
      float rx = dxm;
      float ry = dym;
      dxm = rx * (1.0 - flatY);
      dym = ry * (1.0 - flatX);
      float lenBefore = sqrt(rx * rx + ry * ry);
      float lenAfter = sqrt(dxm * dxm + dym * dym);
      if (lenAfter > 0.001) {
        float k = lenBefore / lenAfter;
        dxm *= k;
        dym *= k;
      }
    }
  }

  // Edge falloff — erf ramp across the depth-inset inner band.
  float innerW = max(0.0, uLensHalf.x - uDepth);
  float innerH = max(0.0, uLensHalf.y - uDepth);
  float innerCorner = max(0.0, min(corner, min(innerW, innerH)));
  float ex = ax - innerW + innerCorner;
  float ey = ay - innerH + innerCorner;
  float innerSdf = lpf(max(ex, 0.0), max(ey, 0.0), uCornerExp) + min(max(ex, ey), 0.0) - innerCorner;
  float fscale = uDepth > 0.0 ? 1.0 / (uDepth * 1.4142136) : 1e6;
  float falloff = 0.5 * (1.0 + erf_(innerSdf * fscale));

  // Bend toward the centre (the magnification look): the map's 0.5 ± halfD
  // encoding with the quadrant sign restored from p.
  float amt = falloff * coverage;
  vec2 bend = vec2(-0.5 * sign(p.x) * dxm, -0.5 * sign(p.y) * dym) * amt;
  vec3 col;
  if (uChroma > 0.0) {
    vec3 cR = auroraFinal(base + bend * (uScale * (1.0 + 0.2 * uChroma)), 1.0);
    vec3 cG = auroraFinal(base + bend * (uScale * (1.0 + 0.1 * uChroma)), 1.0);
    vec3 cB = auroraFinal(base + bend * uScale, 1.0);
    col = vec3(cR.r, cG.g, cB.b);
  } else {
    col = auroraFinal(base + bend * uScale, 1.0);
  }

  // Specular — displacement.ts's projection along the specular axis (the sign
  // between terms flips per diagonal, which |dot| reproduces), the thin SDF rim,
  // and the broad glow band.
  float proj = abs(clamp(p.x / uLensHalf.x, -1.0, 1.0) * uSpecDir.x + clamp(p.y / uLensHalf.y, -1.0, 1.0) * uSpecDir.y);
  float rim = sdf < 0.0 ? max(0.0, 1.0 + sdf / uEdgeW) : 0.0;
  float s = 0.0;
  if (uGlowStr > 0.0) {
    float gg = uGlowBand > 0.001 ? clamp((proj - uGlowInner) / uGlowBand, 0.0, 1.0) : 0.0;
    s += uGlowStr * pow(gg, uGlowExp) * falloff;
  }
  s += uEdgeStr * rim * pow(proj, uEdgeExp);
  col += uSpecStr * min(s, 1.0) * coverage;

  // iOS material tint — LiquidGlass paints this as a DOM layer OVER the
  // refraction + specular; same order here.
  col = mix(col, uTintColor, uTintAlpha);

  // Lens-only brightness (soft-light-ish, as in AuroraLensButton).
  float bAmt = uBright * coverage;
  if (bAmt > 0.0) col = mix(col, sqrt(col), bAmt);
  else if (bAmt < 0.0) col *= (1.0 + bAmt);

  // Same ±1 LSB dither as the full-screen field (keeps the refracted aurora smooth).
  gl_FragColor = vec4(ditherOutput(col, gl_FragCoord.xy), coverage);
}`;

/** Parse an `rgb()`/`rgba()` tint into 0..1 channels + alpha (the only formats
 *  callers pass; anything else falls back to clear). */
function parseTint(tint: string | undefined): { rgb: [number, number, number]; a: number } {
  const m = tint?.match(/[\d.]+/g);
  if (!m || m.length < 3) return { rgb: [1, 1, 1], a: 0 };
  return {
    rgb: [+m[0] / 255, +m[1] / 255, +m[2] / 255],
    a: m.length >= 4 ? +m[3] : 1,
  };
}

interface AuroraLensPanelProps {
  className?: string;
  style?: CSSProperties;
  /** Uniform squircle corner radius, CSS px. */
  radius: number;
  cornerSmoothing: number;
  /** Lens optics — the same knobs the SVG GlassOver path takes. */
  glass: Pick<
    GlassConfig,
    | 'depth'
    | 'scale'
    | 'splay'
    | 'chromaticAberration'
    | 'domeDepth'
    | 'specularRotation'
    | 'specularStrength'
    | 'glowStrength'
    | 'glowSpread'
    | 'glowExponent'
    | 'edgeStrength'
    | 'edgeWidth'
    | 'edgeExponent'
    | 'brightness'
  >;
  /** Translucent material fill composited in-shader (rgb()/rgba() string). */
  tint?: string;
  /** Selector for the full-screen aurora canvas this lens refracts. */
  fieldSelector: string;
  /** Called when WebGL context creation fails — caller renders a fallback. */
  onUnavailable?: () => void;
  children: ReactNode;
}

const MAX_DPR = 2;

export function AuroraLensPanel({
  className,
  style,
  radius,
  cornerSmoothing,
  glass,
  tint,
  fieldSelector,
  onUnavailable,
  children,
}: AuroraLensPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Theme-reactive props read per draw (no GL re-init on theme flip).
  const tintRef = useRef(tint);
  tintRef.current = tint;
  const onUnavailableRef = useRef(onUnavailable);
  onUnavailableRef.current = onUnavailable;
  // The panel root carries the cross-browser squircle clip (fine on Safari for
  // a canvas — no SVG filter involved); the shader's superellipse coverage
  // provides the AA and bounds the refraction/rim inside it.
  const { ref: clipRef, style: clipStyle } = useSquircleClip<HTMLDivElement>({
    cornerRadii: [radius, radius, radius, radius],
    cornerSmoothing,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let au: AuroraUniformLocations | null = null;
    let luts: AuroraLuts | null = null;
    let lutKey = '';
    const lu: Record<string, WebGLUniformLocation | null> = {};
    let palette: AuroraPalette | null = null;
    let fieldEl: HTMLCanvasElement | null = null;
    let raf = 0;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const ang = (glass.specularRotation * Math.PI) / 180;
    const SQRT2 = Math.SQRT2;

    const findField = (): HTMLCanvasElement | null => {
      if (fieldEl && fieldEl.isConnected) return fieldEl;
      fieldEl = document.querySelector(fieldSelector);
      return fieldEl;
    };

    const initGL = (): boolean => {
      const ctx = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
      });
      if (!ctx) return false;
      gl = ctx;
      prog = createAuroraProgram(gl, LENS_FRAG);
      if (!prog) return false;
      gl.useProgram(prog);
      au = getAuroraUniformLocations(gl, prog);
      luts = createAuroraLuts(gl, au); // filled from the field's palette/periods in drawLens
      lutKey = '';
      const U = (n: string) => gl!.getUniformLocation(prog!, n);
      for (const n of [
        'uResolution', 'uDpr', 'uPanelOffset', 'uLensHalf', 'uCornerExp', 'uRadius',
        'uDepth', 'uScale', 'uDomeOn', 'uDomeR', 'uDomeS', 'uSplay', 'uSplayInv',
        'uEdgeStr', 'uEdgeW', 'uSpecStr', 'uSpecDir', 'uChroma', 'uGlowStr',
        'uGlowInner', 'uGlowBand', 'uGlowExp', 'uEdgeExp', 'uBright',
        'uTintColor', 'uTintAlpha',
      ]) {
        lu[n] = U(n);
      }
      // Static lens uniforms (CSS px). Size-dependent ones live in resize().
      gl.uniform1f(lu.uCornerExp, 2 + Math.max(0, Math.min(1, cornerSmoothing)) * 4);
      gl.uniform1f(lu.uRadius, radius);
      gl.uniform1f(lu.uDepth, glass.depth);
      gl.uniform1f(lu.uScale, glass.scale);
      gl.uniform1f(lu.uSplay, glass.splay);
      gl.uniform1f(lu.uEdgeStr, glass.edgeStrength);
      gl.uniform1f(lu.uEdgeW, glass.edgeWidth);
      gl.uniform1f(lu.uSpecStr, glass.specularStrength);
      gl.uniform2f(lu.uSpecDir, Math.cos(ang), Math.sin(ang));
      gl.uniform1f(lu.uChroma, glass.chromaticAberration);
      gl.uniform1f(lu.uGlowStr, glass.glowStrength);
      gl.uniform1f(lu.uGlowInner, (1 - glass.glowSpread) * SQRT2);
      gl.uniform1f(lu.uGlowBand, glass.glowSpread * SQRT2);
      gl.uniform1f(lu.uGlowExp, glass.glowExponent);
      gl.uniform1f(lu.uEdgeExp, glass.edgeExponent);
      gl.uniform1f(lu.uBright, glass.brightness);
      return true;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (gl) {
        gl.viewport(0, 0, w, h);
        gl.uniform2f(lu.uResolution, w, h);
        gl.uniform1f(lu.uDpr, dpr);
        // Layout size drives the lens geometry (the swoop's transform scales
        // the rendered canvas, not the layout, so these stay the rest values).
        const halfW = canvas.clientWidth / 2;
        const halfH = canvas.clientHeight / 2;
        gl.uniform2f(lu.uLensHalf, halfW, halfH);
        gl.uniform1f(lu.uSplayInv, Math.min(halfW, halfH) > 0 ? 1 / (0.5 * Math.min(halfW, halfH)) : 0);
        gl.uniform1f(lu.uDomeOn, glass.domeDepth > 0 ? 1 : 0);
        if (glass.domeDepth > 0) {
          const dome = computeDomeConstants(glass.domeDepth, halfW, halfH);
          gl.uniform2f(lu.uDomeR, dome.Rx, dome.Ry);
          gl.uniform2f(lu.uDomeS, dome.scaleX, dome.scaleY);
        }
      }
    };

    // Returns true once the aurora field is found and the lens is drawn.
    const drawLens = (): boolean => {
      if (!gl || !prog || gl.isContextLost() || !au) return false;
      gl.useProgram(prog);
      const field = findField();
      if (!field) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return false;
      }
      if (!palette) palette = readAuroraPalette(field);

      const localW = field.clientWidth || 1;
      const localH = field.clientHeight || 1;
      const aRect = field.getBoundingClientRect();
      const bRect = canvas.getBoundingClientRect();
      const fitScale = aRect.width > 0 ? aRect.width / localW : 1;
      const offX = (bRect.left - aRect.left) / fitScale;
      const offY = (bRect.top - aRect.top) / fitScale;

      const periods = auroraPeriods(localW, localH);
      const t = reduceMq.matches ? 0 : auroraClock();
      const { driftBase, driftOver } = auroraDrift(localW, t);

      setAuroraStaticUniforms(gl, au, palette, periods); // base colour + gradDir + periods + opacity
      // Bake the field's blurred-gradient LUTs (same periods as the full-screen
      // aurora it refracts). Rebuilt only on theme/field-size change, not per frame.
      const key = auroraLutKey(palette, periods);
      if (luts && key !== lutKey) {
        updateAuroraLuts(gl, luts, palette, periods);
        lutKey = key;
      }
      gl.uniform1f(au.driftBase, driftBase);
      gl.uniform1f(au.driftOver, driftOver);
      gl.uniform2f(lu.uPanelOffset, offX, offY);
      const t2 = parseTint(tintRef.current);
      gl.uniform3f(lu.uTintColor, t2.rgb[0], t2.rgb[1], t2.rgb[2]);
      gl.uniform1f(lu.uTintAlpha, t2.a);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return true;
    };

    const loop = () => {
      const ok = drawLens();
      if (reduceMq.matches) {
        // Static aurora — retry only until the field mounts, then idle.
        raf = ok ? 0 : requestAnimationFrame(loop);
      } else {
        raf = document.hidden ? 0 : requestAnimationFrame(loop);
      }
    };
    const wake = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        wake();
      }
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {
      if (initGL()) {
        resize();
        wake();
      }
    };
    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    const stopTheme = observeTheme(() => {
      palette = null; // re-read themed palette from the field next draw
      wake();
    });

    let ro: ResizeObserver | null = null;
    if (initGL()) {
      resize();
      ro = new ResizeObserver(() => {
        resize();
        wake();
      });
      ro.observe(canvas);
      document.addEventListener('visibilitychange', onVisibility);
      reduceMq.addEventListener?.('change', wake);
      wake();
    } else {
      // No WebGL (context exhaustion / blocked) — let the caller swap in a frost.
      onUnavailableRef.current?.();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      stopTheme();
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMq.removeEventListener?.('change', wake);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
    // Geometry/optics are fixed per mount (the notification's are constants).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldSelector, radius, cornerSmoothing]);

  return (
    <div
      ref={clipRef}
      className={clsx(className)}
      style={{ position: 'relative', ...clipStyle, ...style }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'block' }}>{children}</span>
    </div>
  );
}
