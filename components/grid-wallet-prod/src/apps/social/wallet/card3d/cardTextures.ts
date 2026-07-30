import * as THREE from 'three';

/**
 * The Z metal card's material maps:
 *  - normalMap: fine beadblast micro-grain everywhere + the ~1mm debossed Z,
 *    derived from a height field via Sobel.
 *  - roughnessMap: beadblast = rough (matte), the Z = low (polished).
 *  - map (albedo): metal gray base + the lighter face content (Z highlight,
 *    DEBIT, Visa, card number — flat printed decals).
 * Production loads pre-baked assets and recomposites them cheaply (see the
 * "Pre-baked assets" section); the full procedural generator at the bottom is
 * the authoring tool (dev re-bake hook) + runtime fallback.
 */

// logo-z.svg path (viewBox 200 x 192).
const Z_PATH =
  'M199.706 0L81.2584 172.382H181.649L197.788 191.142H0L72.8104 85.1799H72.8065L118.074 19.3031H24.3851L7.77817 0H199.706ZM35.775 172.382H57.0496L103.738 105.602V105.598L164.068 19.3031H142.793L35.775 172.382Z';
const Z_VIEW_W = 200;
const Z_VIEW_H = 192;

// Texture is the card face at credit-card aspect (1.586:1). High-res so the
// debossed Z, decals and — critically — the per-texel beadblast grain stay fine
// enough to read as metal. The 2048 bake is EXPENSIVE (seconds of main-thread
// canvas work, brutal on Safari), so production loads PRE-BAKED image assets
// (see loadBakedMaps below); this generator is the authoring tool + fallback.
const TEX_W = 2048;
const TEX_H = Math.round(TEX_W / 1.586); // 1291
// Authoring scale: all px sizes/blurs below were tuned at 1024, so scale them.
const S = TEX_W / 1024;

// Z placement on the face (fractions of the texture). Centered horizontally, a
// touch above center, ~52% of the card width.
const Z_WIDTH_FRAC = 0.52;
const Z_CENTER_Y_FRAC = 0.5;

export interface CardMaps {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
}

export interface CardMapOptions {
  issued: boolean;
  cardNumber: string;
}

// ── Pre-baked assets + runtime composite ────────────────────────────────────
// The full-quality 2048 bake takes seconds of main-thread pixel math (Safari
// especially), so production loads baked assets instead. But the maps can't
// ship as single lossy images: normal/roughness are DATA the renderer reads
// numerically, and lossy noise bleeding into the smooth polished regions shows
// up as glinting dots. And losslessly compressing 2048 of random grain is huge.
// So each map is split by what compresses well:
//  - STRUCTURE (debossed Z bevel, chip, polished regions): smooth shapes at
//    2048, shipped LOSSLESS (tiny), with alpha = where they replace the grain.
//  - GRAIN (beadblast noise): one small LOSSLESS tileable patch — pure noise
//    has no spatial correlation, so tiling it is invisible.
// At load they're recombined with a pattern fill + one drawImage — GPU canvas
// work, milliseconds. Result is pixel-equivalent to the live bake with zero
// lossy artifacts. These are MATERIAL INPUT maps (albedo/normal/roughness),
// not a lit render — the scene still lights the card live every frame (env
// reflections, reveal sweep, hover shimmer, dark exposure).
const BAKED_CARD_NUMBER = '•••• 8972';
const ASSET_DIR = '/assets/social/card-maps';
// Tile must be a multiple of the cluster size (5) so the coarse grain tiles.
const GRAIN_TILE = 320;

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  const img = new Image();
  img.src = url;
  try {
    // decode() resolves after async (off-main-thread) decode — drawing/upload
    // later never pays a synchronous decode during an animation frame.
    await img.decode();
    return img;
  } catch {
    return null;
  }
}

function applyTexParams(t: THREE.Texture) {
  t.anisotropy = 16;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
}

/** Composite grain tile + structure overlay into a full-size map texture. */
function compositeMap(grain: HTMLImageElement, structure: HTMLImageElement): THREE.Texture {
  const canvas = makeCanvas(TEX_W, TEX_H);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = ctx.createPattern(grain, 'repeat')!;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.drawImage(structure, 0, 0);
  const t = new THREE.CanvasTexture(canvas);
  applyTexParams(t);
  return t;
}

