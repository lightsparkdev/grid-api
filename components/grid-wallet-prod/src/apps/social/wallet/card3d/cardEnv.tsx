'use client';

import { Environment, GradientTexture, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Self-contained studio for the metal card. Rather than a few small soft boxes
 * (which leave a matte metal integrating mostly to black), the whole surround is
 * a big inverted sphere carrying a vertical studio gradient — bright cool top →
 * soft graphite bottom. A metal card then reads as bright cool silver with a
 * smooth, premium top→bottom falloff. A single soft key adds the sheen line that
 * rakes across the brushed Z. Cool, diffuse, no warm tones, no hard hotspots.
 *
 * `reveal` adds a dark horizontal stripe across the key region the head-on card
 * mirrors — the reveal sweeps it across the polished Z via
 * `scene.environmentRotation` (see ZCardScene) so the metal reads as catching a
 * moving dark reflection line, not one flat tone. Remount (key) to re-bake.
 */
export function CardEnv({ reveal = false }: { reveal?: boolean }) {
  return (
    <Environment resolution={512} frames={1} background={false}>
      <mesh scale={60}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial side={THREE.BackSide} toneMapped={false}>
          <GradientTexture
            attach="map"
            stops={[0, 0.4, 0.68, 1]}
            colors={['#444342', '#939291', '#e2e1df', '#fcfcfb']}
          />
        </meshBasicMaterial>
      </mesh>
      {/* Soft, slightly warm key for the sheen line across the brushed Z. */}
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#fbfaf8"
        position={[0, 5, 10]}
        scale={[14, 6, 1]}
        target={[0, 0, 0]}
      />
      {/* Big bright key BEHIND the camera, centered on the +Z axis. Head-on
          (center-screen) cards reflect this region, so the polished Z mirrors it
          and reads BRIGHTEST there; it's wide enough to cover the slight pitch of
          the center cards (otherwise the Z reflects past it and goes dark). */}
      <Lightformer
        form="rect"
        intensity={2.9}
        color="#ffffff"
        position={[3, 1, 12]}
        scale={[12, 9, 1]}
        target={[0, 0, 0]}
      />
      {/* Dark reflection line for the reveal: a near-black stripe floating just
          in front of the bright key. The resolved (head-on) card mirrors this
          region, so the stripe reads as a soft dark band across the polished Z. */}
      {reveal && (
        <Lightformer
          form="rect"
          intensity={1}
          color="#151515"
          position={[3, 0.6, 11.4]}
          scale={[16, 2.2, 1]}
          target={[0, 0, 0]}
        />
      )}
    </Environment>
  );
}
