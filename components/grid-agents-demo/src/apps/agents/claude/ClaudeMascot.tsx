import { useEffect, useRef } from 'react';
import { createMascot, type MascotState } from './mascot';
import styles from './ClaudeChat.module.scss';

/** The mascot in its glass disc, running on the page's clock (paused while the tab is hidden). */
export function ClaudeMascot({ state }: { state: MascotState }) {
  const shape = useRef<SVGPathElement>(null);
  const line = useRef<SVGPathElement>(null);
  const mascot = useRef<ReturnType<typeof createMascot> | null>(null);

  useEffect(() => {
    if (!shape.current || !line.current) return;
    const m = createMascot(shape.current, line.current, state);
    mascot.current = m;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(Math.max((now - last) / 1000, 0), 1);
      last = now;
      if (!document.hidden) m.advance(dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mascot.current?.ask(state);
  }, [state]);

  return (
    <svg className={styles.mascotArt} viewBox="-47.4 -47.8 100 100" aria-hidden>
      <path ref={shape} className={styles.mascotShape} />
      <path ref={line} className={styles.mascotLine} />
    </svg>
  );
}
