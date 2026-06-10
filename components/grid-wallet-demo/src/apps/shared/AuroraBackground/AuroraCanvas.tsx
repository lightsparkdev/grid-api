'use client';

import { useEffect, useRef } from 'react';
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
  type AuroraUniformLocations,
} from './auroraField';

/**
 * GPU aurora — draws the shared procedural field (auroraField.ts) to a WebGL
 * canvas, replacing the old full-screen `filter: blur(24px)` CSS layers that
 * tanked Safari. One cheap fragment pass per frame (procedural gradient + 1-D
 * Gaussian + soft-light + base mix); no per-frame texture upload.
 *
 * The field is element-relative (period scales with the element), so each
 * AuroraBackground renders its own — faithfully matching the CSS, where every
 * instance computed its gradient from its own box.
 */

const FRAG = `${AURORA_COMMON_GLSL}
uniform vec2 uResolution;  // device px
uniform float uDpr;
uniform vec2 uSize;        // element CSS px (w, h)
uniform float uRadial;     // 0/1 — showRadialGradient

void main(){
  vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uDpr; // CSS px, top-left
  float mask = 1.0;
  if (uRadial > 0.5){
    // radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)
    vec2 d = vec2((p.x - uSize.x) / uSize.x, p.y / uSize.y);
    mask = clamp((0.7 - length(d)) / 0.6, 0.0, 1.0);
  }
  // Dither the final colour against gl_FragCoord (device px) to kill 8-bit banding.
  gl_FragColor = vec4(ditherOutput(auroraFinal(p, mask), gl_FragCoord.xy), 1.0);
}`;

interface AuroraCanvasProps {
  showRadialGradient: boolean;
  /** Marks this canvas as a refraction source so the close-button lens can find it. */
  fieldId?: string;
  className?: string;
}

const MAX_DPR = 2;

export function AuroraCanvas({ showRadialGradient, fieldId, className }: AuroraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radialRef = useRef(showRadialGradient);
  radialRef.current = showRadialGradient;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let au: AuroraUniformLocations | null = null;
    let luts: AuroraLuts | null = null;
    let lutKey = '';
    let uRes: WebGLUniformLocation | null = null;
    let uDpr: WebGLUniformLocation | null = null;
    let uSize: WebGLUniformLocation | null = null;
    let uRadial: WebGLUniformLocation | null = null;

    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    let cssW = 0;
    let cssH = 0;
    let palette = readAuroraPalette(canvas);
    let periods = { pBase: 1, pOver: 1 };
    let raf = 0;
    let staticDirty = true;
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const initGL = (): boolean => {
      const ctx = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
      });
      if (!ctx) {
        console.warn('AuroraCanvas: WebGL unavailable');
        return false;
      }
      gl = ctx;
      prog = createAuroraProgram(gl, FRAG);
      if (!prog) return false;
      gl.useProgram(prog);
      au = getAuroraUniformLocations(gl, prog);
      luts = createAuroraLuts(gl, au); // textures filled on first draw (staticDirty)
      lutKey = '';
      uRes = gl.getUniformLocation(prog, 'uResolution');
      uDpr = gl.getUniformLocation(prog, 'uDpr');
      uSize = gl.getUniformLocation(prog, 'uSize');
      uRadial = gl.getUniformLocation(prog, 'uRadial');
      return true;
    };

    const resize = () => {
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      // The phone shell is CSS-scaled up (AppShell `transform: scale()`), so this
      // canvas is displayed larger than its layout box. clientWidth ignores that
      // transform; getBoundingClientRect includes it. Render at the true on-screen
      // pixel size (fit scale × DPR) so the gradient is sampled per display pixel
      // and the dither lands on real pixels — otherwise the low-res canvas is
      // scaled up and re-quantises into the stair-stepped bands.
      const rect = canvas.getBoundingClientRect();
      const fitScale = cssW > 0 && rect.width > 0 ? rect.width / cssW : 1;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * fitScale;
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      periods = auroraPeriods(cssW || 1, cssH || 1);
      if (gl) gl.viewport(0, 0, w, h);
      staticDirty = true;
    };

    const draw = () => {
      if (!gl || !prog || gl.isContextLost()) return;
      gl.useProgram(prog);
      if (staticDirty && au) {
        setAuroraStaticUniforms(gl, au, palette, periods);
        // Rebuild the blurred-gradient LUTs only when the theme or period changes
        // (skips DPR-only resizes — the LUTs are resolution-independent).
        const key = auroraLutKey(palette, periods);
        if (luts && key !== lutKey) {
          updateAuroraLuts(gl, luts, palette, periods);
          lutKey = key;
        }
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uDpr, dpr);
        gl.uniform2f(uSize, cssW, cssH);
        gl.uniform1f(uRadial, radialRef.current ? 1 : 0);
        staticDirty = false;
      }
      const t = reduceMq.matches ? 0 : auroraClock();
      const { driftBase, driftOver } = auroraDrift(cssW || 1, t);
      if (au) {
        gl.uniform1f(au.driftBase, driftBase);
        gl.uniform1f(au.driftOver, driftOver);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Animate while visible; reduced motion / hidden tab → render once and idle.
    const loop = () => {
      draw();
      raf = reduceMq.matches || document.hidden ? 0 : requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf && !reduceMq.matches && !document.hidden) raf = requestAnimationFrame(loop);
      else draw();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        wake();
      }
    };
    const onReduceChange = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      wake();
    };
    // The shell's fit scale changes on window resize without changing this canvas's
    // layout box, so the ResizeObserver won't fire — re-resolve true size here.
    const onResize = () => {
      resize();
      wake();
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
      palette = readAuroraPalette(canvas);
      staticDirty = true;
      wake();
    });

    let ro: ResizeObserver | null = null;
    if (initGL()) {
      resize();
      draw(); // paint frame 0 synchronously so the canvas never composites blank
      // Re-measure after layout settles — the shell's fit scale may not be applied
      // on the very first frame, which would leave the canvas under-resolved.
      requestAnimationFrame(() => {
        resize();
        wake();
      });
      ro = new ResizeObserver(() => {
        resize();
        wake();
      });
      ro.observe(canvas);
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('resize', onResize);
      reduceMq.addEventListener?.('change', onReduceChange);
      wake();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      stopTheme();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      reduceMq.removeEventListener?.('change', onReduceChange);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      data-aurora-field={fieldId}
      aria-hidden
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
