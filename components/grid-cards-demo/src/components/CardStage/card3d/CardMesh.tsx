'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import {
  isBare,
  materialOf,
  STOCKS,
  stockOf,
  type BrandLayout,
  type CardDesign,
  type CardMaterial,
} from '@/data/design';
import { createCardGeometry, MAT_BACK, MAT_EDGE, MAT_FRONT } from './cardGeometry';
import { foilStudioTexture } from './CardEnv';
import { createSwapUniforms, FRONT_REST, FRONT_START, patchFaceMaterial, WIPE_HOLD, WIPE_MS } from './materialSwap';
import { MaterialSwarm } from './MaterialSwarm';
import {
  brandBox,
  brandRegion,
  K,
  loadFaceAssets,
  loadImage,
  LOCKUP,
  makeCanvas,
  paintArtMask,
  paintBack,
  paintBareBack,
  paintBareFront,
  paintBrandMask,
  foilIsBlack,
  paintFoilAlbedo,
  paintFoilNormal,
  paintFront,
  paintLockupMask,
  resolveBrandLayout,
  TEX_H,
  TEX_W,
  type FaceAssets,
  type SpecRect,
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

/** The brand's box on the front and the layout it was drawn with, so the
 *  stage can hit-test it and start a drag from where it is. */
export interface BrandPlacement {
  box: SpecRect;
  layout: BrandLayout;
}

/** Personalization prints on ACTIVE: this long, in this many repaints. */
const PRINT_MS = 450;
const PRINT_STEPS = 6;

/** Per-surface material constants beyond the maps: the coat and the relief. */
const SURFACE: Record<Surface, { clearcoat: number; clearcoatRoughness: number; normalScale: number }> = {
  'print-matte': { clearcoat: 0, clearcoatRoughness: 0, normalScale: 0.6 },
  'print-gloss': { clearcoat: 1, clearcoatRoughness: 0.08, normalScale: 0.35 },
  // The Z card runs its grain at 1.6, but under this studio's key that reads
  // as stucco; 0.6 is the same fine, even speckle its diffuse room gives.
  'bare-matte': { clearcoat: 0, clearcoatRoughness: 0, normalScale: 0.6 },
  'bare-gloss': { clearcoat: 0, clearcoatRoughness: 0, normalScale: 0.4 },
};

/** The image at `url` once loaded (null on failure or with no url), and
 *  whether it is still on its way: a face is not painted against a missing
 *  logo or art, or the wordmark and the color would flash first. */
function useLoadedImage(url: string | null): { img: HTMLImageElement | null; pending: boolean } {
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
  const settled = state.url === url;
  return { img: settled ? state.img : null, pending: !!url && !settled };
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
 * face the foil is black lacquer rather than silver: the same film, read by
 * its gloss and bevel.
 */
const FOIL = { roughness: 0.04, envMapIntensity: 1.1, normalScale: 1 };

function FoilMark({ assets, backZ, black }: { assets: FaceAssets; backZ: number; black: boolean }) {
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      metalness: 1,
      roughness: FOIL.roughness,
      transparent: true,
    });
    m.map = canvasTexture(paintFoilAlbedo(black), true);
    m.alphaMap = canvasTexture(paintLockupMask(assets));
    m.normalMap = canvasTexture(paintFoilNormal(assets));
    m.normalScale.set(FOIL.normalScale, FOIL.normalScale);
    m.envMap = foilStudioTexture();
    m.envMapIntensity = FOIL.envMapIntensity;
    m.depthWrite = false;
    return m;
  }, [assets, black]);
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
    <mesh position={[cx, cy, backZ - 0.08]} rotation={[0, Math.PI, 0]} material={material}>
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
  /** Fires after each front paint with where the brand landed. */
  onBrandPlacement?: (placement: BrandPlacement) => void;
  /** Whether a material change may play out (the card is floating, the intro
   *  is over, motion is allowed), and whether the back is showing (the wipe
   *  runs left to right on screen either way). Absent, the body swaps at once. */
  swapContext?: () => { animate: boolean; backShowing: boolean };
}

