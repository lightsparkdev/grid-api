'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CardDesign, CardFinish } from '@/data/design';
import { createCardGeometry, MAT_BACK, MAT_EDGE, MAT_FRONT } from './cardGeometry';
import {
  loadFaceAssets,
  loadImage,
  makeCanvas,
  paintBack,
  paintFront,
  TEX_H,
  TEX_W,
  type FaceAssets,
} from './facePaint';
import { getFoilMaps, getSurfaceMaps } from './surfaceMaps';

export interface CardMeshState {
  design: CardDesign;
  issued: boolean;
  frozen: boolean;
  closed: boolean;
  /** PAN groups revealed on the back (0..4; 5 = expiry and CVV). */
  shown: number;
}

/** Per-finish material constants beyond the maps. */
const FINISH: Record<
  CardFinish,
  { clearcoat: number; clearcoatRoughness: number; envMapIntensity: number; normalScale: number; edge: string; edgeMetal: number; edgeRough: number }
> = {
  matte: { clearcoat: 0, clearcoatRoughness: 0, envMapIntensity: 0.9, normalScale: 0.6, edge: '#e9e9ec', edgeMetal: 0, edgeRough: 0.55 },
  metal: { clearcoat: 0, clearcoatRoughness: 0, envMapIntensity: 1.35, normalScale: 1.4, edge: '#d4d4d8', edgeMetal: 1, edgeRough: 0.18 },
  glass: { clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.55, normalScale: 0.35, edge: '#e9e9ec', edgeMetal: 0, edgeRough: 0.5 },
};

function canvasTexture(c: HTMLCanvasElement, srgb = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/**
 * The one card. Front and back are painted to canvases from the design and
 * the cardholder state and uploaded as the face maps; the surface (roughness,
 * metalness, relief, foil) comes from the per-finish bakes. The parent group
 * is positioned and rotated by the stage.
 */
export const CardMesh = forwardRef<THREE.Group, { state: CardMeshState; onReady?: () => void }>(
  function CardMesh({ state, onReady }, ref) {
    const invalidate = useThree((s) => s.invalidate);
    const geometry = useMemo(() => createCardGeometry(), []);
    const [assets, setAssets] = useState<FaceAssets | null>(null);
    const [logo, setLogo] = useState<{ url: string | null; img: HTMLImageElement | null }>({ url: null, img: null });

    // One canvas per face for the life of the mesh; repaints upload in place.
    const frontCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
    const backCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
    const frontMap = useMemo(() => canvasTexture(frontCanvas, true), [frontCanvas]);
    const backMap = useMemo(() => canvasTexture(backCanvas, true), [backCanvas]);

    const materials = useMemo(() => {
      const face = () =>
        new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          metalness: 1,
          roughness: 1,
          iridescence: 1,
          iridescenceIOR: 1.7,
          iridescenceThicknessRange: [120, 760],
        });
      const mats: THREE.MeshPhysicalMaterial[] = [];
      mats[MAT_BACK] = face();
      mats[MAT_FRONT] = face();
      mats[MAT_EDGE] = new THREE.MeshPhysicalMaterial({ color: '#e9e9ec', roughness: 0.55 });
      mats[MAT_BACK].map = backMap;
      mats[MAT_FRONT].map = frontMap;
      return mats;
    }, [frontMap, backMap]);

    useEffect(() => {
      loadFaceAssets().then(setAssets);
    }, []);

    // Surface textures are cached per finish and face for the session.
    const surfaceTex = useRef(new Map<string, { orm: THREE.Texture; normal: THREE.Texture }>());
    const foilTex = useRef<{ mask: THREE.Texture; thickness: THREE.Texture } | null>(null);

    // The uploaded logo, if any.
    useEffect(() => {
      const url = state.design.logoUrl;
      if (!url) {
        setLogo({ url: null, img: null });
        return;
      }
      let alive = true;
      loadImage(url).then((img) => {
        if (alive) setLogo({ url, img });
      });
      return () => {
        alive = false;
      };
    }, [state.design.logoUrl]);

    // Surface: finish-dependent maps and constants on both faces and the edge.
    const finish = state.design.finish;
    useEffect(() => {
      if (!assets) return;
      if (!foilTex.current) {
        const f = getFoilMaps(assets);
        foilTex.current = { mask: canvasTexture(f.mask), thickness: canvasTexture(f.thickness) };
      }
      const c = FINISH[finish];
      for (const [side, idx] of [
        ['front', MAT_FRONT],
        ['back', MAT_BACK],
      ] as const) {
        const key = `${finish}|${side}`;
        let t = surfaceTex.current.get(key);
        if (!t) {
          const m = getSurfaceMaps(finish, side, assets);
          t = { orm: canvasTexture(m.orm), normal: canvasTexture(m.normal) };
          surfaceTex.current.set(key, t);
        }
        const mat = materials[idx];
        mat.roughnessMap = t.orm;
        mat.metalnessMap = t.orm;
        mat.normalMap = t.normal;
        mat.normalScale.set(c.normalScale, c.normalScale);
        mat.iridescenceMap = foilTex.current.mask;
        mat.iridescenceThicknessMap = foilTex.current.thickness;
        mat.clearcoat = c.clearcoat;
        mat.clearcoatRoughness = c.clearcoatRoughness;
        mat.envMapIntensity = c.envMapIntensity;
        mat.needsUpdate = true;
      }
      const edge = materials[MAT_EDGE];
      edge.color.set(c.edge);
      edge.metalness = c.edgeMetal;
      edge.roughness = c.edgeRough;
      invalidate();
    }, [assets, finish, materials, invalidate]);

    // Front print.
    const ready = useRef(false);
    const logoImg = logo.url === state.design.logoUrl ? logo.img : null;
    useEffect(() => {
      if (!assets) return;
      paintFront(
        frontCanvas.getContext('2d')!,
        { design: state.design, logo: logoImg, issued: state.issued, frozen: state.frozen, closed: state.closed },
        assets,
      );
      frontMap.needsUpdate = true;
      invalidate();
      if (!ready.current) {
        ready.current = true;
        onReady?.();
      }
    }, [assets, state.design, logoImg, state.issued, state.frozen, state.closed, frontCanvas, frontMap, invalidate, onReady]);

    // Back print.
    useEffect(() => {
      if (!assets) return;
      paintBack(
        backCanvas.getContext('2d')!,
        { design: state.design, shown: state.shown, frozen: state.frozen, closed: state.closed },
        assets,
      );
      backMap.needsUpdate = true;
      invalidate();
    }, [assets, state.design, state.shown, state.frozen, state.closed, backCanvas, backMap, invalidate]);

    useEffect(
      () => () => {
        materials.forEach((m) => m.dispose());
        frontMap.dispose();
        backMap.dispose();
        surfaceTex.current.forEach((t) => {
          t.orm.dispose();
          t.normal.dispose();
        });
        foilTex.current?.mask.dispose();
        foilTex.current?.thickness.dispose();
        geometry.dispose();
      },
      [materials, frontMap, backMap, geometry],
    );

    return (
      <group ref={ref}>
        <mesh geometry={geometry} material={materials} visible={assets !== null} />
      </group>
    );
  },
);
