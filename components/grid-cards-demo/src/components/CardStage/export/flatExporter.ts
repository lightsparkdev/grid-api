/* The card rendered for a picture without WebGL: the flat card's two painted
   faces, projected through the same camera as the 3D exporter (the card a
   plane of card px at the origin, the camera CAMERA_Z out), so a pose frames
   and foreshortens as it does there. Face on, the face is one affine draw; at
   an angle it is a mesh of small triangles, each an affine draw, which holds
   the perspective. No thickness and no lighting: it is the flat card. */

import { footprint } from '@/apps/card/cardMetrics';
import { squirclePath } from '@/components/liquid-glass';
import type { Orientation } from '@/data/design';
import { CARD_R, CORNER_SMOOTHING } from '../card3d/cardGeometry';
import { CAMERA_Z, type CardFrameSource, type ExportFrame, type ExportFrameOptions, type ExportPose } from './exportRenderer';

/** Mesh cells along the card's long edge (the short edge in proportion). */
const CELLS_LONG = 18;
/** Each triangle's clip grows by this much (frame px) past its edges, so the
 *  anti-aliased seams between neighbors are covered. */
const SEAM_PX = 0.75;

/** The flat card's painted faces, as it is held (see FlatCard). Null until
 *  the front has painted once. */
export interface FlatFaces {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
  /** Painted, with nothing loading. */
  ready: boolean;
}

interface Deps {
  faces: () => FlatFaces | null;
  orientation: () => Orientation;
  livePose: () => ExportPose;
}

type Pt = { x: number; y: number };

/** `img`'s triangle `s` drawn onto the frame's triangle `d`. */
function drawTriangle(ctx: CanvasRenderingContext2D, img: CanvasImageSource, s: [Pt, Pt, Pt], d: [Pt, Pt, Pt]) {
  const [s0, s1, s2] = s;
  const [d0, d1, d2] = d;
  const den = (s1.x - s0.x) * (s2.y - s0.y) - (s2.x - s0.x) * (s1.y - s0.y);
  if (Math.abs(den) < 1e-9) return;
  const a = ((d1.x - d0.x) * (s2.y - s0.y) - (d2.x - d0.x) * (s1.y - s0.y)) / den;
  const b = ((d1.y - d0.y) * (s2.y - s0.y) - (d2.y - d0.y) * (s1.y - s0.y)) / den;
  const c = ((d2.x - d0.x) * (s1.x - s0.x) - (d1.x - d0.x) * (s2.x - s0.x)) / den;
  const e = ((d2.y - d0.y) * (s1.x - s0.x) - (d1.y - d0.y) * (s2.x - s0.x)) / den;
  // Scaled about the incenter by (r + SEAM_PX) / r, every edge moves out by
  // SEAM_PX (the shared diagonal of a cell included).
  const la = Math.hypot(d1.x - d2.x, d1.y - d2.y);
  const lb = Math.hypot(d0.x - d2.x, d0.y - d2.y);
  const lc = Math.hypot(d0.x - d1.x, d0.y - d1.y);
  const perimeter = la + lb + lc;
  const area = Math.abs((d1.x - d0.x) * (d2.y - d0.y) - (d2.x - d0.x) * (d1.y - d0.y)) / 2;
  if (perimeter < 1e-6 || area < 1e-6) return;
  const ix = (la * d0.x + lb * d1.x + lc * d2.x) / perimeter;
  const iy = (la * d0.y + lb * d1.y + lc * d2.y) / perimeter;
  const grow = 1 + SEAM_PX / ((2 * area) / perimeter);
  const [g0, g1, g2] = [d0, d1, d2].map((p) => ({ x: ix + (p.x - ix) * grow, y: iy + (p.y - iy) * grow }));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(g0.x, g0.y);
  ctx.lineTo(g1.x, g1.y);
  ctx.lineTo(g2.x, g2.y);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, e, d0.x - a * s0.x - c * s0.y, d0.y - b * s0.x - e * s0.y);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

export class FlatExporter implements CardFrameSource {
  private canvas: HTMLCanvasElement | null = null;

  constructor(private readonly deps: Deps) {}

  get ready(): boolean {
    return !!this.deps.faces()?.ready;
  }

  get orientation(): Orientation {
    return this.deps.orientation();
  }

  get livePose(): ExportPose {
    return this.deps.livePose();
  }

  warm() {}

  renderSafe(opts: ExportFrameOptions): ExportFrame {
    return this.render(opts);
  }

