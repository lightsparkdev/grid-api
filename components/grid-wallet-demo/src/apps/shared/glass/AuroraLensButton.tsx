'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { computeDomeConstants } from '@/components/liquid-glass';
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
} from '@/apps/shared/AuroraBackground/auroraField';
import { SYMBOL_GLASS } from './presets';
import styles from './GlassSymbolButton.module.scss';

/**
 * Close-button glass that refracts the LIVE aurora on the GPU.
 *
 * It replaces the old static `--glass-aurora-backdrop` gradient (which the SVG
 * GlassOver refracted) with a tiny WebGL lens that samples the shared aurora
 * field (auroraField.ts) at the button's position over the full-screen aurora and
 * bends it with StageGL's analytic glass math + the SYMBOL_GLASS params. So the
 * X button refracts the actual drifting aurora again — cheaply, because the lens
 * is a single ~40px shader region (no full-screen SVG displacement tree).
 *
 * Only used in the aurora-over-issuance case; GlassSymbolButton stays the SVG
 * path for every other context (the sheet, the home header).
 */

const LENS_FRAG = `${AURORA_COMMON_GLSL}
uniform vec2 uResolution;    // device px (this button canvas)
uniform float uDpr;
uniform vec2 uButtonOffset;  // button top-left in aurora-local CSS px
uniform vec2 uLensHalf;      // CSS px
uniform float uCornerExp;
uniform float uRadius;       // CSS px
uniform float uDepth;        // CSS px
uniform float uScale;        // CSS px refraction
uniform float uDomeOn;
uniform vec2 uDomeR;         // CSS px
uniform vec2 uDomeS;
uniform float uSplay;
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

void main(){
  vec2 cp = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr; // button-local CSS px
  vec2 lensHalf = uLensHalf;
  vec2 p = cp - lensHalf;            // from centre
  float ax = abs(p.x);
  float ay = abs(p.y);
  float corner = min(uRadius, min(lensHalf.x, lensHalf.y));
  float qx = ax - lensHalf.x + corner;
  float qy = ay - lensHalf.y + corner;
  float outside = lpf(max(qx, 0.0), max(qy, 0.0), uCornerExp);
  float sdf = outside + min(max(qx, qy), 0.0) - corner;
  float coverage = clamp(0.5 - sdf, 0.0, 1.0); // ~1 CSS px AA (CSS also clips round)
  if (coverage <= 0.0) { gl_FragColor = vec4(0.0); return; }

  vec2 base = uButtonOffset + cp;    // aurora-local CSS px

  float dxm, dym;
  if (uDomeOn > 0.5) {
    dxm = domeGrad(ax, uDomeR.x, uDomeS.x);
    dym = domeGrad(ay, uDomeR.y, uDomeS.y);
  } else {
    dxm = min(ax / lensHalf.x, 1.0);
    dym = min(ay / lensHalf.y, 1.0);
  }
  if (uSplay < 1.0) {
    float splayRef = 0.5 * min(lensHalf.x, lensHalf.y);
    float splayInv = splayRef > 0.0 ? 1.0 / splayRef : 0.0;
    float flatY = max(0.0, 1.0 - (lensHalf.y - ay) * splayInv) * (1.0 - uSplay);
    float flatX = max(0.0, 1.0 - (lensHalf.x - ax) * splayInv) * (1.0 - uSplay);
    if (flatY > 0.001 || flatX > 0.001) {
      float rx = dxm; float ry = dym;
      dxm = rx * (1.0 - flatY); dym = ry * (1.0 - flatX);
      float lenBefore = sqrt(rx * rx + ry * ry);
      float lenAfter = sqrt(dxm * dxm + dym * dym);
      if (lenAfter > 0.001) { float kk = lenBefore / lenAfter; dxm *= kk; dym *= kk; }
    }
  }
  float dx = dxm * sign(p.x);
  float dy = dym * sign(p.y);

  float innerW = max(0.0, lensHalf.x - uDepth);
  float innerH = max(0.0, lensHalf.y - uDepth);
  float innerCorner = max(0.0, min(corner, min(innerW, innerH)));
  float ex = ax - innerW + innerCorner;
  float ey = ay - innerH + innerCorner;
  float innerSdf = lpf(max(ex, 0.0), max(ey, 0.0), uCornerExp) + min(max(ex, ey), 0.0) - innerCorner;
  float fscale = uDepth > 0.0 ? 1.0 / (uDepth * 1.4142136) : 1e6;
  float falloff = 0.5 * (1.0 + erf_(innerSdf * fscale));

  float amt = falloff * coverage;
  vec2 bend = vec2(-0.5 * dx, -0.5 * dy) * amt;
  vec3 col;
  if (uChroma > 0.0) {
    vec3 cR = auroraFinal(base + bend * (uScale * (1.0 + 0.2 * uChroma)), 1.0);
    vec3 cG = auroraFinal(base + bend * (uScale * (1.0 + 0.1 * uChroma)), 1.0);
    vec3 cB = auroraFinal(base + bend * uScale, 1.0);
    col = vec3(cR.r, cG.g, cB.b);
  } else {
    col = auroraFinal(base + bend * uScale, 1.0);
  }

  float proj = abs(clamp(p.x / lensHalf.x, -1.0, 1.0) * uSpecDir.x + clamp(p.y / lensHalf.y, -1.0, 1.0) * uSpecDir.y);
  float rim = sdf < 0.0 ? max(0.0, 1.0 + sdf / uEdgeW) : 0.0;
  float s = 0.0;
  if (uGlowStr > 0.0) {
    float gg = uGlowBand > 0.001 ? clamp((proj - uGlowInner) / uGlowBand, 0.0, 1.0) : 0.0;
    s += uGlowStr * pow(gg, uGlowExp) * falloff;
  }
  s += uEdgeStr * rim * pow(proj, uEdgeExp);
  col += uSpecStr * min(s, 1.0) * coverage;

  float bAmt = uBright * coverage;
  if (bAmt > 0.0) col = mix(col, sqrt(col), bAmt);
  else if (bAmt < 0.0) col *= (1.0 + bAmt);

  // Same ±1 LSB dither as the full-screen field (keeps the refracted aurora smooth).
  gl_FragColor = vec4(ditherOutput(col, gl_FragCoord.xy), coverage);
}`;

