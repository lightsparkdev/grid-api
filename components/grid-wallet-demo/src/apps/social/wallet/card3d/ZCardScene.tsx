'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CardView } from '@/apps/shared/wallet';
import { ZCard } from './ZCard';
import { generateCardMaps, type CardMaps } from './cardTextures';

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

const FAN_COUNT = 18;
const FAN_RADIUS = 5.2; // bigger ring
const FAN_SCALE = 0.96; // overall size in frame (slightly up)
const FAN_OFFSET_Y = -4.9; // hub dropped low (≈40px lower); only the top arc shows, rest fades under the mask
const FAN_PITCH = 0.42; // CONSTANT tilt of every card about its long axis
const REVEAL_DURATION = 2.3; // s; finishes just before the brain flips to 'ready'

/**
 * Intro: the cards sit already fanned into a continuous circle — a deck flourish
 * standing vertically, facing the camera (no fan-out on open; the graphic just
 * fades in). Each card is portrait (long axis radial) and radiates from the hub,
 * with the SAME constant tilt about its long axis. That makes a
 * rotationally-symmetric impeller: every card overlaps the next identically (so
 * they layer cleanly, no intersection) AND the ring is seam-free — continuous
 * rotation looks identical every card-step. The hub sits below frame so only the
 * top arc shows; the rest dissolves into the fade.
 */
function FanGroup({ maps }: { maps: CardMaps | null }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const g = groupRef.current;
    if (g) g.rotation.z = state.clock.elapsedTime * 0.04; // slow continuous drift
  });

  return (
    <group ref={groupRef} scale={FAN_SCALE} position={[0, FAN_OFFSET_Y, 0]}>
      {Array.from({ length: FAN_COUNT }).map((_, i) => (
        <group key={i} rotation={[0, 0, (i / FAN_COUNT) * Math.PI * 2]}>
          {/* radial arm → card on the ring (coplanar). The CONSTANT long-axis
              tilt makes a symmetric impeller: each card overlaps the next the
              same way, so they layer cleanly with no intersection and no seam. */}
          <group position={[0, FAN_RADIUS, 0]} rotation={[0, FAN_PITCH, 0]}>
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

/** Created: one card lies flat, lifts, and spins 360 about the short axis,
 *  resolving head-on. */
function RevealCard({ maps, cardView }: { maps: CardMaps | null; cardView: CardView }) {
  const ref = useRef<THREE.Group>(null);
  const startRef = useRef<number | null>(null);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const now = state.clock.elapsedTime;
    if (startRef.current === null) startRef.current = now;
    const elapsed = now - startRef.current;
    const p = cardView === 'ready' ? 1 : clamp01(elapsed / REVEAL_DURATION);

    // Lift: from nearly flat (tilted toward camera) to upright; rises into frame.
    const lift = easeInOut(clamp01((p - 0.05) / 0.5));
    // Spin: one full turn about Y (the short axis), resolving head-on.
    const spin = easeInOut(clamp01((p - 0.28) / 0.72));
    // Settle: once resolved, a slow living sway so the metal sweeps the studio
    // gradient (a dead-flat head-on card reflects a uniform slice and looks flat).
    const settle = easeInOut(clamp01((p - 0.85) / 0.15));

    g.rotation.x = THREE.MathUtils.lerp(-1.32, -0.1, lift) + Math.sin(now * 0.5) * 0.045 * settle;
    g.position.y = THREE.MathUtils.lerp(-0.55, 0, lift) + Math.sin(now * 0.6) * 0.02 * settle;
    g.rotation.y = spin * Math.PI * 2 + Math.sin(now * 0.42 + 1) * 0.17 * settle;
  });

  return (
    <group ref={ref}>
      <ZCard maps={maps} />
    </group>
  );
}

/**
 * Scene root: generates the shared material maps once (regenerated when issued
 * flips so the card number appears), and swaps between the intro fan and the
 * created reveal based on `cardView`.
 */
export function ZCardScene({
  cardView,
  issued,
  cardNumber,
  reducedMotion = false,
  onReady,
}: {
  cardView: CardView;
  issued: boolean;
  cardNumber: string;
  reducedMotion?: boolean;
  onReady?: () => void;
}) {
  const [maps, setMaps] = useState<CardMaps | null>(null);
  const mapsRef = useRef<CardMaps | null>(null);
  const readyFiredRef = useRef(false);

  useEffect(() => {
    let alive = true;
    generateCardMaps({ issued, cardNumber }).then((m) => {
      if (!alive) {
        m.dispose();
        return;
      }
      mapsRef.current?.dispose();
      mapsRef.current = m;
      setMaps(m);
    });
    return () => {
      alive = false;
    };
  }, [issued, cardNumber]);

  useEffect(
    () => () => {
      mapsRef.current?.dispose();
      mapsRef.current = null;
    },
    [],
  );

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

  // Reduced motion: a single static card, head-on with a slight tilt — no fan, no spin.
  if (reducedMotion) {
    return (
      <group rotation={[-0.08, 0.32, 0]}>
        <ZCard maps={maps} />
      </group>
    );
  }

  if (cardView === 'creating' || cardView === 'ready') {
    return <RevealCard maps={maps} cardView={cardView} />;
  }
  return <FanGroup maps={maps} />;
}
