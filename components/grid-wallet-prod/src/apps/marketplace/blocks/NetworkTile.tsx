'use client';

import { StickerTile } from './FlagTile';
import styles from './NetworkTile.module.scss';

/** Each network logo's own tile color (the SVG's baked-in rect fill) — the
 *  sticker art matches it so a small centered logo reads as glyph-on-brand
 *  instead of a tile-within-a-tile. */
const NETWORK_BG: Record<string, string> = {
  spark: '#000000',
  ethereum: '#ffffff',
  solana: '#000000',
  base: '#ffffff',
  tron: '#ff060a',
  bitcoin: '#ff8c42',
};

/** Icon share of the sticker (36px inside the activity list's 56px tile). */
const ICON_RATIO = 36 / 56;

/**
 * Crypto-network sticker — the sticker chrome filled with the network's brand
 * color, the logo scaled DOWN and centered (its baked-in background blends
 * into the matching backdrop, leaving a right-sized glyph).
 */
export function NetworkTile({ logo, size = 40 }: { logo: string; size?: number }) {
  const key = logo.match(/icon-network-([a-z]+)\.svg$/)?.[1] ?? '';
  const icon = Math.round(size * ICON_RATIO);
  return (
    <StickerTile size={size}>
      <span className={styles.art} style={{ background: NETWORK_BG[key] ?? '#000000' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={icon} height={icon} alt="" draggable={false} />
      </span>
    </StickerTile>
  );
}
