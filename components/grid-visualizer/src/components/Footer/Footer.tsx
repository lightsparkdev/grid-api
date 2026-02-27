'use client';

import type { Theme } from '@/hooks/useTheme';
import { IconSun } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSun';
import { IconMoon } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMoon';
import { IconGithub } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGithub';
import styles from './Footer.module.scss';
import clsx from 'clsx';

interface FooterProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export function Footer({ theme, setTheme }: FooterProps) {
  return (
    <>
      <span className={styles.coordsLabel}>(0, 0, 0)</span>
      <button
        className={styles.toggle}
        type="button"
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <span
          data-mode="light"
          className={clsx(
            styles.toggleItem,
            theme === 'light' && styles.toggleItemActive,
          )}
        >
          <IconSun size={14} />
        </span>
        <span
          data-mode="dark"
          className={clsx(
            styles.toggleItem,
            theme === 'dark' && styles.toggleItemActive,
          )}
        >
          <IconMoon size={14} />
        </span>
      </button>

      <div className={styles.trailing}>
          <a href="https://grid.lightspark.com" className={styles.link} target="_blank" rel="noopener noreferrer">
            View docs
          </a>
          <a
            href="https://github.com/lightsparkdev"
            className={styles.iconLink}
            aria-label="GitHub"
          >
            <IconGithub size={20} />
          </a>
        </div>
    </>
  );
}
