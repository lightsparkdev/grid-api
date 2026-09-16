/* Dev: the exporter from the console. `__cardExport.still('square', 'dark')`
   opens the still in a new tab, `__cardExport.still('square', 'light', 'hand', 'h1')`
   in a hand; `__cardExport.video('brand')` downloads the spin. For checking
   renders without the share sheet. */

import type { CardDesign } from '@/data/design';
import { brandColorOf } from '@/data/design';
import { loadImage } from '../card3d/facePaint';
import {
  brandSurfaceFor,
  dominantColor,
  paletteFor,
  handToneFor,
  prepareTemplate,
  prepareTonedHand,
  warmTemplate,
  type BackdropId,
  type Treatment,
} from './compose';
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
    return { palette: paletteFor(backdrop, { brand: await brandSurfaceFor(d, cardColor), custom: null }) };
  };
  const render = async (
    format: StillFormat = 'square',
    backdrop: BackdropId = 'light',
    treatment: Treatment = 'template',
    hand = 'h1',
  ) => {
    await prepareTemplate();
    const { palette } = await paletteOf(backdrop);
    if (treatment === 'hand') await prepareTonedHand(hand, handToneFor(palette));
    return renderStill(exporter, { format, treatment, hand, palette });
  };
  w.__cardExport = {
    exporter,
    render,
    /** The Brand surface's source color for a picture, by URL. */
    dominant: async (url: string) => {
      const img = await loadImage(url);
      return img ? dominantColor(img) : null;
    },
    still: async (
      format: StillFormat = 'square',
      backdrop: BackdropId = 'light',
      treatment: Treatment = 'template',
      hand = 'h1',
    ) => {
      const blob = await render(format, backdrop, treatment, hand);
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
