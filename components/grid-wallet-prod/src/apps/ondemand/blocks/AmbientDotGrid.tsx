'use client';

import { useEffect, useRef, type RefObject } from 'react';
import styles from './AmbientDotGrid.module.scss';

interface AmbientDotGridProps {
  /** Grid pitch in CSS px — airy for the page backdrop, dense on the card. */
  pitch?: number;
  /** `page` follows the theme text color; `card` is fixed white-on-black. */
  variant?: 'page' | 'card';
  /** Brighten dots around the mouse pointer (the created-card treatment). */
  hover?: boolean;
  /** Radiate a brightness ring outward from `pulseOriginRef` while true. */
  pulse?: boolean;
  /** Element whose center the pulse radiates from (e.g. the card). */
  pulseOriginRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/** Deterministic per-cell hash → 0..1 (shape + size stay stable per dot). */
function cellHash(i: number, j: number, seed: number) {
  let h = (i * 374761393 + j * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Layered-sine flow field → 0..1 brightness at cell (i, j) and time t. */
function flowField(i: number, j: number, t: number) {
  return (
    0.5 +
    0.25 * Math.sin(i * 0.42 + t * 1.55 + 2.4 * Math.sin(j * 0.19 - t * 0.6)) +
    0.25 * Math.sin(j * 0.37 - t * 1.1 + 2.0 * Math.sin(i * 0.16 + t * 0.75))
  );
}

const PULSE_PERIOD = 1500; // ms per radiating ring
const PULSE_BAND = 46; // gaussian half-width of the ring, CSS px

/**
 * Ambient dot grid on a canvas: a field of small squares and circles (mix
 * fixed per cell) whose brightness drifts in slow organic patches, brightens
 * around the pointer (`hover` — the created card only), and — in pulse mode —
 * rides a ring radiating out from a given element's center (the issuance
 * "creating" beat). One canvas, ~10²-10³ dots — cheap at 60fps where
 * equivalent DOM nodes would not be.
 */
export function AmbientDotGrid({
  pitch = 17,
  variant = 'page',
  hover = false,
  pulse = false,
  pulseOriginRef,
  className,
}: AmbientDotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pulseRef = useRef(pulse);
  const pulseStartRef = useRef(0);
  if (pulse && !pulseRef.current) pulseStartRef.current = performance.now();
  pulseRef.current = pulse;
  const originRef = useRef(pulseOriginRef);
  originRef.current = pulseOriginRef;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Brightness voice per variant (alpha on the dot color). The flow value is
    // raised to a power below, so the mean stays quiet while peaks hit aMax.
    const aMin = variant === 'card' ? 0.06 : 0.05;
    const aMax = variant === 'card' ? 0.34 : 0.36;
    const hoverAmp = 0.45;
    const pulseAmp = 0.5;
    const hoverSigma = pitch * 3.2;

    let W = 0;
    let H = 0;
    let raf = 0;
    let color = { r: 0, g: 0, b: 0 };
    let lastColorRead = -1e9;
    // Pointer in canvas CSS px; strength eases in/out so hover glow fades.
    const pointer = { x: -1e5, y: -1e5, target: 0, strength: 0 };

    const readColor = (now: number) => {
      if (now - lastColorRead < 400) return;
      lastColorRead = now;
      const m = getComputedStyle(canvas).color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (m) color = { r: +m[1], g: +m[2], b: +m[3] };
    };

    const drawFrame = (now: number) => {
      readColor(now);
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);

      pointer.strength += (pointer.target - pointer.strength) * 0.08;

      // Pulse ring geometry (canvas CSS px), measured live so it tracks the
      // card through layout glides and the AppShell's stage scaling.
      let ringOn = false;
      let ox = 0;
      let oy = 0;
      let ringR = 0;
      let ringFade = 0;
      const originEl = originRef.current?.current;
      if (pulseRef.current && originEl) {
        const o = originEl.getBoundingClientRect();
        const c = canvas.getBoundingClientRect();
        if (c.width > 0) {
          const toCss = W / c.width; // undo any ancestor transform scale
          ox = (o.left + o.width / 2 - c.left) * toCss;
          oy = (o.top + o.height / 2 - c.top) * toCss;
          const p = ((now - pulseStartRef.current) % PULSE_PERIOD) / PULSE_PERIOD;
          ringR = p * Math.hypot(W, H) * 0.9;
          ringFade = 1 - p;
          ringOn = true;
        }
      }

      const cols = Math.ceil(W / pitch) + 1;
      const rows = Math.ceil(H / pitch) + 1;
      const offX = (W - (cols - 1) * pitch) / 2;
      const offY = (H - (rows - 1) * pitch) / 2;
      const hoverOn = pointer.strength > 0.01;

      for (let j = 0; j < rows; j += 1) {
        const y = offY + j * pitch;
        for (let i = 0; i < cols; i += 1) {
          const x = offX + i * pitch;
          const h1 = cellHash(i, j, 1);
          const h2 = cellHash(i, j, 2);

          // Power curve: quiet floor, punchy highlights.
          let a = aMin + Math.pow(flowField(i, j, t), 1.7) * (aMax - aMin);
          if (hoverOn) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            a +=
              hoverAmp *
              pointer.strength *
              Math.exp(-(dx * dx + dy * dy) / (2 * hoverSigma * hoverSigma));
          }
          if (ringOn) {
            const d = Math.hypot(x - ox, y - oy) - ringR;
            a += pulseAmp * ringFade * Math.exp(-(d * d) / (2 * PULSE_BAND * PULSE_BAND));
          }
          if (a <= 0.008) continue;

          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.min(a, 0.85)})`;
          const size = pitch * (0.16 + h2 * 0.08);
          if (h1 < 0.55) {
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
          } else {
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const loop = (now: number) => {
      drawFrame(now);
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = parent.offsetWidth;
      H = parent.offsetHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) drawFrame(performance.now());
    };

    const onMove = (e: PointerEvent) => {
      const c = canvas.getBoundingClientRect();
      if (c.width === 0) return;
      const toCss = W / c.width;
      const x = (e.clientX - c.left) * toCss;
      const y = (e.clientY - c.top) * toCss;
      const inside = x >= -pitch && x <= W + pitch && y >= -pitch && y <= H + pitch;
      pointer.target = inside ? 1 : 0;
      if (inside) {
        pointer.x = x;
        pointer.y = y;
      }
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    if (!reduceMotion) {
      if (hover) {
        // Window-level so the glow tracks through the content sitting above.
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerleave', onLeave);
      }
      raf = requestAnimationFrame(loop);
    }

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [pitch, variant, hover]);

  return (
    <canvas
      ref={canvasRef}
      className={`${styles.canvas} ${variant === 'card' ? styles.card : styles.page}${
        className ? ` ${className}` : ''
      }`}
      aria-hidden
    />
  );
}
