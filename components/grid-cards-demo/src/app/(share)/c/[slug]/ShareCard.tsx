'use client';

/* The shared card, live: the same mesh and studio as the playground, in a
   square frame laid out like the still (the surface, the rules, the type),
   with the card at the still's size and angle. The still paints first, from
   the record; the card comes into focus over it once WebGL has the front
   painted, and from then on it tilts under the pointer and turns by hand.
   Nothing here can edit the design. */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import clsx from 'clsx';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import * as THREE from 'three';

import { footprint } from '@/apps/card/cardMetrics';
import { CardEnv } from '@/components/CardStage/card3d/CardEnv';
import { CardMesh, type CardMeshState } from '@/components/CardStage/card3d/CardMesh';
import { CardMotion, ORIENT_ROLL } from '@/components/CardStage/cardMotion';
import {
  exposureFor,
  paintTemplate,
  paletteOn,
  prepareTemplate,
  type Palette,
} from '@/components/CardStage/export/compose';
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
/** The template's own surfaces, when the share was made before the look was
 *  recorded: the page's theme picks one. */
const LIGHT_SURFACE = '#f8f8f7';
const DARK_SURFACE = '#1a1a1a';

interface ShareCardProps {
  design: CardDesign;
  look: ShareLook | null | undefined;
  /** The square still, shown until the live card is ready. */
  still: string | null;
  alt: string;
}

export function ShareCard({ design, look, still, alt }: ShareCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const frameRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLCanvasElement>(null);
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

  // The template behind the card: painted at device resolution whenever the
  // frame's size or the surface changes, once its font and logo are in.
  useEffect(() => {
    const frame = frameRef.current;
    const canvas = templateRef.current;
    if (!frame || !canvas) return;
    let cancelled = false;
    const paint = () => {
      const side = frame.clientWidth;
      if (!side) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const px = Math.round(side * dpr);
      if (canvas.width !== px || canvas.height !== px) {
        canvas.width = px;
        canvas.height = px;
      }
      const ctx = canvas.getContext('2d');
      if (ctx) paintTemplate(ctx, px, px, palette);
    };
    prepareTemplate().then(() => {
      if (!cancelled) paint();
    });
    const ro = new ResizeObserver(paint);
    ro.observe(frame);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [palette]);

  const meshState = useMemo<CardMeshState>(
    () => ({ design, issued: false, frozen: false, closed: false }),
    [design],
  );

  // ── Pointer: tilt under the pointer, drag to turn ─────────────────────
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  /** Pointer position relative to the card's footprint, -0.5..0.5 each way. */
  const overCard = useCallback(
    (clientX: number, clientY: number) => {
      const frame = frameRef.current;
      if (!frame) return null;
      const r = frame.getBoundingClientRect();
      const foot = footprint(design.orientation);
      const s = (CARD_IN_LAYOUT * r.width) / Math.max(foot.w, foot.h);
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

  return (
    <div
      ref={frameRef}
      className={clsx(styles.frame, live && styles.live, dragging && styles.dragging)}
      style={{ background: palette.bg }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      role="img"
      aria-label={alt}
    >
      <canvas ref={templateRef} className={styles.template} aria-hidden />
      {still && (
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
        <FrameCamera exposure={exposureFor(palette)} />
        <CardEnv />
        <directionalLight position={[2, 5, 6]} intensity={0.3} color="#eef2f8" />
        <Rig motion={motion} state={meshState} pose={pose} reduceMotion={reduceMotion} onReady={onReady} />
      </Canvas>
      {!reduceMotion && (
        <p className={clsx(styles.hint, live && styles.hintShown)} style={{ color: palette.ink }}>
          Drag to turn it over
        </p>
      )}
    </div>
  );
}

/** A perspective camera whose view at z = 0 is exactly the frame in px. */
function FrameCamera({ exposure }: { exposure: number }) {
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
 *  motion's (tilt, drag, bob). The card sits at the frame's center with its
 *  long edge at `CARD_IN_LAYOUT` of the side, as in the still. */
function Rig({ motion, state, pose, reduceMotion, onReady }: RigProps) {
  const carrier = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const posed = useRef(false);

  // Start at the still's angles, not spring to them from flat.
  useEffect(() => {
    motion.setPose(pose);
    posed.current = false;
  }, [motion, pose]);

  useFrame((_, delta) => {
    const g = group.current;
    const c = carrier.current;
    if (!g || !c) return;
    const dt = Math.min(0.05, delta);
    const { orientation } = state.design;
    const foot = footprint(orientation);
    const s = (CARD_IN_LAYOUT * Math.min(size.width, size.height)) / Math.max(foot.w, foot.h);
    const p = motion.step(dt, {
      wantBack: false,
      hold: false,
      reduceMotion,
      bob: true,
      path: posed.current ? undefined : { from: pose, u: 1 },
    });
    posed.current = true;
    c.position.set(p.dx * s, -p.dy, 0);
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
