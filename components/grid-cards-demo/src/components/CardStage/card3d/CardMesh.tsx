'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import { materialOf, stockOf, type CardDesign } from '@/data/design';
import { createCardGeometry, MAT_BACK, MAT_EDGE, MAT_FRONT } from './cardGeometry';
import { foilStudioTexture } from './CardEnv';
import {
  K,
  loadFaceAssets,
  loadImage,
  LOCKUP,
  makeCanvas,
  paintArtMask,
  paintBack,
  paintBrandMask,
  foilIsBlack,
  paintFoilAlbedo,
  paintFoilNormal,
  paintFront,
  paintLockupMask,
  TEX_H,
  TEX_W,
  type FaceAssets,
} from './facePaint';
import { bakeEdge, decorateNormal, decorateOrm, getSurfaceMaps, surfaceOf, type Surface } from './surfaceMaps';

export interface CardMeshState {
  design: CardDesign;
  issued: boolean;
  frozen: boolean;
  closed: boolean;
  /** PAN groups revealed on the back (0..4; 5 = expiry and CVV). */
  shown: number;
}

/** Personalization prints on ACTIVE: this long, in this many repaints. */
const PRINT_MS = 450;
const PRINT_STEPS = 6;

/** Per-surface material constants beyond the maps: the coat and the relief. */
const SURFACE: Record<Surface, { clearcoat: number; clearcoatRoughness: number; normalScale: number }> = {
  'print-matte': { clearcoat: 0, clearcoatRoughness: 0, normalScale: 0.6 },
  'print-gloss': { clearcoat: 1, clearcoatRoughness: 0.08, normalScale: 0.35 },
  'bare-matte': { clearcoat: 0, clearcoatRoughness: 0, normalScale: 1.6 },
  'bare-gloss': { clearcoat: 0, clearcoatRoughness: 0, normalScale: 0.4 },
};

/** The image at `url` once loaded; null while loading, on failure, or with no url. */
function useLoadedImage(url: string | null): HTMLImageElement | null {
  const [state, setState] = useState<{
    url: string | null;
    img: HTMLImageElement | null;
  }>({ url: null, img: null });
  useEffect(() => {
    if (!url) {
      setState({ url: null, img: null });
      return;
    }
    let alive = true;
    loadImage(url).then((img) => {
      if (alive) setState({ url, img });
    });
    return () => {
      alive = false;
    };
  }, [url]);
  return state.url === url ? state.img : null;
}

function canvasTexture(c: HTMLCanvasElement, srgb = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/**
 * The Visa mark's silver foil, as the layer it is: a film stamped onto the
 * back, a hair proud of the face, with its own material. It is a mirror, and
 * a mirror is only as interesting as what it reflects, so it has its own
 * environment (`foilStudioTexture`: panels and a window with edges) rather
 * than the card's shapeless studio, which in a mirror is flat gray. Its
 * normal map carries the letters' bevel and a faint waviness that bends the
 * reflections. A material's `envMapIntensity` is only honored when the map
 * is set on the material itself, which it is here. On bare metal or a light
 * bare stock the mark is black foil, painted into the face instead.
 */
const FOIL = { roughness: 0.04, envMapIntensity: 1.1, normalScale: 1 };

function FoilMark({ assets, backZ, visible }: { assets: FaceAssets; backZ: number; visible: boolean }) {
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      metalness: 1,
      roughness: FOIL.roughness,
      transparent: true,
    });
    m.map = canvasTexture(paintFoilAlbedo(), true);
    m.alphaMap = canvasTexture(paintLockupMask(assets));
    m.normalMap = canvasTexture(paintFoilNormal(assets));
    m.normalScale.set(FOIL.normalScale, FOIL.normalScale);
    m.envMap = foilStudioTexture();
    m.envMapIntensity = FOIL.envMapIntensity;
    m.depthWrite = false;
    return m;
  }, [assets]);
  useEffect(
    () => () => {
      material.map?.dispose();
      material.alphaMap?.dispose();
      material.normalMap?.dispose();
      material.envMap?.dispose();
      material.dispose();
    },
    [material],
  );
  // The back's texture is mirrored in u, so canvas x runs toward local -x.
  const w = LOCKUP.w / K;
  const h = LOCKUP.h / K;
  const cx = -((LOCKUP.x + LOCKUP.w / 2) / TEX_W - 0.5) * CARD_W;
  const cy = (0.5 - (LOCKUP.y + LOCKUP.h / 2) / TEX_H) * CARD_H;
  return (
    <mesh position={[cx, cy, backZ - 0.08]} rotation={[0, Math.PI, 0]} material={material} visible={visible}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
}

