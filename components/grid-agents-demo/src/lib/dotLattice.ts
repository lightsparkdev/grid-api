/* The dot grid's lattice: the stage's backdrop (StageGL) and the share
   template's middle column (export/compose) lay their dots the same way.
   Matches grid-visualizer's SVG tile: a 20×20 repeat with a 2.5px dot. */

export const DOT_SPACING = 20;
export const DOT_SIZE = 2.5;

/** How the lattice meets the frame's edges: `gutter` (the stage: even
 *  breathing room inside, no dot on an edge) or `flush` (for a column drawn
 *  between two rules: the top and bottom rows sit whole against the top and
 *  bottom edges; across, the gutter, so no dot sits on a rule). */
export type DotEdge = 'gutter' | 'flush';

export interface DotLayout {
  cols: number;
  rows: number;
  /** The first dot's center. */
  startX: number;
  startY: number;
  /** The gap, center to center. */
  stepX: number;
  stepY: number;
}

/**
 * An even grid in a `w` × `h` frame (all in the frame's px). The gutter is a
 * hair smaller than the gap (by one dot), which reads as even padding all
 * around, and puts the first dot past each edge fully outside the frame, so a
 * field extended past the frame (the stage's ripple bleed) hides them at rest.
 * Scale `unit` for a frame drawn at another scale (the template's layout).
 */
export function dotLayout(w: number, h: number, edge: DotEdge = 'gutter', unit = 1): DotLayout {
  const spacing = DOT_SPACING * unit;
  const size = DOT_SIZE * unit;
  // Across: the gutter, either way.
  const cols = Math.max(1, Math.round((w + 2 * size) / spacing) - 1);
  const stepX = (w + 2 * size) / (cols + 1);
  const startX = stepX - size;
  if (edge === 'flush') {
    // Down: the top and bottom rows whole against the edges; the step
    // divides what is between them exactly.
    const rows = Math.max(1, Math.round((h - size) / spacing));
    return { cols, rows, startX, startY: size / 2, stepX, stepY: (h - size) / rows };
  }
  const rows = Math.max(1, Math.round((h + 2 * size) / spacing) - 1);
  const stepY = (h + 2 * size) / (rows + 1);
  return { cols, rows, startX, startY: stepY - size, stepX, stepY };
}
