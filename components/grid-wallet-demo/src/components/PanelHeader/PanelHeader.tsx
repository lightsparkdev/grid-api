import type { ReactNode } from 'react';
import styles from './PanelHeader.module.scss';

interface PanelHeaderProps {
  icon: ReactNode;
  title: string;
}

export function PanelHeader({ icon, title }: PanelHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{title}</span>
    </header>
  );
}
