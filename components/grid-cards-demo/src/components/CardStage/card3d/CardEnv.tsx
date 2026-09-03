'use client';

import { Environment, GradientTexture, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

/**
 * The studio the card sits in, carried over from the wallet demo's Z card: a
 * big inverted sphere with a vertical gradient (bright cool ceiling, graphite
 * floor) so a metal face reads as silver with a smooth top-to-bottom falloff,
 * a soft key above the camera for the sheen line, and a broad bright panel
 * behind the camera so a head-on face mirrors something bright. Baked once.
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
            colors={['#444342', '#939291', '#e2e1df', '#fcfcfb']}
          />
        </meshBasicMaterial>
      </mesh>
      {/* Key: above and a little left, in front. The face's highlight. */}
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#fbfaf8"
        position={[-3, 6, 10]}
        scale={[12, 5, 1]}
        target={[0, 0, 0]}
      />
      {/* Broad fill behind the camera so head-on faces (and the foil, a
          mirror) reflect something bright. Kept near unit radiance: a matte
          face is lit by this, and brighter washes its color out. */}
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#ffffff"
        position={[3, 1, 12]}
        scale={[12, 9, 1]}
        target={[0, 0, 0]}
      />
    </Environment>
  );
}
