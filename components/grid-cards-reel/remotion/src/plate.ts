/* The card plate and its timing, as rendered by the reel app (../). The
   plate is a square, transparent video of the 3D card; track.json says, per
   frame, which design is on the card, and `meta.swaps` when each one comes
   on. Re-render the plate there (npm run render, npm run encode) and copy
   card-reel.webm and track.json here to update. */

import track from './track.json';

export const PLATE = {
  /** Transparent VP9 WebM in public/. For the final render, a ProRes 4444
   *  .mov with alpha (out/plate-final/card-reel.mov in the reel app) can go
   *  in public/ instead: point `file` at it. */
  file: 'card-reel.webm',
  fps: track.meta.fps,
  size: track.meta.size,
  frames: track.meta.frames,
};

export interface Swap {
  /** Plate frame the design comes on. */
  frame: number;
  /** The design's id (see the reel app's src/brands/newBrands.ts). */
  id: string;
}

/** Every card change in the plate, in order: for syncing sound or type to
 *  the flips. The first is the placeholder at frame 0. */
export const SWAPS: Swap[] = track.meta.swaps.map((s: { t: number; id: string }) => ({
  frame: Math.round(s.t * track.meta.fps),
  id: s.id,
}));

/** The card's height per plate frame, a share of the card's height (up). */
const heights: number[] = track.track.map((f: { y: number }) => f.y);

/** The plate's beats, in plate frames. */
export const BEATS = {
  /** The card leaves the ground: the bottom of the dip before the pop. */
  launch: heights.indexOf(Math.min(...heights)),
  /** The first design change. */
  firstSwap: SWAPS[1]?.frame ?? 0,
  /** "Your brand" comes back on the settled card. */
  finalSwap: SWAPS[SWAPS.length - 1]?.frame ?? 0,
};
