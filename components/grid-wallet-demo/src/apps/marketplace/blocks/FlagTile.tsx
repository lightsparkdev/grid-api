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
export function FlagTile({ code }: { code: string }) {
  return (
    <StickerTile>
      <SquareFlag code={code} />
    </StickerTile>
  );
}

/** The same sticker chrome around arbitrary art — e.g. the cash-balance tile
 *  (brand-pink fill + white glyph). */
export function StickerTile({ children, brand = false }: { children: ReactNode; brand?: boolean }) {
  const outer = useSquircleClip<HTMLSpanElement>({ figmaRadii: 12 });
  const inner = useSquircleClip<HTMLSpanElement>({ figmaRadii: 10 });
  return (
    <span className={styles.shell} aria-hidden>
      <span ref={outer.ref} style={outer.style} className={styles.ring}>
        <span
          ref={inner.ref}
          style={inner.style}
          className={brand ? styles.artBrand : styles.art}
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
