import type { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './WalletSheet.module.scss';

interface WalletSheetProps {
  children?: ReactNode;
  className?: string;
}

/** Figma 90:13444 — full-bleed wallet sheet over the debit card (content TBD). */
export function WalletSheet({ children, className }: WalletSheetProps) {
  return <div className={clsx(styles.sheet, className)}>{children}</div>;
}
