/** The card's intrinsic size — the phone screen (402) minus its 16px gutters. */
export const CARD_W = 370;
export const CARD_H = 232;

/** The Figma card spec artboard is 1536 × 969 (ISO ID-1, 1 mm = 17.94 px). */
export const FIGMA_CARD_W = 1536;

/** Figma spec px → card px. Mirrors the `fig()` SCSS function in `card-units`. */
export const fig = (px: number) => (px * CARD_W) / FIGMA_CARD_W;
