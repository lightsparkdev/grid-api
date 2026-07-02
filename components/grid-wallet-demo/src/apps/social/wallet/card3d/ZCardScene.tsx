'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ZCard } from './ZCard';
import { getCardMaps, type CardMaps } from './cardTextures';

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
// Smootherstep (zero velocity AND acceleration at both ends) — a much softer,
// longer deceleration tail than quadratic easeInOut, so the card glides into
// its head-on resolve instead of stopping.
const easeInOutSoft = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
// Analytic match for the app's `easeOutSnappy` bezier (0.19, 1, 0.22, 1) ≈
// expo-out — fast launch, long feathered settle. Used for the final glide so
// the card moves on the same easing language as the copy staggering in.
const easeOutSnappyFn = (x: number) => {
  const t = clamp01(x);
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

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

// ── Reveal timeline (seconds from reveal mount). ONE continuous timeline whose
// curves overlap generously — tilt, rise and spin all blend mid-flight (no
// chained phases, no velocity dip between "tip up" and "spin"). ──
const REVEAL_TILT = [0.35, 2.85] as const; // flat → dead head-on
const REVEAL_RISE = [0.05, 2.8] as const; // off-screen below → screen center
const REVEAL_SPIN = [1.0, 3.05] as const; // 180° about the short axis, joins mid-flight
// (segments end staggered + stretched so the resolve is a long, soft glide-in)
// Head-on at center, a beat, then the card glides up to its final perch while
// the ready copy staggers in below (onResolved fires as the glide starts).
const REVEAL_ELEVATE = [3.35, 4.15] as const;

// The reveal card renders smaller than the fan's cards (full-width felt huge).
const REVEAL_SCALE = 0.8;
// Flat-on-the-"table" entrance pose: nearly flat, top edge tipped up slightly.
const REVEAL_FLAT_RX = -1.34;

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
  onResolved,
}: {
  maps: CardMaps | null;
  instant: boolean;
  /** Final card-center height (world units) — measured from the real layout. */
  endY: number;
  /** Entrance height (world units) — fully below the bottom edge. */
  startY: number;
  onResolved?: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const startRef = useRef<number | null>(null);
  const resolvedFiredRef = useRef(false);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const now = state.clock.elapsedTime;
    if (startRef.current === null) {
      // `instant` (sheet reopened on an already-created card): skip to the end.
      startRef.current = instant ? now - (REVEAL_ELEVATE[1] + 0.1) : now;
    }
    const t = now - startRef.current;
    const seg = ([a, b]: readonly [number, number]) => easeInOutSoft((t - a) / (b - a));

    const tilt = seg(REVEAL_TILT);
    const rise = seg(REVEAL_RISE);
    const spin = seg(REVEAL_SPIN);
    // Snappy ease-out: the card clears the copy zone in the glide's first beats,
    // so the staggering copy never overlaps it.
    const elevate = easeOutSnappyFn(
      (t - REVEAL_ELEVATE[0]) / (REVEAL_ELEVATE[1] - REVEAL_ELEVATE[0]),
    );

    g.rotation.x = THREE.MathUtils.lerp(REVEAL_FLAT_RX, 0, tilt);
    g.rotation.y = spin * Math.PI;
    const centered = THREE.MathUtils.lerp(startY, 0, rise);
    g.position.y = THREE.MathUtils.lerp(centered, endY, elevate);

    if (!resolvedFiredRef.current && t >= REVEAL_ELEVATE[0]) {
      resolvedFiredRef.current = true;
      onResolved?.();
    }
  });

  return (
    <group ref={ref} scale={REVEAL_SCALE}>
      <ZCard maps={maps} />
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
  // no spin — sitting at the resolved height.
  if (reducedMotion) {
    return (
      <group position={[0, endY, 0]} rotation={[-0.08, 0.32, 0]} scale={REVEAL_SCALE}>
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
        onResolved={onRevealResolved}
      />
    );
  }
  return <FanGroup maps={maps} />;
}
