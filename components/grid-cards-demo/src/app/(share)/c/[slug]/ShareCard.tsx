'use client';

/* The share page's stage: the viewport in three columns between hairline
   rules, the card live in the middle one, the brand's name in the left, the
   pitch and the buttons in the right. The same mesh and studio as the
   playground, and the same intro: the blueprint draws, then dissolves as the
   card comes into focus beneath it, and the card turns to the still's angles
   as the pitch comes in. From then on the card tilts under the pointer and
   turns by hand. Nothing here can edit the design. */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import clsx from 'clsx';
import { useReducedMotion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import * as THREE from 'three';

import { footprint } from '@/apps/card/cardMetrics';
import { CardEnv } from '@/components/CardStage/card3d/CardEnv';
import { CardMesh, type CardMeshState } from '@/components/CardStage/card3d/CardMesh';
import { CardIntro } from '@/components/CardStage/CardIntro';
import { CardMotion, ORIENT_ROLL } from '@/components/CardStage/cardMotion';
import { exposureFor, paletteOn, TEMPLATE_TUPLE, type Palette } from '@/components/CardStage/export/compose';
import type { ExportPose } from '@/components/CardStage/export/exportRenderer';
import { FLAT_POSE } from '@/components/CardStage/export/stills';
import { INTRO_END, INTRO_SOUNDS, introCard, stepIntro } from '@/components/CardStage/introTimeline';
import { LightsparkWordmark } from '@/components/LightsparkWordmark';
import type { CardDesign } from '@/data/design';
import { play } from '@/lib/sounds';
import type { ShareLook } from '@/lib/share/types';

import styles from './ShareCard.module.scss';

/** The stage camera's distance; scene units are frame px at z = 0. */
const CAMERA_Z = 2000;
// Khronos PBR-neutral tone map keeps silver true (ACES warms highlights).
const NEUTRAL_TONE_MAPPING = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
/** A press that travels less than this (screen px) is a click, not a turn. */
const DRAG_SLOP = 3;
/** The card's long edge: a share of the stage's width or of its height
 *  (whichever binds), and never more than this many px. */
const CARD_OF_WIDTH = 0.382;
const CARD_OF_HEIGHT = 0.5;
const CARD_MAX_LONG = 560;
/** The page's surfaces by theme (the docs'), and the ink on each. */
const LIGHT_SURFACE = '#f8f8f7';
const DARK_SURFACE = '#111111';

/** The intro's clock, stepped by the frame loop once the front has painted. */
interface Intro {
  /** Seconds since the blueprint started drawing; -1 until the card is ready. */
  t: number;
  done: boolean;
  /** How many of `INTRO_SOUNDS` have played. */
  cued: number;
}

interface ShareCardProps {
  design: CardDesign;
  look: ShareLook | null | undefined;
  /** The brand, for the title. */
  brand: string;
  /** The line over the buttons. */
  pitch: string;
  /** The buttons. Shown, with the pitch, once the intro is over. */
  actions: ReactNode;
  alt: string;
}

export function ShareCard({ design, look, brand, pitch, actions, alt }: ShareCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const motion = useMemo(() => new CardMotion(), []);
  const [introDone, setIntroDone] = useState(false);
  const [dragging, setDragging] = useState(false);

  // The theme is on <html> (the root layout's boot script), read once mounted.
  const [themeDark, setThemeDark] = useState(false);
  useEffect(() => {
    setThemeDark(document.documentElement.dataset.theme === 'dark');
  }, []);
  const palette = useMemo<Palette>(() => paletteOn(themeDark ? DARK_SURFACE : LIGHT_SURFACE), [themeDark]);
  const pose = useMemo<ExportPose>(() => look?.pose ?? FLAT_POSE, [look?.pose]);

  const meshState = useMemo<CardMeshState>(
    () => ({ design, issued: false, frozen: false, closed: false }),
    [design],
  );

  // ── Pointer: tilt under the pointer, drag to turn ─────────────────────
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  /** Pointer position relative to the card's footprint, -0.5..0.5 each way. */
  const overCard = useCallback(
    (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return null;
      const r = stage.getBoundingClientRect();
      const foot = footprint(design.orientation);
      const s = cardScale(r.width, r.height, foot);
      const px = (clientX - (r.left + r.width / 2)) / (foot.w * s);
      const py = (clientY - (r.top + r.height / 2)) / (foot.h * s);
      return { x: Math.max(-0.5, Math.min(0.5, px)), y: Math.max(-0.5, Math.min(0.5, py)) };
    },
    [design.orientation],
  );

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!introDone) return;
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < DRAG_SLOP) return;
      if (!d.moved) {
        d.moved = true;
        motion.beginDrag(e.timeStamp);
        setDragging(true);
      }
      motion.drag(dx, dy, e.timeStamp);
      d.x = e.clientX;
      d.y = e.clientY;
      return;
    }
    if (e.pointerType !== 'mouse' || reduceMotion) return;
    const p = overCard(e.clientX, e.clientY);
    if (p) motion.setTilt(p.x, p.y);
  };

  const onPointerLeave = () => {
    if (!drag.current) motion.clearTilt();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!introDone || drag.current || e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Not capturable; the window-level release below still ends it.
    }
  };

  const endDrag = useCallback(
    (now: number) => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      if (d.moved) {
        motion.endDrag(now);
        setDragging(false);
      }
    },
    [motion],
  );

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) endDrag(e.timeStamp);
  };

  useEffect(() => {
    const release = (e: PointerEvent) => endDrag(e.timeStamp);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [endDrag]);

  const onIntroDone = useCallback(() => setIntroDone(true), []);

  const foot = footprint(design.orientation);
  const vars = {
    '--surface': palette.bg,
    '--ink': palette.ink,
    '--text-primary': palette.ink,
  } as CSSProperties;

  return (
    <div className={clsx(styles.root, introDone && styles.introDone)} style={vars}>
      {/* The card's stage: the whole page; the card sits at its center. */}
      <div
        ref={stageRef}
        className={clsx(styles.stage, introDone && styles.stageLive, dragging && styles.dragging)}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="img"
        aria-label={alt}
      >
        <Canvas
          className={styles.canvas}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, CAMERA_Z], near: 200, far: 6000 }}
          onCreated={({ gl }) => {
            gl.toneMapping = NEUTRAL_TONE_MAPPING;
            // Hidden until the intro brings it into focus.
            gl.domElement.style.opacity = '0';
          }}
        >
          <StageCamera exposure={exposureFor(palette)} />
          <CardEnv />
          <directionalLight position={[2, 5, 6]} intensity={0.3} color="#eef2f8" />
          <Rig
            motion={motion}
            state={meshState}
            pose={pose}
            reduceMotion={reduceMotion}
            hitRef={hitRef}
            overlayRef={overlayRef}
            onIntroDone={onIntroDone}
          />
        </Canvas>
        {/* Rides with the card, its footprint in card px: the blueprint is
            laid out on it. */}
        <div ref={hitRef} className={styles.hit} style={{ width: foot.w, height: foot.h }} aria-hidden>
          {!introDone && <CardIntro ref={overlayRef} brand={brand} orientation={design.orientation} />}
        </div>
      </div>

      {/* The three columns over the stage: their type takes the pointer, the
          space between lets it through to the card. */}
      <div className={clsx(styles.col, styles.colLeft)}>
        <a className={styles.wordmark} href="https://www.lightspark.com" aria-label="Lightspark">
          <LightsparkWordmark />
        </a>
        <h1 className={styles.title}>
          {brand}
          <br />
          <span className={styles.titleMuted}>Card</span>
        </h1>
        <p className={styles.mouse}>{TEMPLATE_TUPLE}</p>
      </div>
      <div className={clsx(styles.col, styles.colMid)} aria-hidden />
      <div className={clsx(styles.col, styles.colRight)}>
        <p className={styles.mouse}>Cards playground</p>
        <div className={styles.pitch}>
          <p className={styles.pitchText}>{pitch}</p>
          <div className={styles.actions}>{actions}</div>
        </div>
        <p className={styles.mouse}>docs.lightspark.com</p>
      </div>
    </div>
  );
}

