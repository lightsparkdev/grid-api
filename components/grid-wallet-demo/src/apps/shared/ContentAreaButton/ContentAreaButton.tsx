import type { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './ContentAreaButton.module.scss';

interface ContentAreaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children?: ReactNode;
  /** Auth hero = quaternary; wallet sheet = bordered (Figma 90:13451); primary
   *  CTA = filled; inline chip on a card (Use max) = secondary. */
  variant?: 'quaternary' | 'secondary' | 'bordered' | 'filled';
  /** Small = the iOS Small content-area chip (Figma 109:29074) — hugs its label. */
  size?: 'default' | 'small';
}

/** Figma Button - Content Area (Fills/Quaternary or Bordered). */
export function ContentAreaButton({
  icon,
  children,
  variant = 'quaternary',
  size = 'default',
  className,
  type = 'button',
  ...rest
}: ContentAreaButtonProps) {
  const iconOnly = Boolean(icon) && children == null;

  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        variant === 'bordered'
          ? styles.bordered
          : variant === 'filled'
            ? styles.filled
            : variant === 'secondary'
              ? styles.secondary
              : styles.quaternary,
        size === 'small' && styles.small,
        iconOnly && styles.iconOnly,
        className,
      )}
      {...rest}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {children != null ? <span className={styles.label}>{children}</span> : null}
    </button>
  );
}
