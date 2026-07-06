'use client';

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { computeDomeConstants } from '@/components/liquid-glass/displacement';
import { observeTheme, readDotGridPalette, type DotGridPalette } from '@/lib/dotGridColors';
import {
  createPointerTracker,
  createPressTracker,
  DOT_PRESS,
  DOT_WAKE_ENABLED,
  IDLE_SURFACE,
  type SurfaceSample,
} from '@/lib/dotGridMotion';

/**
 * WebGL "stage": draws the dot-grid backdrop AND the glass lens in one pass.
 *
 * The dot field + ripple is rendered to an offscreen 2D canvas (reusing the
 * grid-visualizer wave math) and uploaded as a texture. The fragment shader
 * passes that texture straight through everywhere except inside the phone's
 * rounded-rect, where it bends the sampled dots with an analytic displacement
 * (squircle SDF + dome + edge falloff + specular) — so the bezel refracts the
 * live, rippling dots at 60fps. This is the article's "sample an animated
 * surface as a texture and refract it in a shader" approach.
 *
 * The lens region tracks `targetSelector` (the phone shell element), so it
 * follows the phone as it's dragged.
 */

export interface StageGLLens {
  radius: number; // phone-local px
  depth: number;
  scale: number; // refraction strength (px)
  domeDepth: number;
  cornerSmoothing: number; // 0..1
  edgeStrength: number;
  edgeWidth: number;
  specularStrength: number;
  specularRotation: number; // deg
  chromaticAberration: number; // per-channel displacement split (fringe)
  splay: number; // 1 = off; <1 flattens the bend near the edges
  glowStrength: number;
  glowSpread: number;
  glowExponent: number;
  edgeExponent: number;
  brightness: number; // -0.5..0.5 lens-only brightness
  blur: number; // phone-local px (gaussian radius for refracted content)
  designWidth: number; // phone-local design width (e.g. 434)
}

const DEFAULT_LENS: StageGLLens = {
  radius: 76,
  depth: 18,
  scale: 26,
  domeDepth: 30,
  cornerSmoothing: 0.6,
  edgeStrength: 0.45,
  edgeWidth: 2,
  specularStrength: 0.9,
  specularRotation: 45,
  chromaticAberration: 0.15,
  splay: 0.85,
  glowStrength: 0.1,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeExponent: 1.5,
  brightness: 0.08,
  blur: 0,
  designWidth: 434,
};

// --- dot field (same constants/wave as components/DotGrid) ---
// Match grid-visualizer's SVG tile: 20×20 repeat, 2.5px dot at (8.75, 8.75), bg offset 8px.
const DOT_SPACING = 20;
const DOT_SIZE = 2.5;
// Draw the dot field this far past each visible edge (CSS px) so the click ripple
// has real dots to pull in from beyond the frame — no "dots only exist inside"
// boundary mid-wave. At rest these extra dots sit just off-screen (the gutter is a
// hair under the gap, so the first off-frame dot hides behind the edge). The
// visible canvas samples the inner window via the shader's toUV.
const DOT_BLEED = 48;

// Stashed: the original behavior fired the ripple immediately on pointer-down.
// Now the grid presses in on hold and fires the ripple on RELEASE. Flip this to
// true to restore plain click-to-ripple (and drop the press dimple).
const RIPPLE_ON_PRESS = false;

// Presses that begin on the phone UI (this wraps the whole phone) don't touch the
// backdrop — only presses that start on the backdrop do.
const FOREGROUND_SELECTOR = '[class*="AppShell_scaled"]';

/**
 * Even grid with a clean, symmetric edge gutter that's a hair SMALLER than the gap
 * (by one dot size). Two reasons: (1) it reads as even padding all around, and
 * (2) the first dot just past each edge lands fully off-screen, so when the field
 * is extended into the bleed margin those extra dots stay hidden at rest. Returns
 * the VISIBLE lattice (startX = gutter, step = gap); drawDotField extends it across
 * the bleed-padded buffer.
 */
