'use client';

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import {
  materialOf,
  STOCKS,
  stockOf,
  type BrandLayout,
  type CardDesign,
  type CardMaterial,
  type CardStock,
} from '@/data/design';
import { createCardGeometry, faceZOf, MAT_BACK, MAT_EDGE, MAT_FRONT } from './cardGeometry';
import { blankStudioTexture, foilStudioTexture } from './CardEnv';
import { ChipLayer, paintChipMask } from './ChipLayer';
import {
  cellAt,
  createSwapUniforms,
  FRONT_REST,
  FRONT_START,
  grain,
  passed,
  patchFaceMaterial,
  turnOf,
  WIPE_HOLD,
  WIPE_MS,
} from './materialSwap';
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
  paintBare,
  paintBaseBack,
  paintBaseFront,
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
/** The mark's center in the mesh's frame. The back's texture is mirrored in
 *  u, so canvas x runs toward local -x. */
const FOIL_CENTER = {
  x: -((LOCKUP.x + LOCKUP.w / 2) / TEX_W - 0.5) * CARD_W,
  y: (0.5 - (LOCKUP.y + LOCKUP.h / 2) / TEX_H) * CARD_H,
};

function FoilMark({
  assets,
  backZ,
  black,
  materialRef,
}: {
  assets: FaceAssets;
  backZ: number;
  black: boolean;
  /** A material change prints the foil with the graphics. */
  materialRef: React.MutableRefObject<THREE.MeshPhysicalMaterial | null>;
}) {
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
  useEffect(() => {
    materialRef.current = material;
    return () => {
      if (materialRef.current === material) materialRef.current = null;
    };
  }, [material, materialRef]);
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
  const w = LOCKUP.w / K;
  const h = LOCKUP.h / K;
  return (
    <mesh position={[FOIL_CENTER.x, FOIL_CENTER.y, backZ - 0.08]} rotation={[0, Math.PI, 0]} material={material}>
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
  dir: number;
  /** The body has been rebuilt as `to` (once the blank covers the face). */
  committed: boolean;
  /** When the print passed the chip's pocket (ms into the change), once it has. */
  chipAt: number | null;
  /** Dev: hold the clock (`__cardSwap.get().paused = true`) to pose a frame. */
  paused?: boolean;
}

const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;

/** The chip press on the body at full: how far in (card px) and how far
 *  over toward the chip's corner (degrees; a hover at a corner is 9°). */
const PRESS_SINK = 2.5;
const PRESS_TILT_DEG = 8;

/** The steel blank's stock, for the change only: the finished card's steel
 *  (`STOCKS[2]`), a shade cooler and brighter, as mill stainless is. */
const BLANK_STEEL: CardStock = { ...STOCKS[2], face: '#d3d5da' };

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
  // A material change's layers: the blank body, and the print's base.
  const bareFrontCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const bareBackCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const baseFrontCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const baseBackCanvas = useMemo(() => makeCanvas(TEX_W, TEX_H), []);
  const bareFrontMap = useMemo(() => canvasTexture(bareFrontCanvas, true), [bareFrontCanvas]);
  const bareBackMap = useMemo(() => canvasTexture(bareBackCanvas, true), [bareBackCanvas]);
  const baseFrontMap = useMemo(() => canvasTexture(baseFrontCanvas, true), [baseFrontCanvas]);
  const baseBackMap = useMemo(() => canvasTexture(baseBackCanvas, true), [baseBackCanvas]);

  // The chip's pocket, as the front's mask (the back has no chip).
  const chipMask = useMemo(() => canvasTexture(paintChipMask()), []);
  const noMask = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  }, []);

  // The wipe's fronts, shared by both faces; each face owns its layer maps.
  const swapU = useMemo(() => {
    const front = createSwapUniforms();
    front.uBareMap.value = bareFrontMap;
    front.uBaseMap.value = baseFrontMap;
    front.uChipMask.value = chipMask;
    const back = createSwapUniforms(front);
    back.uBareMap.value = bareBackMap;
    back.uBaseMap.value = baseBackMap;
    back.uChipMask.value = noMask;
    return { front, back, shared: front };
  }, [bareFrontMap, bareBackMap, baseFrontMap, baseBackMap, chipMask, noMask]);

  // The chip itself, set into the card after the print.
  const chip = useMemo(() => new ChipLayer(frontMap, chipMask), [frontMap, chipMask]);
  useEffect(() => () => chip.dispose(), [chip]);

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
  // shows the new material's stock as a blank (polished steel whatever the
  // finish, since the finish is the coat, which a blank hasn't had; or PVC),
  // then the new print's surface without its effects under the base.
  const surface = surfaceOf(bodyDesign);
  const bareSurface: Surface = state.design.material === 'metal' ? 'bare-gloss' : `print-${state.design.finish}`;
  const baseSurface = surfaceOf(state.design);
  useEffect(() => {
    if (!assets) return;
    const c = SURFACE[surface];
    const maps = (s: Surface, side: 'front' | 'back', plain = false) => {
      const key = `${s}|${side}|${plain}`;
      let t = surfaceTex.current.get(key);
      if (!t) {
        const m = getSurfaceMaps(s, side, assets, plain);
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
      // The blank and the base are the body before anything is laid on or
      // set into it: no stripe, no mark, no chip pocket (that is milled, and
      // the module set, after the print).
      const bare = maps(bareSurface, side, true);
      u.uBareOrm.value = bare.orm;
      u.uBareNormal.value = bare.normal;
      const base = maps(baseSurface, side, true);
      u.uBaseOrm.value = base.orm;
      u.uBaseNormal.value = base.normal;
    }
    invalidate();
  }, [assets, surface, bareSurface, baseSurface, materials, swapU, invalidate]);

  // The blank's room, as a PMREM in the scene environment's layout, so
  // polished steel has something to reflect.
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = blankStudioTexture();
    const target = pmrem.fromEquirectangular(room);
    room.dispose();
    pmrem.dispose();
    swapU.shared.uBareEnv.value = target.texture;
    return () => {
      swapU.shared.uBareEnv.value = null;
      target.dispose();
    };
  }, [gl, swapU]);

  // The bare body's albedo: the new stock, both faces. Plastic shows as the
  // white PVC blank whatever the print (a dark print's black core would wipe
  // black over black and say nothing); steel as a blank a shade cooler and
  // brighter than the finished card's stock, as mill stainless is next to
  // the finished part.
  const newStock = state.design.material === 'metal' ? BLANK_STEEL : STOCKS[0];
  useEffect(() => {
    if (!assets) return;
    paintBare(bareFrontCanvas.getContext('2d')!, newStock);
    paintBare(bareBackCanvas.getContext('2d')!, newStock);
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
    const base = surfaceTex.current.get(`${surface}|front|false`);
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
  // Three fronts wipe the face left to right, the way a card is made: the
  // new stock as a blank (made of its particles), then the print's base, then
  // the graphics. The slab is rebuilt as the new material once the blank
  // covers the face, when nothing of either print is showing.
  const swarm = useMemo(() => new MaterialSwarm(), []);
  useEffect(() => () => swarm.dispose(), [swarm]);
  const swap = useRef<Swap | null>(null);
  const foilMaterial = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const targetMaterial = state.design.material;

  // The body under the placement head: the press (0..1) pushes it in and
  // rocks it about its center toward the chip's corner, about as far as a
  // hover at that corner tilts it, so the chip's spot dips most. On an inner
  // group, since the rig owns the outer one's rotation every frame.
  const body = useRef<THREE.Group>(null);
  const pressBody = useCallback(
    (press: number) => {
      const b = body.current;
      if (!b) return;
      const { x, y } = chip.center;
      b.position.z = -PRESS_SINK * press;
      // About y, z' = -x sin a: a negative a takes a point at negative x in.
      b.rotation.y = Math.sign(x) * THREE.MathUtils.degToRad(PRESS_TILT_DEG) * press;
      // About x, z' = y sin b: a negative b takes a point at positive y in.
      // The chip is only a little above center, so less of it.
      b.rotation.x = -Math.sign(y) * THREE.MathUtils.degToRad(PRESS_TILT_DEG * (Math.abs(y) / Math.abs(x))) * press;
    },
    [chip],
  );
  useEffect(() => {
    const cur = swap.current;
    const { shared } = swapU;
    const rest = () => {
      swap.current = null;
      swarm.end();
      chip.hide();
      pressBody(0);
      shared.uFront.value = FRONT_REST;
      shared.uBase.value = FRONT_REST;
      shared.uPrint.value = FRONT_REST;
      shared.uChipHide.value = 0;
      if (foilMaterial.current) foilMaterial.current.opacity = 1;
    };
    if (targetMaterial === bodyMaterial) {
      // Changed back before the body was rebuilt: nothing to do after all.
      if (cur && cur.to !== targetMaterial) rest();
      return;
    }
    if (cur?.to === targetMaterial) return;
    const ctx = swapContext?.();
    if (!ready.current || frontPending || !ctx?.animate) {
      rest();
      setBodyMaterial(targetMaterial);
      return;
    }
    const dir = ctx.backShowing ? -1 : 1;
    shared.uDir.value = dir;
    // The base layer is the new design's ground, painted for this change.
    paintBaseFront(baseFrontCanvas.getContext('2d')!, state.design, art);
    paintBaseBack(baseBackCanvas.getContext('2d')!, state.design);
    baseFrontMap.needsUpdate = true;
    baseBackMap.needsUpdate = true;
    // Redirected mid-wipe: the fronts carry on where they are, and the body
    // is rebuilt again for the new target.
    const t = cur ? cur.t : 0;
    swarm.begin(targetMaterial, newStock.face, dir, [frontCanvas, backCanvas]);
    shared.uChipHide.value = 1;
    shared.uBareSteel.value = targetMaterial === 'metal' ? 1 : 0;
    swap.current = { t, to: targetMaterial, dir, committed: false, chipAt: null };
  }, [
    targetMaterial,
    bodyMaterial,
    state.design,
    art,
    frontPending,
    newStock,
    frontCanvas,
    backCanvas,
    baseFrontCanvas,
    baseBackCanvas,
    baseFrontMap,
    baseBackMap,
    swapU,
    swarm,
    chip,
    swapContext,
    pressBody,
  ]);

  useFrame((frame, delta) => {
    const sw = swap.current;
    if (!sw) return;
    if (!sw.paused) sw.t += Math.min(50, delta * 1000);
    const { shared } = swapU;
    const pass = (n: number) => Math.min(1, Math.max(0, (sw.t - n * (WIPE_MS + WIPE_HOLD)) / WIPE_MS));
    const travel = (p: number) => FRONT_START + easeInOutSine(p) * (FRONT_REST - FRONT_START);
    const p1 = pass(0);
    const front = travel(p1);
    shared.uFront.value = front;
    shared.uBase.value = travel(pass(1));
    shared.uPrint.value = travel(pass(2));
    // The particles' clock runs on past the pass, at the pass's pace, so the
    // last dust can finish floating off.
    const particleFront = sw.t <= WIPE_MS ? front : FRONT_REST + ((sw.t - WIPE_MS) / WIPE_MS) * (FRONT_REST - FRONT_START);
    if (swarm.finished(particleFront)) swarm.end();
    else swarm.update(particleFront, frame.gl.domElement.height);
    // The blank covers the face: rebuild the body as the new material.
    if (p1 >= 1 && !sw.committed) {
      sw.committed = true;
      setBodyMaterial(sw.to);
    }
    // The foil prints with the graphics, at its cell's moment.
    const foil = foilMaterial.current;
    if (foil) {
      const cell = cellAt(grain(), FOIL_CENTER.x, FOIL_CENTER.y);
      foil.opacity = 1 - passed(shared.uFront.value, cell, sw.dir) + passed(shared.uPrint.value, cell, sw.dir);
    }
    // The chip is set once the print has passed its pocket: from then the
    // placement head comes down on its own clock, and the change waits for
    // it. The press pushes the whole body in a little.
    chip.sync(materials[MAT_FRONT]);
    const chipTurn = turnOf(cellAt(grain(), chip.center.x, chip.center.y), sw.dir);
    if (sw.chipAt === null && shared.uPrint.value > chipTurn + 0.06) sw.chipAt = sw.t;
    const chipMs = sw.chipAt === null ? 0 : sw.t - sw.chipAt;
    const press = chip.pose(chipMs, faceZOf(sw.to));
    pressBody(press);
    if (pass(2) >= 1 && chipMs >= ChipLayer.duration) {
      swap.current = null;
      swarm.end();
      chip.hide();
      pressBody(0);
      shared.uFront.value = FRONT_REST;
      shared.uBase.value = FRONT_REST;
      shared.uPrint.value = FRONT_REST;
      shared.uChipHide.value = 0;
      if (foil) foil.opacity = 1;
    }
    invalidate();
  });

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
      baseFrontMap.dispose();
      baseBackMap.dispose();
      surfaceTex.current.forEach((t) => {
        t.orm.dispose();
        t.normal.dispose();
      });
      decoTex.current.orm?.dispose();
      decoTex.current.normal?.dispose();
      edgeTex.current?.albedo.dispose();
      edgeTex.current?.orm.dispose();
    },
    [materials, frontMap, backMap, bareFrontMap, bareBackMap, baseFrontMap, baseBackMap],
  );

  return (
    <group ref={ref}>
      <group ref={body}>
        <mesh geometry={geometry} material={materials} visible={assets !== null} />
        {assets && (
          <FoilMark assets={assets} backZ={backZ} black={foilIsBlack(bodyDesign)} materialRef={foilMaterial} />
        )}
        <primitive object={swarm.stock} />
        <primitive object={swarm.dust} />
        <primitive object={chip.mesh} />
      </group>
    </group>
  );
});
