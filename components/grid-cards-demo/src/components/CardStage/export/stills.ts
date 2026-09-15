/* The still pictures a share makes: the square (what the sheet shows and the
   download gives) and the link preview (1.91:1, the same template with the
   square layout centered and the surface running out to the edges). One
   pose for both (the hero: a little pitched back, turned toward the light). */

import type { Orientation } from '@/data/design';
import { compose, encodeCanvas, exposureFor, layoutIn, type Palette } from './compose';
import type { CardExporter, ExportPose } from './exportRenderer';

export type StillFormat = 'post' | 'square';

export interface StillSpec {
  id: StillFormat;
  label: string;
  width: number;
  height: number;
}

export const STILLS: Record<StillFormat, StillSpec> = {
  post: { id: 'post', label: 'Post', width: 2400, height: 1256 },
  square: { id: 'square', label: 'Square', width: 2160, height: 2160 },
};

/** The card's long edge as a fraction of the template's layout square. */
export const CARD_IN_LAYOUT = 0.7;

/** The hero pose: the top edge pitched back a touch, the right edge turned
 *  away so the studio's key runs across the face and the edge shows. */
export const HERO_POSE: ExportPose = { rotX: -9, rotY: 21 };
export const FLAT_POSE: ExportPose = { rotX: 0, rotY: 0 };

export type PoseId = 'front' | 'angle' | 'turned' | 'back';

/** The poses on offer. The card can also be turned freely by hand. */
export const POSES: Array<{ id: PoseId; label: string; pose: ExportPose }> = [
  { id: 'front', label: 'Front', pose: FLAT_POSE },
  { id: 'angle', label: 'Angled', pose: HERO_POSE },
  { id: 'turned', label: 'Turned', pose: { rotX: -6, rotY: 56 } },
  { id: 'back', label: 'Back', pose: { rotX: -9, rotY: 180 + 21 } },
];

/** The pose on offer that a pose is, if any (within a degree). */
export function poseIdOf(pose: ExportPose): PoseId | null {
  const norm = (a: number) => ((a % 360) + 360) % 360;
  return (
    POSES.find(
      (p) => Math.abs(norm(p.pose.rotX) - norm(pose.rotX)) < 1 && Math.abs(norm(p.pose.rotY) - norm(pose.rotY)) < 1,
    )?.id ?? null
  );
}

export function stillSize(format: StillFormat): { width: number; height: number } {
  const s = STILLS[format];
  return { width: s.width, height: s.height };
}

/** The exporter's `cardFrac` (of the frame's matching dimension) that puts
 *  the card's long edge at `CARD_IN_LAYOUT` of the layout square. */
export function cardFracFor(width: number, height: number, orientation: Orientation): number {
  const { side } = layoutIn(width, height);
  return (CARD_IN_LAYOUT * side) / (orientation === 'portrait' ? height : width);
}

export interface StillOptions {
  format: StillFormat;
  palette: Palette;
  pose?: ExportPose;
  /** Render at this fraction of the format's size (a preview). */
  scale?: number;
}

/** Render a still to a canvas (the sheet's preview draws it; the share
 *  encodes it). `prepareTemplate` must have resolved. */
export function renderStillCanvas(exporter: CardExporter, opts: StillOptions): HTMLCanvasElement {
  const size = stillSize(opts.format);
  const scale = opts.scale ?? 1;
  const width = Math.round(size.width * scale);
  const height = Math.round(size.height * scale);
  const frame = exporter.renderSafe({
    width,
    height,
    pose: opts.pose ?? HERO_POSE,
    cardFrac: cardFracFor(width, height, exporter.orientation),
    exposure: exposureFor(opts.palette),
  });
  return compose(frame, { palette: opts.palette });
}

export async function renderStill(exporter: CardExporter, opts: StillOptions): Promise<Blob> {
  return encodeCanvas(renderStillCanvas(exporter, opts));
}