// The normal + roughness maps carry no card number, so the blank and issued
// variants SHARE the same two composited textures (one GPU upload each; the
// mid-reveal issued swap only uploads a new albedo).
let sharedMapsPromise: Promise<{
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
} | null> | null = null;

function getSharedMaps() {
  if (!sharedMapsPromise) {
    sharedMapsPromise = (async () => {
      const [structN, structR, grainN, grainR] = await Promise.all([
        loadImage(`${ASSET_DIR}/structure-normal.png`),
        loadImage(`${ASSET_DIR}/structure-rough.png`),
        loadImage(`${ASSET_DIR}/grain-normal.png`),
        loadImage(`${ASSET_DIR}/grain-rough.png`),
      ]);
      if (!structN || !structR || !grainN || !grainR) return null;
      return {
        normalMap: compositeMap(grainN, structN),
        roughnessMap: compositeMap(grainR, structR),
      };
    })();
  }
  return sharedMapsPromise;
}

/** Load + composite the baked maps; null if any asset is missing (→ live
 *  generator). The baked issued albedo carries the demo card number; any other
 *  number also falls back. */
async function loadBakedMaps(opts: CardMapOptions): Promise<CardMaps | null> {
  if (opts.issued && opts.cardNumber !== BAKED_CARD_NUMBER) return null;
  const [albedo, shared] = await Promise.all([
    // Albedo is a COLOR map (no smooth-region data to corrupt), so mild lossy
    // WebP is safe and keeps it small.
    loadImage(`${ASSET_DIR}/${opts.issued ? 'issued' : 'blank'}-map.webp`),
    getSharedMaps(),
  ]);
  if (!albedo || !shared) return null;
  const map = new THREE.Texture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  applyTexParams(map);
  return { map, normalMap: shared.normalMap, roughnessMap: shared.roughnessMap };
}

// Maps are cached per variant and kept for the session — there are only two
// (blank / issued). The host prewarms both on idle so opening the sheet and the
// mid-reveal issued swap never pay a load (or, in the fallback, a bake).
const mapsCache = new Map<string, Promise<CardMaps>>();

export function getCardMaps(opts: CardMapOptions): Promise<CardMaps> {
  const key = `${opts.issued}|${opts.cardNumber}`;
  let cached = mapsCache.get(key);
  if (!cached) {
    cached = loadBakedMaps(opts).then((baked) => baked ?? generateCardMaps(opts));
    mapsCache.set(key, cached);
  }
  return cached;
}

// ── Dev-only re-bake hook ────────────────────────────────────────────────────
// After changing the card's design below, run the app, enter the Z wallet once
// (loads this chunk), then from the console / a script:
//   const urls = await __bakeCardMaps();  // { 'grain-normal': dataURL, ... }
// and save each data URL to public/assets/social/card-maps/<key>.<png|webp>
// (extension per the data URL's mime — data maps are PNG, albedos WebP; encode
// in Chrome, Safari can't toDataURL('image/webp')).
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__bakeCardMaps = async () => {
    const out: Record<string, string> = {};
    const tiles = bakeGrainTiles();
    out['grain-normal'] = tiles.normal.toDataURL('image/png');
    out['grain-rough'] = tiles.rough.toDataURL('image/png');
    out['structure-normal'] = (await bakeStructureNormal()).toDataURL('image/png');
    out['structure-rough'] = bakeStructureRough().toDataURL('image/png');
    const visa = await loadVisa();
    for (const issued of [false, true]) {
      const albedo = drawAlbedo({ issued, cardNumber: BAKED_CARD_NUMBER }, visa);
      out[`${issued ? 'issued' : 'blank'}-map`] = albedo.toDataURL('image/webp', 0.9);
    }
    return out;
  };
}

/** Tileable beadblast grain patches — the noise has no spatial correlation, so
 *  a small tile repeated across the card is indistinguishable from full-size
 *  noise (and, being small, ships lossless). Matches the live generator's field
 *  passes exactly: height = base ±13 per-texel ±9 per-5px-cluster (Sobel'd to a
 *  normal with WRAP sampling for seamless edges); rough = #b2b2b2 ±21. */
