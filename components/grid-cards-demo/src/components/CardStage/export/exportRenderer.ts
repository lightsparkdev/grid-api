/* The card rendered for a picture, not the stage: the same mesh, materials,
   and studio, through an export camera into an offscreen target at any size.
   The frame comes back as pixels on transparency, ready to composite.

   Why the same renderer: the environment's PMREM, the face maps, and the
   compiled programs all belong to the stage's WebGL context; a second
   renderer would build them all again (seconds, and twice the GPU memory).
   So the export borrows the context between the stage's frames: it moves the
   card to the origin, poses it, renders to its own targets, and puts
   everything back before returning. Nothing about it is asynchronous, so
   the stage never sees the card out of place. */

import * as THREE from 'three';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { RootState } from '@react-three/fiber';
import { footprint } from '@/apps/card/cardMetrics';
import type { Orientation } from '@/data/design';
import { ORIENT_ROLL } from '../cardMotion';
import type { CardMeshUserData } from '../card3d/CardMesh';

/** The stage camera's distance; the export keeps the same perspective so the
 *  card's foreshortening matches what the visitor saw. Scene units are px. */
const CAMERA_Z = 2000;
/** The card's tone mapping exposure on the stage, by the backdrop it sits on. */
export const EXPOSURE_LIGHT = 1.25;
export const EXPOSURE_DARK = 1.0;

/** How the card is held for the picture, degrees, in the stage's terms
 *  (`CardMotion`): rotX pitches the top edge toward the viewer when positive,
 *  rotY turns the right edge away when positive. The orientation's roll is
 *  added underneath. */
export interface ExportPose {
  rotX: number;
  rotY: number;
  rotZ?: number;
}

export interface ExportFrameOptions {
  width: number;
  height: number;
  pose: ExportPose;
  /** The card's long edge as a fraction of the frame's matching dimension
   *  (its width for a flat card, its height for an upright one). */
  cardFrac: number;
  exposure: number;
}

interface Deps {
  get: () => RootState;
  /** The stage's carrier (position and scale) and the card inside it (rotation). */
  carrier: THREE.Group;
  group: THREE.Group;
  orientation: () => Orientation;
  /** How the card is turned on the stage right now (its pitch and spin). */
  livePose: () => ExportPose;
  /** The stage paints its next frame regardless of the render gate. */
  markDirty: () => void;
}

/** A pixel readback with straight (un-premultiplied) alpha, rows top down. */
export interface ExportFrame {
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
}

