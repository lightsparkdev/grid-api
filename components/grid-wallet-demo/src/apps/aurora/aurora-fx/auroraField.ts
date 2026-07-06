/**
 * Shared procedural aurora field — the single source of truth the GPU aurora
 * samples everywhere (full-screen layer, debit-card face, and the close-button
 * lens). It reproduces the old CSS aurora exactly:
 *
 *   background: var(--aurora-base);
 *   .auroraLayer { opacity: .92 }
 *     ::before  repeating-linear-gradient(100deg, s1 6%, s2 12%, s3 18%, s4 24%, s5 30%)
 *               background-size 300% 200% (tile 3W×2H), blur(24px),
 *               drift translate3d(-6W) over 60s
 *     ::after   same gradient, background-size 200% 100% (tile 2W×H), blur(24px),
 *               mix-blend-mode: soft-light, drift translate3d(-3W) over 60s
 *
 * Each consumer renders its OWN element-relative field (the CSS gradient stops
 * are percentages, so the stripe period scales with the element — the card face
 * is NOT a crop of the full-screen field, it's its own smaller aurora, exactly
 * as the CSS produced). One shared GLSL function + one shared clock keeps them
 * consistent and lets the close-button lens refract the live full-screen field.
 *
 * Everything is computed in sRGB (gamma) space with the raw 0..1 colour values —
 * matching how the browser interpolates the gradient, runs the blur, applies
 * soft-light, and composites the .92 opacity over the base.
 */

/** CSS gradient angle (deg). */
const ANGLE_DEG = 100;
const PHI = (ANGLE_DEG * Math.PI) / 180;
const SIN = Math.sin(PHI);
const COS = Math.cos(PHI);

/**
 * Gradient axis unit vector in screen space (y-down): a CSS angle θ points the
 * gradient toward (sin θ, −cos θ). Colour increases along this direction.
 */
export const GRAD_DIR: readonly [number, number] = [SIN, -COS];

/** `filter: blur(24px)` → Gaussian σ = 24 CSS px (CSS blur radius == stdDeviation). */
export const BLUR_SIGMA = 24;

/** `.auroraLayer { opacity: 0.92 }`. */
export const LAYER_OPACITY = 0.92;

/** Stop span of the repeating unit: 30% − 6% = 24% of the gradient line. */
const REPEAT_FRACTION = 0.24;

/** Drift, in element widths, over the 60s loop (base −6W, overlay −3W). */
const DRIFT_BASE_WIDTHS = 6;
const DRIFT_OVERLAY_WIDTHS = 3;
const DRIFT_PERIOD_SEC = 60;

/**
 * Stripe period (px) for each layer. The CSS gradient line length for a tile
 * (tw, th) at angle θ is L = |tw·sinθ| + |th·cosθ|; the repeating unit is 24% of
 * L. Base tile = 3W×2H, overlay tile = 2W×H (from the 300%/200% & 200%/100%
 * background-size that the drift transform preserves).
 */
export function auroraPeriods(w: number, h: number): { pBase: number; pOver: number } {
  const absCos = Math.abs(COS);
  const lBase = 3 * w * SIN + 2 * h * absCos;
  const lOver = 2 * w * SIN + 1 * h * absCos;
  return { pBase: REPEAT_FRACTION * lBase, pOver: REPEAT_FRACTION * lOver };
}

/**
 * Leftward drift offset (px) sampled into the rest pattern at time `tSec`. The
 * CSS layer translates content by −6W (base) / −3W (overlay) over 60s; sampling
 * the rest pattern at `p + drift` reproduces that leftward scroll.
 */
export function auroraDrift(w: number, tSec: number): { driftBase: number; driftOver: number } {
  const phase = tSec / DRIFT_PERIOD_SEC;
  return {
    driftBase: DRIFT_BASE_WIDTHS * w * phase,
    driftOver: DRIFT_OVERLAY_WIDTHS * w * phase,
  };
}

// One shared clock so every instance (and the lens) drifts in lockstep — the
// absolute phase is unobservable (slow loop), but a single origin makes the
// close-button lens line up with the full-screen field it refracts.
const EPOCH =
  typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