function bakeGrainTiles(): { normal: HTMLCanvasElement; rough: HTMLCanvasElement } {
  const N = GRAIN_TILE;
  const height = new Float32Array(N * N).fill(128);
  for (let i = 0; i < N * N; i++) height[i] += (Math.random() - 0.5) * 26;
  for (let by = 0; by < N; by += 5) {
    for (let bx = 0; bx < N; bx += 5) {
      const n = (Math.random() - 0.5) * 18;
      for (let y = by; y < by + 5; y++) {
        for (let x = bx; x < bx + 5; x++) height[y * N + x] += n;
      }
    }
  }
  const strength = 2.5;
  const at = (x: number, y: number) => height[((y + N) % N) * N + ((x + N) % N)] / 255;
  const nimg = new ImageData(N, N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength; // v-flip (see heightToNormal)
      const len = Math.hypot(dx, dy, 1) || 1;
      const i = (y * N + x) * 4;
      nimg.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 3] = 255;
    }
  }
  const normal = makeCanvas(N, N);
  normal.getContext('2d')!.putImageData(nimg, 0, 0);

  const rimg = new ImageData(N, N);
  for (let i = 0; i < rimg.data.length; i += 4) {
    const v = Math.max(0, Math.min(255, 178 + (Math.random() - 0.5) * 42));
    rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = v;
    rimg.data[i + 3] = 255;
  }
  const rough = makeCanvas(N, N);
  rough.getContext('2d')!.putImageData(rimg, 0, 0);
  return { normal, rough };
}

/** Structure normal: Sobel of the SMOOTH height field (flat base + debossed Z
 *  bevel), with alpha = where structure replaces the grain — the Z fill's own
 *  blur coverage plus the hard-edged chip body (stamped smooth/polished). At
 *  load this is drawn over the tiled grain normal: field keeps grain, basin +
 *  chip go smooth, bevel edges blend — matching the live generator, where the
 *  solid fills overwrote the grain. */
async function bakeStructureNormal(): Promise<HTMLCanvasElement> {
  const hCanvas = makeCanvas(TEX_W, TEX_H);
  const hctx = hCanvas.getContext('2d')!;
  hctx.fillStyle = '#808080';
  hctx.fillRect(0, 0, TEX_W, TEX_H);
  hctx.save();
  hctx.filter = `blur(${3 * S}px)`;
  hctx.fillStyle = '#4d4d4d';
  fillZ(hctx);
  hctx.restore();
  const normal = await heightToNormal(
    hctx.getImageData(0, 0, TEX_W, TEX_H).data,
    TEX_W,
    TEX_H,
    2.5,
  );
  const aCanvas = makeCanvas(TEX_W, TEX_H);
  const actx = aCanvas.getContext('2d')!;
  actx.save();
  actx.filter = `blur(${3 * S}px)`;
  actx.fillStyle = '#ffffff';
  fillZ(actx);
  actx.restore();
  actx.fillStyle = '#ffffff';
  fillChipBody(actx);
  const cover = actx.getImageData(0, 0, TEX_W, TEX_H);
  for (let i = 3; i < normal.data.length; i += 4) normal.data[i] = cover.data[i];
  const out = makeCanvas(TEX_W, TEX_H);
  out.getContext('2d')!.putImageData(normal, 0, 0);
  return out;
}

/** Structure roughness: the polished Z / chip marks on a TRANSPARENT canvas —
 *  drawn over the tiled grain at load, this composites identically to the live
 *  generator (same ops, same order, over the grainy field). */
