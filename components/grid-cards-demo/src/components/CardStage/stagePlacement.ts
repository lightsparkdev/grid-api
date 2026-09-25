/**
 * Where the card sits on the stage, shared by the 3D stage (CardStage) and
 * the flat one (FlatCardStage): at rest in the middle, scaled to fit; in the
 * phone's `[data-card-slot]` as the phone comes up; clipped to the phone's
 * screen once parked there; in the share frame's slot while it is open.
 */

import { easeInOutCubic } from '@/components/DotGridCanvas/PhoneBootContext';
import type { CardMotion } from './cardMotion';

/** Largest the card gets on stage, relative to its size in the phone. */
const MAX_SCALE = 1.4;
const MIN_SCALE = 0.55;
/** Stage margin around the card. */
const GUTTER_X = 28;
const GUTTER_Y = 120;
/** Glide time constant toward the rest position (seconds). */
export const GLIDE_TAU = 0.14;
/** The card's fade under the screen's scroll edge has run out this far down
 *  the strip (the header's bottom edge). */
const EDGE_FADE_RAMP_END = 0.8;
const EDGE_FADE_STOPS = 8;

export interface Placement {
  x: number;
  y: number;
  s: number;
}

type Size = { w: number; h: number };

/** Rest: centered on a stage of `width` × `height`, scaled to fit it. */
export function restOn(width: number, height: number, foot: Size): Placement {
  return {
    x: width / 2,
    y: height / 2,
    s: Math.max(MIN_SCALE, Math.min(MAX_SCALE, (width - GUTTER_X * 2) / foot.w, (height - GUTTER_Y) / foot.h)),
  };
}

/** `p` moved `t` (0..1) of the way into the phone's card slot, at the scale
 *  that fits the slot (its width or its height, whichever the footprint
 *  needs). `r` is the stage's box. Unchanged if there is no slot. */
export function towardSlot(p: Placement, t: number, doc: Document, r: DOMRect, foot: Size): Placement {
  const slot = doc.querySelector<HTMLElement>('[data-card-slot]');
  if (!slot) return p;
  const b = slot.getBoundingClientRect();
  return {
    x: p.x + (b.left + b.width / 2 - r.left - p.x) * t,
    y: p.y + (b.top + b.height / 2 - r.top - p.y) * t,
    s: p.s + (Math.min(b.width / foot.w, b.height / foot.h) - p.s) * t,
  };
}

/** The flight into the share frame and back (s). */
const SHARE_FLIGHT_S = 0.6;

/**
 * The share frame: the card parks in its slot (`[data-share-card-slot]`),
 * posed. The flight's clock steps toward wanted, and the card interpolates
 * to the slot on the eased curve, as for the phone. The turn rides the
 * flight: where the card starts is read as the flight begins (either way),
 * and the angles follow the flight's own curve so the pose lands with the
 * card. Settled, the spring has it again.
 */
export class ShareFlight {
  /** 0 on the stage, 1 in the frame. */
  t = 0;
  private from: { rotX: number; rotY: number } | null = null;
  /** The slot as the card follows it: the slot moves and resizes with what
   *  the panel shows (Template, a hand), and the card glides after it rather
   *  than jumping. Null between flights. */
  private slot: Placement | null = null;
  /** The card is parked in the slot and still (last told). */
  private settled = false;

  get flying() {
    return this.t > 0 && this.t < 1;
  }

