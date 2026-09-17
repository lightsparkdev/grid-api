'use client';

/* The share page's stage: the viewport in three columns between hairline
   rules, the card live in the middle one, the brand's name in the left, the
   pitch and the buttons in the right. The same mesh and studio as the
   playground, and the same intro: the blueprint draws, then dissolves as the
   card comes into focus beneath it. From then on the card tilts under the
   pointer and turns by hand. Nothing here can edit the design. */

import { IconRotate360Right } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconRotate360Right';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import clsx from 'clsx';
import { useReducedMotion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import * as THREE from 'three';

import { footprint } from '@/apps/card/cardMetrics';
import { CardEnv } from '@/components/CardStage/card3d/CardEnv';
import { CardMesh, type CardMeshState } from '@/components/CardStage/card3d/CardMesh';
import { flushDeferredPaints, holdDeferredPaints } from '@/components/CardStage/card3d/deferredPaint';
import { preheatSoon } from '@/lib/sounds';
import { CardIntro } from '@/components/CardStage/CardIntro';
import { CardMotion, ORIENT_ROLL } from '@/components/CardStage/cardMotion';
import { exposureFor, paletteOn, TEMPLATE_TUPLE, type Palette } from '@/components/CardStage/export/compose';
import { INTRO_END, introCard, stepIntro } from '@/components/CardStage/introTimeline';
import { StageGL } from '@/components/glass-gl/StageGL';
import { LightsparkWordmark } from '@/components/LightsparkWordmark';
import type { CardDesign } from '@/data/design';

import styles from './ShareCard.module.scss';

/** The stage camera's distance; scene units are frame px at z = 0. */
const CAMERA_Z = 2000;
// Khronos PBR-neutral tone map keeps silver true (ACES warms highlights).
const NEUTRAL_TONE_MAPPING = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
/** A press that travels less than this (screen px) is a click, not a turn. */
const DRAG_SLOP = 3;
/** The card's long edge: a share of the stage's width (the Figma's 550 of
 *  1440) or of its height, whichever binds, and never under this many px. */
const CARD_OF_WIDTH = 550 / 1440;
const CARD_OF_HEIGHT = 0.5;
const CARD_MIN_LONG = 320;
/** The page's surfaces by theme (the docs'), and the ink on each. */
const LIGHT_SURFACE = '#f8f8f7';
const DARK_SURFACE = '#111111';

/** The website's blur-resolve entrance (lightspark.com's heroes) is a CSS
 *  animation (`.blurIn`), staggered by this delay. In CSS rather than a
 *  JavaScript tween: the page's first seconds are the card's (shaders
 *  compiling, its faces painting), and a tween driven from the main thread
 *  stalled with them; the compositor runs a CSS animation of opacity,
 *  transform, and filter on its own. */
const blurInDelay = (seconds: number) => ({ '--blur-in-delay': `${seconds}s` }) as CSSProperties;

/** The intro's clock, stepped by the frame loop once the front has painted. */
interface Intro {
  /** Seconds since the blueprint started drawing; -1 until the card is ready. */
  t: number;
  done: boolean;
}

interface ShareCardProps {
  design: CardDesign;
  /** The brand, for the title. */
  brand: string;
  /** The line over the buttons. */
  pitch: string;
  /** The buttons. Shown, with the pitch, once the intro is over. */
  actions: ReactNode;
  alt: string;
}

export function ShareCard({ design, brand, pitch, actions, alt }: ShareCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const motion = useMemo(() => new CardMotion(), []);
  const [introDone, setIntroDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** The pointer is over the card's footprint (the cursor, the tilt). */
  const [overCardNow, setOverCardNow] = useState(false);
  /** The card has been turned by hand once: the hint has done its job. */
  const [dragged, setDragged] = useState(false);

  // The theme is on <html>, set by the root layout's boot script before the
  // first paint. The page's colors come from the stylesheet off that
  // attribute, so the server's HTML paints right; this reading is for the
  // GL (the dot grid's surface, the card's exposure). The server's snapshot
  // is light; the client's is read during hydration, and React re-renders
  // before paint where they differ, so a dark system never sees a light
  // frame. Subscribed, so a theme switch follows too.
  const themeDark = useSyncExternalStore(subscribeTheme, readThemeDark, () => false);
  const palette = useMemo<Palette>(() => paletteOn(themeDark ? DARK_SURFACE : LIGHT_SURFACE), [themeDark]);

  const meshState = useMemo<CardMeshState>(
    () => ({ design, issued: false, frozen: false, closed: false }),
    [design],
  );

  // ── Pointer: tilt under the pointer, drag to turn ─────────────────────
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  /** Pointer position relative to the card's footprint (as held flat),
   *  -0.5..0.5 each way over the card; null off it. Read off the hit box,
   *  which rides with the card (its bob included), so this and the pointer
   *  target agree at the card's edges. */
  const overCard = useCallback((clientX: number, clientY: number) => {
    const hit = hitRef.current;
    if (!hit) return null;
    const r = hit.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    const px = (clientX - (r.left + r.width / 2)) / r.width;
    const py = (clientY - (r.top + r.height / 2)) / r.height;
    return Math.abs(px) <= 0.5 && Math.abs(py) <= 0.5 ? { x: px, y: py } : null;
  }, []);

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
        setDragged(true);
      }
      motion.drag(dx, dy, e.timeStamp);
      d.x = e.clientX;
      d.y = e.clientY;
      return;
    }
    const p = overCard(e.clientX, e.clientY);
    setOverCardNow(p !== null);
    if (e.pointerType !== 'mouse' || reduceMotion) return;
    if (p) motion.setTilt(p.x, p.y);
    else motion.clearTilt();
  };

  const onPointerLeave = () => {
    setOverCardNow(false);
    if (!drag.current) motion.clearTilt();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!introDone || drag.current || e.button !== 0) return;
    // Only the card itself turns.
    if (!overCard(e.clientX, e.clientY)) return;
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

  // iOS Safari: a finger turning the card must not become a page scroll
  // (which cancels the pointer mid-turn). The touch's moves are cancelled
  // while a drag is live; native and not passive, as React's touch handlers
  // are passive and cannot cancel.
  useEffect(() => {
    const hit = hitRef.current;
    if (!hit) return;
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current && e.cancelable) e.preventDefault();
    };
    hit.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => hit.removeEventListener('touchmove', onTouchMove);
  }, []);

  // The back's slow maps wait for the intro (deferredPaint): held from
  // mount, painted once it is done.
  useEffect(() => holdDeferredPaints(), []);
  const onIntroDone = useCallback(() => {
    setIntroDone(true);
    flushDeferredPaints();
    // The audio context, too: Chrome builds it on the main thread.
    preheatSoon();
  }, []);

  const foot = footprint(design.orientation);

  return (
    // The pointer is handled here, on the page: the stage paints over the
    // columns (the card is always on top) but lets the pointer through, so
    // the type and the buttons take theirs and the rest reaches the card.
    <div
      className={clsx(
        styles.root,
        introDone && overCardNow && styles.overCard,
        dragging && styles.dragging,
      )}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* The playground's dot grid, in the card's column, under everything.
          It ripples on a click anywhere but the chrome. */}
      <div className={styles.dots} aria-hidden>
        {/* Its surface comes from the --dot-grid-* tokens, read from the
            stylesheet on its first paint: a React-side theme would paint
            the server's light frame first. */}
        <StageGL bootMix={0} edge="flush" />
      </div>

      {/* The card's stage: the whole page; the card sits at its center. */}
      <div ref={stageRef} className={styles.stage} role="img" aria-label={alt}>
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
            reduceMotion={reduceMotion}
            hitRef={hitRef}
            overlayRef={overlayRef}
            onIntroDone={onIntroDone}
          />
        </Canvas>
        {/* Rides with the card, its footprint in card px: the blueprint is
            laid out on it. */}
        <div
          ref={hitRef}
          className={styles.hit}
          style={{ width: foot.w, height: foot.h }}
          data-stage-foreground
          aria-hidden
        >
          {!introDone && <CardIntro ref={overlayRef} brand={brand} orientation={design.orientation} />}
          {/* The playground's hint, under the card, until it has been turned. */}
          <span className={clsx(styles.hint, (dragged || !introDone) && styles.hintGone)}>
            <IconRotate360Right size={14} />
            Drag to turn it over
          </span>
        </div>
      </div>

      {/* The chrome, on a grid over the stage (three columns wide, the
          card's middle one empty; stacked on a phone): each piece takes the
          pointer, the space between lets it through to the card. */}
      <span className={clsx(styles.rule, styles.ruleA)} aria-hidden />
      <span className={clsx(styles.rule, styles.ruleB)} aria-hidden />
      <span className={clsx(styles.rule, styles.ruleC)} aria-hidden />
      <span className={clsx(styles.rule, styles.ruleD)} aria-hidden />
      <a className={styles.wordmark} href="https://www.lightspark.com" aria-label="Lightspark" data-stage-foreground>
        <LightsparkWordmark />
      </a>
      <p className={clsx(styles.mouse, styles.label)} data-stage-foreground>
        Cards Playground
      </p>
      <h1 className={clsx(styles.title, styles.blurIn)} style={blurInDelay(0.1)} data-stage-foreground>
        {brand}
        <br />
        <span className={styles.titleMuted}>Card</span>
      </h1>
      <div className={styles.pitch} data-stage-foreground>
        <p className={clsx(styles.pitchText, styles.blurIn)} style={blurInDelay(0.25)}>
          {pitch}
        </p>
        <div className={clsx(styles.actions, styles.blurIn)} style={blurInDelay(0.35)}>
          {actions}
        </div>
      </div>
      <p className={clsx(styles.mouse, styles.tuple)} data-stage-foreground>
        {TEMPLATE_TUPLE}
      </p>
      <a
        className={clsx(styles.mouse, styles.mouseLink, styles.docs)}
        href="https://docs.lightspark.com"
        data-stage-foreground
      >
        docs.lightspark.com
      </a>
    </div>
  );
}

