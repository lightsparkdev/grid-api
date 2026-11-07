import { useEffect, useRef } from 'react';

// Instinct's link previews engrave the product into the paper: wavy diagonal strokes whose weight follows how
// dark the photo is, in a tan a step darker than the paper (measured from the recording's options link).
const INK = '#d0c7be';
const SPACING = 4.6;
const MAX_WEIGHT = 3.4;
const ANGLE = (24 * Math.PI) / 180;

type Box = { x: number; y: number; w: number; h: number };

// Where the photo sits in the preview, as fractions of it: right of centre and larger than the preview, so it's
// clipped at the top and bottom.
const PLACE: Box = { x: 0.26, y: -0.4, w: 0.9, h: 1.8 };

export function Hatch({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let live = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (live) engrave(canvas, img);
    };
    img.src = src;
    return () => {
      live = false;
    };
  }, [src]);

  return <canvas ref={ref} className={className} aria-hidden />;
}

function engrave(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  const dark = darkness(img, w, h);
  if (!dark) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = INK;

  const dx = Math.cos(ANGLE);
  const dy = Math.sin(ANGLE);
  const reach = Math.hypot(w, h);
  const at = (x: number, y: number) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    return ix < 0 || iy < 0 || ix >= w || iy >= h ? 0 : dark[iy * w + ix];
  };

  for (let k = -Math.ceil(reach / SPACING); k <= Math.ceil(reach / SPACING); k++) {
    const ox = w / 2 - dy * k * SPACING;
    const oy = h / 2 + dx * k * SPACING;
    let top: [number, number][] = [];
    let bottom: [number, number][] = [];
    const flush = () => {
      if (top.length > 1) {
        ctx.beginPath();
        top.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        for (let i = bottom.length - 1; i >= 0; i--) ctx.lineTo(bottom[i][0], bottom[i][1]);
        ctx.closePath();
        ctx.fill();
      }
      top = [];
      bottom = [];
    };
    for (let s = -reach / 2; s <= reach / 2; s += 1) {
      const wobble = 0.7 * Math.sin(s / 3.1 + k * 0.9);
      const x = ox + dx * s - dy * wobble;
      const y = oy + dy * s + dx * wobble;
      const half = (at(x, y) * MAX_WEIGHT * (0.75 + 0.25 * Math.sin(s / 3.4 + k * 1.7))) / 2;
      if (half < 0.12) {
        flush();
        continue;
      }
      top.push([x + dy * half, y - dx * half]);
      bottom.push([x - dy * half, y + dx * half]);
    }
    flush();
  }
}

// The photo, fitted into PLACE over white, as 0 (paper) to 1 (full stroke) per pixel. Product shots are mostly
// pale objects on white, so the curve lifts faint tones. Null when the image can't be read (a cross-origin photo).
function darkness(img: HTMLImageElement, w: number, h: number): Float32Array | null {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  const box = { x: PLACE.x * w, y: PLACE.y * h, w: PLACE.w * w, h: PLACE.h * h };
  const scale = Math.min(box.w / img.naturalWidth, box.h / img.naturalHeight);
  const iw = img.naturalWidth * scale;
  const ih = img.naturalHeight * scale;
  ctx.filter = 'blur(0.8px)';
  ctx.drawImage(img, box.x + (box.w - iw) / 2, box.y + (box.h - ih) / 2, iw, ih);
  let px: Uint8ClampedArray;
  try {
    px = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
  const out = new Float32Array(w * h);
  for (let i = 0; i < out.length; i++) {
    const lum = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;
    out[i] = Math.min(1, Math.max(0, (1 - lum - 0.03) / 0.3)) ** 0.7;
  }
  return out;
}
