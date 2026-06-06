/**
 * Displacement-map generator — the portable core of the "glass" effect.
 *
 * This is a faithful re-implementation of Aave's technique (reverse-engineered
 * from their shipped bundle, see https://aave.com/design/building-glass-for-the-web).
 *
 * The map is a small RGBA image. For every pixel:
 *   - R encodes the horizontal displacement  (0.5 == no shift)
 *   - G encodes the vertical displacement    (0.5 == no shift)
 *   - B encodes the specular highlight        (0.5 == no light)
 * Outside the lens (when `sdfBoundary`) every channel sits at the neutral 128
 * so those pixels are left untouched by `feDisplacementMap`.
 *
 * The map is consumed two ways, identically:
 *   - on live DOM, it drives an SVG `feDisplacementMap`
 *   - on canvas/video, the same map feeds a WebGL shader
 */

/** erf approximation used for the soft edge falloff: tanh(sqrt(pi) * x). */
export function erf(x: number): number {
  return Math.tanh(1.7724538509055159 * x);
}

export interface DomeConstants {
  Rx: number;
  Ry: number;
  scaleX: number;
  scaleY: number;
}

/**
 * Pre-compute the radii + normalisation for a spherical "dome" (the Curvature
 * control). A dome of sagitta `domeDepth` over a half-chord `half` has radius
 * R = (half^2 + sagitta^2) / (2 * sagitta). The gradient is normalised so it
 * integrates to 0.5 across the half-width (matching the linear gradient range).
 */
export function computeDomeConstants(domeDepth: number, halfW: number, halfH: number): DomeConstants {
  const sagitta = Math.max(0.01, Math.min(domeDepth, Math.min(halfW, halfH) - 1));
  const Rx = (halfW * halfW + sagitta * sagitta) / (2 * sagitta);
  const Ry = (halfH * halfH + sagitta * sagitta) / (2 * sagitta);
  // Numerically integrate ∫ t / sqrt(R^2 - t^2) dt from 0..half (trapezoid, 200 steps).
  const integrate = (R: number, half: number): number => {
    let acc = 0;
    for (let n = 0; n <= 200; n++) {
      const t = (n / 200) * half;
      const v = t / Math.sqrt(R * R - t * t);
      acc += n === 0 || n === 200 ? 0.5 * v : v;
    }
    return acc / 200;
  };
  const lx = integrate(Rx, halfW);
  const ly = integrate(Ry, halfH);
  return {
    Rx,
    Ry,
    scaleX: lx > 0 ? 0.5 / lx : 1,
    scaleY: ly > 0 ? 0.5 / ly : 1,
  };
}

/** Tangent slope of the dome circle at offset `d`, scaled to the [0,0.5] range. */
export function domeGradient(d: number, R: number, scale: number): number {
  const n = Math.min(d, 0.999 * R);
  return (n / Math.sqrt(R * R - n * n)) * scale;
}

export interface DisplacementMapOptions {
  /** Pixel width of the generated map buffer. */
  width: number;
  /** Pixel height of the generated map buffer. Match the lens aspect ratio so
   *  the rounded corner isn't squashed onto a square grid and stair-stepped. */
  height: number;
  /** Half the lens width, in lens units (x spans [-halfW, halfW]). */
  lensHalfWidth: number;
  /** Half the lens height, in lens units (y spans [-halfH, halfH]). */
  lensHalfHeight: number;
  /** Corner radius of the rounded-rect lens, in lens units. */
  borderRadius: number;
  /** Edge inset that controls how wide the refraction band is. */
  depth: number;
  /** Clip to the rounded-rect: pixels outside the lens stay neutral. */
  sdfBoundary: boolean;
  /** Smoothly ramp the displacement to zero across the edge (via erf). */
  edgeFalloff: boolean;
  /** Specular highlight direction, in degrees. */
  specularRotation?: number;
  /** Broad glow highlight strength (0..1). */
  glowStrength?: number;
  /** How tightly the glow hugs the specular axis (0..1). */
  glowSpread?: number;
  glowExponent?: number;
  /** Thin rim-light strength (0..1). */
  edgeStrength?: number;
  /** Rim-light band width, in lens units. */
  edgeWidth?: number;
  edgeExponent?: number;
  /** Spherical curvature (sagitta). 0 == flat/linear refraction. */
  domeDepth?: number;
  /** Flattens displacement near edges so values stay readable (1 == off). */
  splayAmount?: number;
  /**
   * Corner smoothing, 0..1. 0 = a circular rounded-rect corner; higher values
   * morph the corner into an Apple-style squircle (continuous curvature) so it
   * matches a squircle container clip. ~0.6 ≈ iOS.
   */
  cornerSmoothing?: number;
}

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/**
 * Fill `target` (an RGBA buffer of length width*height*4) with the
 * displacement map. Pure function of the options — no DOM required.
 */
