import type { PresetDesign } from '@/data/presets';

export interface NewBrand {
  id: string;
  design: PresetDesign;
}

export const NEW_BRANDS: NewBrand[] = [];
