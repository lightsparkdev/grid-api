'use client';

import clsx from 'clsx';
import { IconRotate360Right } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconRotate360Right';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_H, CARD_W, FIGMA_CARD_W, FIGMA_FACE_H } from '@/apps/card/cardMetrics';
import { programNameOf } from '@/apps/shared/brand/BrandContext';
import { PAN_GROUPS, type CardHome } from '@/apps/shared/card';
import { usePhoneBoot } from '@/components/DotGridCanvas/PhoneBootContext';
import { useThemeMode } from '@/hooks/useThemeMode';
import {
  BRAND_DEFAULT_LAYOUT,
  BRAND_MARGIN,
  BRAND_MAX_H,
  BRAND_MIN_H,
  type BrandLayout,
  type CardDesign,
} from '@/data/design';
import { CardEnv } from './card3d/CardEnv';
import { CardMesh, type BrandPlacement, type CardMeshState } from './card3d/CardMesh';
import type { SpecRect } from './card3d/facePaint';
import { CardMotion } from './cardMotion';
import { resizeCursor, rotateCursor } from './cursors';
import { CardIntro } from './CardIntro';
import { INTRO_END, introCard, stepIntro } from './introTimeline';
import styles from './CardStage.module.scss';

/** Largest the card gets on stage, relative to its size in the phone. */
const MAX_SCALE = 1.4;
const MIN_SCALE = 0.55;
/** Stage margin around the card. */
const GUTTER_X = 28;
const GUTTER_Y = 120;
/** Glide time constant toward the rest position (seconds). */
const GLIDE_TAU = 0.14;
/** Camera distance, stage px. Scene units are stage px at z = 0. */
const CAMERA_Z = 2000;
/** PAN groups roll in at this pace on Reveal. */
const ROLL_STEP_MS = 140;
/** How far outside the brand's box (spec px) still grabs it. */
const BRAND_GRAB_MARGIN = 24;
/** A move snaps within this many screen px of a guide. */
const SNAP_PX = 6;
/** Rotation snaps to multiples of this, within SNAP_DEG. */
const ROTATE_STEP = 15;
const SNAP_DEG = 3;
/** Spec px → card px, the hit box's unit. */
const CARD_PER_SPEC = CARD_W / FIGMA_CARD_W;
/** The chip module's center x (spec px; see `CHIP` in facePaint). */
const CHIP_CENTER_X = 172 + 197 / 2;

// Khronos PBR-neutral tone map keeps silver true (ACES warms highlights).
const NEUTRAL_TONE_MAPPING = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
const EXPOSURE_LIGHT = 1.25;
const EXPOSURE_DARK = 1.0;

function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/** Inputs the frame loop reads without re-subscribing. */
interface Live {
  /** Phone boot curve, eased. */
  t: number;
  wantBack: boolean;
  reduceMotion: boolean;
  /** The brand is selected: the card holds flat under the selection box. */
  editing: boolean;
  intro: Intro;
}

/** The intro's clock, stepped by the frame loop once the front has painted. */
interface Intro {
  /** Seconds since the blueprint started drawing; -1 until the card is ready. */
  t: number;
  done: boolean;
  overlay: React.RefObject<SVGSVGElement>;
  /** The stage canvas, blurred and faded in behind the dissolving blueprint. */
  canvas: React.RefObject<HTMLCanvasElement>;
  onDone: () => void;
  /** Run it again from the top (dev: `__cardStage.intro.replay()`). */
  replay: () => void;
  /** Dev: freeze the clock (set `t`, then `paused = true`) to pose a frame. */
  paused: boolean;
}

/** A point on the front face, in spec px; null when the pointer misses the
 *  card's plane or the back is showing. */
type Pick = (clientX: number, clientY: number) => { x: number; y: number } | null;
type Pt = { x: number; y: number };

/** The selection box's handles: edges and corners scale, the zones just
 *  outside the corners rotate. */
