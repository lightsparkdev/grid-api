'use client';

import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createCardGeometry } from './cardGeometry';
import type { CardMaps } from './cardTextures';

const NORMAL_SCALE = new THREE.Vector2(1.6, 1.6);

/** A single metal card mesh. ExtrudeGeometry has two material groups — the caps
 *  (group 0) and the extruded rim (group 1) — so we use two materials: the face
 *  carries the beadblast + debossed brushed Z, and the rim is polished shiny
 *  metal (diamond-cut edge). Built imperatively and assigned as a `material`
 *  ARRAY so every instance gets both deterministically (the JSX
 *  `attach="material-N"` form raced across the fan's instances). The parent
 *  positions/animates the forwarded group. */
export const ZCard = forwardRef<THREE.Group, { maps: CardMaps | null }>(function ZCard(
  { maps },
  ref,
) {
  const geometry = useMemo(() => createCardGeometry(), []);

  const faceMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f1f1f0'),
        metalness: 1,
        roughness: 1,
        envMapIntensity: 1.05,
        normalScale: NORMAL_SCALE,
      }),
    [],
  );
  // Rim: bright, near-mirror raw metal. A small emissive lift keeps the thin
  // edge from going dark when it reflects the darker parts of the studio.
  const edgeMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f6f6f4'),
        metalness: 1,
        roughness: 0.1,
        envMapIntensity: 2.4,
        emissive: new THREE.Color('#6a6a6a'),
        emissiveIntensity: 0.6,
      }),
    [],
  );
  const materials = useMemo(() => [faceMaterial, edgeMaterial], [faceMaterial, edgeMaterial]);

  // Apply the shared maps to the face material once they're generated.
  useEffect(() => {
    faceMaterial.map = maps?.map ?? null;
    faceMaterial.normalMap = maps?.normalMap ?? null;
    faceMaterial.roughnessMap = maps?.roughnessMap ?? null;
    faceMaterial.color.set(maps ? '#f1f1f0' : '#c4c8cc');
    faceMaterial.roughness = maps ? 1 : 0.55;
    faceMaterial.needsUpdate = true;
  }, [maps, faceMaterial]);

  useEffect(
    () => () => {
      faceMaterial.dispose();
      edgeMaterial.dispose();
    },
    [faceMaterial, edgeMaterial],
  );

  return (
    <group ref={ref}>
      <mesh geometry={geometry} material={materials} />
    </group>
  );
});