function dotLayout(w: number, h: number) {
  const cols = Math.max(1, Math.round((w + 2 * DOT_SIZE) / DOT_SPACING) - 1);
  const rows = Math.max(1, Math.round((h + 2 * DOT_SIZE) / DOT_SPACING) - 1);
  const stepX = (w + 2 * DOT_SIZE) / (cols + 1); // the gap
  const stepY = (h + 2 * DOT_SIZE) / (rows + 1);
  return {
    cols,
    rows,
    startX: stepX - DOT_SIZE, // gutter ≈ gap − one dot, so off-frame dots hide
    startY: stepY - DOT_SIZE,
    stepX,
    stepY,
  };
}

function drawDotField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bleed: number,
  dpr: number,
  palette: DotGridPalette,
  bgColor: string,
) {
  const fullW = w + 2 * bleed;
  const fullH = h + 2 * bleed;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px on the device-sized buffer
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, fullW, fullH);
  const { startX, startY, stepX, stepY } = dotLayout(w, h);
  if (stepX <= 0 || stepY <= 0) return;
  // The visible lattice (visible x = startX + n*stepX) extended across the whole
  // bleed-padded buffer (shifted by `bleed`), so the ripple can pull in dots from
  // just past the frame. At rest the extra (off-frame) dots sit outside the visible
  // window and stay hidden; the wave is now a GPU sample-displacement so this field
  // is drawn once (static), not per frame.
  const nMin = Math.floor((-bleed - startX) / stepX);
  const nMax = Math.ceil((fullW - bleed - startX) / stepX);
  const mMin = Math.floor((-bleed - startY) / stepY);
  const mMax = Math.ceil((fullH - bleed - startY) / stepY);
  ctx.fillStyle = palette.dot;
  for (let n = nMin; n <= nMax; n++) {
    const midX = bleed + startX + n * stepX;
    for (let m = mMin; m <= mMax; m++) {
      const midY = bleed + startY + m * stepY;
      ctx.fillRect(midX - DOT_SIZE / 2, midY - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE);
    }
  }
}

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;            // canvas device px
uniform vec4 uLens;          // x,y,w,h (top-down device px)
uniform float uCornerExp;
uniform float uRadius;       // device px
uniform float uDepth;        // device px
uniform float uScale;        // device px refraction
uniform float uDomeOn;
uniform vec2 uDomeR;         // Rx, Ry (device px)
uniform vec2 uDomeS;         // scaleX, scaleY
uniform float uEdgeStr;
uniform float uEdgeW;        // device px
uniform float uSpecStr;
uniform vec2 uSpecDir;       // cos,sin
uniform float uBlur;         // device px (gaussian radius for refracted content)
uniform float uChroma;       // chromatic aberration (per-channel split)
uniform float uSplay;        // 1 = off; <1 flattens the bend near the edges
uniform float uGlowStr;
uniform float uGlowInner;    // (1-spread)*sqrt2
uniform float uGlowBand;     // spread*sqrt2
uniform float uGlowExp;
uniform float uEdgeExp;
uniform float uBright;       // -0.5..0.5 lens-only brightness
uniform float uRippleT;     // seconds since release; < 0 = inactive (centre = uPressPos)
uniform float uRippleAmp;   // 0..1 rebound strength (= press depth at release)
uniform float uDpr;         // device px per CSS px (scales the CSS-px wave consts)
uniform float uBleed;       // dot field drawn this far past each visible edge (device px)
uniform vec2 uPressPos;    // press-in dimple centre, device px (top-down, matches sp)
uniform float uPressStr;   // 0..1 press depth; 0 = inactive
uniform float uBootMix;    // 0 = flat dots in bezel; 1 = full glass lens

// Map a visible-canvas position (device px, top-down) into the dot texture, which
// is larger than the canvas by uBleed on every side. The visible frame is a window
// into a continuous lattice, so the ripple can sample dots from just past the edge
// while at-rest dots stay whole and the off-frame ones hide outside the window.
vec2 toUV(vec2 p){ return (p + uBleed) / (uRes + vec2(2.0 * uBleed)); }