type Handle = 'n' | 'e' | 's' | 'w' | 'nw' | 'ne' | 'se' | 'sw';
const CORNERS: Handle[] = ['nw', 'ne', 'se', 'sw'];
const EDGES: Handle[] = ['n', 'e', 's', 'w'];
/** A handle's direction from the box's center, in its own frame. */
const HANDLE_DIR: Record<Handle, Pt> = {
  n: { x: 0, y: -1 },
  e: { x: 1, y: 0 },
  s: { x: 0, y: 1 },
  w: { x: -1, y: 0 },
  nw: { x: -1, y: -1 },
  ne: { x: 1, y: -1 },
  se: { x: 1, y: 1 },
  sw: { x: -1, y: 1 },
};
/** The angle a handle's resize arrow lies along, in the box's frame. */
const handleAngle = (h: Handle) => (Math.atan2(HANDLE_DIR[h].y, HANDLE_DIR[h].x) * 180) / Math.PI;
/** The rotate cursor's arch turns to bulge toward its corner. */
const CORNER_ANGLE: Record<Handle, number> = { nw: -45, ne: 45, se: 135, sw: -135, n: 0, e: 90, s: 180, w: -90 };

/** A brand edit in flight, from the pointer that started it. */
interface BrandDrag {
  id: number;
  mode: 'move' | 'scale' | 'rotate';
  handle?: Handle;
  /** Where the pointer started on the face, and what the brand was. */
  start: Pt;
  layout0: BrandLayout;
  box0: SpecRect;
}

/** Snap guides shown during a move, in spec px: the lines, and an × at each
 *  point being aligned (on the brand, and on what it snapped to). */
interface Guides {
  x?: number;
  y?: number;
  marks?: Pt[];
}

