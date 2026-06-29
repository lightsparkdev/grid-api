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
 */
export function CardEnv() {
  return (
    <Environment resolution={512} frames={1} background={false}>
      <mesh scale={60}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial side={THREE.BackSide} toneMapped={false}>
          <GradientTexture
            attach="map"
            stops={[0, 0.4, 0.68, 1]}
            colors={['#474e59', '#9aa4b3', '#e2e8f0', '#ffffff']}
          />
        </meshBasicMaterial>
      </mesh>
      {/* Soft key for the sheen line across the brushed Z. */}
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#ffffff"
        position={[0, 5, 10]}
        scale={[14, 6, 1]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}
