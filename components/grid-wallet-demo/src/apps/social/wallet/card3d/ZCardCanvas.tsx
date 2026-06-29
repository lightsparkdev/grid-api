'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { CardView } from '@/apps/shared/wallet';
import { CardEnv } from './cardEnv';
import { ZCardScene } from './ZCardScene';

// Khronos PBR-neutral tone map keeps the silver cool and true (ACES, r3f's
// default, skews highlights warm). Fall back gracefully on older three.
const NEUTRAL_TONE_MAPPING =
  THREE.NeutralToneMapping ?? THREE.AgXToneMapping ?? THREE.ACESFilmicToneMapping;

export interface ZCardCanvasProps {
  cardView: CardView;
  issued: boolean;
  cardNumber?: string;
  reducedMotion?: boolean;
  /** Fired once the material maps are generated (host fades the graphic in). */
  onReady?: () => void;
}

/**
 * Real-time 3D metal Z card. Default export so it can be `React.lazy`-loaded
 * (three.js is code-split and only fetched when the card flow opens). Transparent
 * canvas so it sits on the issuance sheet's bg.
 */
export default function ZCardCanvas({
  cardView,
  issued,
  cardNumber = '•••• 8972',
  reducedMotion = false,
  onReady,
}: ZCardCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 10], fov: 28 }}
      style={{ width: '100%', height: '100%' }}
      // The phone scales via CSS transform; getBoundingClientRect (r3f's default
      // measure) returns the *scaled* size, sizing the drawing buffer too small
      // so the scene clips on the right. offsetSize uses the unscaled layout box.
      resize={{ offsetSize: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = NEUTRAL_TONE_MAPPING;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Suspense fallback={null}>
        <CardEnv />
        {/* Reflections are all env-driven; just a faint cool ambient + a gentle
            key so the matte beadblast isn't dead flat. Kept low for the soft,
            diffuse studio look. */}
        <ambientLight intensity={0.12} color="#cdd6e4" />
        <directionalLight position={[2, 5, 6]} intensity={0.35} color="#eef2f8" />
        <ZCardScene
          cardView={cardView}
          issued={issued}
          cardNumber={cardNumber}
          reducedMotion={reducedMotion}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
