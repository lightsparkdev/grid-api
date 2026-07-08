'use client';

import type { ThemePref } from '@/hooks/useTheme';
import { IconSun } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSun';
import { IconMoon } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMoon';
import { IconStudioDisplay } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconStudioDisplay';
import { IconGithub } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGithub';
import styles from './Footer.module.scss';
import clsx from 'clsx';

interface FooterProps {
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
}

// Mirrors the docs' Mintlify switcher: system / light / dark, in that order,
// with matching aria-labels — so the embedded footer and the docs sidebar
// read as the same control.
const OPTIONS: { mode: ThemePref; label: string; Icon: typeof IconSun }[] = [
  { mode: 'system', label: 'Switch to system theme', Icon: IconStudioDisplay },
  { mode: 'light', label: 'Switch to light theme', Icon: IconSun },
  { mode: 'dark', label: 'Switch to dark theme', Icon: IconMoon },
];

export function Footer({ pref, setPref }: FooterProps) {
  return (
    <>
      <span className={styles.coordsLabel}>(0, 0, 0)</span>
      <div className={styles.toggle} role="group" aria-label="Theme preference">
        {OPTIONS.map(({ mode, label, Icon }) => (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={pref === mode}
            data-mode={mode}
            className={clsx(
              styles.toggleItem,
              pref === mode && styles.toggleItemActive,
            )}
            onClick={() => setPref(mode)}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      <div className={styles.trailing}>
          <a href="https://docs.lightspark.com" className={styles.link} target="_blank" rel="noopener noreferrer">
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