export function auroraClock(): number {
  const now =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  return (now - EPOCH) / 1000;
}

export type RGB = [number, number, number];

export interface AuroraPalette {
  base: RGB;
  stripes: [RGB, RGB, RGB, RGB, RGB];
}

const FALLBACK: AuroraPalette = {
  base: [0x00 / 255, 0x6f / 255, 0xa8 / 255],
  stripes: [
    [0x00 / 255, 0x58 / 255, 0x82 / 255],
    [0x01 / 255, 0x96 / 255, 0xc9 / 255],
    [0x94 / 255, 0xc8 / 255, 0xe3 / 255],
    [0x01 / 255, 0x96 / 255, 0xc9 / 255],
    [0x45 / 255, 0xb8 / 255, 0xe5 / 255],
  ],
};

let probeCtx: CanvasRenderingContext2D | null = null;

function parseColor01(input: string): RGB | null {
  const v = input.trim();
  if (!v) return null;
  if (!probeCtx) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    probeCtx = c.getContext('2d');
  }
  if (!probeCtx) return null;
  // Round-trip through the canvas so any CSS colour (hex/rgb/color-mix) normalises.
  probeCtx.fillStyle = '#000000';
  probeCtx.fillStyle = v;
  const s = probeCtx.fillStyle as string;
  if (s[0] === '#') {
    let h = s.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = s.match(/[\d.]+/g);
  if (m && m.length >= 3) return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
  return null;
}

/**
 * Read the themed aurora palette from the `--aurora-*` custom properties (they
 * inherit, so reading from any element inside the AuroraBackground root resolves
 * the `[data-theme]` overrides). Re-read on theme flip.
 */
export function readAuroraPalette(el: Element): AuroraPalette {
  const cs = getComputedStyle(el);
  const base = parseColor01(cs.getPropertyValue('--aurora-base')) ?? FALLBACK.base;
  const stripes = ([1, 2, 3, 4, 5] as const).map((i, idx) => {
    return parseColor01(cs.getPropertyValue(`--aurora-stripe-${i}`)) ?? FALLBACK.stripes[idx];
  }) as [RGB, RGB, RGB, RGB, RGB];
  return { base, stripes };
}

// ── blurred-gradient LUT (CPU) ───────────────────────────────────────────────
// The GPU samples each aurora layer as a 1-D lookup texture: the 5-stop gradient
// convolved with the `blur(24px)` Gaussian over ONE period, baked here on the CPU.
// Sampling a precomputed blurred gradient (LINEAR + REPEAT) replaces the old
// per-pixel 121-tap loop — ~2 texture reads/pixel instead of 242 exp() calls —
// while staying ripple-free: the convolution is integrated densely below.

/** Width of each LUT texture (texels over one period). Power of two for REPEAT. */
export const LUT_SIZE = 1024;

// Dense grad5 table the Gaussian is convolved against. Power of two so the
// circular wrap is a bit-mask; its cell size sets the convolution step
// (≈ period/TABLE px), fine enough that the baked gradient has no visible ripple.
const GRAD_TABLE_SIZE = 4096;
// Gaussian truncation radius — matches the old shader window (NTAPS·STEP = 60px =
// 2.5σ at σ=24), so the baked blur is the exact kernel the tap loop used.
const KERNEL_RADIUS_SIGMAS = 2.5;

const gradTable = new Float32Array(GRAD_TABLE_SIZE * 3);
const kernelWeights = new Float32Array(GRAD_TABLE_SIZE + 1);

/** Fill `gradTable` with grad5 over [0,1) — the JS twin of the GLSL grad5. */
function buildGradTable(stripes: AuroraPalette['stripes']): void {
  const [s0, s1, s2, s3, s4] = stripes;
  for (let k = 0; k < GRAD_TABLE_SIZE; k++) {
    const f = (k / GRAD_TABLE_SIZE) * 4; // u = k/N in [0,1) → fract is the identity
    let a: RGB, b: RGB, t: number;
    if (f < 1) { a = s0; b = s1; t = f; }
    else if (f < 2) { a = s1; b = s2; t = f - 1; }
    else if (f < 3) { a = s2; b = s3; t = f - 2; }
    else { a = s3; b = s4; t = f - 3; }
    const o = k * 3;
    gradTable[o] = a[0] + (b[0] - a[0]) * t;
    gradTable[o + 1] = a[1] + (b[1] - a[1]) * t;
    gradTable[o + 2] = a[2] + (b[2] - a[2]) * t;
  }
}