/** A material change in flight. */
interface Swap {
  /** ms since it began. */
  t: number;
  to: CardMaterial;
  /** Dev: hold the clock (`__cardSwap.get().paused = true`) to pose a frame. */
  paused?: boolean;
}

const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;

export const CardMesh = forwardRef<THREE.Group, CardMeshProps>(function CardMesh(
  { state, onReady, onBrandPlacement, swapContext },
  ref,
) {
  const invalidate = useThree((s) => s.invalidate);
  // The body's material lags the design's through a change: the wipe shows
  // the new stock, and the slab is rebuilt as it finishes.
  const [bodyMaterial, setBodyMaterial] = useState<CardMaterial>(state.design.material);
  const bodyDesign = useMemo(
    () => (state.design.material === bodyMaterial ? state.design : { ...state.design, material: bodyMaterial }),
    [state.design, bodyMaterial],
  );
  // Thickness follows the material, so the slab is rebuilt when it changes.
  const cardMaterial = materialOf(bodyDesign);
  const geometry = useMemo(() => createCardGeometry(cardMaterial), [cardMaterial]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // The back face's plane (the bevel makes the slab deeper than its depth).
  const backZ = useMemo(() => {
    geometry.computeBoundingBox();
    return geometry.boundingBox!.min.z;
  }, [geometry]);
  const [assets, setAssets] = useState<FaceAssets | null>(null);
  const { img: logo, pending: logoPending } = useLoadedImage(state.design.logoUrl);
  const { img: art, pending: artPending } = useLoadedImage(state.design.backgroundUrl);
  // The front waits for its images; the last paint stays up meanwhile.
  const frontPending = logoPending || artPending;

  // One canvas per face for the life of the mesh; repaints upload in place.
  const frontCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const backCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const frontMap = useMemo(() => canvasTexture(frontCanvas, true), [frontCanvas]);
  const backMap = useMemo(() => canvasTexture(backCanvas, true), [backCanvas]);
  // The bare body under the print, for the assembly beat of a material change.
  const bareFrontCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const bareBackCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const bareFrontMap = useMemo(() => canvasTexture(bareFrontCanvas, true), [bareFrontCanvas]);
  const bareBackMap = useMemo(() => canvasTexture(bareBackCanvas, true), [bareBackCanvas]);

  // The wipe's front, shared by both faces; each face owns its bare maps.
  const swapU = useMemo(() => {
    const front = createSwapUniforms();
    front.uBareMap.value = bareFrontMap;
    const back = createSwapUniforms(front);
    back.uBareMap.value = bareBackMap;
    return { front, back, shared: front };
  }, [bareFrontMap, bareBackMap]);

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
    patchFaceMaterial(mats[MAT_FRONT], swapU.front);
    patchFaceMaterial(mats[MAT_BACK], swapU.back);
    return mats;
  }, [frontMap, backMap, swapU]);

  useEffect(() => {
    loadFaceAssets().then(setAssets);
  }, []);
  // Surface textures are cached per surface and face for the session.
  const surfaceTex = useRef(new Map<string, { orm: THREE.Texture; normal: THREE.Texture }>());

  // Surface: print or bare metal, matte or gloss, on both faces. The wipe
  // shows the new material's stock as a blank: polished steel whatever the
  // finish (the finish is the coat, which the blank hasn't had), or PVC.
  const surface = surfaceOf(bodyDesign);
  const bareSurface: Surface = state.design.material === 'metal' ? 'bare-gloss' : `print-${state.design.finish}`;
  useEffect(() => {
    if (!assets) return;
    const c = SURFACE[surface];
    const maps = (s: Surface, side: 'front' | 'back') => {
      const key = `${s}|${side}`;
      let t = surfaceTex.current.get(key);
      if (!t) {
        const m = getSurfaceMaps(s, side, assets);
        t = { orm: canvasTexture(m.orm), normal: canvasTexture(m.normal) };
        surfaceTex.current.set(key, t);
      }
      return t;
    };
    for (const [side, idx, u] of [
      ['front', MAT_FRONT, swapU.front],
      ['back', MAT_BACK, swapU.back],
    ] as const) {
      const t = maps(surface, side);
      const mat = materials[idx];
      mat.roughnessMap = t.orm;
      mat.metalnessMap = t.orm;
      mat.normalMap = t.normal;
      mat.normalScale.set(c.normalScale, c.normalScale);
      mat.clearcoat = c.clearcoat;
      mat.clearcoatRoughness = c.clearcoatRoughness;
      mat.needsUpdate = true;
      const bare = maps(bareSurface, side);
      u.uBareOrm.value = bare.orm;
      u.uBareNormal.value = bare.normal;
    }
    invalidate();
  }, [assets, surface, bareSurface, materials, swapU, invalidate]);

  // The bare body's albedo: the new stock, with the chip set into the front.
  // Plastic shows as the white PVC blank whatever the print (a dark print's
  // black core would wipe black over black and say nothing).
  const newStock = state.design.material === 'metal' ? stockOf(state.design) : STOCKS[0];
  useEffect(() => {
    if (!assets) return;
    paintBareFront(bareFrontCanvas.getContext('2d')!, newStock);
    paintBareBack(bareBackCanvas.getContext('2d')!, newStock);
    bareFrontMap.needsUpdate = true;
    bareBackMap.needsUpdate = true;
  }, [assets, newStock, bareFrontCanvas, bareBackCanvas, bareFrontMap, bareBackMap]);

  // Decoration: spot gloss, foil, or etch on the brand, spot gloss on the
  // art, laid over the front's cached maps per design.
  const { logoTreatment, artTreatment } = state.design;
  const decoTex = useRef<{ orm: THREE.Texture | null; normal: THREE.Texture | null }>({ orm: null, normal: null });
  useEffect(() => {
    if (!assets || frontPending) return;
    const front = materials[MAT_FRONT];
    const base = surfaceTex.current.get(`${surface}|front`);
    if (!base) return;
    decoTex.current.orm?.dispose();
    decoTex.current.normal?.dispose();
    decoTex.current = { orm: null, normal: null };
    const brandT = logoTreatment === 'print' ? null : logoTreatment;
    const artT = art && artTreatment === 'spotGloss';
    const brandMask = brandT ? paintBrandMask(bodyDesign, logo) : null;
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
          cardMaterial === 'metal',
        ),
      );
      decoTex.current.orm = decorated;
      front.roughnessMap = decorated;
      front.metalnessMap = decorated;
    }
    if (brandT === 'etch' && brandMask) {
      // The relief is a per-texel bake, confined to the brand's own texels so
      // it keeps up with a drag.
      const relief = canvasTexture(
        decorateNormal(base.normal.image as HTMLCanvasElement, brandMask, brandRegion(bodyDesign, logo)),
      );
      decoTex.current.normal = relief;
      front.normalMap = relief;
    } else {
      front.normalMap = base.normal;
    }
    front.needsUpdate = true;
    invalidate();
  }, [assets, surface, bodyDesign, cardMaterial, logoTreatment, artTreatment, logo, art, frontPending, materials, invalidate]);

  // Edge: the construction's layers, the printed skins in the print color (or
  // the stock's own face when nothing is printed).
  const stock = stockOf(bodyDesign);
  const edgeSkin = bodyDesign.color ?? stock.face;
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
    if (!assets || frontPending) return;
    paintFront(frontCanvas.getContext('2d')!, {
      design: bodyDesign,
      logo,
      art,
      frozen: state.frozen,
      closed: state.closed,
    });
    frontMap.needsUpdate = true;
    invalidate();
    onBrandPlacement?.({ box: brandBox(bodyDesign, logo), layout: resolveBrandLayout(bodyDesign, logo) });
    if (!ready.current) {
      ready.current = true;
      onReady?.();
    }
  }, [
    assets,
    bodyDesign,
    logo,
    art,
    state.frozen,
    state.closed,
    frontPending,
    frontCanvas,
    frontMap,
    invalidate,
    onReady,
    onBrandPlacement,
  ]);

  // Back print.
  useEffect(() => {
    if (!assets) return;
    paintBack(
      backCanvas.getContext('2d')!,
      {
        design: bodyDesign,
        personalized,
        shown: state.shown,
        frozen: state.frozen,
        closed: state.closed,
      },
      assets,
    );
    backMap.needsUpdate = true;
    invalidate();
  }, [assets, bodyDesign, personalized, state.shown, state.frozen, state.closed, backCanvas, backMap, invalidate]);

  // ── Material change ────────────────────────────────────────────────────────
  // A slanted front wipes the face left to right and leaves the new stock
  // bare; a second front follows and the print is back behind it. The slab is
  // rebuilt as the new material when the wipes have passed (its thickness and
  // edge, which the face doesn't show head-on).
  const swarm = useMemo(() => new MaterialSwarm(), []);
  useEffect(() => () => swarm.dispose(), [swarm]);
  const swap = useRef<Swap | null>(null);
  const targetMaterial = state.design.material;
  const newIsBare = isBare(state.design);
  useEffect(() => {
    if (targetMaterial === bodyMaterial) return;
    const cur = swap.current;
    if (cur?.to === targetMaterial) return;
    const { shared } = swapU;
    const ctx = swapContext?.();
    if (!ready.current || !ctx?.animate) {
      swap.current = null;
      swarm.end();
      shared.uFront.value = FRONT_REST;
      shared.uClose.value = FRONT_REST;
      setBodyMaterial(targetMaterial);
      return;
    }
    const dir = ctx.backShowing ? -1 : 1;
    shared.uDir.value = dir;
    shared.uNewIsBare.value = newIsBare ? 1 : 0;
    // Redirected mid-wipe: the front carries on where it is.
    const t = cur ? cur.t : 0;
    swarm.begin(targetMaterial, newStock.face, dir);
    swap.current = { t, to: targetMaterial };
  }, [targetMaterial, bodyMaterial, newIsBare, newStock, swapU, swarm, swapContext]);

  useFrame((_, delta) => {
    const sw = swap.current;
    if (!sw) return;
    if (!sw.paused) sw.t += Math.min(50, delta * 1000);
    const { shared } = swapU;
    // First pass: the stock front, with the particles. Hold. Second pass:
    // the print's front.
    const p1 = Math.min(1, sw.t / WIPE_MS);
    const p2 = Math.min(1, Math.max(0, (sw.t - WIPE_MS - WIPE_HOLD) / WIPE_MS));
    const travel = (p: number) => FRONT_START + easeInOutSine(p) * (FRONT_REST - FRONT_START);
    const front = travel(p1);
    shared.uFront.value = front;
    shared.uClose.value = travel(p2);
    if (p1 < 1) swarm.update(front);
    else swarm.end();
    if (p2 >= 1) {
      swap.current = null;
      // The fronts stay past the far edge (the stock everywhere, for a None
      // color) until the rebuilt body has painted; then they rest.
      setBodyMaterial(sw.to);
    }
    invalidate();
  });
  useEffect(() => {
    swapU.shared.uFront.value = FRONT_REST;
    swapU.shared.uClose.value = FRONT_REST;
    swapU.shared.uNewIsBare.value = 0;
  }, [bodyMaterial, swapU]);

  // Dev: the wipe's clock and front, for tracing from the console.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    (window as unknown as Record<string, unknown>).__cardSwap = {
      get: () => swap.current,
      uniforms: swapU.shared,
    };
  }, [swapU]);

  useEffect(
    () => () => {
      materials.forEach((m) => m.dispose());
      frontMap.dispose();
      backMap.dispose();
      bareFrontMap.dispose();
      bareBackMap.dispose();
      surfaceTex.current.forEach((t) => {
        t.orm.dispose();
        t.normal.dispose();
      });
      decoTex.current.orm?.dispose();
      decoTex.current.normal?.dispose();
      edgeTex.current?.albedo.dispose();
      edgeTex.current?.orm.dispose();
    },
    [materials, frontMap, backMap, bareFrontMap, bareBackMap],
  );

  return (
    <group ref={ref}>
      <mesh geometry={geometry} material={materials} visible={assets !== null} />
      {assets && <FoilMark assets={assets} backZ={backZ} black={foilIsBlack(bodyDesign)} />}
      <primitive object={swarm.mesh} />
    </group>
  );
});