  render({ width, height, pose, cardFrac }: ExportFrameOptions): ExportFrame {
    // Before the first paint there is no card to picture, and while a logo or
    // art loads the paint is the last design's: fail (the share offers a
    // retry) rather than hand back a blank or stale frame.
    const faces = this.deps.faces();
    if (!faces?.ready) throw new Error('The flat card is not painted yet');
    const canvas = (this.canvas ??= document.createElement('canvas'));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.clearRect(0, 0, width, height);
    this.paint(ctx, faces, width, height, pose, cardFrac);
    return { width, height, data: ctx.getImageData(0, 0, width, height).data };
  }

  private paint(
    ctx: CanvasRenderingContext2D,
    faces: FlatFaces,
    width: number,
    height: number,
    pose: ExportPose,
    cardFrac: number,
  ) {
    const foot = footprint(this.orientation);
    // Framed as the 3D exporter frames it: the long edge takes `cardFrac`.
    const k = foot.w >= foot.h ? (width * cardFrac) / foot.w : (height * cardFrac) / foot.h;
    // The scene's Euler XYZ (y up), the upright card laid out upright (no
    // quarter-turn roll, as in FlatCard's CSS).
    const rad = Math.PI / 180;
    const [sx, cx] = [Math.sin(pose.rotX * rad), Math.cos(pose.rotX * rad)];
    const [sy, cy] = [Math.sin(pose.rotY * rad), Math.cos(pose.rotY * rad)];
    const rz = (pose.rotZ ?? 0) * rad;
    const [sz, cz] = [Math.sin(rz), Math.cos(rz)];
    /** A point of the face (card px from its top left, y down, as painted)
     *  → the frame, for the front, or the back seen from behind. */
    const project = (u: number, v: number, back: boolean): Pt => {
      const x0 = back ? foot.w / 2 - u : u - foot.w / 2;
      const y0 = foot.h / 2 - v;
      const x1 = x0 * cz - y0 * sz;
      const y1 = x0 * sz + y0 * cz;
      // The face is the plane z = 0, so the spin's z comes from x alone.
      const x2 = x1 * cy;
      const z2 = -x1 * sy;
      const y3 = y1 * cx - z2 * sx;
      const z3 = y1 * sx + z2 * cx;
      const persp = CAMERA_Z / (CAMERA_Z - z3);
      return { x: width / 2 + x2 * persp * k, y: height / 2 - y3 * persp * k };
    };

    // The face toward the camera: the front's corners wind clockwise on screen.
    const tl = project(0, 0, false);
    const tr = project(foot.w, 0, false);
    const bl = project(0, foot.h, false);
    const back = (tr.x - tl.x) * (bl.y - tl.y) - (tr.y - tl.y) * (bl.x - tl.x) < 0;
    const img = back ? faces.back : faces.front;
    const toImg = img.width / foot.w;

    // The card's outline (the same squircle as the mesh), projected: the clip.
    const nums = squirclePath(foot.w, foot.h, CARD_R, CORNER_SMOOTHING).match(/-?\d+(\.\d+)?/g)!.map(Number);
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < nums.length; i += 2) {
      const p = project(nums[i], nums[i + 1], false);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.imageSmoothingQuality = 'high';

    const faceOn = Math.abs(sx) < 1e-6 && Math.abs(sy) < 1e-6;
    const cols = faceOn ? 1 : foot.w >= foot.h ? CELLS_LONG : Math.max(2, Math.round((CELLS_LONG * foot.w) / foot.h));
    const rows = faceOn ? 1 : foot.h > foot.w ? CELLS_LONG : Math.max(2, Math.round((CELLS_LONG * foot.h) / foot.w));
    if (faceOn) {
      // Affine: one draw, no seams.
      const o = project(0, 0, back);
      const ux = project(foot.w, 0, back);
      const vy = project(0, foot.h, back);
      ctx.setTransform(
        (ux.x - o.x) / img.width,
        (ux.y - o.y) / img.width,
        (vy.x - o.x) / img.height,
        (vy.y - o.y) / img.height,
        o.x,
        o.y,
      );
      ctx.drawImage(img, 0, 0);
    } else {
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const u0 = (i / cols) * foot.w;
          const u1 = ((i + 1) / cols) * foot.w;
          const v0 = (j / rows) * foot.h;
          const v1 = ((j + 1) / rows) * foot.h;
          const s00 = { x: u0 * toImg, y: v0 * toImg };
          const s10 = { x: u1 * toImg, y: v0 * toImg };
          const s01 = { x: u0 * toImg, y: v1 * toImg };
          const s11 = { x: u1 * toImg, y: v1 * toImg };
          const d00 = project(u0, v0, back);
          const d10 = project(u1, v0, back);
          const d01 = project(u0, v1, back);
          const d11 = project(u1, v1, back);
          drawTriangle(ctx, img, [s00, s10, s11], [d00, d10, d11]);
          drawTriangle(ctx, img, [s00, s11, s01], [d00, d11, d01]);
        }
      }
    }
    ctx.restore();
  }
}