function bakeStructureRough(): HTMLCanvasElement {
  const c = makeCanvas(TEX_W, TEX_H);
  const ctx = c.getContext('2d')!;
  ctx.save();
  ctx.filter = `blur(${2 * S}px)`;
  ctx.fillStyle = '#333333';
  fillZ(ctx);
  ctx.restore();
  ctx.save();
  ctx.filter = `blur(${3 * S}px)`;
  ctx.fillStyle = '#404040';
  fillChipBody(ctx);
  ctx.restore();
  ctx.save();
  ctx.filter = `blur(${0.5 * S}px)`;
  ctx.strokeStyle = '#b2b2b2';
  strokeChip(ctx, 2 * S);
  ctx.restore();
  return c;
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Position + scale the Z path into a ctx (caller sets fillStyle/filter first). */
function fillZ(ctx: CanvasRenderingContext2D) {
  const targetW = TEX_W * Z_WIDTH_FRAC;
  const scale = targetW / Z_VIEW_W;
  const zW = Z_VIEW_W * scale;
  const zH = Z_VIEW_H * scale;
  const tx = (TEX_W - zW) / 2;
  const ty = TEX_H * Z_CENTER_Y_FRAC - zH / 2;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);
  ctx.fill(new Path2D(Z_PATH), 'evenodd');
  ctx.restore();
}

// SIM chip (refs/social-platform/chip.svg, viewBox 151 x 101): a rounded body +
// a 2x3 grid of rounded contacts. Placed left, vertically centered, ~realistic
// size. The body is shiny polished metal (like the Z); the contact-dividing
// lines are the matte grey field.
const CHIP_VIEW_W = 151;
const CHIP_W_FRAC = 0.145; // chip width / card width
const CHIP_LEFT_FRAC = 0.075; // chip left edge / card width

/** Apply the chip's placement transform (drawing then happens in svg space). */
function withChip(ctx: CanvasRenderingContext2D, fn: (c: CanvasRenderingContext2D) => void) {
  const scale = (TEX_W * CHIP_W_FRAC) / CHIP_VIEW_W;
  const chipH = 101 * scale;
  ctx.save();
  ctx.translate(TEX_W * CHIP_LEFT_FRAC, TEX_H * 0.5 - chipH / 2);
  ctx.scale(scale, scale);
  fn(ctx);
  ctx.restore();
}

/** Fill the chip body (the outer rounded rect). */
function fillChipBody(ctx: CanvasRenderingContext2D) {
  withChip(ctx, (c) => {
    c.beginPath();
    c.roundRect(0.5, 0.5, 149.066, 99.0898, 19.5);
    c.fill();
  });
}

/** Stroke the chip lines — outer outline + the 2x3 contact outlines (caller
 *  sets strokeStyle). These are the matte grey dividers between the contacts. */
function strokeChip(ctx: CanvasRenderingContext2D, lineWidthTex: number) {
  const scale = (TEX_W * CHIP_W_FRAC) / CHIP_VIEW_W;
  withChip(ctx, (c) => {
    c.lineWidth = lineWidthTex / scale;
    c.lineJoin = 'round';
    c.beginPath();
    c.roundRect(0.5, 0.5, 149.066, 99.0898, 19.5);
    for (const cx of [8.5, 83.5332]) {
      for (const ry of [8.5, 37.8633, 67.2266]) {
        c.roundRect(cx, ry, 58.0332, 24.3633, 12.1816);
      }
    }
    c.stroke();
  });
}

/** Draw the bottom-row face content (card number left, DEBIT + Visa right). */
function drawFace(
  ctx: CanvasRenderingContext2D,
  visa: HTMLImageElement | null,
  opts: CardMapOptions,
  ink: string,
) {
  const margin = TEX_W * 0.06;
  const baselineY = TEX_H * 0.88;
  ctx.save();
  ctx.fillStyle = ink;
  ctx.textBaseline = 'alphabetic';

  // Card number (bottom-left) — only once issued.
  if (opts.issued) {
    ctx.font = `600 ${30 * S}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(opts.cardNumber, margin, baselineY);
  }

  // DEBIT + Visa (bottom-right, stacked, right-aligned) — scaled up a touch.
  ctx.font = `700 ${31 * S}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('DEBIT', TEX_W - margin, baselineY - 47 * S);
  if (visa) {
    const vw = 156 * S;
    const vh = (visa.height / visa.width) * vw;
    ctx.drawImage(visa, TEX_W - margin - vw, baselineY - 35 * S, vw, vh);
  } else {
    ctx.font = `italic 800 ${47 * S}px Georgia, "Times New Roman", serif`;
    ctx.fillText('VISA', TEX_W - margin, baselineY);
  }
  ctx.restore();
}

function loadVisa(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '/assets/VisaLogo.svg';
  });
}

