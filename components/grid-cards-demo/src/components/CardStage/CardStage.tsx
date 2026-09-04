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
import { BRAND_MAX_H, BRAND_MIN_H, type BrandLayout, type CardDesign } from '@/data/design';
import { CardEnv } from './card3d/CardEnv';
import { CardMesh, type BrandPlacement, type CardMeshState } from './card3d/CardMesh';
import { CardMotion } from './cardMotion';
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
/** Brand scale per wheel px (a 120 px notch is about +20%). */
const WHEEL_SCALE = 0.0015;
/** A wheel resize counts as a drag until this long after the last notch. */
const WHEEL_SETTLE_MS = 260;

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

/** A brand drag in flight: which pointer, where it last was on the face, the
 *  layout it is writing, and a second pointer if it has become a pinch. */
interface BrandDrag {
  id: number;
  last: { x: number; y: number };
  client: { x: number; y: number };
  layout: BrandLayout;
  pinch?: { id: number; x: number; y: number; d0: number; h0: number };
}

interface CardStageProps {
  design: CardDesign;
  home: CardHome;
  /** Lets the stage edit the design: the brand is dragged, resized, and
   *  reset on the card itself. */
  onDesignChange?: (patch: Partial<CardDesign>) => void;
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
 * pointer input, the state pill, and the accessible name.
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

  // ── The brand on the card: where it is, and picking the face ───────────────
  // The mesh reports the brand's box after each front paint; the rig provides
  // a picker from the pointer to the front face's plane.
  const placement = useRef<BrandPlacement | null>(null);
  const pick = useRef<Pick | null>(null);
  /** The face point under the pointer if it is on (or just outside) the brand. */
  const hitBrand = (clientX: number, clientY: number) => {
    const p = pick.current?.(clientX, clientY);
    const b = placement.current?.box;
    if (!p || !b) return null;
    const m = Math.max(BRAND_GRAB_MARGIN, b.h * 0.15);
    const inside = p.x >= b.x - m && p.x <= b.x + b.w + m && p.y >= b.y - m && p.y <= b.y + b.h + m;
    return inside ? p : null;
  };
  const brandEditable = !!onDesignChange;
  const setLayout = (layout: BrandLayout | null) => onDesignChange?.({ brandLayout: layout });
  /** The layout at height `h`, grown or shrunk about the box's center. */
  const resized = (layout: BrandLayout, h: number): BrandLayout => {
    h = Math.min(BRAND_MAX_H, Math.max(BRAND_MIN_H, h));
    const b = placement.current?.box;
    if (!b) return { ...layout, h };
    // The box scales with the layout's height (a wordmark's box is its caps,
    // shorter than h, so the ratio is taken against h itself).
    const w = (b.w * h) / layout.h;
    const cx = b.x + b.w / 2;
    const x = layout.anchor === 'left' ? cx - w / 2 : layout.anchor === 'center' ? cx : cx + w / 2;
    return { ...layout, x, h };
  };

