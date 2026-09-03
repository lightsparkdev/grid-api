'use client';

import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { CARD_R } from './cardGeometry';
import { makeCanvas } from './facePaint';

/** Blur radius in card px; the plane grows by it on every side. */
const BLUR = 22;
const PAD = BLUR * 2;
/** Offset from the card, card px: the key sits above-left, so the shadow falls down-right. */
export const SHADOW_OFFSET = { x: 5, y: -12 };
/** How far behind the card the shadow plane sits (px). Past the card's reach
 *  when it spins (half its width at the largest stage scale), or the plane
 *  would cut through the turned card and tint the part behind it. */
export const SHADOW_Z = -330;
/** The camera distance the stage uses; the plane is scaled up by its extra
 *  depth so it projects at the card's size. */
const CAMERA_Z = 2000;
export const SHADOW_DEPTH_SCALE = (CAMERA_Z - SHADOW_Z) / CAMERA_Z;
const DEPTH_SCALE = SHADOW_DEPTH_SCALE;

function shadowTexture(): THREE.CanvasTexture {
  const w = CARD_W + PAD * 2;
  const h = CARD_H + PAD * 2;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.filter = `blur(${BLUR}px)`;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.roundRect(PAD, PAD, CARD_W, CARD_H, CARD_R);
  ctx.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

/**
 * The card's shadow on the stage: a soft dark plane behind it that follows its
 * position and scale (the stage sets those) but not its spin. The stage sets
 * `material.opacity` from the pose and theme.
 */
export const CardShadow = forwardRef<THREE.Mesh>(function CardShadow(_, ref) {
  const texture = useMemo(() => shadowTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        toneMapped: false,
      }),
    [texture],
  );
  useEffect(
    () => () => {
      material.dispose();
      texture.dispose();
    },
    [material, texture],
  );
  return (
    <mesh
      ref={ref}
      material={material}
      position={[SHADOW_OFFSET.x * DEPTH_SCALE, SHADOW_OFFSET.y * DEPTH_SCALE, SHADOW_Z]}
      scale={DEPTH_SCALE}
    >
      <planeGeometry args={[CARD_W + PAD * 2, CARD_H + PAD * 2]} />
    </mesh>
  );
});
