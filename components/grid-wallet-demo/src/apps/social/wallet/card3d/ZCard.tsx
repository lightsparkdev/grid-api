'use client';

import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import { createCardGeometry } from './cardGeometry';
import type { CardMaps } from './cardTextures';

const NORMAL_SCALE = new THREE.Vector2(1.2, 1.2);

/** A single metal card mesh (geometry + PBR material from shared maps). The
 *  parent positions/animates the forwarded group. */
export const ZCard = forwardRef<THREE.Group, { maps: CardMaps | null }>(function ZCard(
  { maps },
  ref,
) {
  const geometry = useMemo(() => createCardGeometry(), []);
  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        {maps ? (
          <meshPhysicalMaterial
            color="#f4f6f8"
            metalness={1}
            roughness={1}
            map={maps.map}
            normalMap={maps.normalMap}
            normalScale={NORMAL_SCALE}
            roughnessMap={maps.roughnessMap}
            anisotropy={0.85}
            anisotropyMap={maps.anisotropyMap}
            envMapIntensity={1.05}
          />
        ) : (
          <meshPhysicalMaterial color="#c4c8cc" metalness={1} roughness={0.55} envMapIntensity={1.0} />
        )}
      </mesh>
    </group>
  );
});