/** The card's scale for a stage of `w` × `h`: its long edge at
 *  `CARD_OF_WIDTH` of the width or `CARD_OF_HEIGHT` of the height, floored. */
function cardScale(w: number, h: number, foot: { w: number; h: number }): number {
  const long = Math.max(CARD_MIN_LONG, Math.min(CARD_OF_WIDTH * w, CARD_OF_HEIGHT * h));
  return long / Math.max(foot.w, foot.h);
}

function readThemeDark(): boolean {
  return document.documentElement.dataset.theme === 'dark';
}

function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
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
  reduceMotion: boolean;
  hitRef: React.RefObject<HTMLDivElement>;
  overlayRef: React.RefObject<SVGSVGElement>;
  onIntroDone: () => void;
}

/** Drives the mesh every frame: the intro first (the blueprint draws, the
 *  card comes into focus under it), then the motion's (tilt, drag, bob). The
 *  card sits at the stage's center, facing front. */
function Rig({ motion, state, reduceMotion, hitRef, overlayRef, onIntroDone }: RigProps) {
  const carrier = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const intro = useRef<Intro>({ t: -1, done: false });


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
    // Flat, facing front, as on the playground: held through the intro, then
    // floating (the tilt, the bob), and settling on a face after a turn.
    const p = motion.step(dt, {
      wantBack: false,
      hold: !it.done,
      reduceMotion,
      bob: it.done,
    });
    const bob = it.done ? p.dy : 0;
    c.position.set(p.dx * s, -bob, 0);
    c.scale.setScalar(s);

    // The intro: step the blueprint and bring the card's canvas into focus
    // off one clock. The canvas is hidden from the first frame (before the
    // card is ready, t is -1). Reduced motion ends it now.
    if (!it.done) {
      if (it.t >= 0) it.t += dt;
      if (reduceMotion && it.t >= 0) it.t = INTRO_END;
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
      // The hint riding on it undoes that scale.
      hit.style.setProperty('--card-scale', s.toFixed(4));
    }
  });

  return (
    <group ref={carrier}>
      <CardMesh ref={group} state={state} onReady={onReady} />
    </group>
  );
}
