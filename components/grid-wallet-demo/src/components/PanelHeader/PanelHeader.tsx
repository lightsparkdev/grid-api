import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './PanelHeader.module.scss';

interface PanelHeaderProps {
  icon: ReactNode;
  title: string;
  className?: string;
}

export function PanelHeader({ icon, title, className }: PanelHeaderProps) {
  return (
    <header className={clsx(styles.header, className)}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{title}</span>
    </header>
  );
}
