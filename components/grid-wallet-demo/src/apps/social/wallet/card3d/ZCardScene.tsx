'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ZCard } from './ZCard';
import { CARD_W, CARD_H } from './cardGeometry';
import { getCardMaps, type CardMaps } from './cardTextures';

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
// Smootherstep (zero velocity AND acceleration at both ends) — a much softer,
// longer deceleration tail than quadratic easeInOut, so the card glides into
// its head-on resolve instead of stopping.
const easeInOutSoft = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
// Ease-out (power 2.5): velocity is at its max at x=0 and decays monotonically
// to zero — the "fly in, spend the momentum" profile for the reveal's rise.
// The gentle exponent keeps the entry brisk but not violent, and keeps REAL
// velocity through the mid-flight (quintic dumped it all in the first beat and
// read as slamming the brakes as the card tipped upright).
const easeOutSoft = (x: number) => 1 - Math.pow(1 - clamp01(x), 2.5);

const FAN_COUNT = 18;
const FAN_RADIUS = 5.2; // bigger ring
const FAN_SCALE = 0.96; // overall size in frame (slightly up)
const FAN_OFFSET_Y = -4.3; // hub dropped low; only the top arc shows (full-screen canvas:
// world y=0 is the screen center, so the hub sits less deep than the old nav-to-copy framing)
const FAN_PITCH = 0.35; // base tilt about each card's long axis (keeps the impeller layering)
const FAN_PITCH_DRIFT = 1.0; // ± pitch amplitude swept across the visible arc
const FAN_PITCH_PHASE = 0.55; // shifts the pitch wave toward the right/entering side so the rotation
// "starts earlier" — and parks the near-flat (intersecting) trough off the right edge
const FAN_SPIN = 0.04; // rad/s — slow continuous wheel rotation
// Fan-scene environment orientation (hand-tuned with the dev EnvTuner) — rakes
// the studio light across the cards as they carousel through mid-screen.
const FAN_ENV_X = -0.16;
const FAN_ENV_Y = 0.88;

// ── Reveal timeline (seconds from reveal mount). ONE continuous timeline whose
// curves overlap generously — tilt, rise and spin all blend mid-flight (no
// chained phases, no velocity dip between "tip up" and "spin"). ──
const REVEAL_TILT = [0, 1.65] as const; // flat → dead head-on. Starts at t=0 —
// the uprighting is part of the entrance itself (never a separate "now it
// tilts" onset); smootherstep's dead-flat start means it only budges a few
// degrees during the fly-in, with the visible action landing low on screen.
const REVEAL_RISE = [0, 1.85] as const; // off-screen below → the final perch.
// Ease-OUT, not in-out: the card enters at PEAK velocity and only ever
// decelerates — one continuous "fly in, spend the momentum" gesture with no
// mid-flight slowdown (in-out's velocity hump read as two movements). The soft
// exponent spreads the climb out, so the card is still low on screen (and
// clearly traveling) when the tilt and spin join.
const REVEAL_SPIN = [0.5, 1.85] as const; // full 360° about the short axis —
// joins in the lower third of the climb, while the card is clearly traveling
// (segments end staggered so the resolve is a soft — but not lingering — glide-in)
const REVEAL_RESOLVE_AT = 1.5; // fire onResolved during the final approach
const REVEAL_DONE = 1.85;

// Depth arc: the recede is ease-out too — the card shrinks away IMMEDIATELY as
// it flies in (one gesture with the rise), hits the far point while the rise is
// spending its momentum, and the smootherstep approach then carries the
// scale-up continuously until the resolve. Windows overlap heavily so the turn
// is a rounded blend, never a stop-and-return.
const REVEAL_ARC_DEPTH = 12;
const REVEAL_RECEDE = [0, 1.05] as const;
const REVEAL_APPROACH = [0.5, 1.85] as const;

