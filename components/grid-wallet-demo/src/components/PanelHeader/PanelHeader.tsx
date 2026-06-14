import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './PanelHeader.module.scss';

interface PanelHeaderProps {
  icon: ReactNode;
  title: string;
  className?: string;
  /** Optional right-aligned content (e.g. a Reset action). */
  actions?: ReactNode;
}

export function PanelHeader({ icon, title, className, actions }: PanelHeaderProps) {
  return (
    <header className={clsx(styles.header, className)}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{title}</span>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