/** Albedo: metal gray base + lighter face content (all smooth — no grain). */
function drawAlbedo(opts: CardMapOptions, visa: HTMLImageElement | null): HTMLCanvasElement {
  const canvas = makeCanvas(TEX_W, TEX_H);
  const actx = canvas.getContext('2d')!;
  actx.fillStyle = '#cdcccb'; // titanium-gray base reflectance (near-neutral, warmth dialed back)
  actx.fillRect(0, 0, TEX_W, TEX_H);
  // Brighter, polished Z reflectance so the recessed mark reads brighter.
  actx.save();
  actx.filter = `blur(${1.5 * S}px)`;
  actx.fillStyle = '#f0efee';
  fillZ(actx);
  actx.restore();
  // Chip body bright (like the Z); the dividing lines fall back to the base tone.
  actx.save();
  actx.filter = `blur(${3 * S}px)`;
  actx.fillStyle = '#f0efee';
  fillChipBody(actx);
  actx.restore();
  actx.save();
  actx.filter = `blur(${0.5 * S}px)`;
  actx.strokeStyle = '#cdcccb';
  strokeChip(actx, 2 * S);
  actx.restore();
  // Face content, light — flat printed decal.
  drawFace(actx, visa, opts, 'rgba(230,229,228,0.92)');
  return canvas;
}

/** Cooperative yield — hands the main thread back between work slices so the
 *  bake never blocks input/animation (Safari has no requestIdleCallback, so the
 *  prewarm can land mid-entrance; a synchronous bake froze the whole app for
 *  seconds there). MessageChannel = a fast macrotask without setTimeout's 4ms
 *  clamp. */
function yieldMain(): Promise<void> {
  return new Promise((resolve) => {
    const mc = new MessageChannel();
    mc.port1.onmessage = () => resolve();
    mc.port2.postMessage(null);
  });
}
// Rows per slice for the pixel passes (~0.4M px each at 2048 wide — a few ms).
const SLICE_ROWS = 192;

/** Sobel height -> tangent-space normal map. height read from the red channel.
 *  Chunked: yields between row slices (see yieldMain). */
async function heightToNormal(
  height: Uint8ClampedArray,
  w: number,
  h: number,
  strength: number,
): Promise<ImageData> {
  const out = new ImageData(w, h);
  const at = (x: number, y: number) => {
    const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
    const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
    return height[(cy * w + cx) * 4] / 255;
  };
  for (let y0 = 0; y0 < h; y0 += SLICE_ROWS) {
    const y1 = Math.min(y0 + SLICE_ROWS, h);
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
        // Canvas y runs DOWN but texture v runs UP — the vertical gradient's sign
        // must flip, or every horizontal deboss edge lights from the wrong side
        // (top walls of the recess catching light that should hit bottom walls).
        const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
        const nz = 1;
        const len = Math.hypot(dx, dy, nz) || 1;
        const i = (y * w + x) * 4;
        out.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
        out.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
        out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
        out.data[i + 3] = 255;
      }
    }
    await yieldMain();
  }
  return out;
}