export class CardExporter {
  private sceneRT: THREE.WebGLRenderTarget | null = null;
  private outRT: THREE.WebGLRenderTarget | null = null;
  private readonly output = new OutputPass();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 200, 6000);
  private buffer: Uint8Array | null = null;
  private multisample = true;

  constructor(private readonly deps: Deps) {
    this.camera.position.set(0, 0, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);
  }

  /** The card is a finished picture: painted, nothing loading, no material
   *  change mid-wipe. */
  get ready(): boolean {
    const f = this.deps.group.userData as CardMeshUserData;
    return !!f.painted && !f.pending && !f.swapInFlight;
  }

  get orientation(): Orientation {
    return this.deps.orientation();
  }

  /** The card as it is turned on the stage, for a picture of what is seen. */
  get livePose(): ExportPose {
    return this.deps.livePose();
  }

  private targets(width: number, height: number) {
    if (this.sceneRT && this.sceneRT.width === width && this.sceneRT.height === height) {
      return { scene: this.sceneRT, out: this.outRT! };
    }
    this.sceneRT?.dispose();
    this.outRT?.dispose();
    // The scene renders linear, in half floats, so the tone map has the
    // highlights to work with; the output pass writes bytes in sRGB.
    this.sceneRT = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      samples: this.multisample ? 4 : 0,
      depthBuffer: true,
      stencilBuffer: false,
    });
    this.outRT = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.UnsignedByteType,
      colorSpace: THREE.SRGBColorSpace,
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.buffer = new Uint8Array(width * height * 4);
    return { scene: this.sceneRT, out: this.outRT };
  }

  /**
   * Render one frame. Synchronous: the card is moved, rendered, and put back
   * before this returns.
   */
  render(opts: ExportFrameOptions): ExportFrame {
    const { get, carrier, group, markDirty } = this.deps;
    const { gl, scene } = get();
    const { width, height, pose, cardFrac, exposure } = opts;
    const orientation = this.orientation;

    // Frame the card: its long edge takes `cardFrac` of the frame.
    const foot = footprint(orientation);
    const aspect = width / height;
    let worldW: number;
    let worldH: number;
    if (foot.w >= foot.h) {
      worldW = foot.w / cardFrac;
      worldH = worldW / aspect;
    } else {
      worldH = foot.h / cardFrac;
      worldW = worldH * aspect;
    }
    this.camera.aspect = aspect;
    this.camera.fov = (2 * Math.atan(worldH / 2 / CAMERA_Z) * 180) / Math.PI;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    // Save the stage's arrangement and the renderer's state.
    const savedPos = carrier.position.clone();
    const savedScale = carrier.scale.clone();
    const savedRot = group.rotation.clone();
    const savedTarget = gl.getRenderTarget();
    const savedExposure = gl.toneMappingExposure;
    const savedClear = new THREE.Color();
    gl.getClearColor(savedClear);
    const savedClearAlpha = gl.getClearAlpha();
    const savedAutoClear = gl.autoClear;

    try {
      carrier.position.set(0, 0, 0);
      carrier.scale.setScalar(1);
      group.rotation.set(
        THREE.MathUtils.degToRad(pose.rotX),
        THREE.MathUtils.degToRad(pose.rotY),
        THREE.MathUtils.degToRad((pose.rotZ ?? 0) + ORIENT_ROLL[orientation]),
      );
      carrier.updateMatrixWorld(true);
      // Layers that light themselves from the camera (the hologram).
      group.traverse((o) => {
        const update = (o.userData as { updateView?: (c: THREE.Camera) => void }).updateView;
        if (update) update(this.camera);
      });

      const { scene: sceneRT, out } = this.targets(width, height);
      gl.toneMappingExposure = exposure;
      gl.setClearColor(0x000000, 0);
      gl.autoClear = true;
      gl.setRenderTarget(sceneRT);
      gl.clear();
      gl.render(scene, this.camera);
      // Tone map and encode, as the stage's canvas would.
      this.output.render(gl, out, sceneRT, 0, false);
      gl.readRenderTargetPixels(out, 0, 0, width, height, this.buffer!);
    } finally {
      gl.setRenderTarget(savedTarget);
      gl.toneMappingExposure = savedExposure;
      gl.setClearColor(savedClear, savedClearAlpha);
      gl.autoClear = savedAutoClear;
      carrier.position.copy(savedPos);
      carrier.scale.copy(savedScale);
      group.rotation.copy(savedRot);
      carrier.updateMatrixWorld(true);
      markDirty();
    }

    // Rows come up bottom first, and an edge's samples resolve to
    // premultiplied color: turn both around for the 2D canvas.
    const src = this.buffer!;
    const data = new Uint8ClampedArray(new ArrayBuffer(width * height * 4));
    const rowBytes = width * 4;
    for (let y = 0; y < height; y++) {
      const from = (height - 1 - y) * rowBytes;
      const to = y * rowBytes;
      for (let x = 0; x < rowBytes; x += 4) {
        const a = src[from + x + 3];
        if (a === 0) continue;
        if (a === 255) {
          data[to + x] = src[from + x];
          data[to + x + 1] = src[from + x + 1];
          data[to + x + 2] = src[from + x + 2];
        } else {
          const k = 255 / a;
          data[to + x] = src[from + x] * k;
          data[to + x + 1] = src[from + x + 1] * k;
          data[to + x + 2] = src[from + x + 2] * k;
        }
        data[to + x + 3] = a;
      }
    }
    return { width, height, data };
  }

  /** A render that fails under multisampling (a context without half-float
   *  MSAA) is retried without. */
  renderSafe(opts: ExportFrameOptions): ExportFrame {
    try {
      return this.render(opts);
    } catch (e) {
      if (!this.multisample) throw e;
      this.multisample = false;
      this.sceneRT?.dispose();
      this.sceneRT = null;
      return this.render(opts);
    }
  }

  dispose() {
    this.sceneRT?.dispose();
    this.outRT?.dispose();
    this.output.dispose();
    this.sceneRT = null;
    this.outRT = null;
    this.buffer = null;
  }
}
