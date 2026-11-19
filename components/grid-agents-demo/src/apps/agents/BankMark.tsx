import type { CSSProperties } from 'react';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { Flag } from '@/apps/shared/Flag';
import { BANK_LOGOS } from '@/data/bankLogos.generated';
import styles from './BankMark.module.scss';

/** A bank's file name under /assets/agents/banks, as scripts/fetch-bank-logos.mjs saves it. */
export const bankSlug = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * A bank as people recognize it: its app icon (or a bank glyph when there isn't one), with the country's flag
 * at the bottom right. `size` is the icon's side; skins tune the glyph tile and the flag's ring with
 * `--bank-tile`, `--bank-ink` and `--bank-ring` (the surface it sits on).
 */
export function BankMark({ bank, country, size = 36, className }: { bank: string; country?: string; size?: number; className?: string }) {
  const slug = bankSlug(bank);
  const flag = Math.round(size * 0.44);
  return (
    <span className={`${styles.mark} ${className ?? ''}`} style={{ '--size': `${size}px`, '--flag': `${flag}px` } as CSSProperties}>
      {BANK_LOGOS.has(slug) ? (
        <img className={styles.logo} src={`/assets/agents/banks/${slug}.png`} alt="" draggable={false} />
      ) : (
        <span className={styles.glyph}>
          <IconBank size={Math.round(size * 0.55)} />
        </span>
      )}
      {country && <Flag code={country} size={flag} className={styles.flag} />}
    </span>
  );
}
