'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CardView } from '@/apps/shared/wallet';
import { ZCard } from './ZCard';
import { generateCardMaps, type CardMaps } from './cardTextures';

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

const FAN_COUNT = 5;
const FAN_SPREAD = 0.66; // total in-plane splay of the hand (radians, across all cards)
const FAN_PIVOT_Y = -2.5; // cards rotate around a point below them, like a held hand
const REVEAL_DURATION = 2.3; // s; finishes just before the brain flips to 'ready'

/** Intro: a stack of cards that fans open like a held hand, the whole group
 *  slowly orbiting. Each card pivots around a shared point below the stack. */
function FanGroup({ maps }: { maps: CardMaps | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<(THREE.Group | null)[]>([]);
  const startRef = useRef<number | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (startRef.current === null) startRef.current = t;
    const e = t - startRef.current;
    // Fan out from a near-closed stack over the first ~1.3s.
    const spread = easeInOut(clamp01(e / 1.3));

    cardRefs.current.forEach((c, i) => {
      if (!c) return;
      const u = FAN_COUNT > 1 ? (i - (FAN_COUNT - 1) / 2) / (FAN_COUNT - 1) : 0; // -0.5..0.5
      c.rotation.z = -u * FAN_SPREAD * spread;
    });

    const g = groupRef.current;
    if (g) {
      g.rotation.y = Math.sin(t * 0.24) * 0.5;
      g.rotation.x = -0.13 + Math.sin(t * 0.19) * 0.04;
    }
  });

  return (
    <group ref={groupRef} scale={0.82}>
      {Array.from({ length: FAN_COUNT }).map((_, i) => {
        const u = FAN_COUNT > 1 ? (i - (FAN_COUNT - 1) / 2) / (FAN_COUNT - 1) : 0;
        const zDepth = (0.5 - Math.abs(u)) * 0.28; // center card sits frontmost
        return (
          <group
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            position={[0, FAN_PIVOT_Y, zDepth]}
          >
            <group position={[0, -FAN_PIVOT_Y, 0]}>
              <ZCard maps={maps} />
            </group>
          </group>
        );
      })}
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
}: {
  cardView: CardView;
  issued: boolean;
  cardNumber: string;
  reducedMotion?: boolean;
}) {
  const [maps, setMaps] = useState<CardMaps | null>(null);
  const mapsRef = useRef<CardMaps | null>(null);

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
