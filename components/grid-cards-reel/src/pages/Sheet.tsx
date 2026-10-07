/* Every design, front and back, rendered through the reel's scene (the real
   card, lit as in the plate), for reviewing the set before a render. */

import { useEffect, useState } from 'react';
import { PLACEHOLDER, REEL_BRANDS, type ReelBrand } from '@reel/brands/reelBrands';
import { REEL } from '@reel/reel/reelTimeline';
import { ReelScene } from '@reel/reel/ReelScene';
import { toPng } from '@reel/reel/ReelDirector';
import { useReelEngine } from '@reel/reel/useReelEngine';

const TILE = 520;
const ROLL = { landscape: 0, portrait: -90 } as const;

interface Shot {
  id: string;
  front: string;
  back: string;
}

export function SheetPage() {
  const { engine, onHandle } = useReelEngine();
  const [shots, setShots] = useState<Shot[]>([]);
  const [status, setStatus] = useState('Loading the card…');

  useEffect(() => {
    if (!engine) return;
    let alive = true;
    (async () => {
      const all: ReelBrand[] = [PLACEHOLDER, ...REEL_BRANDS];
      for (let i = 0; i < all.length && alive; i++) {
        const b = all[i];
        setStatus(`Rendering ${i + 1}/${all.length}: ${b.id}`);
        await engine.director.show(b.design);
        const opts = { size: TILE, cardFrac: 0.86, exposure: REEL.exposure };
        const rotZ = ROLL[b.orientation];
        const front = engine.renderer.render([{ rotX: -6, rotY: 10, rotZ, y: 0, z: 0 }], opts);
        const back = engine.renderer.render([{ rotX: -6, rotY: 190, rotZ, y: 0, z: 0 }], opts);
        const [f, k] = await Promise.all([toPng(front), toPng(back)]);
        if (!alive) return;
        setShots((s) => [...s, { id: b.id, front: URL.createObjectURL(f), back: URL.createObjectURL(k) }]);
      }
      setStatus(`${all.length} designs`);
    })();
    return () => {
      alive = false;
    };
  }, [engine]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ position: 'fixed', left: -10000, top: 0 }}>
        <ReelScene size={64} onHandle={onHandle} />
      </div>
      <div style={{ marginBottom: 16 }}>{status}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${TILE / 2 + 24}px, 1fr))`, gap: 16 }}>
        {shots.map((s) => (
          <figure key={s.id} style={{ margin: 0, background: '#0b0b0c', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <img src={s.front} width={TILE / 2} height={TILE / 2} alt={`${s.id} front`} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <img src={s.back} width={TILE / 2} height={TILE / 2} alt={`${s.id} back`} />
            </div>
            <figcaption style={{ color: '#888', marginTop: 6 }}>{s.id}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
