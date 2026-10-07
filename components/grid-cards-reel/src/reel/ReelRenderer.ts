/* One frame of the plate: the card posed at a run of instants across the
   shutter, each rendered linear in half floats and added into an
   accumulation target at an equal weight (the motion blur), then tone mapped
   and encoded once, as the playground's export does, and read back as
   straight-alpha pixels on transparency. */

import * as THREE from 'three';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { footprint } from '@/apps/card/cardMetrics';
import type { ReelFrame } from './reelTimeline';
import { CAMERA_Z, type SceneHandle } from './ReelScene';

export interface RenderOptions {
  size: number;
  /** The landscape card's width as a fraction of the frame. */
  cardFrac: number;
  exposure: number;
}

export interface Pixels {
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
}

const DEG = Math.PI / 180;

const accumulateMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null }, uWeight: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader:
      'uniform sampler2D tSrc; uniform float uWeight; varying vec2 vUv; void main() { gl_FragColor = texture2D(tSrc, vUv) * uWeight; }',
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneFactor,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
  });

export class ReelRenderer {
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 200, 6000);
  private readonly output = new OutputPass();
  private readonly quadScene = new THREE.Scene();
  private readonly quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  /** By size: the plate's, and the small one the settle check renders. */
  private readonly targets = new Map<
    number,
    { scene: THREE.WebGLRenderTarget; accum: THREE.WebGLRenderTarget; out: THREE.WebGLRenderTarget; buffer: Uint8Array }
  >();

  constructor(private readonly scene: SceneHandle) {
    this.camera.position.set(0, 0, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), accumulateMaterial());
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  private targetsFor(size: number) {
    const kept = this.targets.get(size);
    if (kept) return kept;
    const scene = new THREE.WebGLRenderTarget(size, size, { type: THREE.HalfFloatType, samples: 4, depthBuffer: true });
    const accum = new THREE.WebGLRenderTarget(size, size, { type: THREE.HalfFloatType, depthBuffer: false });
    // Plain bytes: the output pass writes sRGB-encoded values itself.
    const out = new THREE.WebGLRenderTarget(size, size, { type: THREE.UnsignedByteType, depthBuffer: false });
    const made = { scene, accum, out, buffer: new Uint8Array(size * size * 4) };
    this.targets.set(size, made);
    return made;
  }

  /** The camera for a frame of `size`: the landscape card's width takes `cardFrac` of it. */
  private frameCamera(o: RenderOptions) {
    const worldW = footprint('landscape').w / o.cardFrac;
    this.camera.aspect = 1;
    this.camera.fov = (2 * Math.atan(worldW / 2 / CAMERA_Z) * 180) / Math.PI;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  /** Put the card where the timeline has it. */
  pose(f: Omit<ReelFrame, 'index'>) {
    const { carrier, card } = this.scene;
    const cardH = footprint('landscape').h;
    carrier.position.set(0, f.y * cardH, f.z * CAMERA_Z);
    card.rotation.set(f.rotX * DEG, f.rotY * DEG, f.rotZ * DEG);
    carrier.updateMatrixWorld(true);
    card.traverse((o) => {
      const update = (o.userData as { updateView?: (c: THREE.Camera) => void }).updateView;
      if (update) update(this.camera);
    });
  }

  /** Render the instants in `poses` into one frame and read it back. */
  render(poses: Array<Omit<ReelFrame, 'index'>>, o: RenderOptions): Pixels {
    const { gl, scene } = this.scene.get();
    const t = this.targetsFor(o.size);
    this.frameCamera(o);

    const savedTarget = gl.getRenderTarget();
    const savedExposure = gl.toneMappingExposure;
    const savedClear = new THREE.Color();
    gl.getClearColor(savedClear);
    const savedClearAlpha = gl.getClearAlpha();
    const savedAutoClear = gl.autoClear;
    try {
      gl.toneMappingExposure = o.exposure;
      gl.setClearColor(0x000000, 0);
      gl.autoClear = false;
      gl.setRenderTarget(t.accum);
      gl.clear(true, false, false);
      const weight = 1 / poses.length;
      for (const p of poses) {
        this.pose(p);
        gl.setRenderTarget(t.scene);
        gl.clear(true, true, false);
        gl.render(scene, this.camera);
        this.quad.material.uniforms.tSrc.value = t.scene.texture;
        this.quad.material.uniforms.uWeight.value = weight;
        gl.setRenderTarget(t.accum);
        gl.render(this.quadScene, this.quadCamera);
      }
      gl.autoClear = true;
      this.output.render(gl, t.out, t.accum, 0, false);
      gl.readRenderTargetPixels(t.out, 0, 0, o.size, o.size, t.buffer);
    } finally {
      gl.setRenderTarget(savedTarget);
      gl.toneMappingExposure = savedExposure;
      gl.setClearColor(savedClear, savedClearAlpha);
      gl.autoClear = savedAutoClear;
    }

    // Rows come up bottom first, and the edges are premultiplied: turn both
    // around for a PNG.
    const { size } = o;
    const src = t.buffer;
    const data = new Uint8ClampedArray(new ArrayBuffer(size * size * 4));
    const row = size * 4;
    for (let y = 0; y < size; y++) {
      const from = (size - 1 - y) * row;
      const to = y * row;
      for (let x = 0; x < row; x += 4) {
        const a = src[from + x + 3];
        if (a === 0) continue;
        const k = a === 255 ? 1 : 255 / a;
        data[to + x] = src[from + x] * k;
        data[to + x + 1] = src[from + x + 1] * k;
        data[to + x + 2] = src[from + x + 2] * k;
        data[to + x + 3] = a;
      }
    }
    return { width: size, height: size, data };
  }

  /** The card straight to the preview canvas, tone mapped, no blur. */
  preview(f: Omit<ReelFrame, 'index'>, o: Omit<RenderOptions, 'size'>) {
    const { gl, scene } = this.scene.get();
    this.frameCamera({ ...o, size: 0 });
    this.pose(f);
    gl.toneMappingExposure = o.exposure;
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(scene, this.camera);
  }

  private disposeTargets() {
    this.targets.forEach((t) => {
      t.scene.dispose();
      t.accum.dispose();
      t.out.dispose();
    });
    this.targets.clear();
  }

  dispose() {
    this.disposeTargets();
    this.output.dispose();
    this.quad.geometry.dispose();
    this.quad.material.dispose();
  }
}