function toByte(v: number): number {
  const n = Math.round(v * 255);
  return n < 0 ? 0 : n > 255 ? 255 : n;
}

/**
 * Bake the blur(24px) gradient for one period into RGBA8 LUT data (LUT_SIZE × 1).
 * Convolves the dense grad5 table with a truncated Gaussian (σ = BLUR_SIGMA/period
 * in phase units). The hard stop4→stop0 wrap is handled by the circular table, so
 * the baked curve is a smooth erf through the wrap — no rib. Cheap and rare (only
 * recomputed on theme/period change), so the dense integration is free.
 */
export function computeAuroraLut(stripes: AuroraPalette['stripes'], period: number): Uint8Array {
  buildGradTable(stripes);
  const mask = GRAD_TABLE_SIZE - 1;
  const sigmaCells = (BLUR_SIGMA / Math.max(period, 1)) * GRAD_TABLE_SIZE;
  const half = Math.min(Math.round(KERNEL_RADIUS_SIGMAS * sigmaCells), GRAD_TABLE_SIZE >> 1);
  const inv2s2 = 1 / (2 * sigmaCells * sigmaCells);
  // Precompute the Gaussian weights once; the heavy inner loop is then mul-adds.
  let wsum = 0;
  for (let d = -half; d <= half; d++) {
    const w = Math.exp(-(d * d) * inv2s2);
    kernelWeights[d + half] = w;
    wsum += w;
  }
  const invWsum = 1 / wsum;
  const out = new Uint8Array(LUT_SIZE * 4);
  for (let i = 0; i < LUT_SIZE; i++) {
    // Texel i holds the blurred gradient at phase (i + 0.5)/LUT_SIZE, so a LINEAR
    // texture2D(phase) returns the convolution at that phase.
    const center = Math.round(((i + 0.5) / LUT_SIZE) * GRAD_TABLE_SIZE);
    let r = 0, g = 0, b = 0;
    for (let d = -half; d <= half; d++) {
      const idx = ((center + d) & mask) * 3; // &mask wraps (incl. negatives) → circular
      const w = kernelWeights[d + half];
      r += gradTable[idx] * w;
      g += gradTable[idx + 1] * w;
      b += gradTable[idx + 2] * w;
    }
    const o = i * 4;
    out[o] = toByte(r * invWsum);
    out[o + 1] = toByte(g * invWsum);
    out[o + 2] = toByte(b * invWsum);
    out[o + 3] = 255;
  }
  return out;
}

// ── GLSL ────────────────────────────────────────────────────────────────────

export const AURORA_VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * Shared fragment-shader prelude: the aurora field + the (lens) refraction
 * helpers. Concatenate with a renderer-specific `main()`.
 *
 * The `filter: blur(24px)` of each CSS layer is a 1-D Gaussian along the gradient
 * axis (the gradient is constant perpendicular to it), so the blurred gradient is
 * a function of phase alone. We bake that per period into a 1-D LUT on the CPU
 * (computeAuroraLut) and read it here — one texture tap per layer instead of the
 * old 121-tap loop, with no banding.
 */
