/* The brand's app icon, for the phone's push notifications. A preset's is the
   platform's own icon; a design of the visitor's gets one made from the brand
   on its card: the logo (as a mark, in the ink) or the wordmark's initial, on
   a square of the brand color, held to the sheet tile's fill so it reads on
   the surface. */

import { useEffect, useState } from 'react';
import { CARD_FONT_FAMILY, loadCardFont } from '@/components/CardStage/card3d/cardFont';
import { BRAND_CAP, BRAND_TEXT_WEIGHT, loadImage } from '@/components/CardStage/card3d/facePaint';
import { brandColorOf, type CardDesign } from '@/data/design';
import { PRESETS, presetOf } from '@/data/presets';
import type { Theme } from '@/hooks/useTheme';
import { brandFill } from './brandPalette';

/** iOS's notification icon is 38pt; painted at 3x. */
const SIZE = 76 * 3;
/** The square's corner, as the iOS icon's (17/76 of its side). */
const RADIUS = (SIZE * 17) / 76;
/** The logo fits a box this share of the side, centered. */
const LOGO_SHARE = 0.56;
/** The monogram's em, as a share of the side. */
const MONOGRAM_EM = 0.5;

function roundedSquare(ctx: CanvasRenderingContext2D, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(0, 0, SIZE, SIZE, RADIUS);
  ctx.fill();
}

/** The brand tile with no mark yet (shown while the mark is being made). */
function tileOnly(fill: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 76"><rect width="76" height="76" rx="17" fill="${fill}"/></svg>`,
  )}`;
}

async function paintAppIcon(design: CardDesign, fill: string, ink: string): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  roundedSquare(ctx, fill);

  const logo = design.logoUrl ? await loadImage(design.logoUrl) : null;
  if (logo) {
    // The logo's alpha in the ink: the shape as a mark, whatever its colors.
    const box = SIZE * LOGO_SHARE;
    const scale = Math.min(box / logo.naturalWidth, box / logo.naturalHeight);
    const w = logo.naturalWidth * scale;
    const h = logo.naturalHeight * scale;
    const mark = document.createElement('canvas');
    mark.width = SIZE;
    mark.height = SIZE;
    const m = mark.getContext('2d')!;
    m.drawImage(logo, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
    m.globalCompositeOperation = 'source-in';
    m.fillStyle = ink;
    m.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(mark, 0, 0);
  } else {
    // The wordmark's initial, in the card's face.
    await loadCardFont();
    const initial = Array.from(design.programName.trim() || 'Your brand')[0].toUpperCase();
    const em = SIZE * MONOGRAM_EM;
    ctx.fillStyle = ink;
    ctx.font = `${BRAND_TEXT_WEIGHT} ${em}px "${CARD_FONT_FAMILY}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    // The cap centered on the square: baseline half a cap below its middle.
    ctx.fillText(initial, SIZE / 2, SIZE / 2 + (em * BRAND_CAP) / 2);
  }
  return canvas.toDataURL('image/png');
}

export function useAppIcon(design: CardDesign, theme: Theme): string {
  const presetId = presetOf(design);
  const presetIcon = presetId ? PRESETS.find((p) => p.id === presetId)?.iconSrc ?? null : null;
  const { fill, ink } = brandFill(brandColorOf(design), theme);
  const key = `${fill}|${ink}|${design.logoUrl ?? ''}|${design.programName}`;
  const [made, setMade] = useState<{ key: string; url: string } | null>(null);
  useEffect(() => {
    if (presetIcon) return;
    let alive = true;
    paintAppIcon(design, fill, ink).then((url) => {
      if (alive) setMade({ key, url });
    });
    return () => {
      alive = false;
    };
    // The key carries every input the icon reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, presetIcon]);
  if (presetIcon) return presetIcon;
  return made?.key === key ? made.url : tileOnly(fill);
}
