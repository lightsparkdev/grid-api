'use client';

import type { ReactNode } from 'react';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { SquareFlag } from './SquareFlag';
import styles from './FlagTile.module.scss';

/**
 * Rich flag tile (the Airbnb voice): the square flag sits inside a 2px
 * card-surface ring — CONCENTRIC squircles (outer r12, inner r10) — with the
 * wallet-card outside hairline (a halo stroke under the opaque fill, so only
 * the outer ~0.33px shows) and a soft drop shadow on the unclipped shell.
 */
export function FlagTile({ code, size }: { code: string; size?: number }) {
  return (
    <StickerTile size={size}>
      <SquareFlag code={code} />
    </StickerTile>
  );
}

/** The same sticker chrome around arbitrary art — e.g. the cash-balance tile
 *  (brand-pink fill + white glyph) or a neutral glyph tile (surface fill).
 *  `size` scales the WHOLE construction proportionally — ring width AND both
 *  radii (2/12/10 at 40) — so a big sticker is exactly the small one enlarged
 *  and the corner geometry can't drift. */
export function StickerTile({
  children,
  brand = false,
  neutral = false,
  size = 40,
}: {
  children: ReactNode;
  brand?: boolean;
  neutral?: boolean;
  size?: number;
}) {
  const s = size / 40;
  const outer = useSquircleClip<HTMLSpanElement>({ figmaRadii: 12 * s });
  const inner = useSquircleClip<HTMLSpanElement>({ figmaRadii: 10 * s });
  return (
    <span
      className={styles.shell}
      style={{ width: size, height: size }}
      data-large={size > 40 || undefined}
      aria-hidden
    >
      <span
        ref={outer.ref}
        style={{ ...outer.style, padding: 2 * s }}
        className={styles.ring}
      >
        <span
          ref={inner.ref}
          style={inner.style}
          className={brand ? styles.artBrand : neutral ? styles.artNeutral : styles.art}
        >
          {children}
        </span>
      </span>
      <SquircleFocusHalo
        path={outer.path}
        width={outer.width}
        height={outer.height}
        className={styles.halo}
      />
    </span>
  );
}
