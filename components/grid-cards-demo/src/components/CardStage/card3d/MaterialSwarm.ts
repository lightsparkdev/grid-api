import * as THREE from 'three';
import { CARD_H, CARD_W } from '@/apps/card/cardMetrics';
import type { CardMaterial } from '@/data/design';
import { CARD_R, faceZOf } from './cardGeometry';
import { FRONT_REST, grain, GRAIN_H, GRAIN_W, turnOf } from './materialSwap';

/**
 * The particles of a material change, one per cell of the face, two sets,
 * on the model of the project tracker's row dissolve: pixel-sized points in
 * flat color with a soft edge, no lighting, tens of thousands of them, every
 * one moved by the GPU off the sweep's clock.
 *
 * The stock's: each falls in from above the card and a little off the face,
 * slowing as it comes down, and lands on its cell at the moment the cell
 * turns to the new stock, so the landing is the change. Landed, it rests a
 * moment and fades into the surface.
 *
 * The old face's: at that same moment its cell's grain lifts off, in the
 * color the face had there, and floats up and away with a little sway,
 * thinning as it goes.
 *
 * In the card's frame, so they tilt and scale with it.
 */

const CELLS = GRAIN_W * GRAIN_H;
const COUNT = CELLS * 2;
/** Point size, card px. */
const SIZE = 1.15;

/** Whether a point of the face is inside the squircle (not a corner round). */
function onFace(x: number, y: number): boolean {
  const cx = CARD_W / 2 - CARD_R;
  const cy = CARD_H / 2 - CARD_R;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  return !(ax > cx && ay > cy && Math.hypot(ax - cx, ay - cy) > CARD_R) && ax <= CARD_W / 2 && ay <= CARD_H / 2;
}

/** The old face's color under each cell: the face canvases shrunk to the
 *  cell grid and read back. The back's texture is mirrored in u; canvas y
 *  runs down. */
