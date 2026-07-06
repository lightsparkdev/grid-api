'use client';

import styles from './PlainMarks.module.scss';

/** Plain circular country flag — the flag assets are circular by design, so
 *  this is just the bare image at glyph scale. No sticker ring, no halo:
 *  the ondemand list voice is "bare glyphs or plain circles". */
export function CircleFlag({ code, size = 28 }: { code: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.circle}
      src={`/assets/flags/${code}.svg`}
      width={size}
      height={size}
      alt=""
      draggable={false}
    />
  );
}

/** Plain circular network logo — the logo SVGs carry a baked-in brand-color
 *  background rect; clipping to a circle turns that into the circle fill. */
export function CircleLogo({ src, size = 28 }: { src: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={styles.circle}
      src={src}
      width={size}
      height={size}
      alt=""
      draggable={false}
    />
  );
}
