import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './WalletSheet.module.scss';

interface WalletSheetProps {
  children?: ReactNode;
  className?: string;
  /** Card detail open — hide lift shadow while the sheet is off-screen. */
  dismissed?: boolean;
}

/** Figma 90:13444 — full-bleed wallet sheet over the debit card (content TBD). */
export function WalletSheet({ children, className, dismissed }: WalletSheetProps) {
  return (
    <div className={clsx(styles.sheet, dismissed && styles.sheetDismissed, className)}>
      {children}
    </div>
  );
}
