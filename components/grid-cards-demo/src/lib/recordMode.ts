/**
 * Recording mode, development only: `?record=1` or `?record=blueprint` on the
 * playground. The root layout's boot script sets `data-record` on <html>
 * before the first paint (`full` or `blueprint`); the stylesheet hides the
 * chrome and the dot grid off that attribute and paints the stage black, and
 * CardStage holds the intro on a black frame until Space. Never set in a
 * production build.
 *
 * - `full`: the whole intro, the blueprint dissolving into the card.
 * - `blueprint`: the blueprint draws and stays; the card never comes in.
 */
export type RecordVariant = 'full' | 'blueprint';

export function recordVariant(): RecordVariant | null {
  if (process.env.NODE_ENV !== 'development' || typeof document === 'undefined') return null;
  const v = document.documentElement.dataset.record;
  return v === 'full' || v === 'blueprint' ? v : null;
}

export function isRecordMode(): boolean {
  return recordVariant() !== null;
}
