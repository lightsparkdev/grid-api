'use client';

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  materialOf,
  STOCKS,
  stockOf,
  type BrandLayout,
  type CardDesign,
  type CardMaterial,
  type CardStock,
  type Orientation,
} from '@/data/design';
import { canvasTexture } from './canvasTexture';
import { createCardGeometry, MAT_BACK, MAT_EDGE, MAT_FRONT } from './cardGeometry';
import { blankStudioTexture, foilStudioTexture } from './CardEnv';
import { layerFrame } from './faceFrame';
import { doveFrame, HoloDove } from './HoloDove';
import {
  cellAt,
  createSwapUniforms,
  FRONT_REST,
  FRONT_START,
  grain,
  passed,
  patchFaceMaterial,
  WIPE_HOLD,
  WIPE_MS,
} from './materialSwap';
import { MaterialSwarm } from './MaterialSwarm';
import {
  brandBox,
  brandRegion,
  loadFaceAssets,
  loadImage,
  lockupBox,
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
  paintFrontLockupMask,
  paintLockupMask,
  resolveBrandLayout,
  TEX_H,
  TEX_W,
  type FaceAssets,
  type SpecRect,
} from './facePaint';
import { bakeEdge, decorateNormal, decorateOrm, surfaceKey, surfaceOf, type Surface } from './surfaceMaps';
import { canBakeOffThread, loadSurfaceMaps, surfaceMapsReady, type BakeJob } from './surfaceBakeClient';

