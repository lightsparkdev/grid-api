import * as THREE from 'three';

/**
 * Procedurally composites the Z metal card's material maps on an offscreen
 * canvas — no baked image assets. Produces:
 *  - normalMap: fine beadblast micro-grain everywhere + the ~1mm debossed Z,
 *    derived from a height field via Sobel.
 *  - roughnessMap: beadblast = rough (matte), the Z = low (polished).
 *  - map (albedo): metal gray base + the lighter face content (Z highlight,
 *    DEBIT, Visa, card number — flat printed decals).
 * Async because the Visa wordmark is loaded from /assets/VisaLogo.svg.
 */

// logo-z.svg path (viewBox 200 x 192).
const Z_PATH =
  'M199.706 0L81.2584 172.382H181.649L197.788 191.142H0L72.8104 85.1799H72.8065L118.074 19.3031H24.3851L7.77817 0H199.706ZM35.775 172.382H57.0496L103.738 105.602V105.598L164.068 19.3031H142.793L35.775 172.382Z';
const Z_VIEW_W = 200;
const Z_VIEW_H = 192;

// Texture is the card face at credit-card aspect (1.586:1). High-res so the
// debossed Z, decals and beadblast stay crisp when the card fills the frame.
const TEX_W = 2048;
const TEX_H = Math.round(TEX_W / 1.586); // 1291
// Authoring scale: all px sizes/blurs below were tuned at 1024, so scale them.
const S = TEX_W / 1024;

// Z placement on the face (fractions of the texture). Centered horizontally, a
// touch above center, ~52% of the card width.
const Z_WIDTH_FRAC = 0.52;
const Z_CENTER_Y_FRAC = 0.5;

export interface CardMaps {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  dispose: () => void;
}

export interface CardMapOptions {
  issued: boolean;
  cardNumber: string;
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

/** Sobel height -> tangent-space normal map. height read from the red channel. */
function heightToNormal(height: Uint8ClampedArray, w: number, h: number, strength: number): ImageData {
  const out = new ImageData(w, h);
  const at = (x: number, y: number) => {
    const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
    const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
    return height[(cy * w + cx) * 4] / 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength;
      const nz = 1;
      const len = Math.hypot(dx, dy, nz) || 1;
      const i = (y * w + x) * 4;
      out.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
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
  // per-texel sparkle PLUS coarser clusters that survive minification.
  const himg = hctx.getImageData(0, 0, TEX_W, TEX_H);
  for (let i = 0; i < himg.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 26;
    himg.data[i] = Math.max(0, Math.min(255, himg.data[i] + n));
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
  }
  hctx.putImageData(himg, 0, 0);
  // Debossed Z (darker = lower → recessed) over the grain, with a tight bevel
  // (sharp edge). Solid fill ⇒ the basin floor is smooth (no grain = polished).
  hctx.save();
  hctx.filter = `blur(${3 * S}px)`;
  hctx.fillStyle = '#5d5d5d'; // ~half the deboss depth (was #3a3a3a)
  fillZ(hctx);
  hctx.restore();

  const heightField = hctx.getImageData(0, 0, TEX_W, TEX_H);
  const normalImg = heightToNormal(heightField.data, TEX_W, TEX_H, 2.5);
  const normalCanvas = makeCanvas(TEX_W, TEX_H);
  normalCanvas.getContext('2d')!.putImageData(normalImg, 0, 0);

  // ── Roughness: beadblast rough, Z polished. ──
  const roughCanvas = makeCanvas(TEX_W, TEX_H);
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#b2b2b2'; // ~0.70 rough (matte beadblast — grittier, reads as real metal)
  rctx.fillRect(0, 0, TEX_W, TEX_H);
  // grain on the beadblast — stronger gloss variation so the matte stipple pops
  const rimg = rctx.getImageData(0, 0, TEX_W, TEX_H);
  for (let i = 0; i < rimg.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 42;
    rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.max(0, Math.min(255, rimg.data[i] + n));
  }
  rctx.putImageData(rimg, 0, 0);
  // The Z is polished (low roughness) vs the matte beadblast field, soft edge —
  // it mirrors the key so it reads brighter than the field.
  rctx.save();
  rctx.filter = `blur(${2 * S}px)`;
  rctx.fillStyle = '#404040'; // ~0.25 satin polish (spreads the key into a soft bright center, not a hard streak)
  fillZ(rctx);
  rctx.restore();

  // ── Albedo: metal gray base + lighter face content. ──
  const albedoCanvas = makeCanvas(TEX_W, TEX_H);
  const actx = albedoCanvas.getContext('2d')!;
  actx.fillStyle = '#cdcccb'; // titanium-gray base reflectance (near-neutral, warmth dialed back)
  actx.fillRect(0, 0, TEX_W, TEX_H);
  // Brighter, polished Z reflectance so the recessed mark reads brighter.
  actx.save();
  actx.filter = `blur(${1.5 * S}px)`;
  actx.fillStyle = '#f0efee';
  fillZ(actx);
  actx.restore();
  // Face content, light — flat printed decal.
  drawFace(actx, visa, opts, 'rgba(230,229,228,0.92)');

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

  return {
    map,
    normalMap,
    roughnessMap,
    dispose: () => {
      map.dispose();
      normalMap.dispose();
      roughnessMap.dispose();
    },
  };
}