  /** Advance the flight and return where the card is (`at`, its placement
   *  off the frame) and the path its turn takes, for `CardMotion.step`. */
  step(
    dt: number,
    o: {
      wanted: boolean;
      reduceMotion: boolean;
      motion: CardMotion;
      doc: Document;
      r: DOMRect;
      foot: Size;
      at: Placement;
      onSettled?: (settled: boolean) => void;
    },
  ): { at: Placement; path?: { from: { rotX: number; rotY: number }; u: number } } {
    const was = this.t;
    this.t = Math.max(0, Math.min(1, this.t + ((o.wanted ? 1 : -1) * dt) / (o.reduceMotion ? 0.001 : SHARE_FLIGHT_S)));
    const st = easeInOutCubic(this.t);
    const landed = this.t === 0 || this.t === 1;
    if (!landed && was !== this.t && this.from === null) this.from = o.motion.pose;
    if (landed) this.from = null;
    const path = this.from ? { from: this.from, u: o.wanted ? st : 1 - st } : undefined;
    let { x, y, s } = o.at;
    let inPlace = false;
    const slot = st > 0 ? o.doc.querySelector<HTMLElement>('[data-share-card-slot]') : null;
    if (slot) {
      const b = slot.getBoundingClientRect();
      const want = {
        x: b.left + b.width / 2 - o.r.left,
        y: b.top + b.height / 2 - o.r.top,
        s: Math.min(b.width / o.foot.w, b.height / o.foot.h),
      };
      // As the flight begins the slot is where it is; landed, the card
      // glides after a slot that moves (the same approach as toward rest).
      const g = this.slot;
      const sk = g && was > 0 && !o.reduceMotion ? 1 - Math.exp(-dt / GLIDE_TAU) : 1;
      const tgt = g ?? { ...want };
      tgt.x += (want.x - tgt.x) * sk;
      tgt.y += (want.y - tgt.y) * sk;
      tgt.s += (want.s - tgt.s) * sk;
      this.slot = tgt;
      x += (tgt.x - x) * st;
      y += (tgt.y - y) * st;
      s += (tgt.s - s) * st;
      // Nearly in place: landed, the glide within a tenth of the card's
      // width of the slot, the turn within twenty degrees. The glide and
      // the spring take about half a second from here, and what waits on
      // the card (the hand) arrives over that.
      const near = want.s * o.foot.w * 0.1;
      inPlace =
        this.t === 1 &&
        Math.abs(want.x - tgt.x) < near &&
        Math.abs(want.y - tgt.y) < near &&
        Math.abs(want.s - tgt.s) < want.s * 0.1 &&
        o.motion.nearRest(20);
    } else if (st === 0) {
      this.slot = null;
    }
    if (inPlace !== this.settled) {
      this.settled = inPlace;
      o.onSettled?.(inPlace);
    }
    return { at: { x, y, s }, path };
  }
}

/** The parked card's mask under the scroll edge: from `top` (stage px) it
 *  fades in over `run` px, the alpha easing on a smoothstep so neither end of
 *  the ramp shows as a line, and reaching only as deep as `strength` (0..1). */
function edgeMask(top: number, run: number, strength: number): string {
  const stops: string[] = [];
  for (let i = 0; i <= EDGE_FADE_STOPS; i++) {
    const t = i / EDGE_FADE_STOPS;
    const ease = t * t * (3 - 2 * t);
    const alpha = 1 - strength * (1 - ease);
    stops.push(`rgba(0,0,0,${alpha.toFixed(3)}) ${(top + run * t).toFixed(1)}px`);
  }
  return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

/**
 * Parked, the card is screen content: the phone's content layer paints over
 * it (AppShell), and the card is clipped to the screen, so a push that slides
 * its slot past the bezel can't show it over the shell. The screen's scroll
 * edge ([data-card-fade], the strip under the status bar and header) blurs
 * and tints the content scrolling under it; the card is in this layer, out of
 * the blur's reach, so it fades out over the strip instead as the page scroll
 * carries it up there. Applied to the stage's root; cleared when not parked.
 */
export function clipToScreen(root: HTMLElement, r: DOMRect, parked: boolean) {
  let clip = '';
  let mask = '';
  if (parked) {
    const doc = root.ownerDocument;
    const screen = doc.querySelector<HTMLElement>('[data-screen-body]');
    if (screen) {
      const b = screen.getBoundingClientRect();
      const ins = (v: number) => Math.max(0, v).toFixed(1);
      clip = `inset(${ins(b.top - r.top)}px ${ins(r.right - b.right)}px ${ins(r.bottom - b.bottom)}px ${ins(b.left - r.left)}px)`;
    }
    const fade = doc.querySelector<HTMLElement>('[data-card-fade]');
    if (fade) {
      // The strip's own strength (it comes in with the scroll) scales the
      // card's fade; the stops ease like the strip's tint.
      const strength = Number(fade.style.getPropertyValue('--edge-fade')) || 0;
      if (strength > 0.005) {
        const f = fade.getBoundingClientRect();
        mask = edgeMask(f.top - r.top, f.height * EDGE_FADE_RAMP_END, strength);
      }
    }
  }
  if (root.style.clipPath !== clip) root.style.clipPath = clip;
  if (root.style.maskImage !== mask) root.style.maskImage = mask;
}
