/* The "Design your card" state, structured the way a card is made: a body
   (the stock: a plastic color, or steel), a coat (finish), a print (color or
   art, logo), and decoration on the print (spot gloss, foil). */

/** What the card is made of: a laminated PVC card, or a metal sheet with thin
 *  laminated skins. Sets the thickness and the edge layers. */
export type CardMaterial = 'plastic' | 'metal';
/** The surface coat: matte (soft-touch print, brushed metal) or gloss
 *  (laminated print, polished metal). */
export type CardFinish = 'matte' | 'gloss';
/** Decoration applied over a printed element. Spot gloss is a clear
 *  high-gloss varnish (reads on a matte card); foil is hot-stamped metal. */
export type LogoTreatment = 'print' | 'spotGloss' | 'foilSilver' | 'foilGold';
export type ArtTreatment = 'print' | 'spotGloss';

/** The card body: pigmented PVC in a few colors, or bare stainless steel.
 *  Shows at the edge and on the face wherever nothing is printed. */
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
  { id: 'ivory', label: 'Ivory plastic', material: 'plastic', face: '#ebe3d2', core: '#e6ddc9', ink: 'dark' },
  { id: 'gray', label: 'Gray plastic', material: 'plastic', face: '#8d8d92', core: '#8a8a90', ink: 'light' },
  { id: 'navy', label: 'Navy plastic', material: 'plastic', face: '#1b2a4a', core: '#1f2f52', ink: 'light' },
  { id: 'black', label: 'Black plastic', material: 'plastic', face: '#17171a', core: '#1c1c20', ink: 'light' },
  { id: 'steel', label: 'Stainless steel', material: 'metal', face: '#c9c8c7', core: '#d6d6d8', ink: 'dark' },
];

export function stockOf(design: Pick<CardDesign, 'stock'>): CardStock {
  return STOCKS.find((s) => s.id === design.stock) ?? STOCKS[0];
}

/** What the card is made of, from its stock. */
export function materialOf(design: Pick<CardDesign, 'stock'>): CardMaterial {
  return stockOf(design).material;
}

export interface CardDesign {
  /** Program name printed on the card and used as the app's brand. */
  programName: string;
  /** The cardholder, printed on the back. */
  cardholderName: string;
  /** A `STOCKS` id: the material and its color in one. */
  stock: string;
  finish: CardFinish;
  /** Printed color, solid. Null = no print: the bare stock shows. */
  color: string | null;
  /** Object URL (or data URL) of an uploaded logo. Null = wordmark only. */
  logoUrl: string | null;
  logoTreatment: LogoTreatment;
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
  { id: 'ocean', label: 'Ocean', color: '#0b3d91' },
  { id: 'forest', label: 'Forest', color: '#0c3b2e' },
  { id: 'terracotta', label: 'Terracotta', color: '#b3472a' },
  { id: 'lilac', label: 'Lilac', color: '#5b3fb8' },
  { id: 'sand', label: 'Sand', color: '#d9c7a8' },
];

/** No print: the bare stock shows on the face. */
export function isBare(design: Pick<CardDesign, 'color'>): boolean {
  return design.color === null;
}

/** The color the app's chrome takes from the card: the print, or the stock. */
export function brandColorOf(design: Pick<CardDesign, 'color' | 'stock'>): string {
  return design.color ?? stockOf(design).face;
}

export const FINISHES: Array<{ id: CardFinish; label: string }> = [
  { id: 'matte', label: 'Matte' },
  { id: 'gloss', label: 'Gloss' },
];

export const LOGO_TREATMENTS: Array<{ id: LogoTreatment; label: string }> = [
  { id: 'print', label: 'Print' },
  { id: 'spotGloss', label: 'Gloss' },
  { id: 'foilSilver', label: 'Silver' },
  { id: 'foilGold', label: 'Gold' },
];

export const ART_TREATMENTS: Array<{ id: ArtTreatment; label: string }> = [
  { id: 'print', label: 'Print' },
  { id: 'spotGloss', label: 'Gloss' },
];

export const initialDesign: CardDesign = {
  programName: 'Your brand',
  cardholderName: 'Alex Rivera',
  stock: 'white',
  finish: 'matte',
  color: DESIGN_SWATCHES[1].color,
  logoUrl: null,
  logoTreatment: 'print',
  backgroundUrl: null,
  artTreatment: 'print',
};