export const AURORA_COMMON_GLSL = `
precision highp float;

uniform vec3 uBaseColor;
uniform vec2 uGradDir;       // unit, screen px
uniform float uPeriodBase;   // px
uniform float uPeriodOver;   // px
uniform float uDriftBase;    // px (time-dependent)
uniform float uDriftOver;    // px
uniform float uOpacity;      // .92
uniform sampler2D uLutBase;  // CPU-baked blurred gradient over one base period
uniform sampler2D uLutOver;  // CPU-baked blurred gradient over one overlay period

// W3C soft-light, per channel (Cb backdrop = base layer, Cs source = overlay).
float softLightCh(float cb, float cs){
  float d = (cb <= 0.25) ? ((16.0 * cb - 12.0) * cb + 4.0) * cb : sqrt(cb);
  return (cs <= 0.5)
    ? cb - (1.0 - 2.0 * cs) * cb * (1.0 - cb)
    : cb + (2.0 * cs - 1.0) * (d - cb);
}
vec3 softLight(vec3 cb, vec3 cs){
  return vec3(softLightCh(cb.r, cs.r), softLightCh(cb.g, cs.g), softLightCh(cb.b, cs.b));
}

// Group colour (the blurred base + soft-light overlay), before the base mix. Each
// layer is one tap into its precomputed blurred-gradient LUT, sampled by phase
// (fract over one period). uLut* are LINEAR + REPEAT, so the stop4->stop0 wrap is
// seamless and sub-texel smooth.
vec3 auroraGroup(vec2 p){
  float phaseBase = fract(dot(p + vec2(uDriftBase, 0.0), uGradDir) / uPeriodBase);
  float phaseOver = fract(dot(p + vec2(uDriftOver, 0.0), uGradDir) / uPeriodOver);
  vec3 baseCol = texture2D(uLutBase, vec2(phaseBase, 0.5)).rgb;
  vec3 overCol = texture2D(uLutOver, vec2(phaseOver, 0.5)).rgb;
  return softLight(baseCol, overCol);
}

// Final opaque aurora colour at element-local position p (CSS px). maskAlpha
// folds in the radial mask (1 = fully visible). The .92 group composites over
// the solid base, so the masked-out region resolves to the base colour.
vec3 auroraFinal(vec2 p, float maskAlpha){
  return mix(uBaseColor, auroraGroup(p), uOpacity * maskAlpha);
}

// ── output dither (anti-banding) ─────────────────────────────────────────────
// Writing the float aurora to the 8-bit canvas quantises the large, low-contrast
// gradient into visible bands (posterisation). A sub-LSB ordered dither at the
// final write decorrelates that quantisation so the gradient reads smooth — the
// browser does the same when it rasterises a CSS gradient/blur, which is why the
// old CSS aurora never banded. Also smooths the 8-bit LUT texels' own steps. The
// pattern is keyed to gl_FragCoord (device px) ONLY, so it is fixed per pixel with
// no temporal term — no shimmer/crawl. Interleaved gradient noise (Jimenez) — a
// blue-noise-like ordered pattern that reads far smoother than a white-noise hash —
// remapped to a triangular (TPDF) distribution so the ±1 LSB (1/255) error is
// signal-independent and flat.
float ign(vec2 p){
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
// Remap the uniform IGN value to a triangular (TPDF) distribution in [-1,1], so
// the quantisation error is signal-independent at a ±1 LSB amplitude.
vec3 ditherOutput(vec3 col, vec2 fragCoord){
  float n = ign(fragCoord);
  float t = n < 0.5 ? sqrt(2.0 * n) - 1.0 : 1.0 - sqrt(2.0 * (1.0 - n));
  return col + t * (1.0 / 255.0);
}

// ── lens refraction helpers (shared with StageGL's analytic glass) ───────────
float lpf(float a, float b, float e){
  a = max(a, 0.0); b = max(b, 0.0);
  if (a <= 0.0) return b;
  if (b <= 0.0) return a;
  return pow(pow(a, e) + pow(b, e), 1.0 / e);
}
float erf_(float x){ float e = exp(2.0 * 1.7724539 * x); return (e - 1.0) / (e + 1.0); }
float domeGrad(float d, float R, float s){ float n = min(d, 0.999 * R); return (n / sqrt(R * R - n * n)) * s; }
`;

export interface AuroraUniformLocations {
  baseColor: WebGLUniformLocation | null;
  gradDir: WebGLUniformLocation | null;
  periodBase: WebGLUniformLocation | null;
  periodOver: WebGLUniformLocation | null;
  driftBase: WebGLUniformLocation | null;
  driftOver: WebGLUniformLocation | null;
  opacity: WebGLUniformLocation | null;
  lutBase: WebGLUniformLocation | null;
  lutOver: WebGLUniformLocation | null;
}

