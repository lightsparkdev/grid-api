import type { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './ContentAreaButton.module.scss';

interface ContentAreaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children?: ReactNode;
  /** Auth hero = quaternary; wallet sheet = bordered (Figma 90:13451); primary CTA = filled. */
  variant?: 'quaternary' | 'bordered' | 'filled';
}

/** Figma Button - Content Area (Fills/Quaternary or Bordered). */
export function ContentAreaButton({
  icon,
  children,
  variant = 'quaternary',
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
            : styles.quaternary,
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
