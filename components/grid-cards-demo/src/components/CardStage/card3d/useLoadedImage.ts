import { useEffect, useState } from 'react';
import { loadImage } from './facePaint';

/** The image at `url` once loaded (null on failure or with no url), and
 *  whether it is still on its way: a face is not painted against a missing
 *  logo or art, or the wordmark and the color would flash first. */
export function useLoadedImage(url: string | null): { img: HTMLImageElement | null; pending: boolean } {
  const [state, setState] = useState<{
    url: string | null;
    img: HTMLImageElement | null;
  }>({ url: null, img: null });
  useEffect(() => {
    if (!url) {
      setState({ url: null, img: null });
      return;
    }
    let alive = true;
    loadImage(url).then((img) => {
      if (alive) setState({ url, img });
    });
    return () => {
      alive = false;
    };
  }, [url]);
  const settled = state.url === url;
  return { img: settled ? state.img : null, pending: !!url && !settled };
}