// The reveal card renders smaller than the fan's cards (full-width felt huge).
const REVEAL_SCALE = 0.8;
// Flat-on-the-"table" entrance pose: nearly flat, top edge tipped up slightly.
const REVEAL_FLAT_RX = -1.34;
// Env sweep: rotating the baked studio about X slides the dark stripe's
// reflection vertically across the card; this pass rakes it across the Z as the
// card resolves, settling it across the middle.
const REVEAL_SWEEP = [1.25, 2.25] as const;
const REVEAL_SWEEP_FROM = 0.5; // rad — stripe parked off the card at flight start
// Where the light settles on the resolved card (hand-tuned with the EnvTuner).
const REVEAL_SETTLE_X = -0.38;
const REVEAL_SETTLE_Y = 0.12;

// Hover tilt (resolved card only): the card pivots a few degrees under the
// pointer — the hovered edge dips away, like pressing a physical card resting
// on a pin. Damped toward the target so it glides, and eases back to dead
// head-on when the pointer leaves. Tiny angles are plenty: the env-lit metal
// makes even 3° shimmer.
const HOVER_MAX_TILT = 0.1; // rad ≈ 5.7°
const HOVER_DAMP = 5; // exponential smoothing rate (1/s)
// The invisible hover hit plane extends this far beyond the card on every side
// (pre-scale world units), so the tilt engages a little before the pointer
// actually reaches the card; outside the card bounds the tilt clamps to the
// edge value.
const HOVER_HIT_MARGIN = 0.55;

// Hero morph (Continue → the debit-card home): the landed card glides/scales
// from its perch to the measured hero rect as ONE continuous element — same
// canvas, same mesh; only the target moves. Damped (exponential ease-out), so
// it's interruptible and never snaps.
const HERO_DAMP = 6;
// The hero TARGET itself can move after landing (tap-to-pay lifts it 56px) —
// track it damped so target changes glide instead of teleporting. λ≈8 lands in
// ~0.5s, matching the system tap-lift transition the DOM layers use.
const HERO_TRACK_DAMP = 8;

/** Hero target in world units — measured from the card-home layout. */
export interface HeroTarget {
  y: number;
  scale: number;
}

export type CardStage = 'fan' | 'reveal';

/**
 * Intro: the cards sit already fanned into a continuous circle — a deck flourish
 * standing vertically, facing the camera (no fan-out on open; the graphic just
 * fades in). Each card is portrait (long axis radial) and radiates from the hub.
 *
 * It's a CAROUSEL: pitch (tilt about the long axis) is locked to the card's
 * position on the ring — `base + amp·sin(azimuth)`. Across the visible top arc
 * (azimuth roughly -90°…+90°) sin is monotonic, so a card rotates its pitch
 * CONTINUOUSLY in one direction as it travels across, then exits at the side and
 * the reversal happens below, off-screen. Because every card is identical and
 * evenly spaced, as one exits another cycles in behind it → a seamless loop where
 * you never see a back. The base keeps every card tilted the same way (layered, no
 * intersection); 2π-periodic ⇒ seamless. The spin must be visible-speed (not the
 * old crawl) or the carousel reads as frozen.
 */