export async function generateCardMaps(opts: CardMapOptions): Promise<CardMaps> {
  const visa = await loadVisa();

  // ── Height field: mid base + beadblast grain on the FIELD, then a SMOOTH
  //    debossed Z laid on top — its solid fill leaves the basin floor grain-free
  //    (polished metal), while the field stays grainy. The face content (number
  //    / DEBIT / Visa) is a flat printed decal, so it isn't etched here. ──
  const heightCanvas = makeCanvas(TEX_W, TEX_H);
  const hctx = heightCanvas.getContext('2d')!;
  hctx.fillStyle = '#808080';
  hctx.fillRect(0, 0, TEX_W, TEX_H);
  // Beadblast grain at two scales so the texture reads at any card size: a fine
  // per-texel sparkle PLUS coarser clusters that survive minification. Chunked
  // with yields — this is a multi-million-pixel CPU pass.
  const himg = hctx.getImageData(0, 0, TEX_W, TEX_H);
  for (let y0 = 0; y0 < TEX_H; y0 += SLICE_ROWS) {
    const end = Math.min(y0 + SLICE_ROWS, TEX_H) * TEX_W * 4;
    for (let i = y0 * TEX_W * 4; i < end; i += 4) {
      const n = (Math.random() - 0.5) * 26;
      himg.data[i] = Math.max(0, Math.min(255, himg.data[i] + n));
    }
    await yieldMain();
  }
  const CLUSTER = 5;
  for (let by = 0; by < TEX_H; by += CLUSTER) {
    for (let bx = 0; bx < TEX_W; bx += CLUSTER) {
      const n = (Math.random() - 0.5) * 18;
      const xMax = Math.min(bx + CLUSTER, TEX_W);
      const yMax = Math.min(by + CLUSTER, TEX_H);
      for (let y = by; y < yMax; y++) {
        for (let x = bx; x < xMax; x++) {
          const idx = (y * TEX_W + x) * 4;
          himg.data[idx] = Math.max(0, Math.min(255, himg.data[idx] + n));
        }
      }
    }
    if (by % (CLUSTER * 40) === 0) await yieldMain();
  }
  hctx.putImageData(himg, 0, 0);
  // Debossed Z (darker = lower → recessed) over the grain, with a tight bevel
  // (sharp edge). Solid fill ⇒ the basin floor is smooth (no grain = polished).
  hctx.save();
  hctx.filter = `blur(${3 * S}px)`;
  hctx.fillStyle = '#4d4d4d'; // deboss depth (a bit deeper than the half-depth #5d5d5d)
  fillZ(hctx);
  hctx.restore();
  // SIM chip: flush with the surface (no emboss/depth) but the body is stamped
  // SMOOTH at the base height so the polished panel reads clean, not sparkly from
  // the beadblast grain.
  hctx.save();
  hctx.fillStyle = '#808080';
  fillChipBody(hctx);
  hctx.restore();

  const heightField = hctx.getImageData(0, 0, TEX_W, TEX_H);
  const normalImg = await heightToNormal(heightField.data, TEX_W, TEX_H, 2.5);
  const normalCanvas = makeCanvas(TEX_W, TEX_H);
  normalCanvas.getContext('2d')!.putImageData(normalImg, 0, 0);
  await yieldMain();

  // ── Roughness: beadblast rough, Z polished. ──
  const roughCanvas = makeCanvas(TEX_W, TEX_H);
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#b2b2b2'; // ~0.70 rough (matte beadblast — grittier, reads as real metal)
  rctx.fillRect(0, 0, TEX_W, TEX_H);
  // grain on the beadblast — stronger gloss variation so the matte stipple pops
  const rimg = rctx.getImageData(0, 0, TEX_W, TEX_H);
  for (let y0 = 0; y0 < TEX_H; y0 += SLICE_ROWS) {
    const end = Math.min(y0 + SLICE_ROWS, TEX_H) * TEX_W * 4;
    for (let i = y0 * TEX_W * 4; i < end; i += 4) {
      const n = (Math.random() - 0.5) * 42;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.max(0, Math.min(255, rimg.data[i] + n));
    }
    await yieldMain();
  }
  rctx.putImageData(rimg, 0, 0);
  // The Z is polished (low roughness) vs the matte beadblast field, soft edge —
  // it mirrors the key so it reads brighter than the field.
  rctx.save();
  rctx.filter = `blur(${2 * S}px)`;
  rctx.fillStyle = '#333333'; // ~0.20 polish — sharper, more dramatic reflection (still soft enough to stay centered)
  fillZ(rctx);
  rctx.restore();
  // Chip body shiny (like the Z); the dividing lines are matte (the grey field).
  rctx.save();
  rctx.filter = `blur(${3 * S}px)`;
  rctx.fillStyle = '#404040';
  fillChipBody(rctx);
  rctx.restore();
  rctx.save();
  rctx.filter = `blur(${0.5 * S}px)`;
  rctx.strokeStyle = '#b2b2b2';
  strokeChip(rctx, 2 * S);
  rctx.restore();

  const albedoCanvas = drawAlbedo(opts, visa);

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const normalMap = new THREE.CanvasTexture(normalCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  for (const t of [map, normalMap, roughnessMap]) {
    t.anisotropy = 16;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.needsUpdate = true;
  }

  return { map, normalMap, roughnessMap };
}
