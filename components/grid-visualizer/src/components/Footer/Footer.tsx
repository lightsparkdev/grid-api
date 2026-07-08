'use client';

import type { ThemePref } from '@/hooks/useTheme';
import { IconSun } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSun';
import { IconMoon } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMoon';
import { IconStudioDisplay } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconStudioDisplay';
import { IconGithub } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGithub';
import { DocsSystemIcon, DocsSunIcon, DocsMoonIcon } from './DocsThemeIcons';
import styles from './Footer.module.scss';
import clsx from 'clsx';

interface FooterProps {
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  /** Embedded in the docs — the toggle mirrors the docs' sidebar switcher
   *  pixel-for-pixel, including its exact glyphs. Standalone keeps the flow
   *  builder's own central-icons set (24-grid, non-scaling 1.5 stroke). */
  embed?: boolean;
}

// Mirrors the docs' Mintlify switcher: system / light / dark, in that order,
// with matching aria-labels — so the embedded footer and the docs sidebar
// read as the same control.
const OPTIONS = [
  {
    mode: 'system',
    label: 'Switch to system theme',
    Icon: IconStudioDisplay,
    DocsIcon: DocsSystemIcon,
  },
  { mode: 'light', label: 'Switch to light theme', Icon: IconSun, DocsIcon: DocsSunIcon },
  { mode: 'dark', label: 'Switch to dark theme', Icon: IconMoon, DocsIcon: DocsMoonIcon },
] as const;

export function Footer({ pref, setPref, embed = false }: FooterProps) {
  return (
    <>
      <span className={styles.coordsLabel}>(0, 0, 0)</span>
      <div className={styles.toggle} role="group" aria-label="Theme preference">
        {OPTIONS.map(({ mode, label, Icon, DocsIcon }) => (
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
            {embed ? <DocsIcon size={12} /> : <Icon size={14} />}
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