/** The card's scale for a stage of `w` × `h`: its long edge at
 *  `CARD_OF_WIDTH` of the width or `CARD_OF_HEIGHT` of the height, capped. */
function cardScale(w: number, h: number, foot: { w: number; h: number }): number {
  const long = Math.min(CARD_OF_WIDTH * w, CARD_OF_HEIGHT * h, CARD_MAX_LONG);
  return long / Math.max(foot.w, foot.h);
}

/** A perspective camera whose view at z = 0 is exactly the stage in px. */
function StageCamera({ exposure }: { exposure: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    camera.fov = (2 * Math.atan(size.height / 2 / CAMERA_Z) * 180) / Math.PI;
    camera.updateProjectionMatrix();
  }, [camera, size.height]);
  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);
  return null;
}

interface RigProps {
  motion: CardMotion;
  state: CardMeshState;
  pose: ExportPose;
  reduceMotion: boolean;
  hitRef: React.RefObject<HTMLDivElement>;
  overlayRef: React.RefObject<SVGSVGElement>;
  onIntroDone: () => void;
}

/** Drives the mesh every frame: the intro first (the blueprint draws, the
 *  card comes into focus under it, flat), then the turn to the still's pose,
 *  then the motion's (tilt, drag, bob). The card sits at the stage's center. */
