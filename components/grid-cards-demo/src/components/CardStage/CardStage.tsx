'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useReducedMotion } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { programNameOf } from '@/apps/shared/brand/BrandContext';
import { PAN_GROUPS, type CardHome } from '@/apps/shared/card';
import { usePhoneBoot } from '@/components/DotGridCanvas/PhoneBootContext';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { CardDesign } from '@/data/design';
import { CardEnv } from './card3d/CardEnv';
import { CardMesh, type CardMeshState } from './card3d/CardMesh';
import { CardShadow } from './card3d/CardShadow';
import { CardMotion } from './cardMotion';
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

// Khronos PBR-neutral tone map keeps silver true (ACES warms highlights).
const NEUTRAL_TONE_MAPPING = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping;
const EXPOSURE_LIGHT = 1.05;
const EXPOSURE_DARK = 0.85;

function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/** Inputs the frame loop reads without re-subscribing. */
interface Live {
  /** Phone boot curve, eased. */
  t: number;
  wantBack: boolean;
  reduceMotion: boolean;
  dark: boolean;
}

interface CardStageProps {
  design: CardDesign;
  home: CardHome;
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
export function CardStage({ design, home }: CardStageProps) {
  const { bootProgress } = usePhoneBoot();
  const reduceMotion = useReducedMotion() ?? false;
  const dark = useThemeMode() === 'dark';
  const rootRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const motion = useMemo(() => new CardMotion(), []);

  const { issued, issuing, card, isDeclined } = home;
  const revealed = card.sheet === 'details';
  const phoneUp = bootProgress > 0;

  const live = useRef<Live>({ t: 0, wantBack: false, reduceMotion, dark });
  live.current.t = easeInOutCubic(bootProgress);
  live.current.wantBack = revealed;
  live.current.reduceMotion = reduceMotion;
  live.current.dark = dark;

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

  // ── Pointer: tilt on hover, spin on drag ───────────────────────────────────
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current && e.pointerId === drag.current.id) {
      motion.drag(e.clientX - drag.current.x, e.clientY - drag.current.y, e.timeStamp);
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      return;
    }
    if (reduceMotion || live.current.t > 0) return;
    const b = e.currentTarget.getBoundingClientRect();
    motion.setTilt((e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5);
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (live.current.t > 0 || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    motion.beginDrag(e.timeStamp);
    e.currentTarget.classList.add(styles.hitDragging);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || e.pointerId !== drag.current.id) return;
    drag.current = null;
    motion.endDrag();
    e.currentTarget.classList.remove(styles.hitDragging);
  };
  const onPointerLeave = () => {
    if (!drag.current) motion.clearTilt();
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

  return (
    <div ref={rootRef} className={styles.root}>
      <Canvas
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
          state={{ design, issued, frozen: card.frozen, closed: card.closed, shown }}
        />
      </Canvas>

      {/* Rides with the card: pointer input, the state pill, the accessible name. */}
      <div
        ref={hitRef}
        className={styles.hit}
        style={{ width: CARD_W, height: CARD_H, pointerEvents: phoneUp ? 'none' : 'auto' }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onPointerLeave}
      >
        <span className={styles.srOnly} role="img" aria-label={`${programNameOf(design)} card`} />
        {pill && (
          <span className={clsx(styles.pill, card.closed && styles.pillClosed, issuing && styles.pillProcessing)}>
            {pill}
          </span>
        )}
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
  state: CardMeshState;
}

/** Drives the mesh, its shadow, and the DOM hit box every frame. */
function CardRig({ rootRef, hitRef, live, motion, state }: CardRigProps) {
  // Carrier takes position and scale; the card inside it takes the spin, so
  // the shadow (also in the carrier) follows the card without turning.
  const carrier = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);
  const pos = useRef<{ x: number; y: number; s: number } | null>(null);

  // Dev: expose the scene state and the pose for tracing from the console.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    (window as unknown as Record<string, unknown>).__cardStage = { get, group, motion };
  }, [get, motion]);

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

    const pose = motion.step(dt, { wantBack: live.current.wantBack, hold: t > 0, reduceMotion: live.current.reduceMotion });
    const bob = pose.dy * (1 - t);
    // Stage px → scene: origin at the stage center, y up.
    c.position.set(x + pose.dx * s - size.width / 2, size.height / 2 - (y + bob), 0);
    c.scale.setScalar(s);
    g.rotation.set(THREE.MathUtils.degToRad(pose.rotX), THREE.MathUtils.degToRad(pose.rotY), 0);

    // Shadow: fainter as the card turns edge-on, and tighter once it is parked
    // in the phone (the slot is close behind it).
    const facing = Math.abs(Math.cos(THREE.MathUtils.degToRad(pose.rotY))) * Math.abs(Math.cos(THREE.MathUtils.degToRad(pose.rotX)));
    const sh = shadow.current;
    if (sh) {
      (sh.material as THREE.MeshBasicMaterial).opacity = (live.current.dark ? 0.5 : 0.24) * (0.35 + 0.65 * facing) * (1 - 0.45 * t);
      sh.scale.setScalar(1 - 0.12 * t);
    }

    const hit = hitRef.current;
    if (hit) {
      hit.style.transform = `translate(${x + pose.dx * s - CARD_W / 2}px, ${y + bob - CARD_H / 2}px) scale(${s})`;
      // The pill belongs to the front; hide it while the back is showing.
      hit.style.setProperty('--pill-opacity', Math.cos(THREE.MathUtils.degToRad(pose.rotY)) > 0.3 ? '1' : '0');
    }
  });

  return (
    <group ref={carrier}>
      <CardShadow ref={shadow} />
      <CardMesh ref={group} state={state} />
    </group>
  );
}
