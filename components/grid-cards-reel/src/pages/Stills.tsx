/* Stills and the Figma files, per brand:
     out/stills/<id>/hero.png    the 3D card, 4K, transparent, a three-quarter pose
     out/stills/<id>/front.png   the flat front, 2x the spec artboard
     out/stills/<id>/back.png    the flat back
     out/figma/<nn>-<id>-front.svg, -back.svg   the faces as editable layers
   The flat stills are the Figma SVGs rasterized, so what is in Figma is
   what is in the stills. */

import { useEffect, useState } from 'react';
import { loadImage } from '@/components/CardStage/card3d/facePaint';
import { NEW_BRANDS } from '@reel/brands/newBrands';
import { loadReelBrands, PLACEHOLDER } from '@reel/brands/reelBrands';
import { faceSvgs } from '@reel/export/faceSvg';
import { REEL } from '@reel/reel/reelTimeline';
import { ReelScene } from '@reel/reel/ReelScene';
import { toPng, writeFile } from '@reel/reel/ReelDirector';
import { useReelEngine } from '@reel/reel/useReelEngine';

const HERO = 3840;
const ROLL = { landscape: 0, portrait: -90 } as const;
const ART = new Map(NEW_BRANDS.map((b) => [b.id, b.art]));

async function rasterSvg(svg: string, scale: number): Promise<Blob> {
  const img = (await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`))!;
  const c = document.createElement('canvas');
  c.width = img.naturalWidth * scale;
  c.height = img.naturalHeight * scale;
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob((b) => r(b!), 'image/png'));
}

export function StillsPage() {
  const { engine, onHandle } = useReelEngine();
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (!engine) return;
    let alive = true;
    (async () => {
      const only = new URLSearchParams(location.hash.split('?')[1] ?? '').get('only')?.split(',');
      const all = [PLACEHOLDER, ...(await loadReelBrands())];
      for (let i = 0; i < all.length && alive; i++) {
        const b = all[i];
        if (only && !only.includes(b.id)) continue;
        const nn = String(i).padStart(2, '0');
        const svgs = await faceSvgs(b, ART.get(b.id)?.() ?? null);
        const [front, back] = await Promise.all([rasterSvg(svgs.frontPreview, 2), rasterSvg(svgs.back, 2)]);
        await engine.director.show(b.design);
        const hero = engine.renderer.render([{ rotX: -9, rotY: 16, rotZ: ROLL[b.orientation], y: 0, z: 0 }], {
          size: HERO,
          cardFrac: 0.8,
          exposure: REEL.exposure,
        });
        await Promise.all([
          writeFile(`figma/${nn}-${b.id}-front.svg`, svgs.front),
          writeFile(`figma/${nn}-${b.id}-back.svg`, svgs.back),
          writeFile(`stills/${b.id}/front.png`, front),
          writeFile(`stills/${b.id}/back.png`, back),
          writeFile(`stills/${b.id}/hero.png`, await toPng(hero)),
        ]);
        if (!alive) return;
        setLog((l) => [...l, `${b.id}${svgs.rasters.length ? ` (images: ${svgs.rasters.join(', ')})` : ''}`]);
      }
      (window as unknown as Record<string, unknown>).__stillsDone = true;
    })().catch((e) => {
      console.error(e);
      (window as unknown as Record<string, unknown>).__stillsError = String(e?.stack ?? e);
    });
    return () => {
      alive = false;
    };
  }, [engine]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ position: 'fixed', left: -10000, top: 0 }}>
        <ReelScene size={64} onHandle={onHandle} />
      </div>
      <div>Writing stills and Figma SVGs to out/…</div>
      <pre style={{ color: '#888' }}>{log.join('\n')}</pre>
    </div>
  );
}
