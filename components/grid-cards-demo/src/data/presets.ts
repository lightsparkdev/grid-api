/* The Global Accounts playground's platforms, as card designs made with the
   Design controls: the same marks, colors, and placements as their cards
   there. Picking one fills the controls; the selection is read back off the
   design, so any edit is the visitor's own design again. */

import { FIGMA_FACE_H } from '@/apps/card/cardMetrics';
import { sameBrandLayout, sameGradient, type CardDesign } from './design';

export type PresetId = 'creator' | 'social' | 'marketplace' | 'ondemand' | 'messaging';

/** The design a preset fills in. The cardholder's name is the visitor's and
 *  is kept across presets. */
export type PresetDesign = Omit<CardDesign, 'cardholderName'>;

export interface CardPreset {
  id: PresetId;
  label: string;
  iconSrc: string;
  design: PresetDesign;
}

const ASSETS = '/assets/presets';
const MID_Y = FIGMA_FACE_H / 2;
/** The chip's center line (the chip is at y 334, 149 tall). */
const MID_Y_CHIP = 334 + 149 / 2;

export const PRESETS: CardPreset[] = [
  {
    id: 'creator',
    label: 'Creator',
    iconSrc: `${ASSETS}/app-icon-creator.png`,
    // Glitch: brand purple, the mark at the right on the chip's row, a little
    // larger than the sample's wordmark height.
    design: {
      programName: 'Glitch',
      material: 'plastic',
      finish: 'gloss',
      color: '#9147ff',
      gradient: null,
      logoUrl: `${ASSETS}/logo-creator.svg`,
      logoTreatment: 'print',
      brandLayout: { x: 1536 - 152, y: MID_Y_CHIP, h: 140, anchor: 'right', rotation: 0, opacity: 1 },
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
  {
    id: 'social',
    label: 'Social',
    iconSrc: `${ASSETS}/app-icon-social.png`,
    // The Z card: bare matte steel, the Z etched in, centered, 52% of the width.
    design: {
      programName: 'Z',
      material: 'metal',
      finish: 'matte',
      color: null,
      gradient: null,
      logoUrl: `${ASSETS}/logo-social.svg`,
      logoTreatment: 'etch',
      brandLayout: { x: 768, y: MID_Y, h: 767, anchor: 'center', rotation: 0, opacity: 1 },
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    iconSrc: `${ASSETS}/app-icon-marketplace.png`,
    // Waterbnb: an illustrated stay across the card (a Hollywood Hills house
    // at golden hour, in the GA design gallery's gouache style), the house
    // as a white badge at its center (Figma 2631:12225, the art variant).
    design: {
      programName: 'Waterbnb',
      material: 'plastic',
      finish: 'matte',
      color: '#ff385c',
      gradient: null,
      logoUrl: `${ASSETS}/logo-marketplace-badge.svg`,
      logoTreatment: 'print',
      brandLayout: { x: 768, y: MID_Y, h: 343, anchor: 'center', rotation: 0, opacity: 1 },
      backgroundUrl: `${ASSETS}/art-marketplace.webp`,
      artTreatment: 'print',
    },
  },
  {
    id: 'ondemand',
    label: 'On-demand',
    iconSrc: `${ASSETS}/app-icon-ondemand.png`,
    // Super: matte black with the GA card's ambient dot grid across the face
    // (one frame of it, baked as art), the wordmark top-left as a spot-gloss
    // varnish.
    design: {
      programName: 'Super',
      material: 'plastic',
      finish: 'matte',
      color: '#000000',
      gradient: null,
      logoUrl: null,
      logoTreatment: 'spotGloss',
      brandLayout: { x: 95, y: 138, h: 125, anchor: 'left', rotation: 0, opacity: 1 },
      backgroundUrl: `${ASSETS}/art-ondemand.png`,
      artTreatment: 'print',
    },
  },
  {
    id: 'messaging',
    label: 'Messaging',
    iconSrc: `${ASSETS}/app-icon-messaging.png`,
    // ChatsApp: brand green, the bubble as an oversized watermark bleeding
    // off the edge, white at 20% (Figma 2650:11281 has it on the left; here
    // it is on the right, clear of the chip).
    design: {
      programName: 'ChatsApp',
      material: 'plastic',
      finish: 'matte',
      color: '#1daa61',
      gradient: null,
      logoUrl: `${ASSETS}/logo-messaging.svg`,
      logoTreatment: 'print',
      brandLayout: { x: 1536 - 505, y: 475, h: 838, anchor: 'center', rotation: 0, opacity: 0.2 },
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
];

const PRESET_KEYS = Object.keys(PRESETS[0].design) as Array<keyof PresetDesign>;

function matches(design: CardDesign, preset: PresetDesign): boolean {
  return PRESET_KEYS.every((k) =>
    k === 'brandLayout'
      ? sameBrandLayout(design.brandLayout, preset.brandLayout)
      : k === 'gradient'
        ? sameGradient(design.gradient, preset.gradient)
        : design[k] === preset[k],
  );
}

/** The preset a design is, or null: the visitor's own. */
export function presetOf(design: CardDesign): PresetId | null {
  return PRESETS.find((p) => matches(design, p.design))?.id ?? null;
}

/** The preset's design with the visitor's cardholder name kept. */
export function applyPreset(preset: PresetDesign, current: CardDesign): CardDesign {
  return { ...preset, cardholderName: current.cardholderName };
}
