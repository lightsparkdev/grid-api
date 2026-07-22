/**
 * The Waterbnb card design gallery (the Airbnb card-face customization idea):
 * flat brand pink plus AI-illustrated "stay" scenes in the gouache travel
 * style. `art: null` = the pink face with the watermark house mark.
 */
export interface CardDesign {
  id: string;
  art: string | null;
}

const ART_BASE = '/assets/marketplace/card-designs';

/** Session memory for the picked design — module scope so the choice survives
 *  the card screen (and the whole skin) unmounting on app switches. */
export const cardDesignStore = { index: 0 };

export const CARD_DESIGNS: CardDesign[] = [
  { id: 'pink', art: null },
  { id: 'rice-terraces', art: `${ART_BASE}/design-04.webp` },
  { id: 'desert-dome', art: `${ART_BASE}/design-02.webp` },
  { id: 'lighthouse', art: `${ART_BASE}/design-03.webp` },
  { id: 'aurora-cabin', art: `${ART_BASE}/design-01.webp` },
  { id: 'canal-houses', art: `${ART_BASE}/design-05.webp` },
  { id: 'safari-camp', art: `${ART_BASE}/design-06.webp` },
  { id: 'cliff-village', art: `${ART_BASE}/design-07.webp` },
  { id: 'houseboat', art: `${ART_BASE}/design-08.webp` },
  { id: 'treehouse', art: `${ART_BASE}/design-09.webp` },
  { id: 'balloons', art: `${ART_BASE}/design-10.webp` },
  { id: 'rooftop', art: `${ART_BASE}/design-11.webp` },
];
