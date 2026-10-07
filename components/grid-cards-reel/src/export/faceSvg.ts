/* Each card's faces as layered, editable SVG for Figma: the print, the art
   as its own vectors, the mark, the chip, the Visa mark, and on the back
   live text for the account block. Placement comes from the playground's
   face painter (brandBox, lockupBox, backLayout, ...), so the layers land
   where the 3D card prints them.

   Figma imports SVG `id`s as layer names, and drops SVG filters. So:
   noise (film grain) and very dense texture become image layers; a blur or
   a drop shadow is left off the shape and written into its name
   ("… · blur 120"), and the Figma build puts it back as a native effect. */

import { faceSize } from '@/apps/card/cardMetrics';
import { CARD_R } from '@/components/CardStage/card3d/cardGeometry';
import {
  backLayout,
  brandBox,
  CHIP_CONTACTS,
  CHIP_SPEC,
  doveBox,
  finePrintBaseline,
  foilIsBlack,
  foilTone,
  inkFor,
  loadImage,
  lockupBox,
  mixHex,
  resolveBrandLayout,
  STRIPE_SPEC,
} from '@/components/CardStage/card3d/facePaint';
import { FIGMA_CARD_W, CARD_W } from '@/apps/card/cardMetrics';
import { isBare, materialOf, stockOf, type CardDesign } from '@/data/design';
import type { ReelBrand } from '@reel/brands/reelBrands';
import { BACK } from '@reel/brands/reelBrands';

const RADIUS = (CARD_R * FIGMA_CARD_W) / CARD_W;
const FONT = "'Suisse Intl', 'Inter', sans-serif";
const NS = 'http://www.w3.org/2000/svg';

