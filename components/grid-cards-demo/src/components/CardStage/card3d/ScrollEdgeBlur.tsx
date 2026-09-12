'use client';

import { useEffect, useMemo, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** The strip under the status bar and header, in stage px from the top, that
 *  the card is to blur under this frame. Null: nothing to do. */
export interface EdgeBlurBand {
  top: number;
  height: number;
}

/** Full blur at the strip's top edge, CSS px. Matches the screen's strongest
 *  scroll-edge layer. */
const MAX_RADIUS_PX = 8;
/** The blur has ramped to nothing this far down the strip (the header's
 *  bottom edge); below it the card is untouched, and a card at rest, whose top
 *  sits just under there, costs nothing. */
export const EDGE_BLUR_RAMP_END = 0.8;
/** Taps each side of the center; spaced to cover the radius. */
const TAPS = 6;

const QUAD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// One direction of a separable Gaussian whose radius runs from uMaxRadius at
// the strip's top (uv.y = 1) to zero at the ramp's end, so the blur dissolves
// into the sharp card below with no seam. Below half a pixel it is a copy.
const BLUR_FRAGMENT = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  uniform vec2 uDir;
  uniform float uMaxRadius;
  varying vec2 vUv;
  void main() {
    float r = uMaxRadius * max(0.0, (vUv.y - ${(1 - EDGE_BLUR_RAMP_END).toFixed(4)}) / ${EDGE_BLUR_RAMP_END.toFixed(4)});
    if (r < 0.5) {
      gl_FragColor = texture2D(uTex, vUv);
      return;
    }
    vec4 sum = vec4(0.0);
    float wsum = 0.0;
    for (int i = -${TAPS}; i <= ${TAPS}; i++) {
      float fi = float(i);
      float w = exp(-0.5 * fi * fi / ${(TAPS / 2) * (TAPS / 2)}.0);
      sum += texture2D(uTex, vUv + uDir * uTexel * (fi * r / ${TAPS}.0)) * w;
      wsum += w;
    }
    gl_FragColor = sum / wsum;
  }
`;

// The blurred strip back onto the screen. The strip was rendered off screen,
// where the renderer leaves colors linear and untone-mapped; this applies the
// same tone mapping and output transfer the direct render got (the renderer
// declares both for every ShaderMaterial; only the calls are spelled here).
const COMPOSITE_FRAGMENT = /* glsl */ `
  uniform sampler2D uTex;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(uTex, vUv);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface Targets {
  width: number;
  height: number;
  /** The strip, rendered sharp (MSAA, depth). */
  sharp: THREE.WebGLRenderTarget;
  /** Ping-pong for the two blur directions. */
  pass: THREE.WebGLRenderTarget;
  out: THREE.WebGLRenderTarget;
}

function makeTargets(width: number, height: number): Targets {
  const common = {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  };
  return {
    width,
    height,
    sharp: new THREE.WebGLRenderTarget(width, height, { ...common, depthBuffer: true, samples: 4 }),
    pass: new THREE.WebGLRenderTarget(width, height, common),
    out: new THREE.WebGLRenderTarget(width, height, common),
  };
}

function disposeTargets(t: Targets) {
  t.sharp.dispose();
  t.pass.dispose();
  t.out.dispose();
}

/**
 * The screen's scroll edge, for the card. The phone's content layer blurs the
 * content scrolling under the status bar and header with a backdrop filter;
 * the card is in this canvas, out of that filter's reach. When the card rides
 * up into the strip this renders the strip's rows of the scene again into a
 * small target (the camera's view offset picks out just those rows), blurs
 * them in two passes with a radius that ramps from full at the top to zero at
 * the bottom, and draws the result back over the strip. Everything is sized
 * to the strip, not the stage, and nothing runs while the card is clear of
 * it. Owns the frame's render (a prioritized frame turns R3F's own off).
 */
export function ScrollEdgeBlur({ band }: { band: MutableRefObject<EdgeBlurBand | null> }) {
  const quad = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const blur = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: BLUR_FRAGMENT,
      uniforms: {
        uTex: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uDir: { value: new THREE.Vector2() },
        uMaxRadius: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });
    const composite = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: COMPOSITE_FRAGMENT,
      uniforms: { uTex: { value: null } },
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });
    const mesh = new THREE.Mesh(geometry, blur);
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { geometry, blur, composite, mesh, scene, camera, targets: null as Targets | null };
  }, []);

  useEffect(
    () => () => {
      quad.geometry.dispose();
      quad.blur.dispose();
      quad.composite.dispose();
      if (quad.targets) disposeTargets(quad.targets);
    },
    [quad],
  );

  useFrame(({ gl, scene, camera, size }) => {
    gl.render(scene, camera);

    const b = band.current;
    if (!b || b.height <= 0) return;
    const dpr = gl.getPixelRatio();
    const width = Math.round(size.width * dpr);
    const height = Math.round(b.height * dpr);
    if (width <= 0 || height <= 0) return;

    let t = quad.targets;
    if (!t || t.width !== width || t.height !== height) {
      if (t) disposeTargets(t);
      t = quad.targets = makeTargets(width, height);
    }

    // The strip's rows of the scene, sharp, into a target of just that size.
    const persp = camera as THREE.PerspectiveCamera;
    persp.setViewOffset(size.width, size.height, 0, b.top, size.width, b.height);
    gl.setRenderTarget(t.sharp);
    gl.render(scene, camera);
    persp.clearViewOffset();

    // Horizontal, then vertical.
    const { blur, composite, mesh } = quad;
    mesh.material = blur;
    blur.uniforms.uTexel.value.set(1 / width, 1 / height);
    blur.uniforms.uMaxRadius.value = MAX_RADIUS_PX * dpr;
    blur.uniforms.uTex.value = t.sharp.texture;
    blur.uniforms.uDir.value.set(1, 0);
    gl.setRenderTarget(t.pass);
    gl.render(quad.scene, quad.camera);
    blur.uniforms.uTex.value = t.pass.texture;
    blur.uniforms.uDir.value.set(0, 1);
    gl.setRenderTarget(t.out);
    gl.render(quad.scene, quad.camera);

    // Back onto the screen, over the strip's rows only (the renderer's
    // viewport and scissor take CSS px, from the bottom).
    gl.setRenderTarget(null);
    mesh.material = composite;
    composite.uniforms.uTex.value = t.out.texture;
    const y = size.height - b.top - b.height;
    gl.setViewport(0, y, size.width, b.height);
    gl.setScissor(0, y, size.width, b.height);
    gl.setScissorTest(true);
    gl.autoClear = false;
    gl.render(quad.scene, quad.camera);
    gl.autoClear = true;
    gl.setScissorTest(false);
    gl.setViewport(0, 0, size.width, size.height);
  }, 1);

  return null;
}