float lpf(float a, float b, float e){
  a = max(a, 0.0); b = max(b, 0.0);
  if (a <= 0.0) return b;
  if (b <= 0.0) return a;
  return pow(pow(a, e) + pow(b, e), 1.0 / e);
}
float erf_(float x){ float e = exp(2.0 * 1.7724539 * x); return (e - 1.0) / (e + 1.0); }
float domeGrad(float d, float R, float s){ float n = min(d, 0.999 * R); return (n / sqrt(R * R - n * n)) * s; }
// 5x5 separable gaussian collapsed to 9 bilinear taps: with LINEAR filtering each
// off-axis fetch blends two texels, so this matches the 25-tap result at ~1/3 the
// cost and with no per-pixel exp(). Offset/weights precomputed from exp(-0.4*i^2).
vec3 blurTex(vec2 uv, float r){
  vec2 o = (vec2(r) / (uRes + vec2(2.0 * uBleed))) * 0.6157;
  vec3 c = texture2D(uTex, uv).rgb;
  vec3 edge = texture2D(uTex, uv + vec2(o.x, 0.0)).rgb
            + texture2D(uTex, uv + vec2(-o.x, 0.0)).rgb
            + texture2D(uTex, uv + vec2(0.0, o.y)).rgb
            + texture2D(uTex, uv + vec2(0.0, -o.y)).rgb;
  vec3 corner = texture2D(uTex, uv + o).rgb
              + texture2D(uTex, uv + vec2(-o.x, o.y)).rgb
              + texture2D(uTex, uv + vec2(o.x, -o.y)).rgb
              + texture2D(uTex, uv - o).rgb;
  return (c + edge * 0.8722 + corner * 0.7608) / 7.5319;
}
// Sample the refracted dot field, blurring only inside the visible band.
vec3 fetch(vec2 uv, float amt){
  if (uBlur > 0.5 && amt > 0.01) return blurTex(uv, uBlur);
  return texture2D(uTex, uv).rgb;
}

// Press + rebound as ONE continuous surface field, so release feels like a single
// motion. While held, an inward dimple depresses the surface (dots gather toward the
// press point). On release the SAME dimple relaxes back to flat AND throws off one
// outward ring that's born at the press point and radiates out, fading — the ripple
// IS the press springing back. Signed radial magnitude m (>0 outward, <0 inward) along
// the centre axis. GPU sample-displacement of the static dot texture; dpr-scaled.
vec2 surfaceOffset(vec2 sp){
  float d = distance(sp, uPressPos);
  if (d <= 0.0001) return vec2(0.0);
  float SIGMA = 80.0 * uDpr;   // dimple half-width
  float PULL  = 30.0 * uDpr;   // peak inward gather
  float grad  = (d / SIGMA) * exp(-(d * d) / (2.0 * SIGMA * SIGMA)); // 0 at centre, peak ~SIGMA
  float m = -PULL * grad * uPressStr; // held: inward dimple (uPressStr is 0 once released)

  if (uRippleT >= 0.0 && uRippleAmp > 0.0) {
    float C   = 1400.0 * uDpr; // rebound ring speed (px/s)
    float W   = 110.0 * uDpr;  // ring half-width
    float AMP = 24.0 * uDpr;   // peak outward rebound
    // The pressed dimple relaxing back to flat (quick) — continuous with the held
    // state at t=0 (this term then equals the dimple the hold left behind).
    m += -PULL * grad * uRippleAmp * exp(-uRippleT / 0.12);
    // A single ring born at the press point as it springs back, radiating outward and
    // fading. birth is 0 at t=0 so the field starts exactly as the dimple (no jump).
    float xr = (d - C * uRippleT) / W;
    float ring = exp(-xr * xr);
    float birth = 1.0 - exp(-uRippleT / 0.06);
    float life = exp(-uRippleT / 0.5);
    m += AMP * uRippleAmp * ring * birth * life;
  }
  return normalize(sp - uPressPos) * m;
}

