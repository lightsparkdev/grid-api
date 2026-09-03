'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { brandStops } from '@/apps/shared/brand/brandPalette';
import type { CardDesign } from '@/data/design';
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
import { bakeEdge, getSurfaceMaps, surfaceOf, type Surface } from './surfaceMaps';

export interface CardMeshState {
  design: CardDesign;
  issued: boolean;
  frozen: boolean;
  closed: boolean;
  /** PAN groups revealed on the back (0..4; 5 = expiry and CVV). */
  shown: number;
}

/** The last 4 fades in on ACTIVE: this long, in this many repaints. */
const LAST4_FADE_MS = 450;
const LAST4_FADE_STEPS = 6;

/** Per-surface material constants beyond the maps: the coat and how much
 *  studio the face reflects. */
const SURFACE: Record<
  Surface,
  { clearcoat: number; clearcoatRoughness: number; envMapIntensity: number; normalScale: number }
> = {
  'plastic-matte': { clearcoat: 0, clearcoatRoughness: 0, envMapIntensity: 0.9, normalScale: 0.6 },
  'plastic-gloss': { clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.55, normalScale: 0.35 },
  'metal-matte': { clearcoat: 0, clearcoatRoughness: 0, envMapIntensity: 1.35, normalScale: 1.4 },
  'metal-gloss': { clearcoat: 0, clearcoatRoughness: 0, envMapIntensity: 1.2, normalScale: 0.4 },
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
    // Thickness follows the material, so the slab is rebuilt when it changes.
    const cardMaterial = state.design.material;
    const geometry = useMemo(() => createCardGeometry(cardMaterial), [cardMaterial]);
    useEffect(() => () => geometry.dispose(), [geometry]);
    const [assets, setAssets] = useState<FaceAssets | null>(null);
    const [logo, setLogo] = useState<{ url: string | null; img: HTMLImageElement | null }>({ url: null, img: null });

    // One canvas per face for the life of the mesh; repaints upload in place.
    const frontCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
    const backCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
    const frontMap = useMemo(() => canvasTexture(frontCanvas, true), [frontCanvas]);
    const backMap = useMemo(() => canvasTexture(backCanvas, true), [backCanvas]);

    const materials = useMemo(() => {
      const face = () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: 1 });
      const mats: THREE.MeshPhysicalMaterial[] = [];
      mats[MAT_BACK] = face();
      mats[MAT_FRONT] = face();
      // The edge reads its layers from a strip (albedo + roughness/metalness).
      mats[MAT_EDGE] = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: 1 });
      mats[MAT_BACK].map = backMap;
      mats[MAT_FRONT].map = frontMap;
      return mats;
    }, [frontMap, backMap]);

    useEffect(() => {
      loadFaceAssets().then(setAssets);
    }, []);

    // Surface textures are cached per surface and face for the session.
    const surfaceTex = useRef(new Map<string, { orm: THREE.Texture; normal: THREE.Texture }>());

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

    // Surface: material- and finish-dependent maps and constants on both faces.
    const surface = surfaceOf(state.design.material, state.design.finish);
    useEffect(() => {
      if (!assets) return;
      const c = SURFACE[surface];
      for (const [side, idx] of [
        ['front', MAT_FRONT],
        ['back', MAT_BACK],
      ] as const) {
        const key = `${surface}|${side}`;
        let t = surfaceTex.current.get(key);
        if (!t) {
          const m = getSurfaceMaps(surface, side, assets);
          t = { orm: canvasTexture(m.orm), normal: canvasTexture(m.normal) };
          surfaceTex.current.set(key, t);
        }
        const mat = materials[idx];
        mat.roughnessMap = t.orm;
        mat.metalnessMap = t.orm;
        mat.normalMap = t.normal;
        mat.normalScale.set(c.normalScale, c.normalScale);
        mat.clearcoat = c.clearcoat;
        mat.clearcoatRoughness = c.clearcoatRoughness;
        mat.envMapIntensity = c.envMapIntensity;
        mat.needsUpdate = true;
      }
      invalidate();
    }, [assets, surface, materials, invalidate]);

    // Edge: the construction's layers, the printed skins in the card's deep tone.
    const edgeSkin = brandStops(state.design.color, state.design.colorEnd).deep;
    const edgeTex = useRef<{ albedo: THREE.Texture; orm: THREE.Texture } | null>(null);
    useEffect(() => {
      const strips = bakeEdge(cardMaterial, edgeSkin);
      edgeTex.current?.albedo.dispose();
      edgeTex.current?.orm.dispose();
      const albedo = canvasTexture(strips.albedo, true);
      const orm = canvasTexture(strips.orm);
      edgeTex.current = { albedo, orm };
      const edge = materials[MAT_EDGE];
      edge.map = albedo;
      edge.roughnessMap = orm;
      edge.metalnessMap = orm;
      edge.envMapIntensity = cardMaterial === 'metal' ? 1.3 : 0.9;
      edge.needsUpdate = true;
      invalidate();
    }, [cardMaterial, edgeSkin, materials, invalidate]);

    // The last 4 fades in over LAST4_FADE_MS when the card goes ACTIVE (a few
    // repaints); it is simply there or not otherwise.
    const [lastFour, setLastFour] = useState(state.issued ? 1 : 0);
    const wasIssued = useRef(state.issued);
    useEffect(() => {
      if (!state.issued) {
        wasIssued.current = false;
        setLastFour(0);
        return;
      }
      if (wasIssued.current) return;
      wasIssued.current = true;
      const t0 = performance.now();
      let raf = 0;
      let lastStep = -1;
      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / LAST4_FADE_MS);
        const step = Math.floor(u * LAST4_FADE_STEPS);
        if (step !== lastStep) {
          lastStep = step;
          setLastFour(step / LAST4_FADE_STEPS);
        }
        if (u < 1) raf = requestAnimationFrame(tick);
        else setLastFour(1);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [state.issued]);

    // Front print.
    const ready = useRef(false);
    const logoImg = logo.url === state.design.logoUrl ? logo.img : null;
    useEffect(() => {
      if (!assets) return;
      paintFront(frontCanvas.getContext('2d')!, {
        design: state.design,
        logo: logoImg,
        lastFour,
        frozen: state.frozen,
        closed: state.closed,
      });
      frontMap.needsUpdate = true;
      invalidate();
      if (!ready.current) {
        ready.current = true;
        onReady?.();
      }
    }, [assets, state.design, logoImg, lastFour, state.frozen, state.closed, frontCanvas, frontMap, invalidate, onReady]);

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
        edgeTex.current?.albedo.dispose();
        edgeTex.current?.orm.dispose();
      },
      [materials, frontMap, backMap],
    );

    return (
      <group ref={ref}>
        <mesh geometry={geometry} material={materials} visible={assets !== null} />
      </group>
    );
  },
);