interface CardStageProps {
  design: CardDesign;
  home: CardHome;
  /** Lets the stage edit the design: the brand is placed on the card itself. */
  onDesignChange?: (patch: Partial<CardDesign>) => void;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
function rotate(p: Pt, deg: number): Pt {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}
const center = (b: SpecRect): Pt => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const clampH = (h: number) => Math.min(BRAND_MAX_H, Math.max(BRAND_MIN_H, h));
/** The layout that puts a box of width `w` and height `h` (spec px) at center `c`. */
function layoutAt(layout: BrandLayout, c: Pt, w: number, h: number): BrandLayout {
  const x = layout.anchor === 'left' ? c.x - w / 2 : layout.anchor === 'center' ? c.x : c.x + w / 2;
  return { ...layout, x, y: c.y, h };
}

/**
 * The card, always. One mesh in one transparent canvas over the stage. Two
 * states: floating alone (cursor tilt, drag to spin, idle bob), or parked in
 * the phone. Every flow brings the phone in and the card flies into its slot;
 * flows act on it there (frost, flip, shake) while the phone shows the
 * cardholder's side; the phone leaves and the card floats back out.
 *
 * Position is imperative, per frame: the rest point is the stage center; while
 * the phone is up the card interpolates toward the live rect of the phone's
 * `[data-card-slot]` on the phone's boot curve. The slot is an empty box, so
 * nothing ever swaps or unmounts. A DOM hit box rides along with the card for
 * pointer input, the state pill, the accessible name, and the brand's
 * selection box.
 */
export function CardStage({ design, home, onDesignChange }: CardStageProps) {
  const { bootProgress } = usePhoneBoot();
  const reduceMotion = useReducedMotion() ?? false;
  const dark = useThemeMode() === 'dark';
  const rootRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const motion = useMemo(() => new CardMotion(), []);

  const { issued, issuing, card, isDeclined } = home;
  const revealed = card.sheet === 'details';
  const phoneUp = bootProgress > 0;

  // The intro plays once, when the card first appears: the blueprint draws,
  // then dissolves as the card comes into focus. Until it's done the card is
  // held flat and the pointer is off.
  const [introDone, setIntroDone] = useState(false);
  const overlayRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const live = useRef<Live>({
    t: 0,
    wantBack: false,
    reduceMotion,
    editing: false,
    intro: {
      t: -1,
      done: false,
      overlay: overlayRef,
      canvas: canvasRef,
      onDone: () => setIntroDone(true),
      paused: false,
      replay: () => {
        const { intro } = live.current;
        intro.t = 0;
        intro.done = false;
        setIntroDone(false);
      },
    },
  });
  live.current.t = easeInOutCubic(bootProgress);
  live.current.wantBack = revealed;
  live.current.reduceMotion = reduceMotion;

  // Decline: shake once per bounce.
  useEffect(() => {
    if (isDeclined) motion.shake();
  }, [isDeclined, motion]);

  // Reveal: the PAN rolls in group by group on the back, then expiry and CVV.
  const rolling = revealed && card.revealed;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!rolling) {
      setShown(0);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i > PAN_GROUPS.length) window.clearInterval(id);
    }, ROLL_STEP_MS);
    return () => window.clearInterval(id);
  }, [rolling]);

  // ── The brand on the card ──────────────────────────────────────────────────
  // The mesh reports the brand's box after each front paint (a ref for the
  // handlers, state for the selection box); the rig provides a picker from
  // the pointer to the front face's plane.
  const placement = useRef<BrandPlacement | null>(null);
  const [placed, setPlaced] = useState<BrandPlacement | null>(null);
  const onBrandPlacement = useCallback((p: BrandPlacement) => {
    placement.current = p;
    setPlaced(p);
  }, []);
  const pick = useRef<Pick | null>(null);
  const brandEditable = !!onDesignChange;
  const setLayout = (layout: BrandLayout | null) => onDesignChange?.({ brandLayout: layout });

  /** The face point under the pointer if it is on (or just outside) the brand,
   *  allowing for the brand's rotation. */
  const hitBrand = (clientX: number, clientY: number) => {
    const p = pick.current?.(clientX, clientY);
    const pl = placement.current;
    if (!p || !pl) return null;
    const b = pl.box;
    const c = center(b);
    const q = rotate({ x: p.x - c.x, y: p.y - c.y }, -pl.layout.rotation);
    const m = Math.max(BRAND_GRAB_MARGIN, b.h * 0.15);
    const inside = Math.abs(q.x) <= b.w / 2 + m && Math.abs(q.y) <= b.h / 2 + m;
    return inside ? p : null;
  };

  // Selected: the selection box shows and the card holds flat under it. A
  // flow, the intro, Escape, or any change to the design other than the
  // brand's placement (a color, a finish, a preset, Reset) deselects: the
  // box is for placing, and those edits are something else.
  const [selected, setSelected] = useState(false);
  live.current.editing = selected;
  useEffect(() => {
    if (phoneUp || !introDone) setSelected(false);
  }, [phoneUp, introDone]);
  const lastDesign = useRef(design);
  useEffect(() => {
    const prev = lastDesign.current;
    lastDesign.current = design;
    if (prev === design) return;
    const { brandLayout: _a, ...restPrev } = prev;
    const { brandLayout: _b, ...restNext } = design;
    const changed = (Object.keys(restNext) as Array<keyof typeof restNext>).some((k) => restNext[k] !== restPrev[k]);
    if (changed) setSelected(false);
  }, [design]);
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(false);
    };
    // A click on the stage off the card deselects; the panels beside it
    // don't, so a control can be used on the selection.
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      const stage = rootRef.current?.closest('section');
      if (!t || !stage?.contains(t) || hitRef.current?.contains(t)) return;
      setSelected(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [selected]);

  const [guides, setGuides] = useState<Guides>({});
  const [overBrand, setOverBrand] = useState(false);
  const overBrandRef = useRef(false);
  const hover = (over: boolean) => {
    if (over === overBrandRef.current) return;
    overBrandRef.current = over;
    setOverBrand(over);
  };

  /** Snap a moved box to the card's center, the chip's row, and the print
   *  margins; a turned box snaps by its center only. Each snap comes with
   *  its guide and the points it aligned: on the brand, and on the card
   *  feature (its center, the chip) when there is one to mark. */
  const snapMove = (box: SpecRect, rotation: number): { dx: number; dy: number; guides: Guides } => {
    const hit = hitRef.current;
    const tol = hit ? (SNAP_PX * FIGMA_CARD_W) / hit.getBoundingClientRect().width : 0;
    const turned = Math.abs(rotation) > 0.5;
    const c = center(box);
    const cardCenter: Pt = { x: FIGMA_CARD_W / 2, y: FIGMA_FACE_H / 2 };
    const chipCenter: Pt = { x: CHIP_CENTER_X, y: BRAND_DEFAULT_LAYOUT.y };
    // [from, to, the feature's point to mark, if any]
    type Pair = [number, number, Pt | null];
    const xs: Pair[] = [[c.x, cardCenter.x, cardCenter]];
    const ys: Pair[] = [
      [c.y, cardCenter.y, cardCenter],
      [c.y, chipCenter.y, chipCenter],
    ];
    if (!turned) {
      xs.push([box.x, BRAND_MARGIN, null], [box.x + box.w, FIGMA_CARD_W - BRAND_MARGIN, null]);
      ys.push([box.y, BRAND_MARGIN, null], [box.y + box.h, FIGMA_FACE_H - BRAND_MARGIN, null]);
    }
    const best = (pairs: Pair[]) => {
      let d = 0;
      let at: number | undefined;
      let feature: Pt | null = null;
      let min = tol;
      for (const [from, to, pt] of pairs) {
        const dist = Math.abs(to - from);
        if (dist <= min) {
          min = dist;
          d = to - from;
          at = to;
          feature = pt;
        }
      }
      return { d, at, feature };
    };
    const sx = best(xs);
    const sy = best(ys);
    // Where the brand's snapped edge or center sits once moved.
    const snapped: Pt = { x: c.x + sx.d, y: c.y + sy.d };
    const marks: Pt[] = [];
    const mark = (p: Pt) => {
      if (!marks.some((m) => Math.hypot(m.x - p.x, m.y - p.y) < 3)) marks.push(p);
    };
    if (sx.at !== undefined) {
      mark({ x: sx.at, y: snapped.y });
      if (sx.feature) mark(sx.feature);
    }
    if (sy.at !== undefined) {
      mark({ x: snapped.x, y: sy.at });
      if (sy.feature) mark(sy.feature);
    }
    return { dx: sx.d, dy: sy.d, guides: { x: sx.at, y: sy.at, marks } };
  };

  // ── Pointer: tilt on hover, spin on drag; the brand is placed on the card ──
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const brandDrag = useRef<BrandDrag | null>(null);
  /** The cursor a brand edit shows while the pointer is captured: the
   *  handle's own, turning with the box as it rotates. */
  const dragCursor = (bd: BrandDrag, rotation: number) =>
    bd.mode === 'rotate'
      ? rotateCursor(CORNER_ANGLE[bd.handle!] + rotation)
      : bd.mode === 'scale'
        ? resizeCursor(handleAngle(bd.handle!) + rotation)
        : 'default';
  const beginBrandDrag = (e: ReactPointerEvent<HTMLDivElement>, start: Pt, mode: BrandDrag['mode'], handle?: Handle) => {
    const pl = placement.current;
    if (!pl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const bd: BrandDrag = { id: e.pointerId, mode, handle, start, layout0: pl.layout, box0: pl.box };
    brandDrag.current = bd;
    motion.clearTilt();
    setSelected(true);
    e.currentTarget.classList.add(styles.hitMoving);
    // With the pointer captured, the hit box's cursor is the one shown.
    e.currentTarget.style.cursor = dragCursor(bd, pl.layout.rotation);
  };
  const moveBrand = (bd: BrandDrag, p: Pt) => {
    const { layout0: l0, box0: b0 } = bd;
    if (bd.mode === 'move') {
      let dx = p.x - bd.start.x;
      let dy = p.y - bd.start.y;
      const moved = { ...b0, x: b0.x + dx, y: b0.y + dy };
      const snap = snapMove(moved, l0.rotation);
      dx += snap.dx;
      dy += snap.dy;
      setGuides(snap.guides);
      setLayout({ ...l0, x: l0.x + dx, y: l0.y + dy });
      return;
    }
    const c0 = center(b0);
    if (bd.mode === 'rotate') {
      const a0 = Math.atan2(bd.start.y - c0.y, bd.start.x - c0.x);
      const a = Math.atan2(p.y - c0.y, p.x - c0.x);
      let rotation = l0.rotation + ((a - a0) * 180) / Math.PI;
      rotation = ((((rotation + 180) % 360) + 360) % 360) - 180;
      const step = Math.round(rotation / ROTATE_STEP) * ROTATE_STEP;
      if (Math.abs(step - rotation) <= SNAP_DEG) rotation = ((((step + 180) % 360) + 360) % 360) - 180;
      setLayout({ ...l0, rotation });
      if (hitRef.current) hitRef.current.style.cursor = dragCursor(bd, rotation);
      return;
    }
    // Scale: the aspect is the artwork's, so every handle scales uniformly,
    // about the side or corner opposite the one being dragged.
    const dir = HANDLE_DIR[bd.handle!];
    const q = rotate({ x: p.x - c0.x, y: p.y - c0.y }, -l0.rotation);
    const anchor = { x: (-dir.x * b0.w) / 2, y: (-dir.y * b0.h) / 2 };
    const reach = { x: dir.x * b0.w, y: dir.y * b0.h };
    const len = Math.hypot(reach.x, reach.y);
    const along = ((q.x - anchor.x) * reach.x + (q.y - anchor.y) * reach.y) / len;
    const s = Math.max(BRAND_MIN_H / l0.h, Math.min(BRAND_MAX_H / l0.h, along / len));
    const h = clampH(l0.h * s);
    const scale = h / l0.h;
    const w = b0.w * scale;
    const bh = b0.h * scale;
    const local = { x: anchor.x + (dir.x * w) / 2, y: anchor.y + (dir.y * bh) / 2 };
    const world = rotate(local, l0.rotation);
    setLayout(layoutAt(l0, { x: c0.x + world.x, y: c0.y + world.y }, w, h));
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bd = brandDrag.current;
    if (bd) {
      if (e.pointerId !== bd.id) return;
      const p = pick.current?.(e.clientX, e.clientY);
      if (p) moveBrand(bd, p);
      return;
    }
    if (drag.current && e.pointerId === drag.current.id) {
      motion.drag(e.clientX - drag.current.x, e.clientY - drag.current.y, e.timeStamp);
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      return;
    }
    if (live.current.t > 0) return;
    hover(brandEditable && e.pointerType === 'mouse' && hitBrand(e.clientX, e.clientY) !== null);
    if (reduceMotion || selected) return;
    const b = e.currentTarget.getBoundingClientRect();
    motion.setTilt((e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5);
  };
  // Nothing says the card can be turned; say it once, until the first drag.
  const [dragged, setDragged] = useState(false);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (live.current.t > 0 || e.button !== 0 || brandDrag.current) return;
    if (brandEditable) {
      // A handle of the selection box: scale, or rotate from just outside a corner.
      const handleEl = (e.target as HTMLElement).closest<HTMLElement>('[data-handle]');
      const p = pick.current?.(e.clientX, e.clientY);
      if (handleEl && p) {
        const handle = handleEl.dataset.handle as Handle;
        beginBrandDrag(e, p, handleEl.dataset.rotate ? 'rotate' : 'scale', handle);
        return;
      }
      // The brand itself: select it and move it.
      const hit = hitBrand(e.clientX, e.clientY);
      if (hit) {
        beginBrandDrag(e, hit, 'move');
        return;
      }
    }
    // The card: deselect, and spin.
    setSelected(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    setDragged(true);
    motion.beginDrag(e.timeStamp);
    e.currentTarget.classList.add(styles.hitDragging);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bd = brandDrag.current;
    if (bd) {
      if (e.pointerId !== bd.id) return;
      brandDrag.current = null;
      setGuides({});
      e.currentTarget.classList.remove(styles.hitMoving);
      e.currentTarget.style.cursor = '';
      return;
    }
    if (!drag.current || e.pointerId !== drag.current.id) return;
    drag.current = null;
    motion.endDrag();
    e.currentTarget.classList.remove(styles.hitDragging);
  };
  const onPointerLeave = () => {
    hover(false);
    if (!drag.current) motion.clearTilt();
  };
  // Double-click the brand to put it back where the print sample has it.
  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!brandEditable || live.current.t > 0) return;
    if (hitBrand(e.clientX, e.clientY)) setLayout(null);
  };

  const pill = card.closed
    ? 'Closed'
    : card.frozen
      ? 'Frozen'
      : issuing
        ? 'Processing'
        : card.inWallet
          ? 'In Apple Wallet'
          : null;

  // The selection box, in card px on the hit box.
  const box = placed && (selected || overBrand) ? placed.box : null;
  const boxStyle = box
    ? {
        left: box.x * CARD_PER_SPEC,
        top: box.y * CARD_PER_SPEC,
        width: box.w * CARD_PER_SPEC,
        height: box.h * CARD_PER_SPEC,
        transform: `rotate(${placed!.layout.rotation}deg)`,
      }
    : undefined;

  return (
    <div ref={rootRef} className={styles.root}>
      <Canvas
        ref={canvasRef}
        className={styles.canvas}
        dpr={[1, 2]}
        frameloop="always"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, CAMERA_Z], near: 200, far: 6000 }}
        onCreated={({ gl }) => {
          gl.toneMapping = NEUTRAL_TONE_MAPPING;
        }}
      >
        <StageCamera dark={dark} />
        <CardEnv />
        <directionalLight position={[2, 5, 6]} intensity={0.3} color="#eef2f8" />
        <CardRig
          rootRef={rootRef}
          hitRef={hitRef}
          live={live}
          motion={motion}
          pick={pick}
          placement={placement}
          onBrandPlacement={onBrandPlacement}
          state={{ design, issued, frozen: card.frozen, closed: card.closed, shown }}
        />
      </Canvas>

      {/* Rides with the card: pointer input, the state pill, the accessible name. */}
      <div
        ref={hitRef}
        className={clsx(styles.hit, overBrand && styles.hitOverBrand)}
        style={{ width: CARD_W, height: CARD_H, pointerEvents: phoneUp || !introDone ? 'none' : 'auto' }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onPointerLeave}
        onDoubleClick={onDoubleClick}
      >
        <span className={styles.srOnly} role="img" aria-label={`${programNameOf(design)} card`} />
        {!introDone && <CardIntro ref={overlayRef} brand={programNameOf(design)} />}
        {pill && (
          <span className={clsx(styles.pill, card.closed && styles.pillClosed, issuing && styles.pillProcessing)}>
            {pill}
          </span>
        )}

        {/* The brand's box: an outline on hover; selected, the handles too. */}
        {box && (
          <div className={styles.selection} style={boxStyle} aria-hidden>
            {selected &&
              CORNERS.map((h) => (
                <span
                  key={`r${h}`}
                  className={clsx(styles.rotateZone, styles[`zone_${h}`])}
                  style={{ cursor: rotateCursor(CORNER_ANGLE[h] + placed!.layout.rotation) }}
                  data-handle={h}
                  data-rotate="true"
                />
              ))}
            {/* The edges resize along their whole length; the corners carry the handles. */}
            {selected &&
              EDGES.map((h) => (
                <span
                  key={h}
                  className={clsx(styles.edge, styles[`edge_${h}`])}
                  style={{ cursor: resizeCursor(handleAngle(h) + placed!.layout.rotation) }}
                  data-handle={h}
                />
              ))}
            {selected &&
              CORNERS.map((h) => (
                <span
                  key={h}
                  className={clsx(styles.handle, styles[`handle_${h}`])}
                  style={{ cursor: resizeCursor(handleAngle(h) + placed!.layout.rotation) }}
                  data-handle={h}
                />
              ))}
          </div>
        )}
        {guides.x !== undefined && (
          <span className={styles.guideV} style={{ left: guides.x * CARD_PER_SPEC }} aria-hidden />
        )}
        {guides.y !== undefined && (
          <span className={styles.guideH} style={{ top: guides.y * CARD_PER_SPEC }} aria-hidden />
        )}
        {guides.marks?.map((m, i) => (
          <span
            key={i}
            className={styles.guideMark}
            style={{ left: m.x * CARD_PER_SPEC, top: m.y * CARD_PER_SPEC }}
            aria-hidden
          />
        ))}

        <span
          className={clsx(
            styles.hint,
            (dragged || overBrand || selected || !introDone || phoneUp) && styles.hintGone,
          )}
          aria-hidden
        >
          <IconRotate360Right size={14} />
          Drag to turn it over
        </span>
      </div>
    </div>
  );
}