interface AuroraLensButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Button diameter — matches GlassSymbolButton (40 close / 44). */
  size?: 40 | 44;
  /** Lens-only brightness (close button uses headerGlassBrightness: 1 light / 0 dark). */
  brightness?: number;
  /** Selector for the full-screen aurora canvas this lens refracts. */
  fieldSelector?: string;
  'aria-label': string;
}

// Lens-only tuning for the issuance close button — kept separate from the shared
// SYMBOL_GLASS (which also drives the SVG glass buttons). Stronger refraction +
// chroma so the bent aurora reads clearly through the ~40px lens.
const LENS_DEPTH = 4; // SYMBOL_GLASS.depth (0.5) is a thin edge rim; widen the bend.
const LENS_SCALE = 15; // SYMBOL_GLASS.scale is 10.
const LENS_CHROMA = 0.5; // SYMBOL_GLASS.chromaticAberration is 0.25.

const MAX_DPR = 2;

export function AuroraLensButton({
  children,
  className,
  size = 40,
  brightness = SYMBOL_GLASS.brightness,
  fieldSelector = '[data-aurora-field="issuance"]',
  type = 'button',
  ...rest
}: AuroraLensButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brightnessRef = useRef(brightness);
  brightnessRef.current = brightness;

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

    const dome = computeDomeConstants(SYMBOL_GLASS.domeDepth, 20, 20);
    const ang = (SYMBOL_GLASS.specularRotation * Math.PI) / 180;
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
        'uResolution', 'uDpr', 'uButtonOffset', 'uLensHalf', 'uCornerExp', 'uRadius',
        'uDepth', 'uScale', 'uDomeOn', 'uDomeR', 'uDomeS', 'uSplay', 'uEdgeStr', 'uEdgeW',
        'uSpecStr', 'uSpecDir', 'uChroma', 'uGlowStr', 'uGlowInner', 'uGlowBand', 'uGlowExp',
        'uEdgeExp', 'uBright',
      ]) {
        lu[n] = U(n);
      }
      // Static lens uniforms (CSS px; the SYMBOL_GLASS look).
      gl.uniform2f(lu.uLensHalf, size / 2, size / 2);
      gl.uniform1f(lu.uCornerExp, 2 + Math.max(0, Math.min(1, SYMBOL_GLASS.cornerSmoothing)) * 4);
      gl.uniform1f(lu.uRadius, SYMBOL_GLASS.radius);
      gl.uniform1f(lu.uDepth, LENS_DEPTH);
      gl.uniform1f(lu.uScale, LENS_SCALE);
      gl.uniform1f(lu.uDomeOn, SYMBOL_GLASS.domeDepth > 0 ? 1 : 0);
      gl.uniform2f(lu.uDomeR, dome.Rx, dome.Ry);
      gl.uniform2f(lu.uDomeS, dome.scaleX, dome.scaleY);
      gl.uniform1f(lu.uSplay, SYMBOL_GLASS.splay);
      gl.uniform1f(lu.uEdgeStr, SYMBOL_GLASS.edgeStrength);
      gl.uniform1f(lu.uEdgeW, SYMBOL_GLASS.edgeWidth);
      gl.uniform1f(lu.uSpecStr, SYMBOL_GLASS.specularStrength);
      gl.uniform2f(lu.uSpecDir, Math.cos(ang), Math.sin(ang));
      gl.uniform1f(lu.uChroma, LENS_CHROMA);
      gl.uniform1f(lu.uGlowStr, SYMBOL_GLASS.glowStrength);
      gl.uniform1f(lu.uGlowInner, (1 - SYMBOL_GLASS.glowSpread) * SQRT2);
      gl.uniform1f(lu.uGlowBand, SYMBOL_GLASS.glowSpread * SQRT2);
      gl.uniform1f(lu.uGlowExp, SYMBOL_GLASS.glowExponent);
      gl.uniform1f(lu.uEdgeExp, SYMBOL_GLASS.edgeExponent);
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
      gl.uniform2f(lu.uButtonOffset, offX, offY);
      gl.uniform1f(lu.uBright, brightnessRef.current);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldSelector, size]);

  return (
    <button type={type} className={clsx(styles.root, size === 40 && styles.size40, className)} {...rest}>
      <div className={styles.glass} style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        />
        <span className={styles.glyph} style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </span>
      </div>
    </button>
  );
}
