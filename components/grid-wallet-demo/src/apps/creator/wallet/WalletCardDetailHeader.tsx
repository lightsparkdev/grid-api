'use client';

import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCrossMedium';
import { IconDotGrid1x3Horizontal } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconDotGrid1x3Horizontal';
import styles from './WalletCardDetailHeader.module.scss';

interface WalletCardDetailHeaderProps {
  onClose: () => void;
  /** Card-actions (more). Hidden during issuance — the card doesn't exist yet. */
  showActions?: boolean;
}

/** Card-view header — mirrors the Glitch home brand bar: bare central icons (no fill),
 *  a centered "Card" title, transparent (not purple). X (left) / Card / more (right). */
export function WalletCardDetailHeader({ onClose, showActions = true }: WalletCardDetailHeaderProps) {
  return (
    <div className={styles.root}>
      <button type="button" className={styles.button} aria-label="Close" onClick={onClose}>
        <IconCrossMedium size={24} />
      </button>
      <span className={styles.title}>Card</span>
      {showActions ? (
        <button type="button" className={styles.button} aria-label="More">
          <IconDotGrid1x3Horizontal size={24} />
        </button>
      ) : (
        <span className={styles.button} aria-hidden />
      )}
    </div>
  );
}