function Rig({ motion, state, pose, reduceMotion, hitRef, overlayRef, onIntroDone }: RigProps) {
  const carrier = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const posed = useRef(false);
  const released = useRef(false);
  const intro = useRef<Intro>({ t: -1, done: false, cued: 0 });

  // Start flat, set on the frame itself: R3F's first frame can run before
  // an effect would.
  useEffect(() => {
    posed.current = false;
  }, [pose]);

  // The blueprint starts drawing once the front has painted.
  const onReady = useCallback(() => {
    if (intro.current.t < 0) intro.current.t = 0;
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    const c = carrier.current;
    if (!g || !c) return;
    const dt = Math.min(0.05, delta);
    const { orientation } = state.design;
    const foot = footprint(orientation);
    const s = cardScale(size.width, size.height, foot);
    const it = intro.current;
    // Flat under the blueprint (a flat drawing); once it has dissolved, the
    // card turns to the still's angles. Posed (`free`) through the intro and
    // the frame that ends it, since `hold` changing would otherwise re-pick a
    // face; not free from then on, so a turn by hand settles on a face.
    if (!posed.current) motion.setPose(FLAT_POSE);
    motion.free = !released.current;
    const p = motion.step(dt, {
      wantBack: false,
      hold: !it.done,
      reduceMotion,
      bob: it.done,
      path: posed.current ? undefined : { from: FLAT_POSE, u: 1 },
    });
    posed.current = true;
    if (it.done && !released.current) {
      released.current = true;
      motion.setPose(pose);
    }
    const bob = it.done ? p.dy : 0;
    c.position.set(p.dx * s, -bob, 0);
    c.scale.setScalar(s);

    // The intro: step the blueprint and bring the card's canvas into focus
    // off one clock. The canvas is hidden from the first frame (before the
    // card is ready, t is -1). Reduced motion ends it now.
    if (!it.done) {
      if (it.t >= 0) it.t += dt;
      if (reduceMotion && it.t >= 0) {
        it.t = INTRO_END;
        it.cued = INTRO_SOUNDS.length;
      }
      while (it.t >= 0 && it.cued < INTRO_SOUNDS.length && it.t >= INTRO_SOUNDS[it.cued].at) {
        const cue = INTRO_SOUNDS[it.cued];
        play(cue.name, { gain: cue.gain, gap: cue.gap });
        it.cued += 1;
      }
      if (overlayRef.current && it.t >= 0) stepIntro(overlayRef.current, it.t);
      const look = introCard(Math.max(0, it.t));
      const canvas = gl.domElement;
      // The mesh alone settles down to size; the blueprint stays put.
      c.scale.setScalar(s * look.scale);
      canvas.style.opacity = String(look.opacity);
      canvas.style.filter = look.blur > 0.05 ? `blur(${look.blur.toFixed(2)}px)` : '';
      if (it.t >= INTRO_END) {
        it.done = true;
        canvas.style.opacity = '';
        canvas.style.filter = '';
        onIntroDone();
      }
    }

    // Euler XYZ: Rx(pitch) · Ry(spin) · Rz(roll), the roll innermost so it
    // turns the faces about the card's own normal (see CardStage).
    g.rotation.set(
      THREE.MathUtils.degToRad(p.rotX),
      THREE.MathUtils.degToRad(p.rotY),
      THREE.MathUtils.degToRad(p.rotZ + ORIENT_ROLL[orientation]),
    );

    const hit = hitRef.current;
    if (hit) {
      const x = size.width / 2 + p.dx * s - foot.w / 2;
      const y = size.height / 2 + bob - foot.h / 2;
      hit.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    }
  });

  return (
    <group ref={carrier}>
      <CardMesh ref={group} state={state} onReady={onReady} />
    </group>
  );
}
