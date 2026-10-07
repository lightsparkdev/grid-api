/* The art, rasterized once at the face texture's size (2048 on the long
   edge, as the face painter's canvases are), so every paint draws a bitmap
   rather than re-rendering an SVG with filters. */

import { TEX_H, TEX_W } from '@/components/CardStage/card3d/faceFrame';

const cache = new Map<string, Promise<string>>();

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('art failed to load'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

/** An object URL of the art as a PNG, the face's texel size. */
export function rasterize(key: string, svg: string, orientation: 'landscape' | 'portrait'): Promise<string> {
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      const img = await loadSvg(svg);
      const [w, h] = orientation === 'landscape' ? [TEX_W, TEX_H] : [TEX_H, TEX_W];
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d')!.drawImage(img, 0, 0, w, h);
      const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/png'));
      return URL.createObjectURL(blob);
    })();
    cache.set(key, p);
  }
  return p;
}
