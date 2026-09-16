'use client';

/* The share page's stage: the whole viewport on the still's surface, two
   rules running its full height, the template's type in the corners, and
   the card, big, in the middle, live. The same mesh and studio as the
   playground; it tilts under the pointer and turns by hand. The still's
   card paints first (the page's surface is the still's, so only its card
   shows), and the live card comes into focus over it. Nothing here can edit
   the design. */

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
import { CardMotion, ORIENT_ROLL } from '@/components/CardStage/cardMotion';
import { exposureFor, paletteOn, TEMPLATE_TUPLE, type Palette } from '@/components/CardStage/export/compose';
import type { ExportPose } from '@/components/CardStage/export/exportRenderer';
import { CARD_IN_LAYOUT, FLAT_POSE } from '@/components/CardStage/export/stills';
import type { CardDesign } from '@/data/design';
import type { ShareLook } from '@/lib/share/types';

import styles from './ShareCard.module.scss';

/** The stage camera's distance; scene units are frame px at z = 0. */
const CAMERA_Z = 2000;
// Khronos PBR-neutral tone map keeps silver true (ACES warms highlights).
const NEUTRAL_TONE_MAPPING = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
/** A press that travels less than this (screen px) is a click, not a turn. */
const DRAG_SLOP = 3;
/** The card's long edge, as a share of the stage's width and of its height
 *  (whichever binds). Mirrored in the stylesheet for the still. */
const CARD_OF_WIDTH = 0.64;
const CARD_OF_HEIGHT = 0.78;
/** The buttons hang this far under the card (px), and are this tall; the
 *  card sits half their run above the stage's middle so the two center as
 *  one. Mirrored into the stylesheet as `--under-gap` and `--lift`. */
const UNDER_GAP = 40;
const BUTTON_H = 44;
const CARD_LIFT = (UNDER_GAP + BUTTON_H) / 2;
/** The template's own surfaces, when the share was made before the look was
 *  recorded: the page's theme picks one. */
const LIGHT_SURFACE = '#f8f8f7';
const DARK_SURFACE = '#1a1a1a';

interface ShareCardProps {
  design: CardDesign;
  look: ShareLook | null | undefined;
  /** The square still, whose card is shown until the live one is ready. */
  still: string | null;
  alt: string;
  /** What sits under the card (the buttons). */
  children?: ReactNode;
}

export function ShareCard({ design, look, still, alt, children }: ShareCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const motion = useMemo(() => new CardMotion(), []);
  const [live, setLive] = useState(false);
  const [dragging, setDragging] = useState(false);

  // The surface: the look's, or the theme's for an older share. The theme
  // is on <html> (the root layout's boot script), read once mounted.
  const [themeDark, setThemeDark] = useState(false);
  useEffect(() => {
    setThemeDark(document.documentElement.dataset.theme === 'dark');
  }, []);
  const palette = useMemo<Palette>(
    () => paletteOn(look?.surface ?? (themeDark ? DARK_SURFACE : LIGHT_SURFACE)),
    [look?.surface, themeDark],
  );
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
    if (drag.current || e.button !== 0) return;
    // The buttons under the card are theirs to handle.
    if ((e.target as HTMLElement).closest('a, button')) return;
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

  const onReady = useCallback(() => setLive(true), []);

  const foot = footprint(design.orientation);
  const vars = {
    '--surface': palette.bg,
    '--ink': palette.ink,
    '--card-of-width': CARD_OF_WIDTH,
    '--card-of-height': CARD_OF_HEIGHT,
    '--card-in-still': CARD_IN_LAYOUT,
    // The card's height as a share of its long edge (1 held upright).
    '--card-h-of-long': foot.h / Math.max(foot.w, foot.h),
    '--under-gap': `${UNDER_GAP}px`,
    '--lift': `${CARD_LIFT}px`,
  } as CSSProperties;

  return (
    <div className={clsx(styles.root, live && styles.live)} style={vars}>
      {/* The template's chrome: the rules and the type, the page's height. */}
      <span className={styles.ruleLeft} aria-hidden />
      <span className={styles.ruleRight} aria-hidden />
      <span className={styles.logo} role="img" aria-label="Lightspark" />
      <p className={clsx(styles.type, styles.typeTopRight)} aria-hidden>
        Lightspark
        <br />
        Cards Playground
      </p>
      <p className={clsx(styles.type, styles.typeBottomLeft)} aria-hidden>
        {TEMPLATE_TUPLE}
      </p>
      <p className={clsx(styles.type, styles.typeBottomRight)} aria-hidden>
        docs.lightspark.com
      </p>

      <div
        ref={stageRef}
        className={clsx(styles.stage, dragging && styles.dragging)}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        role="img"
        aria-label={alt}
      >
        {still && (
          // The still's card, at the live card's size and place; its rules
          // and type are clipped away, and its surface is the page's.
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.still} src={still} alt="" draggable={false} />
        )}
        <Canvas
          className={styles.canvas}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, CAMERA_Z], near: 200, far: 6000 }}
          onCreated={({ gl }) => {
            gl.toneMapping = NEUTRAL_TONE_MAPPING;
          }}
        >
          <StageCamera exposure={exposureFor(palette)} />
          <CardEnv />
          <directionalLight position={[2, 5, 6]} intensity={0.3} color="#eef2f8" />
          <Rig motion={motion} state={meshState} pose={pose} reduceMotion={reduceMotion} onReady={onReady} />
        </Canvas>
        {children && <div className={styles.under}>{children}</div>}
      </div>
    </div>
  );
}

/** The card's scale for a stage of `w` × `h`: its long edge at
 *  `CARD_OF_WIDTH` of the width or `CARD_OF_HEIGHT` of the height. */
function cardScale(w: number, h: number, foot: { w: number; h: number }): number {
  const long = Math.min(CARD_OF_WIDTH * w, CARD_OF_HEIGHT * h);
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
  onReady: () => void;
}

/** Drives the mesh every frame: the still's pose to begin with, then the
 *  motion's (tilt, drag, bob). The card sits at the stage's center, lifted
 *  by the stylesheet's `--lift` so it and the buttons center as one. */
function Rig({ motion, state, pose, reduceMotion, onReady }: RigProps) {
  const carrier = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const posed = useRef(false);

  // Start at the still's angles, not spring to them from flat. Set on the
  // frame itself: R3F's first frame can run before an effect would.
  useEffect(() => {
    posed.current = false;
  }, [pose]);

  useFrame((_, delta) => {
    const g = group.current;
    const c = carrier.current;
    if (!g || !c) return;
    const dt = Math.min(0.05, delta);
    const { orientation } = state.design;
    const s = cardScale(size.width, size.height, footprint(orientation));
    if (!posed.current) motion.setPose(pose);
    const p = motion.step(dt, {
      wantBack: false,
      hold: false,
      reduceMotion,
      bob: true,
      path: posed.current ? undefined : { from: pose, u: 1 },
    });
    posed.current = true;
    c.position.set(p.dx * s, CARD_LIFT - p.dy, 0);
    c.scale.setScalar(s);
    g.rotation.set(
      THREE.MathUtils.degToRad(p.rotX),
      THREE.MathUtils.degToRad(p.rotY),
      THREE.MathUtils.degToRad(p.rotZ + ORIENT_ROLL[orientation]),
    );
  });

  return (
    <group ref={carrier}>
      <CardMesh ref={group} state={state} onReady={onReady} />
    </group>
  );
}
