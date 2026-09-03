/* The "Design your card" state. Only the `custom` skin ("Your brand") reads it;
   the six showcase skins keep their own art direction. */

/** What the card is made of: a laminated PVC card, or a metal sheet with thin
 *  laminated skins. Sets the thickness, the edge layers, and how color sits
 *  on the surface (pigment or tinted alloy). */
export type CardMaterial = 'plastic' | 'metal';
/** The surface coat: matte (soft-touch plastic, brushed metal) or gloss
 *  (laminated plastic, polished metal). */
export type CardFinish = 'matte' | 'gloss';

export interface CardDesign {
  /** Program name printed on the card and used as the app's brand. */
  programName: string;
  /** Card background. A single color or a two-stop gradient. */
  color: string;
  colorEnd?: string;
  material: CardMaterial;
  finish: CardFinish;
  /** Object URL (or data URL) of an uploaded logo. Null = wordmark only. */
  logoUrl: string | null;
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

export const MATERIALS: Array<{ id: CardMaterial; label: string }> = [
  { id: 'plastic', label: 'Plastic' },
  { id: 'metal', label: 'Metal' },
];

export const FINISHES: Array<{ id: CardFinish; label: string }> = [
  { id: 'matte', label: 'Matte' },
  { id: 'gloss', label: 'Gloss' },
];

export const initialDesign: CardDesign = {
  programName: 'Your brand',
  color: DESIGN_SWATCHES[1].color,
  colorEnd: DESIGN_SWATCHES[1].colorEnd,
  material: 'plastic',
  finish: 'matte',
  logoUrl: null,
};
