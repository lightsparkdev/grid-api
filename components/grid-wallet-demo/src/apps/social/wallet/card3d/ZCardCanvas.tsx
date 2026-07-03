'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CardEnv } from './cardEnv';
import { ZCardScene, type CardStage } from './ZCardScene';
import { getCardMaps } from './cardTextures';

// Khronos PBR-neutral tone map keeps the silver cool and true (ACES, r3f's
// default, skews highlights warm). Fall back gracefully on older three.
const NEUTRAL_TONE_MAPPING =
  THREE.NeutralToneMapping ?? THREE.AgXToneMapping ?? THREE.ACESFilmicToneMapping;

/**
 * Generate + cache both texture variants ahead of time (called from the host on
 * idle, through the same dynamic import that code-splits three.js). Makes the
 * first open cheap and the mid-reveal issued swap free.
 */
export function prewarmCardAssets(cardNumber: string): void {
  void getCardMaps({ issued: false, cardNumber });
  void getCardMaps({ issued: true, cardNumber });
}

export interface ZCardCanvasProps {
  stage: CardStage;
  /** Sheet closed: stop the render loop entirely (canvas stays mounted). */
  paused?: boolean;
  issued: boolean;
  cardNumber?: string;
  /** Final card-center position as a fraction of screen height (from the top). */
  endYFrac?: number;
  /** Card-home hero rect (measured): center Y fraction + width fraction. */
  heroYFrac?: number | null;
  heroWFrac?: number | null;
  /** Pointer hover tilt on the landed card (off during tap-to-pay). */
  hoverTilt?: boolean;
  revealInstant?: boolean;
  reducedMotion?: boolean;
  /** Fired once the material maps are generated (host fades the graphic in). */
  onReady?: () => void;
  /** Fired when the reveal resolves at center and starts its glide up. */
  onRevealResolved?: () => void;
}

/**
 * Real-time 3D metal Z card. Default export so it can be `React.lazy`-loaded
 * (three.js is code-split and only fetched when the card flow opens). Transparent
 * canvas so it sits on the issuance sheet's bg.
 */
export default function ZCardCanvas({
  stage,
  paused = false,
  issued,
  cardNumber = '•••• 8972',
  endYFrac,
  heroYFrac = null,
  heroWFrac = null,
  hoverTilt = true,
  revealInstant = false,
  reducedMotion = false,
  onReady,
  onRevealResolved,
}: ZCardCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={paused ? 'never' : reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // The canvas is a full-screen overlay; the camera is pulled back so the
      // world-units-per-pixel match the old nav-to-copy framing (cards render at
      // the same on-screen size, with headroom below for the bottom entrance).
      camera={{ position: [0, 0, 16.8], fov: 28 }}
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
        {/* Keyed on stage so the env re-bakes with/without the reveal's dark
            stripe — the swap happens while the canvas wrapper is faded out. */}
        <CardEnv key={stage} reveal={stage === 'reveal'} />
        {/* Reflections are all env-driven; just a faint cool ambient + a gentle
            key so the matte beadblast isn't dead flat. Kept low for the soft,
            diffuse studio look. */}
        <ambientLight intensity={0.12} color="#cdd6e4" />
        <directionalLight position={[2, 5, 6]} intensity={0.35} color="#eef2f8" />
        <ZCardScene
          stage={stage}
          issued={issued}
          cardNumber={cardNumber}
          endYFrac={endYFrac}
          heroYFrac={heroYFrac}
          heroWFrac={heroWFrac}
          hoverTilt={hoverTilt}
          revealInstant={revealInstant}
          reducedMotion={reducedMotion}
          onReady={onReady}
          onRevealResolved={onRevealResolved}
        />
      </Suspense>
    </Canvas>
  );
}
