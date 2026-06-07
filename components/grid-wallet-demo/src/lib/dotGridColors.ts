/**
 * Dot-grid theming — bridges the CSS theme to the JS-rendered backdrops.
 *
 * grid-visualizer's dot grid is pure CSS, so it flips with `[data-theme]` in the
 * same paint frame as everything else (seamless). Our backdrop is drawn in a
 * canvas / WebGL, so it can't rely on CSS alone. Instead we read the same theme
 * tokens (`--dot-grid-*` in globals.scss) and repaint the instant the attribute
 * changes — giving the JS backdrop the exact same atomic flip.
 */

export interface DotGridPalette {
  /** Resolved background fill. */
  bg: string;
  /** Resting dot color. */
  dot: string;
  /** Ripple-crest interpolation steps (resting → peak), prebuilt for the wave. */
  blended: string[];
}

const BLEND_COUNT = 16;

const FALLBACK_BG = '#f4f4f3';
const FALLBACK_DOT = '#d9d9d9';
const FALLBACK_PEAK = '#b0b0b0';

/**
 * Normalize any CSS color string (hex, rgb(), named, or a `var()`-resolved
 * token) to the canvas's canonical form by round-tripping it through
 * `ctx.fillStyle`. Invalid/empty input leaves the fallback in place.
 */
function normalize(ctx: CanvasRenderingContext2D, color: string, fallback: string): string {
  ctx.fillStyle = fallback;
  const trimmed = color.trim();
  if (trimmed) ctx.fillStyle = trimmed;
  return ctx.fillStyle as string;
}

function toRGB(color: string): [number, number, number] {
  if (color.startsWith('#')) {
    let h = color.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = color.match(/[\d.]+/g);
  if (m && m.length >= 3) return [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])];
  return [0, 0, 0];
}

/**
 * Read the current dot-grid palette from the `--dot-grid-*` custom properties.
 * Pass the 2D context that will draw the dots so colors normalize against the
 * same canvas. Call this again on every theme change.
 */
export function readDotGridPalette(ctx: CanvasRenderingContext2D): DotGridPalette {
  const cs =
    typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement)
      : null;

  const bg = normalize(ctx, cs?.getPropertyValue('--dot-grid-bg') ?? '', FALLBACK_BG);
  const dot = normalize(ctx, cs?.getPropertyValue('--dot-grid-dot') ?? '', FALLBACK_DOT);
  const peak = normalize(ctx, cs?.getPropertyValue('--dot-grid-dot-peak') ?? '', FALLBACK_PEAK);

  const base = toRGB(dot);
  const crest = toRGB(peak);
  const blended: string[] = [];
  for (let i = 0; i <= BLEND_COUNT; i++) {
    const t = i / BLEND_COUNT;
    blended.push(
      `rgb(${Math.round(base[0] + (crest[0] - base[0]) * t)},${Math.round(
        base[1] + (crest[1] - base[1]) * t,
      )},${Math.round(base[2] + (crest[2] - base[2]) * t)})`,
    );
  }

  return { bg, dot, blended };
}

/**
 * Run `cb` whenever the document theme (`data-theme`) changes. Returns a
 * disposer. The callback fires as a microtask right after the attribute is set —
 * before the next paint — so a canvas repaint here lands in the same frame as
 * the CSS recalc.
 */
export function observeTheme(cb: () => void): () => void {
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }
  const obs = new MutationObserver((records) => {
    for (const r of records) {
      if (r.attributeName === 'data-theme') {
        cb();
        return;
      }
    }
  });
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => obs.disconnect();
}