export function getAuroraUniformLocations(
  gl: WebGLRenderingContext,
  prog: WebGLProgram,
): AuroraUniformLocations {
  const U = (n: string) => gl.getUniformLocation(prog, n);
  return {
    baseColor: U('uBaseColor'),
    gradDir: U('uGradDir'),
    periodBase: U('uPeriodBase'),
    periodOver: U('uPeriodOver'),
    driftBase: U('uDriftBase'),
    driftOver: U('uDriftOver'),
    opacity: U('uOpacity'),
    lutBase: U('uLutBase'),
    lutOver: U('uLutOver'),
  };
}

/** Set the static (non-time) aurora uniforms: base colour, geometry, periods. The
 *  stripe palette + blur now live in the LUTs (see updateAuroraLuts). */
export function setAuroraStaticUniforms(
  gl: WebGLRenderingContext,
  u: AuroraUniformLocations,
  palette: AuroraPalette,
  periods: { pBase: number; pOver: number },
): void {
  gl.uniform3fv(u.baseColor, palette.base);
  gl.uniform2f(u.gradDir, GRAD_DIR[0], GRAD_DIR[1]);
  gl.uniform1f(u.periodBase, periods.pBase);
  gl.uniform1f(u.periodOver, periods.pOver);
  gl.uniform1f(u.opacity, LAYER_OPACITY);
}

/** Stable key for the inputs the LUTs depend on (stripes + periods), so callers
 *  only rebuild the textures when the theme or element size actually changes. */
export function auroraLutKey(
  palette: AuroraPalette,
  periods: { pBase: number; pOver: number },
): string {
  return `${palette.stripes.map((s) => s.join(',')).join(';')}|${periods.pBase.toFixed(2)}|${periods.pOver.toFixed(2)}`;
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('Aurora shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** Compile + link a full-screen-quad program; returns the program (with aPos at 0). */
export function createAuroraProgram(
  gl: WebGLRenderingContext,
  fragSrc: string,
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, AURORA_VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('Aurora link:', gl.getProgramInfoLog(prog));
    return null;
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  return prog;
}

// ── LUT textures (GL) ────────────────────────────────────────────────────────

export interface AuroraLuts {
  base: WebGLTexture | null;
  over: WebGLTexture | null;
}

function createLutTexture(gl: WebGLRenderingContext): WebGLTexture | null {
  const tex = gl.createTexture();
  if (!tex) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // LINEAR between dense texels (+ the output dither) keeps 8-bit LUTs smooth;
  // REPEAT on S makes fract(phase) sampling seamless across the gradient wrap.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

/**
 * Create the base + overlay LUT textures and bind the samplers to units 0/1. Call
 * once after the program links (the program must be current). Fill the texels with
 * `updateAuroraLuts` before the first draw.
 */
export function createAuroraLuts(
  gl: WebGLRenderingContext,
  u: AuroraUniformLocations,
): AuroraLuts {
  gl.uniform1i(u.lutBase, 0);
  gl.uniform1i(u.lutOver, 1);
  gl.activeTexture(gl.TEXTURE0);
  const base = createLutTexture(gl);
  gl.activeTexture(gl.TEXTURE1);
  const over = createLutTexture(gl);
  gl.activeTexture(gl.TEXTURE0);
  return { base, over };
}

/**
 * Recompute + upload both blurred-gradient LUTs (1024×1 RGBA8). Call when the
 * palette (theme) or the periods (resize) change — NOT per frame: the LUTs are
 * independent of drift and resolution. Leaves base bound to unit 0, over to unit 1.
 */
export function updateAuroraLuts(
  gl: WebGLRenderingContext,
  luts: AuroraLuts,
  palette: AuroraPalette,
  periods: { pBase: number; pOver: number },
): void {
  const baseData = computeAuroraLut(palette.stripes, periods.pBase);
  const overData = computeAuroraLut(palette.stripes, periods.pOver);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, luts.base);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LUT_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, baseData);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, luts.over);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, LUT_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, overData);
  gl.activeTexture(gl.TEXTURE0);
}