/**
 * The one card. Front and back are painted to canvases from the design and
 * the cardholder state and uploaded as the face maps; the surface (roughness,
 * metalness, relief, foil) comes from the per-finish bakes. The parent group
 * is positioned and rotated by the stage.
 */
interface CardMeshProps {
  state: CardMeshState;
  /** Fires once, when the front has first been painted. */
  onReady?: () => void;
}

export const CardMesh = forwardRef<THREE.Group, CardMeshProps>(function CardMesh({ state, onReady }, ref) {
  const invalidate = useThree((s) => s.invalidate);
  // Thickness follows the material, so the slab is rebuilt when it changes.
  const cardMaterial = materialOf(state.design);
  const geometry = useMemo(() => createCardGeometry(cardMaterial), [cardMaterial]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // The back face's plane (the bevel makes the slab deeper than its depth).
  const backZ = useMemo(() => {
    geometry.computeBoundingBox();
    return geometry.boundingBox!.min.z;
  }, [geometry]);
  const [assets, setAssets] = useState<FaceAssets | null>(null);
  const logo = useLoadedImage(state.design.logoUrl);
  const art = useLoadedImage(state.design.backgroundUrl);

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
      });
    const mats: THREE.MeshPhysicalMaterial[] = [];
    mats[MAT_BACK] = face();
    mats[MAT_FRONT] = face();
    // The edge reads its layers from a strip (albedo + roughness/metalness).
    mats[MAT_EDGE] = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 1,
      roughness: 1,
    });
    mats[MAT_BACK].map = backMap;
    mats[MAT_FRONT].map = frontMap;
    return mats;
  }, [frontMap, backMap]);

  useEffect(() => {
    loadFaceAssets().then(setAssets);
  }, []);
  // Surface textures are cached per surface and face for the session.
  const surfaceTex = useRef(new Map<string, { orm: THREE.Texture; normal: THREE.Texture }>());

  // Surface: print or bare metal, matte or gloss, on both faces.
  const surface = surfaceOf(state.design);
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
      mat.needsUpdate = true;
    }
    invalidate();
  }, [assets, surface, materials, invalidate]);

  // Decoration: spot gloss, foil, or etch on the brand, spot gloss on the
  // art, laid over the front's cached maps per design.
  const { logoTreatment, artTreatment } = state.design;
  const decoTex = useRef<{ orm: THREE.Texture | null; normal: THREE.Texture | null }>({ orm: null, normal: null });
  useEffect(() => {
    if (!assets) return;
    const front = materials[MAT_FRONT];
    const base = surfaceTex.current.get(`${surface}|front`);
    if (!base) return;
    decoTex.current.orm?.dispose();
    decoTex.current.normal?.dispose();
    decoTex.current = { orm: null, normal: null };
    const brandT = logoTreatment === 'print' ? null : logoTreatment;
    const artT = art && artTreatment === 'spotGloss';
    const brandMask = brandT ? paintBrandMask(state.design, logo) : null;
    if (!brandT && !artT) {
      front.roughnessMap = base.orm;
      front.metalnessMap = base.orm;
    } else {
      const decorated = canvasTexture(
        decorateOrm(
          base.orm.image as HTMLCanvasElement,
          brandMask,
          brandT,
          artT && art ? paintArtMask(art) : null,
          surface.startsWith('bare'),
        ),
      );
      decoTex.current.orm = decorated;
      front.roughnessMap = decorated;
      front.metalnessMap = decorated;
    }
    if (brandT === 'etch' && brandMask) {
      const relief = canvasTexture(decorateNormal(base.normal.image as HTMLCanvasElement, brandMask));
      decoTex.current.normal = relief;
      front.normalMap = relief;
    } else {
      front.normalMap = base.normal;
    }
    front.needsUpdate = true;
    invalidate();
  }, [assets, surface, state.design, logoTreatment, artTreatment, logo, art, materials, invalidate]);

  // Edge: the construction's layers, the printed skins in the print color (or
  // the stock's own face when nothing is printed).
  const stock = stockOf(state.design);
  const edgeSkin = state.design.color ?? stock.face;
  const edgeCore = stock.core;
  const edgeTex = useRef<{ albedo: THREE.Texture; orm: THREE.Texture } | null>(null);
  useEffect(() => {
    const strips = bakeEdge(cardMaterial, edgeCore, edgeSkin);
    edgeTex.current?.albedo.dispose();
    edgeTex.current?.orm.dispose();
    const albedo = canvasTexture(strips.albedo, true);
    const orm = canvasTexture(strips.orm);
    edgeTex.current = { albedo, orm };
    const edge = materials[MAT_EDGE];
    edge.map = albedo;
    edge.roughnessMap = orm;
    edge.metalnessMap = orm;
    edge.needsUpdate = true;
    invalidate();
  }, [cardMaterial, edgeCore, edgeSkin, materials, invalidate]);

  // Personalization (last 4 on the front, account data on the back) prints
  // over PRINT_MS when the card goes ACTIVE (a few repaints); it is simply
  // there or not otherwise.
  const [personalized, setPersonalized] = useState(state.issued ? 1 : 0);
  const wasIssued = useRef(state.issued);
  useEffect(() => {
    if (!state.issued) {
      wasIssued.current = false;
      setPersonalized(0);
      return;
    }
    if (wasIssued.current) return;
    wasIssued.current = true;
    const t0 = performance.now();
    let raf = 0;
    let lastStep = -1;
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / PRINT_MS);
      const step = Math.floor(u * PRINT_STEPS);
      if (step !== lastStep) {
        lastStep = step;
        setPersonalized(step / PRINT_STEPS);
      }
      if (u < 1) raf = requestAnimationFrame(tick);
      else setPersonalized(1);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.issued]);

  // Front print.
  const ready = useRef(false);
  useEffect(() => {
    if (!assets) return;
    paintFront(frontCanvas.getContext('2d')!, {
      design: state.design,
      logo,
      art,
      frozen: state.frozen,
      closed: state.closed,
    });
    frontMap.needsUpdate = true;
    invalidate();
    if (!ready.current) {
      ready.current = true;
      onReady?.();
    }
  }, [
    assets,
    state.design,
    logo,
    art,
    state.frozen,
    state.closed,
    frontCanvas,
    frontMap,
    invalidate,
    onReady,
  ]);

  // Back print.
  useEffect(() => {
    if (!assets) return;
    paintBack(
      backCanvas.getContext('2d')!,
      {
        design: state.design,
        personalized,
        shown: state.shown,
        frozen: state.frozen,
        closed: state.closed,
      },
      assets,
    );
    backMap.needsUpdate = true;
    invalidate();
  }, [assets, state.design, personalized, state.shown, state.frozen, state.closed, backCanvas, backMap, invalidate]);

  useEffect(
    () => () => {
      materials.forEach((m) => m.dispose());
      frontMap.dispose();
      backMap.dispose();
      surfaceTex.current.forEach((t) => {
        t.orm.dispose();
        t.normal.dispose();
      });
      decoTex.current.orm?.dispose();
      decoTex.current.normal?.dispose();
      edgeTex.current?.albedo.dispose();
      edgeTex.current?.orm.dispose();
    },
    [materials, frontMap, backMap],
  );

  return (
    <group ref={ref}>
      <mesh geometry={geometry} material={materials} visible={assets !== null} />
      {assets && <FoilMark assets={assets} backZ={backZ} visible={!foilIsBlack(state.design)} />}
    </group>
  );
});
