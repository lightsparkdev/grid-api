/* The "Design your card" state, structured the way a card is made: a core
   (material and stock), a coat (finish), a print (color or art, logo), and
   decoration on the print (spot gloss, foil). */

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

/** The core itself: PVC in white or black, or an alloy. Shows at the edge,
 *  and on the face wherever nothing is printed. */
export interface CardStock {
  id: string;
  label: string;
  materials: CardMaterial[];
  /** Face reflectance of the bare stock. */
  face: string;
  /** Edge (core) color. */
  core: string;
  /** Bare stock is metal (reflective) rather than pigment. */
  metal: boolean;
  /** Ink that reads on the bare stock. */
  ink: 'light' | 'dark';
}

/* Plastic is pigmented PVC core, in a few colors; metal is one thing, bare
   stainless. Each shows at the edge and under a "None" print. */
export const STOCKS: CardStock[] = [
  { id: 'white', label: 'White', materials: ['plastic'], face: '#f1f1ef', core: '#ececef', metal: false, ink: 'dark' },
  { id: 'ivory', label: 'Ivory', materials: ['plastic'], face: '#ebe3d2', core: '#e6ddc9', metal: false, ink: 'dark' },
  { id: 'gray', label: 'Gray', materials: ['plastic'], face: '#8d8d92', core: '#8a8a90', metal: false, ink: 'light' },
  { id: 'navy', label: 'Navy', materials: ['plastic'], face: '#1b2a4a', core: '#1f2f52', metal: false, ink: 'light' },
  { id: 'black', label: 'Black', materials: ['plastic'], face: '#17171a', core: '#1c1c20', metal: false, ink: 'light' },
  { id: 'steel', label: 'Steel', materials: ['metal'], face: '#a4a4a7', core: '#cfcfd3', metal: true, ink: 'dark' },
];

export function stockOf(design: Pick<CardDesign, 'stock'>): CardStock {
  return STOCKS.find((s) => s.id === design.stock) ?? STOCKS[0];
}

/** The stocks a material comes in. */
export function stocksFor(material: CardMaterial): CardStock[] {
  return STOCKS.filter((s) => s.materials.includes(material));
}

export interface CardDesign {
  /** Program name printed on the card and used as the app's brand. */
  programName: string;
  /** The cardholder, printed on the back. */
  cardholderName: string;
  material: CardMaterial;
  /** A `STOCKS` id valid for `material`. */
  stock: string;
  finish: CardFinish;
  /** Printed color, a single color or a two-stop gradient. Null = no print:
   *  the bare stock shows. */
  color: string | null;
  colorEnd?: string;
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
  colorEnd?: string;
}

export const DESIGN_SWATCHES: DesignSwatch[] = [
  { id: 'ink', label: 'Ink', color: '#151517', colorEnd: '#2b2b30' },
  { id: 'ocean', label: 'Ocean', color: '#0b3d91', colorEnd: '#0083c3' },
  { id: 'forest', label: 'Forest', color: '#0c3b2e', colorEnd: '#1f7a5a' },
  { id: 'terracotta', label: 'Terracotta', color: '#b3472a', colorEnd: '#e0743e' },
  { id: 'lilac', label: 'Lilac', color: '#5b3fb8', colorEnd: '#9b7bff' },
  { id: 'sand', label: 'Sand', color: '#d9c7a8', colorEnd: '#f1e6d2' },
];

/** No print: the bare stock shows on the face. */
export function isBare(design: Pick<CardDesign, 'color'>): boolean {
  return design.color === null;
}

/** The color the app's chrome takes from the card: the print, or the stock. */
export function brandColorOf(design: Pick<CardDesign, 'color' | 'colorEnd' | 'stock'>): {
  color: string;
  colorEnd?: string;
} {
  if (design.color) return { color: design.color, colorEnd: design.colorEnd };
  const s = stockOf(design);
  return { color: s.face };
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
  material: 'plastic',
  stock: 'white',
  finish: 'matte',
  color: DESIGN_SWATCHES[1].color,
  colorEnd: DESIGN_SWATCHES[1].colorEnd,
  logoUrl: null,
  logoTreatment: 'print',
  backgroundUrl: null,
  artTreatment: 'print',
};
