/* The reel: a live preview (real time, no blur, designs swapped as fast as
   the card can paint them), a scrubber that shows any frame exactly as it
   renders, and the render itself, written to out/<take>/. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { loadReelBrands, PLACEHOLDER, type ReelBrand } from '@reel/brands/reelBrands';
import { buildReel, REEL } from '@reel/reel/reelTimeline';
import { ReelScene } from '@reel/reel/ReelScene';
import { useReelEngine } from '@reel/reel/useReelEngine';

const PREVIEW = 640;

const button: React.CSSProperties = {
  background: '#1c1c1f',
  color: '#eee',
  border: '1px solid #333',
  borderRadius: 6,
  padding: '6px 12px',
  cursor: 'pointer',
};

export function RenderPage() {
  const { engine, onHandle } = useReelEngine();
  const [brands, setBrands] = useState<ReelBrand[] | null>(null);
  const reel = useMemo(() => (brands ? buildReel(PLACEHOLDER, brands, REEL) : null), [brands]);
  const [status, setStatus] = useState('Loading the card…');
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    loadReelBrands().then(setBrands);
  }, []);

  useEffect(() => {
    if (!engine || !reel) return;
    engine.director.show(PLACEHOLDER.design).then(() => {
      engine.renderer.preview(reel.frame(0), REEL);
      setStatus(`${reel.sequence.length - 2} brands, ${reel.frames} frames (${reel.duration.toFixed(2)} s)`);
    });
  }, [engine, reel]);

  // Real-time preview: the design is set as the clock reaches it, painted
  // whenever the card gets to it.
  useEffect(() => {
    if (!engine || !reel || !playing) return;
    let raf = 0;
    const t0 = performance.now();
    let shown = -1;
    const tick = (now: number) => {
      const t = ((now - t0) / 1000) % reel.duration;
      const f = reel.frame(t);
      if (f.index !== shown) {
        shown = f.index;
        engine.scene.setDesign(reel.sequence[f.index].design);
      }
      engine.renderer.preview(f, REEL);
      setFrame(Math.floor(t * REEL.fps));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, playing, reel]);

  const scene = (
    <div style={{ background: '#000', outline: '1px solid #222' }}>
      <ReelScene size={PREVIEW} onHandle={onHandle} />
    </div>
  );
  if (!reel) {
    return (
      <div style={{ display: 'flex', gap: 24, padding: 24, alignItems: 'flex-start' }}>
        {scene}
        <div>Preparing the art…</div>
      </div>
    );
  }

  const all = [PLACEHOLDER, ...reel.sequence.slice(1, -1)];
  /** The test second starts just before the first swap, mid-pop. */
  const testFrom = Math.max(0, Math.round((reel.swapTimes[1] - 0.4) * REEL.fps));

  const scrub = async (i: number) => {
    setFrame(i);
    if (!engine || busy.current) return;
    busy.current = true;
    const f = reel.frame(i / REEL.fps);
    await engine.director.show(reel.sequence[f.index].design);
    engine.renderer.preview(f, REEL);
    busy.current = false;
  };

  const run = async (label: string, job: () => Promise<void>) => {
    if (!engine || busy.current) return;
    setPlaying(false);
    busy.current = true;
    const t0 = performance.now();
    try {
      await job();
      setStatus(`${label}: done in ${((performance.now() - t0) / 1000).toFixed(1)} s`);
    } catch (e) {
      setStatus(`${label}: ${String(e)}`);
      throw e;
    } finally {
      busy.current = false;
    }
  };

  const warm = () => run('Warm-up', () => engine!.director.warm(all, (n, total) => setStatus(`Warming ${n}/${total}`)));
  const render = (take: string, from = 0, to = reel.frames) =>
    run(`Render ${take}`, async () => {
      await engine!.director.warm(all, (n, total) => setStatus(`Warming ${n}/${total}`));
      await engine!.director.renderTake(reel, {
        take,
        from,
        to,
        onProgress: (n, total) => {
          setStatus(`Rendering ${take}: ${n}/${total}`);
          setFrame(from + n - 1);
        },
      });
    });

  /** A take with config overrides (a smaller plate for checking motion). */
  const renderWith = (take: string, overrides: Partial<typeof REEL>) =>
    run(`Render ${take}`, async () => {
      const r = buildReel(PLACEHOLDER, brands!, { ...REEL, ...overrides });
      await engine!.director.warm(all, (n, total) => setStatus(`Warming ${n}/${total}`));
      await engine!.director.renderTake(r, { take, onProgress: (n, total) => setStatus(`Rendering ${take}: ${n}/${total}`) });
    });

  (window as unknown as Record<string, unknown>).__reel = { reel, engine, render, renderWith, warm, scrub, testFrom };

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, alignItems: 'flex-start' }}>
      {scene}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
        <div>{status}</div>
        <input type="range" min={0} max={reel.frames - 1} value={frame} onChange={(e) => scrub(Number(e.target.value))} />
        <div style={{ color: '#888' }}>
          Frame {frame} · {(frame / REEL.fps).toFixed(2)} s · {reel.sequence[reel.frame(frame / REEL.fps).index].id}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={button} onClick={() => setPlaying((p) => !p)}>
            {playing ? 'Stop' : 'Play preview'}
          </button>
          <button style={button} onClick={warm}>
            Warm up
          </button>
          <button style={button} onClick={() => render('test', testFrom, testFrom + REEL.fps)}>
            Render 1 s test
          </button>
          <button style={button} onClick={() => render(`take-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`)}>
            Render full plate
          </button>
        </div>
        <div style={{ color: '#666' }}>
          Frames land in components/grid-cards-reel/out/&lt;take&gt;/frames. Then run npm run encode -- &lt;take&gt;.
        </div>
      </div>
    </div>
  );
}