function faceColors(front: HTMLCanvasElement, back: HTMLCanvasElement): Uint8ClampedArray[] {
  return [front, back].map((canvas, side) => {
    const small = document.createElement('canvas');
    small.width = GRAIN_W;
    small.height = GRAIN_H;
    const ctx = small.getContext('2d')!;
    if (side === 1) {
      ctx.translate(GRAIN_W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(canvas, 0, 0, GRAIN_W, GRAIN_H);
    return ctx.getImageData(0, 0, GRAIN_W, GRAIN_H).data;
  });
}

const VERTEX = /* glsl */ `
attribute vec3 color;
attribute float aTurn;
attribute float aSeed;
uniform float uFront;
uniform float uDir;
uniform float uMode;
uniform float uSize;
uniform float uViewportH;
varying vec3 vColor;
varying float vAlpha;

float hash(float s, float k) { return fract(sin(s * 127.1 + k * 311.7) * 43758.5453); }

// The stock: appears LEAD ahead of its landing, rests REST, fades over FADE.
const float LEAD = 0.07;
const float REST = 0.05;
const float FADE = 0.05;
const float DROP = 26.0;
const float LIFT = 12.0;
// The dust: in the air for SPAN, rising RISE and moving ALONG with the front.
const float SPAN = 0.16;
const float RISE = 110.0;
const float ALONG = 105.0;
const float OFF = 30.0;

void main() {
	vColor = color;
	vec3 p = position;
	float side = sign(position.z);
	float alpha = 0.0;
	if (uMode < 0.5) {
		float span = LEAD + REST + FADE;
		float u = (uFront - (aTurn - LEAD)) / span;
		if (u > 0.0 && u < 1.0) {
			float settle = min(1.0, u / (LEAD / span));
			float ease = 1.0 - (1.0 - settle) * (1.0 - settle);
			p.x += -uDir * (4.0 + hash(aSeed, 1.0) * 10.0) * (1.0 - ease);
			p.y += DROP * (0.6 + hash(aSeed, 2.0) * 0.8) * (1.0 - ease);
			p.z += side * (LIFT * (1.0 - ease) + 0.5);
			alpha = smoothstep(0.0, 0.15, u) * (1.0 - smoothstep((LEAD + REST) / span, 1.0, u));
		}
	} else {
		float v = (uFront - aTurn) / SPAN;
		if (v > 0.0 && v < 1.0) {
			float rise = 1.0 - (1.0 - v) * (1.0 - v);
			float sway = sin(v * 9.0 + aSeed * 6.2831) * 3.0 * v;
			p.x += uDir * ALONG * (0.65 + hash(aSeed, 3.0) * 0.7) * rise + sway;
			p.y += RISE * (0.6 + hash(aSeed, 4.0) * 0.8) * rise;
			p.z += side * (OFF * (0.5 + hash(aSeed, 5.0)) * rise + 0.5);
			alpha = 1.0 - smoothstep(0.3, 1.0, v);
		}
	}
	vAlpha = alpha;
	if (alpha <= 0.001) {
		gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
		gl_PointSize = 0.0;
		return;
	}
	vec4 mv = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * mv;
	// A card px, at this depth, in device px; scaled with the card.
	float scale = length(modelMatrix[0].xyz);
	float jitter = 0.75 + hash(aSeed, 6.0) * 0.5;
	gl_PointSize = max(1.0, uSize * jitter * scale * projectionMatrix[1][1] * uViewportH * 0.5 / -mv.z);
}
`;

const FRAGMENT = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
	float r = length(gl_PointCoord - 0.5) * 2.0;
	if (r > 1.0) discard;
	float a = smoothstep(1.0, 0.55, r) * vAlpha;
	gl_FragColor = vec4(vColor, a);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}
`;

function pointsMaterial(mode: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uFront: { value: -1 },
      uDir: { value: 1 },
      uMode: { value: mode },
      uSize: { value: SIZE },
      uViewportH: { value: 1000 },
    },
    transparent: true,
    depthWrite: false,
  });
}

export class MaterialSwarm {
  /** The new stock, landing. */
  readonly stock: THREE.Points;
  /** The old face, leaving. */
  readonly dust: THREE.Points;
  /** Shared by both sets: the cells' positions and moments. */
  private readonly position: THREE.BufferAttribute;
  private readonly turn: THREE.BufferAttribute;
  private readonly stockColor: THREE.BufferAttribute;
  private readonly dustColor: THREE.BufferAttribute;
  private readonly c = new THREE.Color();
  private running = false;

  constructor() {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const { cells } = grain();
    for (let i = 0; i < COUNT; i++) {
      const cell = cells[i % CELLS];
      positions[i * 3] = cell.x;
      positions[i * 3 + 1] = cell.y;
      positions[i * 3 + 2] = i < CELLS ? 1 : -1;
      seeds[i] = Math.random() * 1000;
    }
    this.position = new THREE.BufferAttribute(positions, 3);
    this.turn = new THREE.BufferAttribute(new Float32Array(COUNT), 1);
    this.stockColor = new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3);
    this.dustColor = new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3);
    const seed = new THREE.BufferAttribute(seeds, 1);
    const geometry = (color: THREE.BufferAttribute) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', this.position);
      g.setAttribute('aSeed', seed);
      g.setAttribute('aTurn', this.turn);
      g.setAttribute('color', color);
      return g;
    };
    this.stock = new THREE.Points(geometry(this.stockColor), pointsMaterial(0));
    this.dust = new THREE.Points(geometry(this.dustColor), pointsMaterial(1));
    for (const points of [this.stock, this.dust]) {
      points.frustumCulled = false;
      points.visible = false;
    }
  }

  get active() {
    return this.running;
  }

  /** Whether everything has landed and every grain of dust is gone, for a
   *  front at `front` (which may run on past the pass). */
  finished(front: number) {
    return front > FRONT_REST + 0.16;
  }

  /** Lay out both sets for a change to `material`: the stock in its color,
   *  the dust in the colors of the faces as painted. */
  begin(material: CardMaterial, color: string, dir: number, faces: [HTMLCanvasElement, HTMLCanvasElement]) {
    const z = faceZOf(material);
    const { cells } = grain();
    const colors = faceColors(faces[0], faces[1]);
    const stock = new THREE.Color(color);
    const turn = this.turn.array as Float32Array;
    const stockColor = this.stockColor.array as Float32Array;
    const dustColor = this.dustColor.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const side = i < CELLS ? 1 : -1;
      const k = i % CELLS;
      const cell = cells[k];
      this.position.setZ(i, side * z);
      // A cell in a corner round has no face: its particles never show.
      turn[i] = onFace(cell.x, cell.y) ? turnOf(cell, dir) : Infinity;
      // The stock's color, a little uneven grain to grain.
      const g = 0.92 + Math.random() * 0.16;
      stockColor[i * 3] = stock.r * g;
      stockColor[i * 3 + 1] = stock.g * g;
      stockColor[i * 3 + 2] = stock.b * g;
      // The canvas row for this cell: cells count up from the bottom, the
      // canvas from the top.
      const row = GRAIN_H - 1 - Math.floor(k / GRAIN_W);
      const o = (row * GRAIN_W + (k % GRAIN_W)) * 4;
      const px = colors[side === 1 ? 0 : 1];
      this.c.setRGB(px[o] / 255, px[o + 1] / 255, px[o + 2] / 255, THREE.SRGBColorSpace);
      dustColor[i * 3] = this.c.r;
      dustColor[i * 3 + 1] = this.c.g;
      dustColor[i * 3 + 2] = this.c.b;
    }
    this.position.needsUpdate = true;
    this.turn.needsUpdate = true;
    this.stockColor.needsUpdate = true;
    this.dustColor.needsUpdate = true;
    for (const points of [this.stock, this.dust]) {
      const m = points.material as THREE.ShaderMaterial;
      m.uniforms.uDir.value = dir;
      m.uniforms.uFront.value = -1;
      points.visible = true;
    }
    this.running = true;
  }

  /** Move the front on the particles' clock; `viewportH` in device px. */
  update(front: number, viewportH: number) {
    if (!this.running) return;
    for (const points of [this.stock, this.dust]) {
      const m = points.material as THREE.ShaderMaterial;
      m.uniforms.uFront.value = front;
      m.uniforms.uViewportH.value = viewportH;
    }
  }

  end() {
    if (!this.running) return;
    this.running = false;
    this.stock.visible = false;
    this.dust.visible = false;
  }

  dispose() {
    this.end();
    for (const points of [this.stock, this.dust]) {
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
    }
  }
}
