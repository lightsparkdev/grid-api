import { useCallback, useEffect, useRef, useState } from 'react';
import { ReelDirector } from './ReelDirector';
import { ReelRenderer } from './ReelRenderer';
import type { SceneHandle } from './ReelScene';

/** The renderer and director for a mounted ReelScene, once it is up. */
export function useReelEngine() {
  const [engine, setEngine] = useState<{ scene: SceneHandle; renderer: ReelRenderer; director: ReelDirector } | null>(null);
  const made = useRef(false);
  const onHandle = useCallback((scene: SceneHandle) => {
    if (made.current) return;
    made.current = true;
    const renderer = new ReelRenderer(scene);
    setEngine({ scene, renderer, director: new ReelDirector(scene, renderer) });
  }, []);
  useEffect(() => () => engine?.renderer.dispose(), [engine]);
  return { engine, onHandle };
}