  // Dragging (or wheeling) the brand repaints the print live; the surface
  // bake waits until it settles.
  const [brandDragging, setBrandDragging] = useState(false);
  const wheelSettle = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(wheelSettle.current), []);
  const [overBrand, setOverBrand] = useState(false);
  const overBrandRef = useRef(false);
  const hover = (over: boolean) => {
    if (over === overBrandRef.current) return;
    overBrandRef.current = over;
    setOverBrand(over);
  };

  // ── Pointer: tilt on hover, spin on drag; the brand moves and resizes ──────
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const brandDrag = useRef<BrandDrag | null>(null);
  const applyPinch = (bd: BrandDrag) => {
    if (!bd.pinch) return;
    const d = Math.hypot(bd.client.x - bd.pinch.x, bd.client.y - bd.pinch.y);
    bd.layout = resized(bd.layout, (bd.pinch.h0 * d) / Math.max(1, bd.pinch.d0));
    setLayout(bd.layout);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bd = brandDrag.current;
    if (bd) {
      if (e.pointerId === bd.id) {
        bd.client = { x: e.clientX, y: e.clientY };
        if (bd.pinch) {
          applyPinch(bd);
          return;
        }
        const p = pick.current?.(e.clientX, e.clientY);
        if (!p) return;
        bd.layout = { ...bd.layout, x: bd.layout.x + p.x - bd.last.x, y: bd.layout.y + p.y - bd.last.y };
        bd.last = p;
        setLayout(bd.layout);
      } else if (bd.pinch && e.pointerId === bd.pinch.id) {
        bd.pinch.x = e.clientX;
        bd.pinch.y = e.clientY;
        applyPinch(bd);
      }
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
    if (reduceMotion) return;
    const b = e.currentTarget.getBoundingClientRect();
    motion.setTilt((e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5);
  };
  // Nothing says the card can be turned; say it once, until the first drag.
  const [dragged, setDragged] = useState(false);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (live.current.t > 0 || e.button !== 0) return;
    const bd = brandDrag.current;
    if (bd) {
      // A second finger on a brand drag makes it a pinch.
      if (!bd.pinch && e.pointerId !== bd.id) {
        e.currentTarget.setPointerCapture(e.pointerId);
        const d0 = Math.hypot(e.clientX - bd.client.x, e.clientY - bd.client.y);
        bd.pinch = { id: e.pointerId, x: e.clientX, y: e.clientY, d0, h0: bd.layout.h };
      }
      return;
    }
    const hit = brandEditable ? hitBrand(e.clientX, e.clientY) : null;
    if (hit && placement.current) {
      e.currentTarget.setPointerCapture(e.pointerId);
      brandDrag.current = {
        id: e.pointerId,
        last: hit,
        client: { x: e.clientX, y: e.clientY },
        layout: placement.current.layout,
      };
      motion.clearTilt();
      setBrandDragging(true);
      e.currentTarget.classList.add(styles.hitMoving);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    setDragged(true);
    motion.beginDrag(e.timeStamp);
    e.currentTarget.classList.add(styles.hitDragging);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const bd = brandDrag.current;
    if (bd) {
      if (bd.pinch && e.pointerId === bd.pinch.id) {
        bd.pinch = undefined;
      } else if (e.pointerId === bd.id) {
        brandDrag.current = null;
        setBrandDragging(false);
        e.currentTarget.classList.remove(styles.hitMoving);
      }
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
  // Wheel over the brand resizes it. React's wheel listener is passive, so
  // this one is attached by hand to be able to keep the page still.
  useEffect(() => {
    const el = hitRef.current;
    if (!el || !onDesignChange) return;
    const onWheel = (e: WheelEvent) => {
      if (live.current.t > 0 || brandDrag.current) return;
      const l = placement.current?.layout;
      if (!l || !hitBrand(e.clientX, e.clientY)) return;
      e.preventDefault();
      onDesignChange({ brandLayout: resized(l, l.h * Math.exp(-e.deltaY * WHEEL_SCALE)) });
      setBrandDragging(true);
      clearTimeout(wheelSettle.current);
      wheelSettle.current = setTimeout(() => setBrandDragging(false), WHEEL_SETTLE_MS);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // hitBrand and resized close over refs and constants only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDesignChange]);

  const pill = card.closed
    ? 'Closed'
    : card.frozen
      ? 'Frozen'
      : issuing
        ? 'Processing'
        : card.inWallet
          ? 'In Apple Wallet'
          : null;

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
          state={{ design, issued, frozen: card.frozen, closed: card.closed, shown, brandDragging }}
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
        <span
          className={clsx(styles.hint, (dragged || overBrand || !introDone || phoneUp) && styles.hintGone)}
          aria-hidden
        >
          <IconRotate360Right size={14} />
          Drag to turn it over
        </span>
        {/* Over the brand: what the pointer can do to it. */}
        <span
          className={clsx(styles.hint, (!overBrand || brandDragging || !introDone || phoneUp) && styles.hintGone)}
          aria-hidden
        >
          Drag to move · Scroll to resize · Double-click to reset
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
  /** Kept current with where the brand last painted. */
  placement: React.MutableRefObject<BrandPlacement | null>;
  state: CardMeshState;
}

/** Drives the mesh and the DOM hit box every frame. */
function CardRig({ rootRef, hitRef, live, motion, pick, placement, state }: CardRigProps) {
  const onBrandPlacement = useCallback(
    (p: BrandPlacement) => {
      placement.current = p;
    },
    [placement],
  );
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
      hold: t > 0 || !intro.done,
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
