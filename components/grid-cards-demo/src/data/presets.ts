/* The six platforms from the Global Accounts playground, as card designs.
   Picking one fills the Design controls; the first (Fintech) is the visitor's
   own design, so editing any control returns the selection to it. */

import type { CardDesign } from './design';

export type PresetId = 'fintech' | 'creator' | 'social' | 'marketplace' | 'ondemand' | 'messaging';

/** The design a preset fills in. The cardholder's name is the visitor's and
 *  is kept across presets. */
export type PresetDesign = Omit<CardDesign, 'cardholderName'>;

export interface CardPreset {
  id: PresetId;
  label: string;
  iconSrc: string;
  /** Absent on the custom tile: it holds whatever the visitor has designed. */
  design?: PresetDesign;
}

/** The tile that holds the visitor's own design. */
export const CUSTOM_PRESET: PresetId = 'fintech';

const ICONS = '/assets/presets';

export const PRESETS: CardPreset[] = [
  {
    id: 'fintech',
    label: 'Fintech',
    iconSrc: `${ICONS}/app-icon-wallet.png`,
  },
  {
    id: 'creator',
    label: 'Creator',
    iconSrc: `${ICONS}/app-icon-creator.png`,
    design: {
      programName: 'Glitch',
      material: 'plastic',
      finish: 'gloss',
      color: '#9147ff',
      logoUrl: `${ICONS}/logo-creator.svg`,
      logoTreatment: 'print',
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
  {
    id: 'social',
    label: 'Social',
    iconSrc: `${ICONS}/app-icon-social.png`,
    // The Z card: bare matte steel with the mark etched in.
    design: {
      programName: 'Z',
      material: 'metal',
      finish: 'matte',
      color: null,
      logoUrl: `${ICONS}/logo-social.svg`,
      logoTreatment: 'etch',
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    iconSrc: `${ICONS}/app-icon-marketplace.png`,
    design: {
      programName: 'Waterbnb',
      material: 'plastic',
      finish: 'matte',
      color: '#ff385c',
      logoUrl: `${ICONS}/logo-marketplace.svg`,
      logoTreatment: 'print',
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
  {
    id: 'ondemand',
    label: 'On-demand',
    iconSrc: `${ICONS}/app-icon-ondemand.png`,
    // Black on black: the wordmark is a spot-gloss varnish on the matte card.
    design: {
      programName: 'Super',
      material: 'plastic',
      finish: 'matte',
      color: '#000000',
      logoUrl: null,
      logoTreatment: 'spotGloss',
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
  {
    id: 'messaging',
    label: 'Messaging',
    iconSrc: `${ICONS}/app-icon-messaging.png`,
    design: {
      programName: 'ChatsApp',
      material: 'plastic',
      finish: 'matte',
      color: '#1daa61',
      logoUrl: `${ICONS}/logo-messaging.svg`,
      logoTreatment: 'print',
      backgroundUrl: null,
      artTreatment: 'print',
    },
  },
];

const PRESET_KEYS = Object.keys(PRESETS[1].design!) as Array<keyof PresetDesign>;

function matches(design: CardDesign, preset: PresetDesign): boolean {
  return PRESET_KEYS.every((k) => design[k] === preset[k]);
}

/** The tile a design selects: the preset it equals, else the custom tile. A
 *  design edited away from a preset is the visitor's own again. */
export function presetOf(design: CardDesign): PresetId {
  return PRESETS.find((p) => p.design && matches(design, p.design))?.id ?? CUSTOM_PRESET;
}

/** The preset's design with the visitor's cardholder name kept. */
export function applyPreset(preset: PresetDesign, current: CardDesign): CardDesign {
  return { ...preset, cardholderName: current.cardholderName };
}
