import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './SheetIconButton.module.scss';

interface SheetIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** 40px on wallet toolbars; 44px default (passkey close). */
  size?: 40 | 44;
  'aria-label': string;
}

/** Flat round icon control — replaces GlassSymbolButton in Glitch sheets. */
export function SheetIconButton({
  children,
  className,
  size = 44,
  type = 'button',
  ...rest
}: SheetIconButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.button, size === 40 && styles.size40, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
