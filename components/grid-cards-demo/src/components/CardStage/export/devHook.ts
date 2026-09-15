/* Dev: the exporter from the console. `__cardExport.still('square', 'dark')`
   opens the still in a new tab; `__cardExport.video('brand')` downloads the
   spin. For checking renders without the share sheet. */

import type { CardDesign } from '@/data/design';
import { brandColorOf } from '@/data/design';
import { brandSurfaceFor, paletteFor, prepareTemplate, warmTemplate, type BackdropId } from './compose';
import type { CardExporter } from './exportRenderer';
import { renderSpinVideo } from './exportVideo';
import { renderStill, type StillFormat } from './stills';

export function installExportDevHook(exporter: CardExporter, design: () => CardDesign) {
  if (process.env.NODE_ENV !== 'development') return () => {};
  const w = window as unknown as Record<string, unknown>;
  const paletteOf = async (backdrop: BackdropId) => {
    await warmTemplate();
    const d = design();
    const cardColor = brandColorOf(d);
    return { palette: paletteFor(backdrop, await brandSurfaceFor(d, cardColor)), cardColor };
  };
  const render = async (format: StillFormat = 'square', backdrop: BackdropId = 'light') => {
    await prepareTemplate();
    return renderStill(exporter, { format, ...(await paletteOf(backdrop)) });
  };
  w.__cardExport = {
    exporter,
    render,
    still: async (format: StillFormat = 'square', backdrop: BackdropId = 'light') => {
      const blob = await render(format, backdrop);
      window.open(URL.createObjectURL(blob), '_blank');
      return blob;
    },
    video: async (backdrop: BackdropId = 'light') => {
      const t0 = performance.now();
      const blob = await renderSpinVideo(exporter, {
        ...(await paletteOf(backdrop)),
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
