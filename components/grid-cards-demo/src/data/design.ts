/* The "Design your card" state, structured the way a card is made: a body
   (plastic or metal), a coat (finish), a print (color or art, logo), and
   decoration on the print (spot gloss, foil). */

/** What the card is made of: a laminated PVC card, or a metal sheet with thin
 *  laminated skins. Sets the thickness and the edge layers. */
export type CardMaterial = 'plastic' | 'metal';
/** The surface coat: matte (soft-touch print, brushed metal) or gloss
 *  (laminated print, polished metal). */
export type CardFinish = 'matte' | 'gloss';
/** How the brand mark is applied. Ink is printed; spot gloss is a clear
 *  high-gloss varnish (reads on a matte card); foil is hot-stamped silver;
 *  etch is cut into the card: through to the steel on metal, a blind deboss
 *  on plastic. */
export type LogoTreatment = 'print' | 'spotGloss' | 'foil' | 'etch';
export type ArtTreatment = 'print' | 'spotGloss';

/** The card body under the print: PVC core in white or black, or stainless
 *  steel. Shows at the edge and on the face wherever nothing is printed. Not
 *  a choice: plastic takes the core that matches the print (a dark print on a
 *  black core, so the edge reads as one piece); metal is steel. */
export interface CardStock {
  id: string;
  label: string;
  material: CardMaterial;
  /** Face reflectance of the bare stock. */
  face: string;
  /** Edge (core) color. */
  core: string;
  /** Ink that reads on the bare stock. */
  ink: 'light' | 'dark';
}

export const STOCKS: CardStock[] = [
  { id: 'white', label: 'White plastic', material: 'plastic', face: '#f1f1ef', core: '#ececef', ink: 'dark' },
  { id: 'black', label: 'Black plastic', material: 'plastic', face: '#17171a', core: '#1c1c20', ink: 'light' },
  { id: 'steel', label: 'Stainless steel', material: 'metal', face: '#c9c8c7', core: '#d6d6d8', ink: 'dark' },
];

/** Relative luminance of a #rrggbb, 0..1. */
export function luminance(hex: string): number {
  const c = (i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return 0.2126 * c(0) + 0.7152 * c(1) + 0.0722 * c(2);
}

export function stockOf(design: Pick<CardDesign, 'material' | 'color'>): CardStock {
  if (design.material === 'metal') return STOCKS[2];
  return design.color && luminance(design.color) < 0.3 ? STOCKS[1] : STOCKS[0];
}

/** What the card is made of. */
export function materialOf(design: Pick<CardDesign, 'material'>): CardMaterial {
  return design.material;
}

/** Which point of the brand's box `BrandLayout.x` fixes. */
export type BrandAnchor = 'left' | 'center' | 'right';

/**
 * Where the brand (the logo, or the wordmark) sits on the front, in the card
 * spec's px (the 1536 × 969 artboard). `x` is the anchor's x and `y` the
 * box's center; `h` is the box's height, and a wordmark is set at 0.8 h so
 * its caps sit inside it. `rotation` turns the box about its center,
 * degrees clockwise. The box may run off the card: a watermark bleeds.
 */
export interface BrandLayout {
  x: number;
  y: number;
  h: number;
  anchor: BrandAnchor;
  rotation: number;
  /** 0..1. A watermark is the brand printed faint. */
  opacity: number;
}

/** The print's margin on every side (spec px): the chip's own inset, which
 *  the brand is right-aligned to in the print sample. The stage snaps to it. */
export const BRAND_MARGIN = 152;

/** The print sample's placement: on the chip's row, right-aligned to the
 *  chip's own inset (152), 90 tall (Thales sample, Figma 1:97). */
export const BRAND_DEFAULT_LAYOUT: BrandLayout = {
  x: 1536 - BRAND_MARGIN,
  y: 334 + 149 / 2,
  h: 90,
  anchor: 'right',
  rotation: 0,
  opacity: 1,
};

export const BRAND_MIN_H = 24;
export const BRAND_MAX_H = 1400;

export function sameBrandLayout(a: BrandLayout | null, b: BrandLayout | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.h === b.h &&
    a.anchor === b.anchor &&
    a.rotation === b.rotation &&
    a.opacity === b.opacity
  );
}

export interface CardDesign {
  /** Program name printed on the card and used as the app's brand. */
  programName: string;
  /** The cardholder, printed on the back. */
  cardholderName: string;
  material: CardMaterial;
  finish: CardFinish;
  /** Printed color, solid. Null = no print: the bare stock shows. */
  color: string | null;
  /** Object URL (or data URL) of an uploaded logo. Null = wordmark only. */
  logoUrl: string | null;
  logoTreatment: LogoTreatment;
  /** Where the brand sits. Null = the print sample's placement, with a wide
   *  logo held to 410 wide. */
  brandLayout: BrandLayout | null;
  /** Object URL (or data URL) of uploaded card art, drawn across the front
   *  behind everything else. Null = the color (or the bare stock). */
  backgroundUrl: string | null;
  artTreatment: ArtTreatment;
}

export interface DesignSwatch {
  id: string;
  label: string;
  color: string;
}

export const DESIGN_SWATCHES: DesignSwatch[] = [
  { id: 'ink', label: 'Ink', color: '#151517' },
  // A very slightly warm white.
  { id: 'bone', label: 'Bone', color: '#f2efe9' },
  { id: 'ocean', label: 'Ocean', color: '#0b3d91' },
  { id: 'forest', label: 'Forest', color: '#0c3b2e' },
  { id: 'terracotta', label: 'Terracotta', color: '#b3472a' },
  { id: 'lilac', label: 'Lilac', color: '#5b3fb8' },
];

/** No print: the bare stock shows on the face. */
export function isBare(design: Pick<CardDesign, 'color'>): boolean {
  return design.color === null;
}

/** The color the app's chrome takes from the card: the print, or the stock. */
export function brandColorOf(design: Pick<CardDesign, 'color' | 'material'>): string {
  return design.color ?? stockOf(design).face;
}

export const MATERIALS: Array<{ id: CardMaterial; label: string }> = [
  { id: 'plastic', label: 'Plastic' },
  { id: 'metal', label: 'Metal' },
];

export const FINISHES: Array<{ id: CardFinish; label: string }> = [
  { id: 'matte', label: 'Matte' },
  { id: 'gloss', label: 'Gloss' },
];

export const LOGO_TREATMENTS: Array<{ id: LogoTreatment; label: string }> = [
  { id: 'print', label: 'Ink' },
  { id: 'spotGloss', label: 'Gloss' },
  { id: 'foil', label: 'Foil' },
  { id: 'etch', label: 'Etch' },
];

export const ART_TREATMENTS: Array<{ id: ArtTreatment; label: string }> = [
  { id: 'print', label: 'Ink' },
  { id: 'spotGloss', label: 'Gloss' },
];

export const initialDesign: CardDesign = {
  programName: 'Your brand',
  cardholderName: '',
  material: 'plastic',
  finish: 'matte',
  color: DESIGN_SWATCHES[0].color,
  logoUrl: null,
  logoTreatment: 'print',
  brandLayout: null,
  backgroundUrl: null,
  artTreatment: 'print',
};