export interface FaceSvgs {
  front: string;
  back: string;
  /** The front with the art as authored (blurs and noise as filters), for
   *  rasterizing the flat still. */
  frontPreview: string;
  /** Raster layers embedded, by name, for reporting. */
  rasters: string[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

async function fetchText(url: string): Promise<string> {
  const r = await fetch(url);
  return r.text();
}

let assets: Promise<{ lockup: string; contactless: string; dovePng: string; dove: HTMLImageElement }> | null = null;
function faceAssets() {
  assets ??= (async () => {
    const [lockup, contactless, doveImg] = await Promise.all([
      fetchText('/assets/card/visa-debit-lockup.svg'),
      fetchText('/assets/card/contactless.svg'),
      loadImage('/assets/card/visa-dove.svg'),
    ]);
    const dove = doveImg!;
    const c = document.createElement('canvas');
    c.width = 600;
    c.height = Math.round((600 * dove.naturalHeight) / dove.naturalWidth);
    c.getContext('2d')!.drawImage(dove, 0, 0, c.width, c.height);
    return { lockup, contactless, dovePng: c.toDataURL('image/png'), dove };
  })();
  return assets;
}

/** The inner markup of an SVG document, its ids (and references to them)
 *  prefixed so several can share one file. */
function inner(svg: string, prefix: string): { defs: string; body: string; viewBox: number[] } {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = doc.documentElement;
  const viewBox = (root.getAttribute('viewBox') ?? '0 0 0 0').split(/\s+/).map(Number);
  root.querySelectorAll('[id]').forEach((el) => el.setAttribute('id', `${prefix}${el.getAttribute('id')}`));
  root.querySelectorAll('*').forEach((el) => {
    for (const a of Array.from(el.attributes)) {
      if (a.value.includes('url(#')) el.setAttribute(a.name, a.value.replace(/url\(#/g, `url(#${prefix}`));
    }
  });
  const defs = Array.from(root.querySelectorAll(':scope > defs'))
    .map((d) => d.innerHTML)
    .join('');
  root.querySelectorAll(':scope > defs').forEach((d) => d.remove());
  return { defs, body: root.innerHTML, viewBox };
}

/** An element (with the defs it needs) as a PNG data URL, face-sized. */
async function rasterizeLayer(defs: string, el: string, w: number, h: number, scale = 1): Promise<string> {
  const svg = `<svg xmlns="${NS}" width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${el}</svg>`;
  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  const c = document.createElement('canvas');
  c.width = w * scale;
  c.height = h * scale;
  c.getContext('2d')!.drawImage(img!, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

/** The art's markup made Figma-ready: noise and dense groups to images,
 *  blurs and shadows into layer names. */
async function figmaArt(svg: string, w: number, h: number, rasters: string[]): Promise<{ defs: string; body: string }> {
  const { defs, body } = inner(svg, 'a-');
  const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}"><defs>${defs}</defs><g>${body}</g></svg>`, 'image/svg+xml');
  const defsEl = doc.querySelector('defs')!;
  const g = doc.documentElement.querySelector(':scope > g')!;
  const filterOf = (el: Element) => {
    const m = el.getAttribute('filter')?.match(/url\(#([^)]+)\)/);
    return m ? defsEl.querySelector(`#${CSS.escape(m[1])}`) : null;
  };
  const ser = new XMLSerializer();
  const jobs: Array<Promise<void>> = [];
  let n = 0;
  for (const el of Array.from(g.querySelectorAll('*'))) {
    if (!el.isConnected) continue;
    const f = filterOf(el);
    const dense = el.tagName === 'g' && el.querySelectorAll('*').length > 300;
    if (!f && !dense) continue;
    const noise = f?.querySelector('feTurbulence');
    if (noise || dense) {
      const name = noise ? 'Grain' : 'Texture';
      const markup = ser.serializeToString(el);
      const img = doc.createElementNS(NS, 'image');
      img.setAttribute('id', `${name} (image) ${++n}`);
      img.setAttribute('width', String(w));
      img.setAttribute('height', String(h));
      el.replaceWith(img);
      rasters.push(name);
      // Noise has no detail to lose at half size, and a full-size noise
      // PNG is most of a file.
      jobs.push(rasterizeLayer(defs, markup, w, h, noise ? 0.5 : 1).then((url) => img.setAttribute('href', url)));
      continue;
    }
    const blurSd = f?.querySelector('feGaussianBlur')?.getAttribute('stdDeviation');
    const shadow = f?.querySelector('feDropShadow');
    el.removeAttribute('filter');
    const base = el.getAttribute('id') ?? (el.tagName === 'g' ? 'Group' : 'Shape');
    if (shadow) el.setAttribute('id', `${base} · shadow ${shadow.getAttribute('dy')} ${shadow.getAttribute('stdDeviation')} ${shadow.getAttribute('flood-opacity')}`);
    else if (blurSd) el.setAttribute('id', `Blob · blur ${blurSd}`);
  }
  await Promise.all(jobs);
  return { defs: defsEl.innerHTML, body: g.innerHTML };
}

function etchFloor(design: CardDesign): string {
  if (materialOf(design) === 'metal') return '#f0efee';
  const base = design.color ?? stockOf(design).face;
  const lum = (parseInt(base.slice(1, 3), 16) * 0.2126 + parseInt(base.slice(3, 5), 16) * 0.7152 + parseInt(base.slice(5, 7), 16) * 0.0722) / 255;
  return mixHex(base, lum < 0.5 ? '#ffffff' : '#000000', 0.22);
}

const TREATMENT = { print: 'print', spotGloss: 'spot gloss', foil: 'foil', etch: 'etch' } as const;

async function markLayer(design: CardDesign): Promise<{ defs: string; layer: string }> {
  if (design.brandHidden) return { defs: '', layer: '' };
  const l = resolveBrandLayout(design, null);
  if (!design.logoUrl) {
    // The placeholder's wordmark, as live text.
    const box = brandBox(design, null);
    const em = box.h;
    const ink = inkFor(design, null);
    return {
      defs: '',
      layer: `<text id="Wordmark" x="${box.x}" y="${box.y + box.h / 2 + em * 0.36}" font-family="${FONT}" font-weight="430" font-size="${em}" letter-spacing="${em * -0.04}" fill="${ink}">${esc(design.programName.trim() || 'Your brand')}</text>`,
    };
  }
  const logo = await loadImage(design.logoUrl);
  const box = brandBox(design, logo);
  const lay = resolveBrandLayout(design, logo);
  const svg = design.logoUrl.startsWith('data:')
    ? decodeURIComponent(design.logoUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''))
    : await fetchText(design.logoUrl);
  const { defs, body, viewBox } = inner(svg, 'm-');
  const [vx, vy, vw, vh] = viewBox;
  let content = body;
  let extraDefs = defs;
  if (design.logoTreatment === 'foil') {
    extraDefs += `<linearGradient id="m-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#f2f2f5"/><stop offset="1" stop-color="#d9d9de"/></linearGradient>`;
    content = content.replace(/fill="[^"]*"/g, 'fill="url(#m-foil)"');
  } else if (design.logoTreatment === 'etch') {
    content = content.replace(/fill="[^"]*"/g, `fill="${etchFloor(design)}"`);
  }
  const k = box.w / vw;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  return {
    defs: extraDefs,
    layer: `<g id="Mark (${TREATMENT[design.logoTreatment]})" opacity="${l.opacity}" transform="rotate(${lay.rotation} ${cx} ${cy}) translate(${box.x} ${box.y}) scale(${k}) translate(${-vx} ${-vy})">${content}</g>`,
  };
}

function chipLayer(design: CardDesign, o: CardDesign['orientation']): string {
  const c = CHIP_SPEC;
  const face = isBare(design) ? stockOf(design).face : design.color!;
  const r = (c.w * 19.5) / 151;
  const sx = c.w / 151;
  const sy = c.h / 101;
  const pads = CHIP_CONTACTS.xs
    .flatMap((px) =>
      CHIP_CONTACTS.ys.map(
        (py) =>
          `<rect x="${c.x + px * sx}" y="${c.y + py * sy}" width="${CHIP_CONTACTS.w * sx}" height="${CHIP_CONTACTS.h * sy}" rx="${CHIP_CONTACTS.r * sy}" fill="none" stroke="rgb(70,74,82)" stroke-opacity="0.4" stroke-width="1.6"/>`,
      ),
    )
    .join('');
  const gap = 2.7;
  const turn = o === 'portrait' ? ` transform="translate(${faceSize(o).w} 0) rotate(90)"` : '';
  return `<g id="Chip"${turn}>
    <defs><linearGradient id="chip-pocket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mixHex(face, '#000000', 0.5)}"/><stop offset="1" stop-color="${mixHex(face, '#000000', 0.28)}"/></linearGradient>
    <linearGradient id="chip-plate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9dade"/><stop offset="0.5" stop-color="#f4f5f8"/><stop offset="1" stop-color="#cbcdd3"/></linearGradient></defs>
    <rect id="Pocket" x="${c.x - gap}" y="${c.y - gap}" width="${c.w + gap * 2}" height="${c.h + gap * 2}" rx="${r + gap}" fill="url(#chip-pocket)"/>
    <rect id="Plate" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${r}" fill="url(#chip-plate)"/>
    <g id="Contacts">${pads}</g>
  </g>`;
}

function lockupLayer(lockupSvg: string, o: CardDesign['orientation'], fill: string, name: string): string {
  const L = lockupBox(o);
  const { body } = inner(lockupSvg, 'v-');
  const tinted = body.replace(/fill="#fff"/g, `fill="${fill}"`);
  return `<g id="${name}" transform="translate(${L.x} ${L.y}) scale(${L.w / 339})">${tinted}</g>`;
}

const wrap = (w: number, h: number, name: string, defs: string, body: string) =>
  `<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><clipPath id="card-shape"><rect width="${w}" height="${h}" rx="${RADIUS}"/></clipPath>${defs}</defs><g id="${name}" clip-path="url(#card-shape)">${body}</g></svg>`;

export async function faceSvgs(brand: ReelBrand, artSvg: string | null): Promise<FaceSvgs> {
  const d = brand.design;
  const o = d.orientation;
  const { w, h } = faceSize(o);
  const fa = await faceAssets();
  const rasters: string[] = [];
  const printColor = isBare(d) ? stockOf(d).face : d.color!;
  // A gradient print runs on both faces; seen from behind, the back's is
  // mirrored so it reads the same way round (as gradientPaint has it).
  const printDefs = (side: 'front' | 'back') => {
    const g = d.gradient;
    if (!g || isBare(d)) return { defs: '', fill: printColor };
    const fx = (x: number) => (side === 'front' ? x : w - x);
    const stops = [...g.stops].sort((a, b) => a.at - b.at).map((s) => `<stop offset="${s.at}" stop-color="${s.color}"/>`).join('');
    const r = Math.hypot(g.to.x - g.from.x, g.to.y - g.from.y);
    const el =
      g.type === 'radial'
        ? `<radialGradient id="print-${side}" gradientUnits="userSpaceOnUse" cx="${fx(g.from.x)}" cy="${g.from.y}" r="${r}">${stops}</radialGradient>`
        : `<linearGradient id="print-${side}" gradientUnits="userSpaceOnUse" x1="${fx(g.from.x)}" y1="${g.from.y}" x2="${fx(g.to.x)}" y2="${g.to.y}">${stops}</linearGradient>`;
    return { defs: el, fill: `url(#print-${side})` };
  };
  const frontPrint = printDefs('front');
  const backPrint = printDefs('back');

  // Front. Art authored here comes in as vectors; a preset's art is a
  // picture, embedded as one.
  let art = artSvg ? await figmaArt(artSvg, w, h, rasters) : null;
  if (!art && d.backgroundUrl) {
    const blob = await (await fetch(d.backgroundUrl)).blob();
    const url = await new Promise<string>((r) => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result as string);
      fr.readAsDataURL(blob);
    });
    art = { defs: '', body: `<image id="Art (image)" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" href="${url}"/>` };
    rasters.push('Art');
  }
  const artName = d.artTreatment === 'spotGloss' ? 'Art (spot gloss)' : 'Art';
  const mark = await markLayer(d);
  const ink = inkFor(d, d.backgroundUrl ? ({} as HTMLImageElement) : null);
  const frontWith = (a: { defs: string; body: string } | null) =>
    wrap(
      w,
      h,
      `${brand.id} · front`,
      (a?.defs ?? '') + mark.defs + frontPrint.defs,
      `<rect id="${isBare(d) ? (materialOf(d) === 'metal' ? 'Steel' : 'Stock') : 'Print'}" width="${w}" height="${h}" fill="${frontPrint.fill}"/>
     ${a ? `<g id="${artName}">${a.body}</g>` : ''}
     ${mark.layer}
     ${chipLayer(d, o)}
     ${d.visaMark === 'front' ? lockupLayer(fa.lockup, o, ink, 'Visa') : ''}`,
    );
  const front = frontWith(art);
  const frontPreview = artSvg ? frontWith(inner(artSvg, 'a-')) : front;

  // Back.
  const L = backLayout(o);
  const backInk = inkFor(d, null);
  const stripe = mixHex(printColor, '#000000', 0.2);
  const stripeRect = o === 'landscape' ? `<rect id="Magstripe" width="${w}" height="${STRIPE_SPEC}" fill="${stripe}"/>` : `<rect id="Magstripe" width="${STRIPE_SPEC}" height="${h}" fill="${stripe}"/>`;
  const line = L.em * (41 / 57);
  const gap = L.em * (32 / 57);
  const y1 = L.y + line;
  const y2 = y1 + line + gap;
  const y3 = y2 + line + gap;
  const text = (id: string, x: number, y: number, size: number, s: string) =>
    `<text id="${id}" x="${x}" y="${y}" font-family="${FONT}" font-weight="400" font-size="${size}" fill="${backInk}">${esc(s)}</text>`;
  const cw = 90 * (67.3435 / 90);
  const contactless = inner(fa.contactless, 'c-').body.replace(/stroke="white"/g, `stroke="${backInk}"`);
  const fineLast = finePrintBaseline(o);
  const fine = L.finePrint.map((t, i) => text(`Fine print ${i + 1}`, L.x, fineLast - L.finePrintLead * (L.finePrint.length - 1 - i), L.finePrintPx, t)).join('');
  const dove = doveBox(fa.dove, o);
  const visa =
    d.visaMark === 'back'
      ? lockupLayer(fa.lockup, o, foilTone(foilIsBlack(d)), `Visa (foil, ${foilIsBlack(d) ? 'black' : 'silver'})`)
      : `<image id="Hologram (dove)" x="${dove.x}" y="${dove.y}" width="${dove.w}" height="${dove.h}" href="${fa.dovePng}"/>`;
  if (d.visaMark !== 'back') rasters.push('Hologram');
  const back = wrap(
    w,
    h,
    `${brand.id} · back`,
    backPrint.defs,
    `<rect id="Print" width="${w}" height="${h}" fill="${backPrint.fill}"/>
     ${stripeRect}
     <g id="Contactless" transform="translate(${L.contactless.right - cw} ${L.contactless.y})">${contactless}</g>
     <g id="Account">
       ${text('Cardholder', L.x, y1, L.em, d.cardholderName || BACK.cardholderName)}
       ${text('Card number', L.x, y2, L.em, brand.credentials.groups.join(' '))}
       ${text('Expiry and CVV', L.x, y3, L.em, `EXP ${brand.credentials.exp}   CVV ${brand.credentials.cvv}`)}
     </g>
     <g id="Fine print">${fine}</g>
     ${visa}`,
  );
  return { front, back, frontPreview, rasters };
}