export function renderDisplacementMap(target: Uint8ClampedArray, opts: DisplacementMapOptions): void {
  const {
    width,
    height,
    lensHalfWidth: halfW,
    lensHalfHeight: halfH,
    borderRadius,
    depth,
    sdfBoundary,
    edgeFalloff,
    specularRotation = 45,
    glowStrength = 0,
    glowSpread = 1,
    glowExponent = 1.5,
    edgeStrength = 0,
    edgeWidth = 3,
    edgeExponent = 1.5,
    domeDepth = 0,
    splayAmount = 1,
    cornerSmoothing = 0,
  } = opts;

  // Corner shape: exponent 2 = circle, higher = squircle (superellipse Lp norm).
  const cornerExp = 2 + clamp(cornerSmoothing, 0, 1) * 4;
  const useSquircle = cornerSmoothing > 0.001;
  const invExp = 1 / cornerExp;
  const lp = (a: number, b: number): number => {
    if (a <= 0) return b <= 0 ? 0 : b;
    if (b <= 0) return a;
    return useSquircle
      ? Math.pow(Math.pow(a, cornerExp) + Math.pow(b, cornerExp), invExp)
      : Math.sqrt(a * a + b * b);
  };

  const corner = Math.min(borderRadius, Math.min(halfW, halfH));
  const innerW = Math.max(0, halfW - depth);
  const innerH = Math.max(0, halfH - depth);
  const innerCorner = Math.max(0, Math.min(borderRadius, Math.min(innerW, innerH)));
  // erf input scale: maps the inner SDF distance into the falloff ramp.
  const falloffScale = depth > 0 ? 1 / (depth * Math.SQRT2) : 1e6;
  const wantSpecular = glowStrength > 0 || edgeStrength > 0;
  const angle = (specularRotation * Math.PI) / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const glowInner = (1 - glowSpread) * Math.SQRT2;
  const glowBand = glowSpread * Math.SQRT2;
  const dome = domeDepth > 0 ? computeDomeConstants(domeDepth, halfW, halfH) : null;
  const splayOn = splayAmount < 1;
  const splayRef = 0.5 * Math.min(halfW, halfH);
  const splayInv = splayRef > 0 ? 1 / splayRef : 0;
  // Anti-alias the lens boundary across ~1.5 source texels (largest axis) so the
  // rounded corner stays smooth instead of stair-stepping when the map is scaled.
  const aaWidth = 1.5 * Math.max((2 * halfW) / width, (2 * halfH) / height);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = (row * width + col) * 4;
      // Pixel centre → lens coordinates in [-halfW, halfW] x [-halfH, halfH].
      const x = ((col + 0.5) / width) * (2 * halfW) - halfW;
      const y = ((row + 0.5) / height) * (2 * halfH) - halfH;
      const ax = Math.abs(x);
      const ay = Math.abs(y);

      // Signed distance to the (squircle) rounded rectangle (negative inside).
      const qx = ax - halfW + corner;
      const qy = ay - halfH + corner;
      const outside = lp(Math.max(qx, 0), Math.max(qy, 0));
      const sdf = outside + Math.min(Math.max(qx, qy), 0) - corner;

      // Smooth coverage of the lens: 1 well inside, 0 well outside, with a
      // soft ramp across the edge so the boundary is anti-aliased.
      const coverage = sdfBoundary ? clamp(0.5 - sdf / aaWidth, 0, 1) : 1;

      if (coverage > 0) {
        // Base gradient direction (linear plane or spherical dome).
        let gx: number;
        let gy: number;
        if (dome) {
          gx = Math.sign(x) * domeGradient(ax, dome.Rx, dome.scaleX);
          gy = Math.sign(y) * domeGradient(ay, dome.Ry, dome.scaleY);
        } else {
          gx = clamp(x / halfW, -1, 1);
          gy = clamp(y / halfH, -1, 1);
        }

        let dx = gx;
        let dy = gy;

        // Splay: flatten the displacement as it approaches the edges, then
        // renormalise so the magnitude is preserved (keeps content readable).
        if (splayOn) {
          const flatY = Math.max(0, 1 - (halfH - ay) * splayInv) * (1 - splayAmount);
          const flatX = Math.max(0, 1 - (halfW - ax) * splayInv) * (1 - splayAmount);
          if (flatY > 0.001 || flatX > 0.001) {
            const rx = dx;
            const ry = dy;
            dx = rx * (1 - flatY);
            dy = ry * (1 - flatX);
            const lenBefore = Math.sqrt(rx * rx + ry * ry);
            const lenAfter = Math.sqrt(dx * dx + dy * dy);
            if (lenAfter > 0.001) {
              const k = lenBefore / lenAfter;
              dx *= k;
              dy *= k;
            }
          }
        }

        // Soft edge falloff via erf of the inset SDF.
        let falloff = 1;
        if (edgeFalloff) {
          const ex = ax - innerW + innerCorner;
          const ey = ay - innerH + innerCorner;
          const innerSdf =
            lp(Math.max(ex, 0), Math.max(ey, 0)) + Math.min(Math.max(ex, ey), 0) - innerCorner;
          falloff = 0.5 * (1 + erf(innerSdf * falloffScale));
        }

        // `coverage` blends the displacement back toward neutral (0.5) at the
        // very edge, anti-aliasing the rounded corner.
        target[idx] = Math.round((0.5 - 0.5 * dx * falloff * coverage) * 255);
        target[idx + 1] = Math.round((0.5 - 0.5 * dy * falloff * coverage) * 255);

        if (wantSpecular) {
          // Projection onto the specular axis (0 == perpendicular, 1 == aligned).
          const proj = Math.abs(clamp(x / halfW, -1, 1) * cosA + clamp(y / halfH, -1, 1) * sinA);
          let spec = 0;
          if (glowStrength > 0) {
            const g = glowBand > 0.001 ? clamp((proj - glowInner) / glowBand, 0, 1) : 0;
            spec += glowStrength * Math.pow(g, glowExponent) * falloff;
          }
          if (edgeStrength > 0) {
            const rim = sdf < 0 ? Math.max(0, 1 + sdf / edgeWidth) : 0;
            spec += edgeStrength * rim * Math.pow(proj, edgeExponent);
          }
          spec = Math.min(1, spec) * coverage;
          target[idx + 2] = Math.round(127 * spec + 128);
        } else {
          target[idx + 2] = 128;
        }
      } else {
        target[idx] = 128;
        target[idx + 1] = 128;
        target[idx + 2] = 128;
      }
      target[idx + 3] = 255;
    }
  }
}

/**
 * Generate the displacement map and return it as a PNG data URL, ready to be
 * fed to an SVG `<feImage href=...>`. Reuses an offscreen canvas when given one.
 */
export function displacementMapToDataURL(
  opts: DisplacementMapOptions,
  canvas?: HTMLCanvasElement,
): string | null {
  const cnv = canvas ?? document.createElement('canvas');
  cnv.width = opts.width;
  cnv.height = opts.height;
  const ctx = cnv.getContext('2d');
  if (!ctx) return null;
  const image = ctx.createImageData(opts.width, opts.height);
  renderDisplacementMap(image.data, opts);
  ctx.putImageData(image, 0, 0);
  return cnv.toDataURL('image/png');
}