/** Perspective camera whose view at z = 0 is exactly the stage in px. */
function StageCamera({ dark }: { dark: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    camera.fov = (2 * Math.atan(size.height / 2 / CAMERA_Z) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  }, [camera, size.height]);
  useEffect(() => {
    gl.toneMappingExposure = dark ? EXPOSURE_DARK : EXPOSURE_LIGHT;
  }, [gl, dark]);
  return null;
}

interface CardRigProps {
  rootRef: React.RefObject<HTMLDivElement>;
  hitRef: React.RefObject<HTMLDivElement>;
  live: React.MutableRefObject<Live>;
  motion: CardMotion;
  /** Filled with a picker from the pointer to the front face (spec px). */
  pick: React.MutableRefObject<Pick | null>;
  /** Where the brand last painted (for the dev hook). */
  placement: React.MutableRefObject<BrandPlacement | null>;
  onBrandPlacement: (p: BrandPlacement) => void;
  state: CardMeshState;
}

/** Drives the mesh and the DOM hit box every frame. */
function CardRig({ rootRef, hitRef, live, motion, pick, placement, onBrandPlacement, state }: CardRigProps) {
  // Carrier takes position and scale; the card inside it takes the spin.
  const carrier = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  const pos = useRef<{ x: number; y: number; s: number } | null>(null);

  // Pointer → the card's front plane → spec px. The plane, not the mesh, so a
  // drag can carry the brand past the card's edge; null when the back faces
  // the camera.
  useEffect(() => {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane();
    const origin = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const hit = new THREE.Vector3();
    pick.current = (clientX, clientY) => {
      const g = group.current;
      if (!g) return null;
      const { camera, gl } = get();
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      g.getWorldPosition(origin);
      normal.set(0, 0, 1).applyQuaternion(g.getWorldQuaternion(q));
      if (ray.ray.direction.dot(normal) >= 0) return null;
      plane.setFromNormalAndCoplanarPoint(normal, origin);
      if (!ray.ray.intersectPlane(plane, hit)) return null;
      g.worldToLocal(hit);
      return { x: (hit.x / CARD_W + 0.5) * FIGMA_CARD_W, y: (0.5 - hit.y / CARD_H) * FIGMA_FACE_H };
    };
    return () => {
      pick.current = null;
    };
  }, [get, pick]);

  // Dev: expose the scene state and the pose for tracing from the console.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    (window as unknown as Record<string, unknown>).__cardStage = {
      get,
      group,
      motion,
      intro: live.current.intro,
      brand: placement,
    };
  }, [get, motion, live, placement]);

  useFrame((_, delta) => {
    const g = group.current;
    const c = carrier.current;
    const root = rootRef.current;
    if (!g || !c || !root) return;
    const dt = Math.min(0.05, delta);
    const r = root.getBoundingClientRect();
    // Rest position: centered on the stage, scaled to fit it.
    const rest = {
      x: r.width / 2,
      y: r.height / 2,
      s: Math.max(MIN_SCALE, Math.min(MAX_SCALE, (r.width - GUTTER_X * 2) / CARD_W, (r.height - GUTTER_Y) / CARD_H)),
    };
    // Glide toward rest (exponential approach), snapping on the first frame.
    const k = pos.current ? 1 - Math.exp(-dt / GLIDE_TAU) : 1;
    const p = pos.current ?? { ...rest };
    p.x += (rest.x - p.x) * k;
    p.y += (rest.y - p.y) * k;
    p.s += (rest.s - p.s) * k;
    pos.current = p;
    // Phone up: interpolate toward the phone's live card slot and park there.
    let { x, y, s } = p;
    const { t } = live.current;
    if (t > 0) {
      const slot = root.ownerDocument.querySelector<HTMLElement>('[data-card-slot]');
      if (slot) {
        const b = slot.getBoundingClientRect();
        x += (b.left + b.width / 2 - r.left - x) * t;
        y += (b.top + b.height / 2 - r.top - y) * t;
        s += (b.width / CARD_W - s) * t;
      }
    }

    const { intro } = live.current;
    const pose = motion.step(dt, {
      wantBack: live.current.wantBack,
      // Held flat: parked in the phone, during the intro, or under the
      // brand's selection box (which is DOM, and must sit on the face).
      hold: t > 0 || !intro.done || live.current.editing,
      reduceMotion: live.current.reduceMotion,
    });
    const bob = pose.dy * (1 - t);
    // Stage px → scene: origin at the stage center, y up.
    c.position.set(x + pose.dx * s - size.width / 2, size.height / 2 - (y + bob), 0);
    c.scale.setScalar(s);

    // The intro: step the blueprint and bring the card's canvas into focus off
    // one clock. The canvas is hidden from the first frame (before the card is
    // ready, t is -1). A flow starting mid-intro (or reduced motion) ends it now.
    if (!intro.done) {
      if (intro.t >= 0 && !intro.paused) intro.t += dt;
      if (t > 0 || live.current.reduceMotion) intro.t = INTRO_END;
      if (intro.overlay.current) stepIntro(intro.overlay.current, intro.t);
      const canvas = intro.canvas.current;
      const look = introCard(intro.t);
      // The mesh alone settles down to size; the blueprint and hit box stay put.
      c.scale.setScalar(s * look.scale);
      if (canvas) {
        canvas.style.opacity = String(look.opacity);
        canvas.style.filter = look.blur > 0.05 ? `blur(${look.blur.toFixed(2)}px)` : '';
      }
      if (intro.t >= INTRO_END) {
        intro.done = true;
        if (canvas) {
          canvas.style.opacity = '';
          canvas.style.filter = '';
        }
        intro.onDone();
      }
    }
    // Euler XYZ: Rx(pitch) · Ry(spin) · Rz(roll), the roll innermost so it
    // turns the faces about the card's own normal.
    g.rotation.set(
      THREE.MathUtils.degToRad(pose.rotX),
      THREE.MathUtils.degToRad(pose.rotY),
      THREE.MathUtils.degToRad(pose.rotZ),
    );

    const hit = hitRef.current;
    if (hit) {
      hit.style.transform = `translate(${x + pose.dx * s - CARD_W / 2}px, ${y + bob - CARD_H / 2}px) scale(${s})`;
      // The pill belongs to the front; hide it while the back is showing.
      hit.style.setProperty('--pill-opacity', pose.facing > 0.3 ? '1' : '0');
      // The hit box scales with the card; text riding on it undoes that.
      hit.style.setProperty('--card-scale', s.toFixed(4));
    }
  });

  // The blueprint starts drawing once the front has painted.
  const onReady = useCallback(() => {
    const { intro } = live.current;
    if (intro.t < 0) intro.t = 0;
  }, [live]);

  return (
    <group ref={carrier}>
      <CardMesh ref={group} state={state} onReady={onReady} onBrandPlacement={onBrandPlacement} />
    </group>
  );
}