void main(){
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); // top-down device px
  vec2 warp = surfaceOffset(sp);        // unified press dimple + release rebound
  vec2 uv = toUV(sp - warp);            // dots ride it (into the bleed-padded texture)

  vec2 lo = uLens.xy;
  vec2 ls = uLens.zw;
  vec2 rel = sp - lo;                 // px from lens top-left
  if (rel.x < 0.0 || rel.y < 0.0 || rel.x > ls.x || rel.y > ls.y) {
    gl_FragColor = texture2D(uTex, uv);
    return;
  }

  vec2 lensHalf = ls * 0.5;
  vec2 p = rel - lensHalf;            // from lens centre
  float ax = abs(p.x);
  float ay = abs(p.y);
  float corner = min(uRadius, min(lensHalf.x, lensHalf.y));

  float qx = ax - lensHalf.x + corner;
  float qy = ay - lensHalf.y + corner;
  float outside = lpf(max(qx, 0.0), max(qy, 0.0), uCornerExp);
  float sdf = outside + min(max(qx, qy), 0.0) - corner;
  float aa = 1.5;
  float coverage = clamp(0.5 - sdf / aa, 0.0, 1.0);
  if (coverage <= 0.0) { gl_FragColor = texture2D(uTex, uv); return; }

  // bend magnitudes
  float dxm, dym;
  if (uDomeOn > 0.5) {
    dxm = domeGrad(ax, uDomeR.x, uDomeS.x);
    dym = domeGrad(ay, uDomeR.y, uDomeS.y);
  } else {
    dxm = min(ax / lensHalf.x, 1.0);
    dym = min(ay / lensHalf.y, 1.0);
  }
  // splay: flatten the bend near the edges so content stays readable (1 = off)
  if (uSplay < 1.0) {
    float splayRef = 0.5 * min(lensHalf.x, lensHalf.y);
    float splayInv = splayRef > 0.0 ? 1.0 / splayRef : 0.0;
    float flatY = max(0.0, 1.0 - (lensHalf.y - ay) * splayInv) * (1.0 - uSplay);
    float flatX = max(0.0, 1.0 - (lensHalf.x - ax) * splayInv) * (1.0 - uSplay);
    if (flatY > 0.001 || flatX > 0.001) {
      float rx = dxm;
      float ry = dym;
      dxm = rx * (1.0 - flatY);
      dym = ry * (1.0 - flatX);
      float lenBefore = sqrt(rx * rx + ry * ry);
      float lenAfter = sqrt(dxm * dxm + dym * dym);
      if (lenAfter > 0.001) { float kk = lenBefore / lenAfter; dxm *= kk; dym *= kk; }
    }
  }
  float dx = dxm * sign(p.x);
  float dy = dym * sign(p.y);

  // edge falloff
  float innerW = max(0.0, lensHalf.x - uDepth);
  float innerH = max(0.0, lensHalf.y - uDepth);
  float innerCorner = max(0.0, min(corner, min(innerW, innerH)));
  float ex = ax - innerW + innerCorner;
  float ey = ay - innerH + innerCorner;
  float innerSdf = lpf(max(ex, 0.0), max(ey, 0.0), uCornerExp) + min(max(ex, ey), 0.0) - innerCorner;
  float fscale = uDepth > 0.0 ? 1.0 / (uDepth * 1.4142136) : 1e6;
  float falloff = 0.5 * (1.0 + erf_(innerSdf * fscale));

  float amt = falloff * coverage;
  vec2 bend = vec2(-0.5 * dx, -0.5 * dy) * amt; // pre-scale displacement vector
  // Sample the refracted dot field. With chroma, R/G/B bend by slightly different
  // amounts (colour fringe); fetch() blurs only inside the visible band (amt > 0,
  // the flat centre is covered by the screen) and is free when blur = 0.
  vec3 col;
  if (uChroma > 0.0) {
    vec2 sR = toUV(sp + bend * (uScale * (1.0 + 0.2 * uChroma)) - warp);
    vec2 sG = toUV(sp + bend * (uScale * (1.0 + 0.1 * uChroma)) - warp);
    vec2 sB = toUV(sp + bend * uScale - warp);
    col = vec3(fetch(sR, amt).r, fetch(sG, amt).g, fetch(sB, amt).b);
  } else {
    col = fetch(toUV(sp + bend * uScale - warp), amt);
  }

  // specular: broad glow + thin edge rim along the specular axis (matches the SVG
  // map's B channel: s = glow + edge, clamped, then * specularStrength * coverage)
  float proj = abs(clamp(p.x / lensHalf.x, -1.0, 1.0) * uSpecDir.x + clamp(p.y / lensHalf.y, -1.0, 1.0) * uSpecDir.y);
  float rim = sdf < 0.0 ? max(0.0, 1.0 + sdf / uEdgeW) : 0.0;
  float s = 0.0;
  if (uGlowStr > 0.0) {
    float gg = uGlowBand > 0.001 ? clamp((proj - uGlowInner) / uGlowBand, 0.0, 1.0) : 0.0;
    s += uGlowStr * pow(gg, uGlowExp) * falloff;
  }
  s += uEdgeStr * rim * pow(proj, uEdgeExp);
  col += uSpecStr * min(s, 1.0) * coverage;

  // lens-only brightness: soft-light(white) approx when +, multiply(black) when -.
  float bAmt = uBright * coverage;
  if (bAmt > 0.0) col = mix(col, sqrt(col), bAmt);
  else if (bAmt < 0.0) col *= (1.0 + bAmt);

  vec3 flatCol = texture2D(uTex, uv).rgb;
  gl_FragColor = vec4(mix(flatCol, col, uBootMix), 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  // Safari returns null from createShader when the context is lost at creation
  // (GPU process restart / context limit) — fail soft, never throw.
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('StageGL shader:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

export interface StageGLHandle {
  /** Sync repaint after sibling layout (phone fit scale) has settled. */
  bootRepaint: () => void;
}

export interface StageGLProps {
  className?: string;
  /** Background fill override. Defaults to the themed `--dot-grid-bg` token. */
  bg?: string;
  lens?: Partial<StageGLLens>;
  bootMix?: number;
  targetSelector?: string;
  rippleOnClick?: boolean;
}

export const StageGL = forwardRef<StageGLHandle, StageGLProps>(function StageGL(
  {
    className,
    bg,
    lens,
    targetSelector = '[class*="AppShell_shell"]',
    rippleOnClick = true,
    bootMix = 1,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bootRepaintRef = useRef<(() => void) | null>(null);
  const bootMixRef = useRef(bootMix);
  bootMixRef.current = bootMix;
  // Stashed click path only (RIPPLE_ON_PRESS): a release-only rebound from a click.
  const release = useRef<{ x: number; y: number; t0: number; amp: number } | null>(null);
  const cfg = { ...DEFAULT_LENS, ...lens };
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;

  useImperativeHandle(ref, () => ({
    bootRepaint: () => bootRepaintRef.current?.(),
  }));

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d');
    if (!offCtx) return;
    const stage = canvas.parentElement;
    if (!stage) return;

    // Themed dot/bg colors; re-read on theme flip (observeTheme below, which wakes
    // the on-demand loop to repaint the dot texture with the new palette).
    let palette = readDotGridPalette(offCtx);
    const pointer = DOT_WAKE_ENABLED
      ? createPointerTracker(stage, canvas, { flipY: true })
      : null;

    // Press the grid in on hold (a concave dimple following the cursor, over the phone
    // too); release lets it spring back and radiate — one continuous surface gesture.
    // When RIPPLE_ON_PRESS is flipped on, this is skipped and onDown fires the old
    // click rebound instead.
    const pressOn = DOT_PRESS.enabled && !RIPPLE_ON_PRESS && rippleOnClick;
    const press = pressOn
      ? createPressTracker(stage, canvas, {
          excludeSelector: FOREGROUND_SELECTOR,
          onChange: () => invalidate(false), // shader-only — no dot-texture redraw
        })
      : null;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssW = 0;
    let cssH = 0;
    // Offscreen dot-field size = visible size + DOT_BLEED on every side.
    let texCssW = 0;
    let texCssH = 0;
    let raf = 0;
    let pendingResize = false;

    // GL resources — rebuilt if the context is lost and later restored.
    let gl: WebGLRenderingContext | null = null;
    let tex: WebGLTexture | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};

    const initGL = (): boolean => {
      const ctx = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
      if (!ctx) {
        console.warn('StageGL: WebGL unavailable');
        return false;
      }
      gl = ctx;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      if (!prog) return false;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn('StageGL link:', gl.getProgramInfoLog(prog));
        return false;
      }
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      const U = (n: string) => gl!.getUniformLocation(prog, n);
      u = {
        tex: U('uTex'), res: U('uRes'), lens: U('uLens'), cornerExp: U('uCornerExp'),
        radius: U('uRadius'), depth: U('uDepth'), scale: U('uScale'), domeOn: U('uDomeOn'),
        domeR: U('uDomeR'), domeS: U('uDomeS'), edgeStr: U('uEdgeStr'), edgeW: U('uEdgeW'),
        specStr: U('uSpecStr'), specDir: U('uSpecDir'), blur: U('uBlur'),
        chroma: U('uChroma'), splay: U('uSplay'), glowStr: U('uGlowStr'),
        glowInner: U('uGlowInner'), glowBand: U('uGlowBand'), glowExp: U('uGlowExp'),
        edgeExp: U('uEdgeExp'), bright: U('uBright'),
        rippleT: U('uRippleT'), rippleAmp: U('uRippleAmp'),
        dpr: U('uDpr'), bleed: U('uBleed'),
        pressPos: U('uPressPos'), pressStr: U('uPressStr'),
        bootMix: U('uBootMix'),
      };
      return true;
    };

    const applyResizeBuffers = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      const W = Math.max(1, Math.round(cssW * dpr));
      const H = Math.max(1, Math.round(cssH * dpr));
      canvas.width = W; // visible drawing buffer
      canvas.height = H;
      // Offscreen dot field is bleed-padded; the shader's toUV maps the visible
      // canvas to its inner window so on-screen dots stay whole.
      texCssW = cssW + 2 * DOT_BLEED;
      texCssH = cssH + 2 * DOT_BLEED;
      off.width = Math.max(1, Math.round(texCssW * dpr));
      off.height = Math.max(1, Math.round(texCssH * dpr));
      if (gl) gl.viewport(0, 0, W, H);
      pointer?.setStage(cssW, cssH);
    };

    const markResize = () => {
      pendingResize = true;
    };

    const applyResizeIfNeeded = () => {
      if (!pendingResize) return;
      pendingResize = false;
      applyResizeBuffers();
    };

    // ── On-demand rendering ───────────────────────────────────────────────────
    // The dot field is STATIC unless something animates: a click ripple, the hover
    // "bloom" moving the lens, a resize, or a theme flip. Redrawing every dot in 2D
    // and re-uploading the whole stage-sized texture each frame is the expensive
    // part on WebKit, so we only do that when the texture is "dirty" (ripple /
    // resize / theme), only re-run the cheap shader when the lens actually moves
    // (bloom), and stop the loop entirely once everything settles. This is the
    // difference vs. Aave's video glass: their per-frame upload is a hardware
    // <video> texture; ours was a full CPU 2D redraw + upload of an unchanging image.
    let textureDirty = true; // dots need (re)draw + upload this frame
    let pendingDirty = true; // one-shot dirty request (resize / theme / press start)
    let stillFrames = 0;
    let lastLx = NaN;
    let lastLy = NaN;
    let lastLw = NaN;
    let lastLh = NaN;
    let lastRadius = NaN;
    let targetEl: Element | null = null;
    let shellBound: Element | null = null;
    const SETTLE_FRAMES = 3;

    const getTarget = (): Element | null => {
      if (targetEl && targetEl.isConnected) return targetEl;
      targetEl = targetSelector ? document.querySelector(targetSelector) : null;
      return targetEl;
    };

    const paintFrame = (s: SurfaceSample): boolean => {
      if (!gl || gl.isContextLost()) return false;

      // Expensive path — only when the STATIC dot field changed (resize/theme). The
      // click ripple is no longer baked here; it's a shader displacement (below), so
      // it costs nothing on this 2D-redraw + upload path.
      if (textureDirty) {
        drawDotField(offCtx, cssW, cssH, DOT_BLEED, dpr, palette, bg ?? palette.bg);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
      }

      // lens rect from the target element, in this canvas's device px (top-down)
      const c = cfgRef.current;
      const cr = canvas.getBoundingClientRect();
      const target = getTarget();
      let lx = cr.width * 0.5 - 217 * dpr;
      let ly = cr.height * 0.5 - 453 * dpr;
      let lw = 434 * dpr;
      let lh = 906 * dpr;
      if (target) {
        const tr = target.getBoundingClientRect();
        lx = (tr.left - cr.left) * dpr;
        ly = (tr.top - cr.top) * dpr;
        lw = tr.width * dpr;
        lh = tr.height * dpr;
      }
      const g = lw / c.designWidth; // device px per design px

      // Lens radius tracks the shell's ACTUAL rounded corner so the refracted bezel
      // stays concentric (and keeps tracking through the hover bloom). getComputedStyle
      // is costly, so re-read it only when the rect changed (bloom/resize); otherwise
      // reuse the cached value. Scale the DOM radius by the shell's own px ratio.
      const rectChanged = lx !== lastLx || ly !== lastLy || lw !== lastLw || lh !== lastLh;
      let radiusDevicePx = Number.isNaN(lastRadius) ? c.radius * g : lastRadius;
      if (target && (rectChanged || Number.isNaN(lastRadius))) {
        const cs = getComputedStyle(target);
        const br = parseFloat(cs.borderTopLeftRadius);
        const pw = parseFloat(cs.width);
        radiusDevicePx = br > 0 && pw > 0 ? br * (lw / pw) : c.radius * g;
      }
      const exp = 2 + Math.max(0, Math.min(1, c.cornerSmoothing)) * 4;
      const dome = c.domeDepth > 0 ? computeDomeConstants(c.domeDepth, c.designWidth / 2, (c.designWidth / 2) * (lh / lw)) : null;
      const ang = (c.specularRotation * Math.PI) / 180;

      gl.uniform1i(u.tex, 0);
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform4f(u.lens, lx, ly, lw, lh);
      gl.uniform1f(u.cornerExp, exp);
      gl.uniform1f(u.radius, radiusDevicePx);
      gl.uniform1f(u.depth, c.depth * g);
      gl.uniform1f(u.scale, c.scale * g);
      gl.uniform1f(u.domeOn, dome ? 1 : 0);
      gl.uniform2f(u.domeR, dome ? dome.Rx * g : 1, dome ? dome.Ry * g : 1);
      gl.uniform2f(u.domeS, dome ? dome.scaleX : 1, dome ? dome.scaleY : 1);
      gl.uniform1f(u.edgeStr, c.edgeStrength);
      gl.uniform1f(u.edgeW, c.edgeWidth * g);
      gl.uniform1f(u.specStr, c.specularStrength);
      gl.uniform2f(u.specDir, Math.cos(ang), Math.sin(ang));
      gl.uniform1f(u.blur, c.blur * g);
      gl.uniform1f(u.chroma, c.chromaticAberration);
      gl.uniform1f(u.splay, c.splay);
      gl.uniform1f(u.glowStr, c.glowStrength);
      gl.uniform1f(u.glowInner, (1 - c.glowSpread) * Math.SQRT2);
      gl.uniform1f(u.glowBand, c.glowSpread * Math.SQRT2);
      gl.uniform1f(u.glowExp, c.glowExponent);
      gl.uniform1f(u.edgeExp, c.edgeExponent);
      gl.uniform1f(u.bright, c.brightness);

      // Unified surface (GPU): one centre (device px, top-down) drives both the held
      // dimple (pressStr) and the release rebound (relT seconds, relAmp depth). dpr
      // scales the CSS-px constants in the shader. relT < 0 = idle.
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.bleed, DOT_BLEED * dpr);
      gl.uniform2f(u.pressPos, s.x * dpr, s.y * dpr);
      gl.uniform1f(u.pressStr, s.pressStr);
      gl.uniform1f(u.rippleT, s.relT);
      gl.uniform1f(u.rippleAmp, s.relAmp);
      gl.uniform1f(u.bootMix, bootMixRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const moved = rectChanged || radiusDevicePx !== lastRadius;
      lastLx = lx;
      lastLy = ly;
      lastLw = lw;
      lastLh = lh;
      lastRadius = radiusDevicePx;
      return moved;
    };

    const tick = (now: number) => {
      if (!gl || gl.isContextLost()) {
        raf = 0;
        return;
      }
      applyResizeIfNeeded();
      bindShell();

      // Advance the unified surface (shader-only — never touches the 2D redraw/upload):
      // the press tracker drives hold + rebound; the stashed click path is a release-
      // only rebound read from `release`. Keeps the loop alive while either animates.
      let s: SurfaceSample;
      let surfaceActive: boolean;
      if (press) {
        s = press.tick(now);
        surfaceActive = press.isAnimating();
      } else {
        const rr = release.current;
        const relT = rr ? (now - rr.t0) / 1000 : -1;
        const within = !!rr && relT * 1000 < DOT_PRESS.releaseLifeMs;
        if (rr && !within) release.current = null;
        s = within ? { x: rr!.x, y: rr!.y, pressStr: 0, relT, relAmp: rr!.amp } : IDLE_SURFACE;
        surfaceActive = within;
      }

      textureDirty = pendingDirty;
      pendingDirty = false;

      const moved = paintFrame(s);

      // Keep going while the scene is animating; coast a few frames, then idle.
      if (surfaceActive || moved) {
        stillFrames = 0;
        raf = requestAnimationFrame(tick);
      } else if (stillFrames++ < SETTLE_FRAMES) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    // Wake the loop (events below call this). `dirty` forces a dot redraw+upload.
    const invalidate = (dirty = false) => {
      if (dirty) pendingDirty = true;
      stillFrames = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Hover "bloom" moves the lens via a CSS transition on the shell; wake the loop
    // on those transitions so the refraction tracks the growth, then it settles and
    // stops on its own. Bound once the shell element exists (re-checked each tick).
    const onShellTransition = () => invalidate(false);
    const bindShell = () => {
      const el = getTarget();
      if (!el || el === shellBound) return;
      if (shellBound) {
        shellBound.removeEventListener('transitionrun', onShellTransition);
        shellBound.removeEventListener('transitionend', onShellTransition);
        shellBound.removeEventListener('transitioncancel', onShellTransition);
      }
      shellBound = el;
      el.addEventListener('transitionrun', onShellTransition);
      el.addEventListener('transitionend', onShellTransition);
      el.addEventListener('transitioncancel', onShellTransition);
    };

    // Recover gracefully from a lost GL context (GPU reset / context eviction).
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {
      if (initGL()) {
        pendingResize = false;
        applyResizeBuffers();
        lastRadius = NaN;
        invalidate(true);
      }
    };
    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    // Stashed click path. In press mode the rebound is driven by the press tracker, so
    // this only runs when RIPPLE_ON_PRESS is flipped on (or the press effect is off):
    // a click fires a release-only rebound (no dimple) at full strength.
    const onDown = (e: PointerEvent) => {
      if (!rippleOnClick || pressOn) return;
      const t = e.target as Element | null;
      if (t?.closest?.(FOREGROUND_SELECTOR)) return; // ignore taps on the phone UI
      const r = canvas.getBoundingClientRect();
      // Top-down CSS px (matches the shader's `sp` space; ×dpr applied at upload).
      release.current = { x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now(), amp: 1 };
      invalidate(false); // shader-only — no dot-texture redraw needed
    };
    stage.addEventListener('pointerdown', onDown, { capture: true });

    // Re-read the palette on theme flip and repaint the dot texture once.
    const stopTheme = observeTheme(() => {
      palette = readDotGridPalette(offCtx);
      invalidate(true);
    });

    let ro: ResizeObserver | null = null;
    if (initGL()) {
      applyResizeBuffers();
      bindShell();
      const paintBootFrame = () => {
        if (!gl || gl.isContextLost()) return;
        applyResizeBuffers();
        bindShell();
        if (cssW <= 0 || cssH <= 0) return;
        textureDirty = true;
        paintFrame(IDLE_SURFACE);
        textureDirty = false;
      };
      bootRepaintRef.current = paintBootFrame;
      // Sync first frame here (StageGL's layout effect runs before the phone's fit-
      // scale effect). Parent bootRepaint realigns the lens once scale is known; the
      // static dot field can show immediately.
      paintBootFrame();
      ro = new ResizeObserver(() => {
        markResize();
        lastRadius = NaN;
        invalidate(true);
      });
      ro.observe(canvas);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      stopTheme();
      pointer?.dispose();
      press?.dispose();
      stage.removeEventListener('pointerdown', onDown, { capture: true });
      if (shellBound) {
        shellBound.removeEventListener('transitionrun', onShellTransition);
        shellBound.removeEventListener('transitionend', onShellTransition);
        shellBound.removeEventListener('transitioncancel', onShellTransition);
      }
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      // NB: don't call WEBGL_lose_context.loseContext() here — in React
      // StrictMode the throwaway mount would permanently lose the canvas's
      // context (getContext then returns the lost one). Let GC reclaim it.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg, targetSelector, rippleOnClick]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
});

export default StageGL;