function FanGroup({ maps }: { maps: CardMaps | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const pitchRefs = useRef<(THREE.Group | null)[]>([]);
  const scene = useThree((s) => s.scene);

  // Park the env at the fan's tuned orientation; hand it back neutral for the
  // reveal stage (which drives its own sweep) on unmount.
  useEffect(() => {
    scene.environmentRotation.set(FAN_ENV_X, FAN_ENV_Y, 0);
    return () => {
      scene.environmentRotation.set(0, 0, 0);
    };
  }, [scene]);

  useFrame((state) => {
    const rot = state.clock.elapsedTime * FAN_SPIN;
    const g = groupRef.current;
    if (g) g.rotation.z = rot;
    for (let i = 0; i < FAN_COUNT; i++) {
      const p = pitchRefs.current[i];
      if (!p) continue;
      const azimuth = rot + (i / FAN_COUNT) * Math.PI * 2;
      p.rotation.y = FAN_PITCH + FAN_PITCH_DRIFT * Math.sin(azimuth + FAN_PITCH_PHASE);
    }
  });

  return (
    <group ref={groupRef} scale={FAN_SCALE} position={[0, FAN_OFFSET_Y, 0]}>
      {Array.from({ length: FAN_COUNT }).map((_, i) => (
        <group key={i} rotation={[0, 0, (i / FAN_COUNT) * Math.PI * 2]}>
          {/* radial arm → card on the ring (coplanar). Pitch (rotation.y) is
              driven per-frame from the card's azimuth (see above). */}
          <group
            ref={(el) => {
              pitchRefs.current[i] = el;
            }}
            position={[0, FAN_RADIUS, 0]}
            rotation={[0, FAN_PITCH, 0]}
          >
            {/* roll to portrait (long axis radial) */}
            <group rotation={[0, 0, Math.PI / 2]}>
              <ZCard maps={maps} />
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}

/**
 * Created: one card rises from fully off-screen below, lying nearly flat, then
 * tilts toward the viewer and spins 180° about its short (vertical) axis — all
 * on one continuous timeline with overlapping eased segments (no phase seams).
 * It resolves DEAD head-on (no sway) at the CENTER of the screen, holds a beat,
 * then glides up to `endY` — the measured center of the gap between the nav and
 * the ready copy — while the copy staggers in (onResolved fires as the glide
 * starts, so the two motions read as one moment). Both caps carry the same
 * content (see cardGeometry), so the face showing after the half-turn reads
 * identically. Runs on its own clock — the brain's `ready` flip mid-flight only
 * swaps in the numbered texture.
 */
function RevealCard({
  maps,
  instant,
  endY,
  startY,
  hero,
  hoverTilt = true,
  onResolved,
}: {
  maps: CardMaps | null;
  instant: boolean;
  /** Final card-center height (world units) — measured from the real layout. */
  endY: number;
  /** Entrance height (world units) — fully below the bottom edge. */
  startY: number;
  /** Card-home hero target — when set, the landed card morphs to it. */
  hero?: HeroTarget | null;
  /** Pointer hover tilt on the landed card (off during tap-to-pay — the
   *  system interaction wants the card dead head-on). */
  hoverTilt?: boolean;
  onResolved?: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const startRef = useRef<number | null>(null);
  const resolvedFiredRef = useRef(false);
  const scene = useThree((s) => s.scene);
  // Hover tilt state — target follows the pointer (landed card only), current
  // is damped toward it every frame.
  const landedRef = useRef(false);
  const hoverTarget = useRef({ x: 0, y: 0 });
  const hoverCur = useRef({ x: 0, y: 0 });
  // 0 = flight/perch placement, 1 = hero placement. Instant opens onto the
  // card home start at 1 (no morph on mount).
  const heroBlend = useRef(instant && hero ? 1 : 0);
  const heroLast = useRef<HeroTarget | null>(null);
  // The morph's FROM placement, captured the moment the hero engages. The live
  // perch is layout-derived and MOVES when the ready copy exits mid-morph —
  // blending from a frozen snapshot instead keeps the card jump-free.
  const heroFrom = useRef<HeroTarget | null>(null);

  // The env sweep below mutates the shared scene — put it back for the fan
  // (whose key-light placement is tuned) when the reveal unmounts.
  useEffect(
    () => () => {
      scene.environmentRotation.set(0, 0, 0);
    },
    [scene],
  );

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const now = state.clock.elapsedTime;
    if (startRef.current === null) {
      // `instant` (sheet reopened on an already-created card): skip to the end.
      startRef.current = instant ? now - (REVEAL_DONE + 0.1) : now;
    }
    const t = now - startRef.current;
    const seg = ([a, b]: readonly [number, number]) => easeInOutSoft((t - a) / (b - a));
    const segOut = ([a, b]: readonly [number, number]) => easeOutSoft((t - a) / (b - a));

    const tilt = seg(REVEAL_TILT);
    const rise = segOut(REVEAL_RISE);
    const spin = seg(REVEAL_SPIN);

    // Hover tilt only engages once the flight is over (and not while it's
    // disabled, e.g. tap-to-pay); the damped current value keeps any residual
    // tilt easing out smoothly if the state flips.
    landedRef.current = t >= REVEAL_DONE && hoverTilt;
    if (!landedRef.current) {
      hoverTarget.current.x = 0;
      hoverTarget.current.y = 0;
    }
    hoverCur.current.x = THREE.MathUtils.damp(
      hoverCur.current.x, hoverTarget.current.x, HOVER_DAMP, delta,
    );
    hoverCur.current.y = THREE.MathUtils.damp(
      hoverCur.current.y, hoverTarget.current.y, HOVER_DAMP, delta,
    );

    g.rotation.x = THREE.MathUtils.lerp(REVEAL_FLAT_RX, 0, tilt) + hoverCur.current.x;
    g.rotation.y = spin * Math.PI * 2 + hoverCur.current.y;

    const flightY = THREE.MathUtils.lerp(startY, endY, rise);

    // Hero morph: blend from a FROZEN snapshot of the card's placement (taken
    // the moment the hero engages) toward the measured hero rect. Remember the
    // last real target so the morph keeps easing if `hero` flips back to null
    // mid-glide. The target itself is TRACKED damped — post-landing target
    // moves (the tap-to-pay 56px lift) glide instead of snapping.
    if (hero) {
      if (!heroLast.current) {
        heroLast.current = { ...hero };
      } else {
        heroLast.current.y = THREE.MathUtils.damp(
          heroLast.current.y, hero.y, HERO_TRACK_DAMP, delta,
        );
        heroLast.current.scale = THREE.MathUtils.damp(
          heroLast.current.scale, hero.scale, HERO_TRACK_DAMP, delta,
        );
      }
      if (!heroFrom.current) {
        heroFrom.current = { y: g.position.y, scale: g.scale.x || REVEAL_SCALE };
      }
    }
    heroBlend.current = THREE.MathUtils.damp(
      heroBlend.current, hero ? 1 : 0, HERO_DAMP, delta,
    );
    if (!hero && heroBlend.current < 0.001) heroFrom.current = null;
    const b = heroBlend.current;
    const heroT = heroLast.current;
    const from = heroFrom.current;

    g.position.y =
      heroT && from ? THREE.MathUtils.lerp(from.y, heroT.y, b) : flightY;
    // Depth arc: recede (ease-out, flies away with the entrance) minus approach
    // (smootherstep, carries the come-closer scale-up all the way to the land).
    g.position.z = -REVEAL_ARC_DEPTH * (segOut(REVEAL_RECEDE) - seg(REVEAL_APPROACH));
    g.scale.setScalar(
      heroT && from ? THREE.MathUtils.lerp(from.scale, heroT.scale, b) : REVEAL_SCALE,
    );

    // The card holds dead straight once resolved, so instead of moving the card
    // we orbit the STUDIO around it. The env carries a dark stripe (see cardEnv):
    // the X-rotation pass rakes its reflection across the polished Z as the card
    // resolves and settles it across the middle; the small residual sines keep
    // the metal breathing afterwards instead of freezing on one flat tone.
    // The env sweep rakes the dark stripe across the Z as the card resolves,
    // then the light parks DEAD STILL at the settle point — no idle sway (the
    // reveal's motion is the show; the landed card holds rock-solid).
    const sweep = seg(REVEAL_SWEEP);
    scene.environmentRotation.set(
      THREE.MathUtils.lerp(REVEAL_SWEEP_FROM, REVEAL_SETTLE_X, sweep),
      REVEAL_SETTLE_Y * sweep,
      0,
    );

    if (!resolvedFiredRef.current && t >= REVEAL_RESOLVE_AT) {
      resolvedFiredRef.current = true;
      onResolved?.();
    }
  });

  return (
    <group
      ref={ref}
      onPointerMove={(e) => {
        const g = ref.current;
        if (!g || !landedRef.current) return;
        // Pointer position across the card's footprint, -1..1 from the center
        // (normalized by the CURRENT scale — the hero card is much larger).
        const nx = THREE.MathUtils.clamp(
          (e.point.x - g.position.x) / ((CARD_W / 2) * g.scale.x), -1, 1,
        );
        const ny = THREE.MathUtils.clamp(
          (e.point.y - g.position.y) / ((CARD_H / 2) * g.scale.y), -1, 1,
        );
        // Hovered edge dips away (pressing a card pivoting on a pin).
        hoverTarget.current.x = -ny * HOVER_MAX_TILT;
        hoverTarget.current.y = nx * HOVER_MAX_TILT;
      }}
      onPointerLeave={() => {
        hoverTarget.current.x = 0;
        hoverTarget.current.y = 0;
      }}
    >
      <ZCard maps={maps} />
      {/* Invisible raycast target extending the hover-reactive area past the
          card bounds (transparent but NOT visible=false — hidden objects are
          skipped by the raycaster). */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry
          args={[CARD_W + HOVER_HIT_MARGIN * 2, CARD_H + HOVER_HIT_MARGIN * 2]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/**
 * Scene root: pulls the shared material maps from the session cache (the issued
 * flip mid-reveal just swaps in the prewarmed numbered variant), and renders the
 * intro fan or the created-card reveal based on `stage`. The canvas spans the
 * full screen, so the host expresses the card's final perch as `endYFrac` — a
 * 0..1 fraction from the top of the screen, MEASURED from the real layout (nav
 * bottom / ready-copy top) — and it's converted to world units here. Content
 * changes later just re-measure; nothing in the scene is hardcoded to the copy.
 */
export function ZCardScene({
  stage,
  issued,
  cardNumber,
  endYFrac = 0.35,
  heroYFrac = null,
  heroWFrac = null,
  hoverTilt = true,
  revealInstant = false,
  reducedMotion = false,
  onReady,
  onRevealResolved,
}: {
  stage: CardStage;
  issued: boolean;
  cardNumber: string;
  /** Final card-center position as a fraction of screen height (from the top). */
  endYFrac?: number;
  /** Card-home hero rect (measured): center Y fraction + width fraction. */
  heroYFrac?: number | null;
  heroWFrac?: number | null;
  /** Pointer hover tilt on the landed card (off during tap-to-pay). */
  hoverTilt?: boolean;
  /** Sheet opened on an already-created card — skip straight to the resolved pose. */
  revealInstant?: boolean;
  reducedMotion?: boolean;
  onReady?: () => void;
  onRevealResolved?: () => void;
}) {
  const [maps, setMaps] = useState<CardMaps | null>(null);
  const readyFiredRef = useRef(false);
  const viewport = useThree((s) => s.viewport);
  // Screen-fraction → world Y (canvas is full-screen; world y=0 = screen center).
  const endY = (0.5 - endYFrac) * viewport.height;
  // Entrance: fully below the bottom edge (half the viewport + card clearance).
  const startY = -(viewport.height / 2 + 0.9);
  // Card-home hero placement, converted from the measured layout fractions.
  const hero: HeroTarget | null =
    heroYFrac !== null && heroWFrac !== null
      ? {
          y: (0.5 - heroYFrac) * viewport.height,
          scale: (heroWFrac * viewport.width) / CARD_W,
        }
      : null;

  useEffect(() => {
    let alive = true;
    getCardMaps({ issued, cardNumber }).then((m) => {
      if (alive) setMaps(m);
    });
    return () => {
      alive = false;
    };
  }, [issued, cardNumber]);

  // Tell the host once the maps exist, so it can fade the (already-textured,
  // already-fanned) graphic in with no untextured flash.
  useEffect(() => {
    if (maps && !readyFiredRef.current) {
      readyFiredRef.current = true;
      onReady?.();
    }
  }, [maps, onReady]);

  // Render nothing until the maps are ready (no fallback flash before fade-in).
  if (!maps) return null;

  // Reduced motion: a single static card, head-on with a slight tilt — no fan,
  // no spin — sitting at the resolved (or hero) placement.
  if (reducedMotion) {
    return (
      <group
        position={[0, hero ? hero.y : endY, 0]}
        rotation={[-0.08, 0.32, 0]}
        scale={hero ? hero.scale : REVEAL_SCALE}
      >
        <ZCard maps={maps} />
      </group>
    );
  }

  if (stage === 'reveal') {
    return (
      <RevealCard
        maps={maps}
        instant={revealInstant}
        endY={endY}
        startY={startY}
        hero={hero}
        hoverTilt={hoverTilt}
        onResolved={onRevealResolved}
      />
    );
  }
  return <FanGroup maps={maps} />;
}