export interface CardMeshState {
  design: CardDesign;
  issued: boolean;
  frozen: boolean;
  closed: boolean;
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

/** The least of a feature that keeps its shader branch compiled in. */
const SHADER_KEEP = 1e-4;

/** Per-surface material constants beyond the maps: the coat, the base's own
 *  specular, and the relief. A gloss laminate is one interface: the coat
 *  reflects and the print under it only scatters, so the base's specular is
 *  off and the color reads deep between the highlights. A matte laminate
 *  scatters the room across its whole face, which lifts and dulls the color
 *  a little: that is what matte looks like. */
const SURFACE: Record<Surface, { clearcoat: number; clearcoatRoughness: number; specular: number; sheen: number; normalScale: number }> = {
  // The sheen is the matte laminate's dusty scatter toward the eye at a
  // glancing view: a faint white lift over the color, as a matte print has.
  'print-matte': { clearcoat: 0, clearcoatRoughness: 0, specular: 1, sheen: 0.25, normalScale: 0.6 },
  'print-gloss': { clearcoat: 1, clearcoatRoughness: 0.06, specular: 0, sheen: 0, normalScale: 0.35 },
  // The Z card runs its grain at 1.6, but under this studio's key that reads
  // as stucco; 0.6 is the same fine, even speckle its diffuse room gives.
  'bare-matte': { clearcoat: 0, clearcoatRoughness: 0, specular: 1, sheen: 0, normalScale: 0.6 },
  'bare-gloss': { clearcoat: 0, clearcoatRoughness: 0, specular: 1, sheen: 0, normalScale: 0.4 },
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
/** The background surface bakes start this long after the face assets land:
 *  past the intro (the blueprint draws and the card comes into focus). */
const BAKE_START_DELAY_MS = 4500;
/** No pointer input for this long counts as a quiet moment for a bake. */
const BAKE_QUIET_MS = 700;
/** How long an idle request may wait before it runs regardless. */
const BAKE_IDLE_TIMEOUT_MS = 8000;

const FOIL = { roughness: 0.04, envMapIntensity: 1.1, normalScale: 1 };
/** The mark's plane on the mesh (center in card px, size, roll) for the card
 *  as held: the back's texture is mirrored in u and the composed back turns
 *  with the card, both of which `layerFrame` accounts for. */
function foilFrame(orientation: Orientation) {
  return layerFrame(orientation, 'back', lockupBox(orientation));
}

function FoilMark({
  assets,
  backZ,
  black,
  orientation,
  visible,
  materialRef,
}: {
  assets: FaceAssets;
  backZ: number;
  black: boolean;
  orientation: Orientation;
  /** Hidden, not unmounted, when the mark is printed on the front: the
   *  program and maps stay ready for the switch back. */
  visible: boolean;
  /** A material change prints the foil with the graphics. */
  materialRef: React.MutableRefObject<THREE.MeshPhysicalMaterial | null>;
}) {
  // One material for the life of the mark. Its albedo alone follows `black`
  // (silver foil or black lacquer) and is swapped in place below: a new
  // material per change threw away the only user of its shader program, and
  // the next preset compiled the same program again, a quarter-second stall
  // on every switch between a print card and a bare one.
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
    // `black` is read once here; the effect below keeps the albedo current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets]);
  const paintedBlack = useRef(black);
  useEffect(() => {
    if (paintedBlack.current === black) return;
    paintedBlack.current = black;
    const old = material.map;
    material.map = canvasTexture(paintFoilAlbedo(black), true);
    old?.dispose();
  }, [black, material]);
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
  const frame = foilFrame(orientation);
  return (
    <mesh
      position={[frame.x, frame.y, backZ - 0.08]}
      rotation={[0, Math.PI, frame.rotZ]}
      material={material}
      visible={visible}
    >
      <planeGeometry args={[frame.w, frame.h]} />
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
   *  runs along the card's long axis, left to right on screen for a flat card
   *  whichever face shows). Absent, the body swaps at once. */
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
  /** Dev: hold the clock (`__cardSwap.get().paused = true`) to pose a frame. */
  paused?: boolean;
}

const easeInOutSine = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;

/** The steel blank's stock, for the change only: the finished card's steel
 *  (`STOCKS[2]`), a shade cooler and brighter, as mill stainless is. */
const BLANK_STEEL: CardStock = { ...STOCKS[2], face: '#d3d5da' };

export const CardMesh = forwardRef<THREE.Group, CardMeshProps>(function CardMesh(
  { state, onReady, onBrandPlacement, swapContext },
  ref,
) {
  const invalidate = useThree((s) => s.invalidate);
  const three = useThree((s) => s.get);
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

  // The wipe's fronts, shared by both faces; each face owns its layer maps.
  const swapU = useMemo(() => {
    const front = createSwapUniforms();
    front.uBareMap.value = bareFrontMap;
    front.uBaseMap.value = baseFrontMap;
    const back = createSwapUniforms(front);
    back.uBareMap.value = bareBackMap;
    back.uBaseMap.value = baseBackMap;
    return { front, back, shared: front };
  }, [bareFrontMap, bareBackMap, baseFrontMap, baseBackMap]);

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
  // Bake the other surfaces ahead, so the first switch to metal or gloss
  // does not pay for its maps on the click. In the worker the bakes cost
  // the page nothing, so they run back to back from the moment the artwork
  // is in, the bead-blast steel (the Z card, the heaviest and the one whose
  // etched mark would otherwise show up a beat late) first. Where the page
  // must bake them itself, each is a frame or two of work (more in WebKit),
  // so the queue waits out the intro and runs only in quiet moments: idle
  // time with a long timeout, or, without idle callbacks (WebKit), a pause
  // in the pointer.
  // The maps for the surface land asynchronously (the bake worker); this
  // counts the times they have, for the decoration effect below to lay its
  // treatment over the maps that are actually on the material, and for the
  // queue here to start once the card's own maps are in (the worker takes
  // one bake at a time; the card's come first).
  const [mapsVersion, setMapsVersion] = useState(0);
  useEffect(() => {
    if (!assets || mapsVersion === 0) return;
    // [surface, side, plain, mark, orientation]. The plain bakes (the body
    // alone) are the blank and the base a material change wipes through.
    const jobs: Array<[Surface, 'front' | 'back', boolean, boolean, Orientation]> = [];
    for (const s of ['bare-matte', 'print-gloss', 'bare-gloss', 'print-matte'] as Surface[]) {
      for (const side of ['front', 'back'] as const) {
        jobs.push([s, side, false, true, 'landscape']);
        jobs.push([s, side, true, true, 'landscape']);
      }
      // The back with the mark on an upright card, and without the foil mark
      // (for a front-marked card; the same either way up).
      jobs.push([s, 'back', false, true, 'portrait']);
      jobs.push([s, 'back', false, false, 'landscape']);
    }
    const asJob = (job: (typeof jobs)[number]): BakeJob => ({
      surface: job[0],
      side: job[1],
      plain: job[2],
      mark: job[3],
      orientation: job[4],
    });
    if (canBakeOffThread()) {
      let cancelled = false;
      const next = () => {
        const job = jobs.shift();
        if (!job || cancelled) return;
        loadSurfaceMaps(asJob(job), assets).then(next, next);
      };
      next();
      return () => {
        cancelled = true;
      };
    }
    let lastInput = performance.now();
    const onInput = () => {
      lastInput = performance.now();
    };
    window.addEventListener('pointermove', onInput, { passive: true });
    window.addEventListener('pointerdown', onInput, { passive: true });
    window.addEventListener('wheel', onInput, { passive: true });
    let timer = 0;
    let idle = 0;
    const hasIdle = typeof requestIdleCallback === 'function';
    const quiet = () => performance.now() - lastInput > BAKE_QUIET_MS;
    const runOne = () => {
      const job = jobs.shift();
      if (!job) return;
      loadSurfaceMaps(asJob(job), assets).then(schedule, schedule);
    };
    const schedule = () => {
      if (hasIdle) {
        idle = requestIdleCallback(() => (quiet() ? runOne() : schedule()), { timeout: BAKE_IDLE_TIMEOUT_MS });
      } else {
        timer = window.setTimeout(() => (quiet() ? runOne() : schedule()), BAKE_QUIET_MS);
      }
    };
    timer = window.setTimeout(schedule, BAKE_START_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      if (hasIdle && idle) cancelIdleCallback(idle);
      window.removeEventListener('pointermove', onInput);
      window.removeEventListener('pointerdown', onInput);
      window.removeEventListener('wheel', onInput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, mapsVersion > 0]);
  // The back carries the foil mark's carrier and metal only while the mark
  // is there; with the mark on the front, the hologram layer has its own.
  const backMark = bodyDesign.visaMark === 'back';
  const orientation = bodyDesign.orientation;
  // The front has painted and the card wants to report ready, but its
  // surface maps hadn't landed yet: the maps effect reports for it.
  const readyWanted = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!assets) return;
    const c = SURFACE[surface];
    // Every map this surface needs, for either face: the surface's own, and
    // the blank's and the base's for the material change.
    const jobs: Array<[BakeJob, 'orm' | 'normal' | 'both']> = [];
    const job = (s: Surface, side: 'front' | 'back', plain: boolean, mark: boolean): BakeJob => ({
      surface: s,
      side,
      plain,
      mark,
      orientation,
    });
    for (const side of ['front', 'back'] as const) {
      jobs.push([job(surface, side, false, side === 'front' || backMark), 'both']);
      jobs.push([job(bareSurface, side, true, true), 'both']);
      jobs.push([job(baseSurface, side, true, true), 'both']);
    }
    let cancelled = false;
    let raf = 0;
    // Textures made here and not yet on the GPU: they go up one per frame
    // before the material takes them, so the frame that switches surfaces
    // isn't also the frame that uploads six 2048px maps.
    const fresh: THREE.Texture[] = [];
    const texturesFor = (j: BakeJob) => {
      const key = surfaceKey(j.surface, j.side, j.plain, j.mark, orientation);
      let t = surfaceTex.current.get(key);
      if (!t) {
        const m = surfaceMapsReady(j);
        if (!m) return null;
        t = { orm: canvasTexture(m.orm), normal: canvasTexture(m.normal) };
        surfaceTex.current.set(key, t);
        fresh.push(t.orm, t.normal);
      }
      return t;
    };
    const apply = () => {
      for (const [side, idx, u] of [
        ['front', MAT_FRONT, swapU.front],
        ['back', MAT_BACK, swapU.back],
      ] as const) {
        const t = texturesFor(job(surface, side, false, side === 'front' || backMark))!;
        const mat = materials[idx];
        mat.roughnessMap = t.orm;
        mat.metalnessMap = t.orm;
        mat.normalMap = t.normal;
        mat.normalScale.set(c.normalScale, c.normalScale);
        // Never exactly zero: three compiles a different program when a coat
        // or a sheen is present at all, and a recompile stalls the frame at a
        // finish change. A trace of each keeps one program for every surface.
        mat.clearcoat = Math.max(SHADER_KEEP, c.clearcoat);
        mat.clearcoatRoughness = c.clearcoatRoughness;
        mat.specularIntensity = c.specular;
        mat.sheen = Math.max(SHADER_KEEP, c.sheen);
        mat.sheenRoughness = 0.9;
        mat.sheenColor.set('#ffffff');
        mat.needsUpdate = true;
        // The blank and the base are the body before anything is laid on or
        // set into it: no stripe, no mark, no chip pocket. The chip arrives
        // with the graphics.
        const bare = texturesFor(job(bareSurface, side, true, true))!;
        u.uBareOrm.value = bare.orm;
        u.uBareNormal.value = bare.normal;
        const base = texturesFor(job(baseSurface, side, true, true))!;
        u.uBaseOrm.value = base.orm;
        u.uBaseNormal.value = base.normal;
      }
      invalidate();
      setMapsVersion((v) => v + 1);
      const announce = readyWanted.current;
      readyWanted.current = null;
      announce?.();
    };
    // Wrap every map in a texture (fresh ones are queued for upload), send
    // the fresh ones up a frame apiece, then switch the material over.
    const stage = () => {
      for (const [j] of jobs) texturesFor(j);
      const { gl } = three();
      const uploadNext = () => {
        if (cancelled) return;
        // Two a frame: a map's upload is well inside a frame's budget.
        const pair = fresh.splice(0, 2);
        if (pair.length) {
          for (const t of pair) gl.initTexture(t);
          raf = requestAnimationFrame(uploadNext);
          return;
        }
        apply();
      };
      // The first paint (nothing on the material yet) can't wait a frame per
      // map: the ready path uploads for it. Later switches stage.
      if (materials[MAT_FRONT].roughnessMap === null) {
        fresh.length = 0;
        apply();
      } else {
        uploadNext();
      }
    };
    // All baked already (a second visit, or the background got there first):
    // straight on. Otherwise the worker bakes what is missing and the
    // material keeps its last maps until the new ones land together.
    if (jobs.every(([j]) => surfaceMapsReady(j))) {
      stage();
    } else {
      Promise.all(jobs.map(([j]) => loadSurfaceMaps(j, assets))).then(() => {
        if (!cancelled) stage();
      });
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [assets, surface, bareSurface, baseSurface, backMark, orientation, materials, swapU, invalidate, three]);

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
  // art, and the front Visa lockup's ink on bare steel, laid over the
  // front's cached maps per design.
  const { logoTreatment, artTreatment } = state.design;
  const frontInk = !backMark && surface.startsWith('bare');
  const decoTex = useRef<{ orm: THREE.Texture | null; normal: THREE.Texture | null }>({ orm: null, normal: null });
  useEffect(() => {
    if (!assets || frontPending) return;
    const front = materials[MAT_FRONT];
    const base = surfaceTex.current.get(surfaceKey(surface, 'front', false, true, orientation));
    // Not yet baked: this runs again when the maps land (mapsVersion).
    if (!base) return;
    decoTex.current.orm?.dispose();
    decoTex.current.normal?.dispose();
    decoTex.current = { orm: null, normal: null };
    const brandT = logoTreatment === 'print' ? null : logoTreatment;
    const artT = art && artTreatment === 'spotGloss';
    const brandMask = brandT ? paintBrandMask(bodyDesign, logo) : null;
    if (!brandT && !artT && !frontInk) {
      front.roughnessMap = base.orm;
      front.metalnessMap = base.orm;
    } else {
      const decorated = canvasTexture(
        decorateOrm(
          base.orm.image as HTMLCanvasElement, // a canvas, or the worker's bitmap: both draw
          brandMask,
          brandT,
          artT && art ? paintArtMask(art, orientation) : null,
          cardMaterial === 'metal',
          frontInk ? paintFrontLockupMask(assets, orientation) : null,
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
  }, [
    assets,
    surface,
    bodyDesign,
    orientation,
    cardMaterial,
    logoTreatment,
    artTreatment,
    frontInk,
    logo,
    art,
    frontPending,
    materials,
    invalidate,
    mapsVersion,
  ]);

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
    paintFront(
      frontCanvas.getContext('2d')!,
      {
        design: bodyDesign,
        logo,
        art,
        frozen: state.frozen,
        closed: state.closed,
      },
      assets,
    );
    frontMap.needsUpdate = true;
    invalidate();
    onBrandPlacement?.({ box: brandBox(bodyDesign, logo), layout: resolveBrandLayout(bodyDesign, logo) });
    if (!ready.current) {
      ready.current = true;
      // Before the card is shown, its textures go up to the GPU one frame at
      // a time and its programs compile off the main thread (where the
      // browser allows), so the intro's first frame is not the frame that
      // uploads a dozen 2048px maps and links the shaders: that was a
      // quarter-second hitch as the blueprint began. If the surface maps
      // haven't landed yet (they bake in a worker), this waits for them.
      const { gl, scene, camera } = three();
      const textures = new Set<THREE.Texture>();
      for (const m of materials) {
        for (const v of Object.values(m)) if (v instanceof THREE.Texture) textures.add(v);
      }
      for (const u of [swapU.front, swapU.back]) {
        for (const x of Object.values(u)) if (x?.value instanceof THREE.Texture) textures.add(x.value);
      }
      const queue = Array.from(textures);
      let raf = 0;
      const uploadNext = () => {
        const t = queue.shift();
        if (t) {
          gl.initTexture(t);
          raf = requestAnimationFrame(uploadNext);
          return;
        }
        const compiled = typeof gl.compileAsync === 'function' ? gl.compileAsync(scene, camera) : Promise.resolve();
        compiled.catch(() => undefined).then(() => onReady?.());
      };
      const surfaceMapsOn = materials[MAT_FRONT].roughnessMap !== null;
      if (surfaceMapsOn) raf = requestAnimationFrame(uploadNext);
      else readyWanted.current = () => requestAnimationFrame(uploadNext);
      return () => cancelAnimationFrame(raf);
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
    three,
    materials,
    swapU,
  ]);

  // Back print.
  useEffect(() => {
    if (!assets) return;
    paintBack(
      backCanvas.getContext('2d')!,
      {
        design: bodyDesign,
        personalized,
        frozen: state.frozen,
        closed: state.closed,
      },
      assets,
    );
    backMap.needsUpdate = true;
    invalidate();
  }, [assets, bodyDesign, personalized, state.frozen, state.closed, backCanvas, backMap, invalidate]);

  // ── Material change ────────────────────────────────────────────────────────
  // Three fronts wipe the face left to right, the way a card is made: the
  // new stock as a blank (made of its particles), then the print's base, then
  // the graphics. The slab is rebuilt as the new material once the blank
  // covers the face, when nothing of either print is showing.
  const swarm = useMemo(() => new MaterialSwarm(), []);
  useEffect(() => () => swarm.dispose(), [swarm]);
  const swap = useRef<Swap | null>(null);
  // The back's layers (the foil mark, the hologram): each prints with the
  // graphics at its own cell's moment.
  const foilMaterial = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const doveMaterial = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const layers = useMemo(() => {
    const foil = foilFrame(orientation);
    return [
      { ref: foilMaterial, center: foil },
      { ref: doveMaterial, center: assets ? doveFrame(assets, orientation) : foil },
    ];
  }, [assets, orientation]);
  const targetMaterial = state.design.material;

  useEffect(() => {
    const cur = swap.current;
    const { shared } = swapU;
    const rest = () => {
      swap.current = null;
      swarm.end();
      shared.uFront.value = FRONT_REST;
      shared.uBase.value = FRONT_REST;
      shared.uPrint.value = FRONT_REST;
      for (const l of layers) if (l.ref.current) l.ref.current.opacity = 1;
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
    // The sweep runs along local +x. Flat, that is screen-right on the front
    // and screen-left on the back, so the back's is reversed to read left to
    // right; upright, local +x points down the screen from either side.
    const dir = ctx.backShowing && state.design.orientation === 'landscape' ? -1 : 1;
    shared.uDir.value = dir;
    // The base layer is the new design's ground, painted for this change.
    paintBaseFront(baseFrontCanvas.getContext('2d')!, state.design, art);
    paintBaseBack(baseBackCanvas.getContext('2d')!, state.design);
    baseFrontMap.needsUpdate = true;
    baseBackMap.needsUpdate = true;
    // Redirected mid-wipe: the fronts carry on where they are, and the body
    // is rebuilt again for the new target.
    const t = cur ? cur.t : 0;
    swarm.begin(targetMaterial, newStock.face, dir, state.design.orientation, [frontCanvas, backCanvas]);
    shared.uBareSteel.value = targetMaterial === 'metal' ? 1 : 0;
    swap.current = { t, to: targetMaterial, dir, committed: false };
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
    swapContext,
    layers,
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
    // The back's layers print with the graphics, each at its cell's moment.
    for (const l of layers) {
      const m = l.ref.current;
      if (!m) continue;
      const cell = cellAt(grain(), l.center.x, l.center.y);
      m.opacity = 1 - passed(shared.uFront.value, cell, sw.dir) + passed(shared.uPrint.value, cell, sw.dir);
    }
    if (pass(2) >= 1) {
      swap.current = null;
      swarm.end();
      shared.uFront.value = FRONT_REST;
      shared.uBase.value = FRONT_REST;
      shared.uPrint.value = FRONT_REST;
      for (const l of layers) if (l.ref.current) l.ref.current.opacity = 1;
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
      <mesh geometry={geometry} material={materials} visible={assets !== null} />
      {assets && (
        <>
          <FoilMark
            assets={assets}
            backZ={backZ}
            black={foilIsBlack(bodyDesign)}
            orientation={orientation}
            visible={backMark}
            materialRef={foilMaterial}
          />
          <HoloDove
            assets={assets}
            backZ={backZ}
            orientation={orientation}
            visible={!backMark}
            materialRef={doveMaterial}
          />
        </>
      )}
      <primitive object={swarm.stock} />
      <primitive object={swarm.dust} />
    </group>
  );
});
