/* Dev: the exporter from the console. `__cardExport.still('post', 'light')`
   opens the still in a new tab; `__cardExport.video('dark')` downloads the
   spin. For checking renders without the share sheet. */

import type { BackdropId } from './compose';
import type { CardExporter } from './exportRenderer';
import { renderSpinVideo } from './exportVideo';
import { renderStill, type StillFormat } from './stills';

export function installExportDevHook(exporter: CardExporter, brandColor: () => string) {
  if (process.env.NODE_ENV !== 'development') return () => {};
  const w = window as unknown as Record<string, unknown>;
  const render = (format: StillFormat = 'post', backdrop: BackdropId = 'light') =>
    renderStill(exporter, { format, backdrop, brandColor: brandColor() });
  w.__cardExport = {
    exporter,
    render,
    still: async (format: StillFormat = 'post', backdrop: BackdropId = 'light') => {
      const blob = await render(format, backdrop);
      window.open(URL.createObjectURL(blob), '_blank');
      return blob;
    },
    video: async (backdrop: BackdropId = 'light') => {
      const t0 = performance.now();
      const blob = await renderSpinVideo(exporter, {
        backdrop,
        brandColor: brandColor(),
        onProgress: (n, total) => {
          if (n % 60 === 0) console.log(`spin ${n}/${total}`);
        },
      });
      console.log(`spin encoded in ${Math.round(performance.now() - t0)} ms`, blob);
      if (blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'card-spin.mp4';
        a.click();
      }
      return blob;
    },
  };
  return () => {
    delete w.__cardExport;
  };
}
