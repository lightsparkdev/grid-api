import type { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './ContentAreaButton.module.scss';

interface ContentAreaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children: ReactNode;
}

/** Figma "Button - Content Area" — pill fill on app screens (not glass). */
export function ContentAreaButton({
  icon,
  children,
  className,
  type = 'button',
  ...rest
}: ContentAreaButtonProps) {
  return (
    <button type={type} className={clsx(styles.button, className)} {...rest}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </button>
  );
}
