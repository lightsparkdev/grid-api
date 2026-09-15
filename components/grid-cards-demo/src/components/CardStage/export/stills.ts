/* The still pictures a share makes: the link preview, a square post, and the
   card alone on transparency. One pose for all three (the hero: a little
   pitched back, turned toward the light), framed per format. */

import type { Orientation } from '@/data/design';
import { compose, encodeCanvas, exposureFor, type BackdropId } from './compose';
import type { CardExporter, ExportPose } from './exportRenderer';

export type StillFormat = 'post' | 'square' | 'card';

export interface StillSpec {
  id: StillFormat;
  label: string;
  /** Frame size for a flat card; an upright card swaps the card-only frame. */
  width: number;
  height: number;
  cardFrac: number;
  /** Transparent: no backdrop, PNG. */
  transparent: boolean;
}

export const STILLS: Record<StillFormat, StillSpec> = {
  post: { id: 'post', label: 'Post', width: 2400, height: 1256, cardFrac: 0.56, transparent: false },
  square: { id: 'square', label: 'Square', width: 2160, height: 2160, cardFrac: 0.8, transparent: false },
  card: { id: 'card', label: 'Card only', width: 3840, height: 2560, cardFrac: 0.86, transparent: true },
};

/** The hero pose: the top edge pitched back a touch, the right edge turned
 *  away so the studio's key runs across the face and the edge shows. */
export const HERO_POSE: ExportPose = { rotX: -9, rotY: 21 };
export const FLAT_POSE: ExportPose = { rotX: 0, rotY: 0 };
export const BACK_POSE: ExportPose = { rotX: -9, rotY: 180 - 21 };

/** Frame size for a format and how the card is held. */
export function stillSize(format: StillFormat, orientation: Orientation): { width: number; height: number } {
  const s = STILLS[format];
  if (format === 'card' && orientation === 'portrait') return { width: s.height, height: s.width };
  return { width: s.width, height: s.height };
}

/** The card's long edge in frame px (sizes the backdrop's dots). */
function cardPx(format: StillFormat, orientation: Orientation): number {
  const { width, height } = stillSize(format, orientation);
  return (orientation === 'portrait' ? height : width) * STILLS[format].cardFrac;
}

export interface StillOptions {
  format: StillFormat;
  backdrop: BackdropId;
  brandColor: string;
  pose?: ExportPose;
  /** Render at this fraction of the format's size (a preview). */
  scale?: number;
}

/** Render a still to a canvas (the sheet's preview draws it; the share
 *  encodes it). */
export function renderStillCanvas(exporter: CardExporter, opts: StillOptions): HTMLCanvasElement {
  const spec = STILLS[opts.format];
  const orientation = exporter.orientation;
  const size = stillSize(opts.format, orientation);
  const scale = opts.scale ?? 1;
  const width = Math.round(size.width * scale);
  const height = Math.round(size.height * scale);
  const backdrop: BackdropId = spec.transparent ? 'none' : opts.backdrop;
  const frame = exporter.renderSafe({
    width,
    height,
    pose: opts.pose ?? HERO_POSE,
    cardFrac: spec.cardFrac,
    exposure: exposureFor(backdrop, opts.brandColor),
  });
  return compose(frame, backdrop, opts.brandColor, cardPx(opts.format, orientation) * scale);
}

export async function renderStill(exporter: CardExporter, opts: StillOptions): Promise<Blob> {
  const canvas = renderStillCanvas(exporter, opts);
  return encodeCanvas(canvas, STILLS[opts.format].transparent);
}
