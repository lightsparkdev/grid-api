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
 * Today this map drives the DOM path only: LiquidGlass feeds it to an SVG
 * `feDisplacementMap` (so refracted content stays selectable/clickable). The
 * WebGL path (glass-gl/StageGL, currently phone-specific) re-derives the same
 * displacement math analytically in GLSL rather than sampling this map — the two
 * share the formulas, not this artifact. A future general WebGL glass could
 * sample this map directly to be pixel-identical to the SVG path.
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
  /**
   * Per-corner radii `[topLeft, topRight, bottomRight, bottomLeft]`, in lens
   * units — overrides `borderRadius` when set (e.g. a bottom sheet whose bottom
   * corners hug the phone screen while the top keeps a smaller sheet radius). The
   * refraction bend, edge falloff and specular are computed per corner so they
   * trace the actual shape instead of clipping flat at a uniform corner.
   */
  cornerRadii?: [number, number, number, number];
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
  /**
   * Bend along the rounded-rect SDF normal instead of per axis (Aave's
   * circle/pill lens model): perpendicular to the straight edges, radial around
   * the corner caps, with the domed magnitude growing from the shape's medial
   * axis ("spine") to the boundary. On a circle this is exactly the radial lens
   * (x/r, y/r). Uses the first corner radius — intended for uniform-radius
   * shapes (circles, pills). Only meaningful with `domeDepth > 0`.
   */
  radialDome?: boolean;
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
 * Fill `target` (an RGBA buffer of length width*height*4) with the displacement
 * map. Pure function of the options — no DOM required.
 *
 * The loop always walks just a quarter of the pixels and writes the four mirror
 * positions per iteration (Aave's "compute a quarter" trick); the bend magnitude
 * is corner-independent, so it's computed once and mirrored (sign-flipped) into
 * all four. The per-corner SDF/coverage/falloff + specular are grouped by distinct
 * corner radius and evaluated once per group — automatically 1 eval for uniform
 * glass (both axes symmetric), 2 for a single-axis shape like a sheet
 * (`[a,a,b,b]` / `[a,b,b,a]`), up to 4 when every corner differs. The symmetry is
 * derived from the radii, never specified by the caller.
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
    radialDome = false,
    splayAmount = 1,
    cornerSmoothing = 0,
    cornerRadii,
  } = opts;

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

  const innerW = Math.max(0, halfW - depth);
  const innerH = Math.max(0, halfH - depth);
  const innerMin = Math.min(innerW, innerH);
  const minHalf = Math.min(halfW, halfH);
  // Per-corner radii [TL, TR, BR, BL] — uniform `borderRadius` unless overridden.
  const radii = cornerRadii ?? [borderRadius, borderRadius, borderRadius, borderRadius];
  // Boundary + inner-band corner radii, clamped to the lens, per corner.
  const cornerVal = radii.map((r) => Math.min(r, minHalf));
  const innerCornerVal = radii.map((r) => Math.max(0, Math.min(r, innerMin)));

  // Auto symmetry: group the four quadrants by identical corner radius so the
  // SDF/coverage/falloff is evaluated once per *distinct* corner — derived from the
  // values, never specified by the caller. `shapeSrc[q]` is the first quadrant that
  // shares q's radius (so q recomputes only if it's its own source). This collapses
  // to 1 eval for uniform glass (both axes symmetric), 2 for a single-axis shape
  // like a sheet ([a,a,b,b] or [a,b,b,a]), up to 4 when every corner differs.
  // Quadrant order: 0=TL, 1=TR, 2=BR, 3=BL.
  const shapeSrc = [0, 1, 2, 3].map((q) => {
    for (let j = 0; j < q; j++) if (cornerVal[j] === cornerVal[q]) return j;
    return q;
  });
  // Specular shares an axis per diagonal: TL/BR ride proj+, TR/BL ride proj−. Equal
  // corners on the same axis → identical specular byte (so uniform = 2 evals).
  const diagShare = cornerVal[0] === cornerVal[2];
  const antiShare = cornerVal[1] === cornerVal[3];
  // Per-quadrant scratch, reused each pixel (no per-pixel allocation).
  const qCov = [0, 0, 0, 0];
  const qFall = [1, 1, 1, 1];
  const qSdf = [0, 0, 0, 0];
  const falloffScale = depth > 0 ? 1 / (depth * Math.SQRT2) : 1e6;
  const wantSpecular = glowStrength > 0 || edgeStrength > 0;
  const angle = (specularRotation * Math.PI) / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const glowInner = (1 - glowSpread) * Math.SQRT2;
  const glowBand = glowSpread * Math.SQRT2;
  const dome = domeDepth > 0 ? computeDomeConstants(domeDepth, halfW, halfH) : null;
  // Radial mode: one dome over the inscribed circle; bend points at the center.
  const domeR = dome && radialDome ? computeDomeConstants(domeDepth, minHalf, minHalf) : null;
  const splayOn = splayAmount < 1;
  const splayRef = 0.5 * Math.min(halfW, halfH);
  const splayInv = splayRef > 0 ? 1 / splayRef : 0;
  const aaWidth = 1.5 * Math.max((2 * halfW) / width, (2 * halfH) / height);

  // Rounded-rect SDF + coverage + edge falloff for one corner radius at |x|,|y|.
  // Writes scratch outputs (no per-pixel allocation). The bend magnitude is the
  // same for every corner, so only this shape data varies per corner.
  let shSdf = 0;
  let shCov = 0;
  let shFall = 1;
  const shapeFor = (ax: number, ay: number, corner: number, innerCorner: number): void => {
    const qx = ax - halfW + corner;
    const qy = ay - halfH + corner;
    shSdf = lp(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - corner;
    shCov = sdfBoundary ? clamp(0.5 - shSdf / aaWidth, 0, 1) : 1;
    shFall = 1;
    if (edgeFalloff) {
      const ex = ax - innerW + innerCorner;
      const ey = ay - innerH + innerCorner;
      const innerSdf =
        lp(Math.max(ex, 0), Math.max(ey, 0)) + Math.min(Math.max(ex, ey), 0) - innerCorner;
      shFall = 0.5 * (1 + erf(innerSdf * falloffScale));
    }
  };

  // Specular byte for one corner, given its rim/falloff/coverage and the (shared,
  // directional) projection along the specular axis.
  const specByte = (proj: number, rim: number, falloff: number, coverage: number): number => {
    let s = 0;
    if (glowStrength > 0) {
      const g = glowBand > 0.001 ? clamp((proj - glowInner) / glowBand, 0, 1) : 0;
      s += glowStrength * Math.pow(g, glowExponent) * falloff;
    }
    if (edgeStrength > 0) s += edgeStrength * rim * Math.pow(proj, edgeExponent);
    if (s > 1) s = 1;
    return Math.round(127 * s * coverage + 128);
  };

  const halfCols = Math.ceil(width / 2);
  const halfRows = Math.ceil(height / 2);

  for (let row = 0; row < halfRows; row++) {
    const mrow = height - 1 - row;
    const rowBase = row * width;
    const mrowBase = mrow * width;
    const y = ((row + 0.5) / height) * (2 * halfH) - halfH;
    const ay = Math.abs(y);

    for (let col = 0; col < halfCols; col++) {
      const mcol = width - 1 - col;
      const x = ((col + 0.5) / width) * (2 * halfW) - halfW;
      const ax = Math.abs(x);

      // Four mirror indices fed by this one quadrant sample.
      const iTL = (rowBase + col) * 4;
      const iTR = (rowBase + mcol) * 4;
      const iBL = (mrowBase + col) * 4;
      const iBR = (mrowBase + mcol) * 4;

      // Shape once per distinct corner (see shapeSrc): a quadrant copies an earlier
      // quadrant's result when they share a radius, else evaluates its own.
      for (let q = 0; q < 4; q++) {
        const s = shapeSrc[q];
        if (s === q) {
          shapeFor(ax, ay, cornerVal[q], innerCornerVal[q]);
          qCov[q] = shCov;
          qFall[q] = shFall;
          qSdf[q] = shSdf;
        } else {
          qCov[q] = qCov[s];
          qFall[q] = qFall[s];
          qSdf[q] = qSdf[s];
        }
      }

      // Fully outside every corner → neutral; skip the bend/specular work.
      if (qCov[0] <= 0 && qCov[1] <= 0 && qCov[2] <= 0 && qCov[3] <= 0) {
        target[iTL] = target[iTL + 1] = target[iTL + 2] = 128;
        target[iTR] = target[iTR + 1] = target[iTR + 2] = 128;
        target[iBL] = target[iBL + 1] = target[iBL + 2] = 128;
        target[iBR] = target[iBR + 1] = target[iBR + 2] = 128;
        target[iTL + 3] = target[iTR + 3] = target[iBL + 3] = target[iBR + 3] = 255;
        continue;
      }

      // Bend magnitudes — identical in all four quadrants; only the sign flips.
      let dxm: number;
      let dym: number;
      if (radialDome) {
        // SDF-normal lens (Aave's circle/pill model). Direction follows the
        // rounded-rect SDF normal: radial in the corner-cap region, perpendicular
        // to the nearest edge elsewhere. Magnitude is measured from the shape's
        // medial axis (minHalf + sdf: 0 at the spine → minHalf at the boundary);
        // per Aave, a CIRCLE domes that distance while pills/rects keep it
        // linear. On a circle this reduces exactly to (x/r, y/r).
        const c0 = cornerVal[0];
        const qx = ax - halfW + c0;
        const qy = ay - halfH + c0;
        const ux = Math.max(qx, 0);
        const uy = Math.max(qy, 0);
        const cd = Math.sqrt(ux * ux + uy * uy);
        const sdf = cd + Math.min(Math.max(qx, qy), 0) - c0;
        let nx: number;
        let ny: number;
        if (ux > 0 || uy > 0) {
          const inv = 1 / Math.max(cd, 1e-6);
          nx = ux * inv;
          ny = uy * inv;
        } else if (qx > qy) {
          nx = 1;
          ny = 0;
        } else {
          nx = 0;
          ny = 1;
        }
        const dist = Math.max(0, minHalf + sdf);
        const isCircle = Math.abs(halfW - halfH) < 0.5 && c0 >= minHalf - 0.5;
        let g: number;
        if (isCircle && domeR) {
          g = domeGradient(dist, domeR.Rx, domeR.scaleX);
        } else {
          g = dist / minHalf;
          if (g > 1) g = 1;
        }
        dxm = nx * g;
        dym = ny * g;
      } else if (dome) {
        dxm = domeGradient(ax, dome.Rx, dome.scaleX);
        dym = domeGradient(ay, dome.Ry, dome.scaleY);
      } else {
        dxm = ax / halfW;
        if (dxm > 1) dxm = 1;
        dym = ay / halfH;
        if (dym > 1) dym = 1;
      }

      if (splayOn) {
        const flatY = Math.max(0, 1 - (halfH - ay) * splayInv) * (1 - splayAmount);
        const flatX = Math.max(0, 1 - (halfW - ax) * splayInv) * (1 - splayAmount);
        if (flatY > 0.001 || flatX > 0.001) {
          const rx = dxm;
          const ry = dym;
          dxm = rx * (1 - flatY);
          dym = ry * (1 - flatX);
          const lenBefore = Math.sqrt(rx * rx + ry * ry);
          const lenAfter = Math.sqrt(dxm * dxm + dym * dym);
          if (lenAfter > 0.001) {
            const k = lenBefore / lenAfter;
            dxm *= k;
            dym *= k;
          }
        }
      }

      const halfDx = 0.5 * dxm;
      const halfDy = 0.5 * dym;

      // Specular projection along the (directional) specular axis — shared. The
      // diagonal corners (TL/BR) use proj+, the anti-diagonal (TR/BL) use proj−.
      let projDiag = 0;
      let projAnti = 0;
      if (wantSpecular) {
        let pxv = ax / halfW;
        if (pxv > 1) pxv = 1;
        pxv *= cosA;
        let pyv = ay / halfH;
        if (pyv > 1) pyv = 1;
        pyv *= sinA;
        projDiag = Math.abs(pxv + pyv);
        projAnti = Math.abs(pxv - pyv);
      }

      // Per-quadrant displacement: a quadrant outside its own corner has fc → 0,
      // which writes the neutral 128 automatically (x<0 → +, x>0 → −; same for y).
      const fcTL = qFall[0] * qCov[0];
      const fcTR = qFall[1] * qCov[1];
      const fcBR = qFall[2] * qCov[2];
      const fcBL = qFall[3] * qCov[3];
      target[iTL] = Math.round((0.5 + halfDx * fcTL) * 255);
      target[iTL + 1] = Math.round((0.5 + halfDy * fcTL) * 255);
      target[iTR] = Math.round((0.5 - halfDx * fcTR) * 255);
      target[iTR + 1] = Math.round((0.5 + halfDy * fcTR) * 255);
      target[iBL] = Math.round((0.5 + halfDx * fcBL) * 255);
      target[iBL + 1] = Math.round((0.5 - halfDy * fcBL) * 255);
      target[iBR] = Math.round((0.5 - halfDx * fcBR) * 255);
      target[iBR + 1] = Math.round((0.5 - halfDy * fcBR) * 255);

      // Specular: evaluate TL/TR, then reuse for BR/BL when they share the axis's
      // corner (diagShare/antiShare) — so uniform glass stays at 2 evals.
      if (wantSpecular) {
        const rimTL = qSdf[0] < 0 ? Math.max(0, 1 + qSdf[0] / edgeWidth) : 0;
        const bTL = specByte(projDiag, rimTL, qFall[0], qCov[0]);
        const rimTR = qSdf[1] < 0 ? Math.max(0, 1 + qSdf[1] / edgeWidth) : 0;
        const bTR = specByte(projAnti, rimTR, qFall[1], qCov[1]);
        const bBR = diagShare
          ? bTL
          : specByte(projDiag, qSdf[2] < 0 ? Math.max(0, 1 + qSdf[2] / edgeWidth) : 0, qFall[2], qCov[2]);
        const bBL = antiShare
          ? bTR
          : specByte(projAnti, qSdf[3] < 0 ? Math.max(0, 1 + qSdf[3] / edgeWidth) : 0, qFall[3], qCov[3]);
        target[iTL + 2] = bTL;
        target[iTR + 2] = bTR;
        target[iBR + 2] = bBR;
        target[iBL + 2] = bBL;
      } else {
        target[iTL + 2] = target[iTR + 2] = target[iBR + 2] = target[iBL + 2] = 128;
      }
      target[iTL + 3] = target[iTR + 3] = target[iBL + 3] = target[iBR + 3] = 255;
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
