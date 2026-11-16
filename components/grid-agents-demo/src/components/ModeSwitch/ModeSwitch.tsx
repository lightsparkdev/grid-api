'use client';

import clsx from 'clsx';
import { IconBuildings } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBuildings';
import { IconPeopleCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPeopleCircle';
import { LayoutGroup, motion } from 'motion/react';
import type { ComponentType } from 'react';
import { MODES, type Mode } from '@/data/mode';
import { motionTransition } from '@/lib/easing';
import { pressable } from '@/lib/sounds';
import styles from './ModeSwitch.module.scss';

const TABS: Record<Mode, { label: string; Icon: ComponentType<{ size?: number }>; color: string }> = {
  personal: { label: 'Personal', Icon: IconPeopleCircle, color: 'var(--color-sky-500)' },
  business: { label: 'Business', Icon: IconBuildings, color: '#34C759' },
};

interface ModeSwitchProps {
  mode: Mode;
  onSelect: (mode: Mode) => void;
}

/** Personal or business, each keeping its own conversation: two tiles in the agents' group style, the chosen one
 *  wearing their gradient ring, gliding between. */
export function ModeSwitch({ mode, onSelect }: ModeSwitchProps) {
  return (
    <LayoutGroup id="mode-tiles">
      <div className={styles.tiles} role="tablist" aria-label="Personal or business">
        {MODES.map((m) => {
          const { label, Icon, color } = TABS[m];
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={m === mode}
              className={clsx(styles.tile, m === mode && styles.active)}
              {...pressable({ onClick: () => m !== mode && onSelect(m) })}
            >
              {m === mode && <motion.span layoutId="mode-ring" className={styles.ring} transition={motionTransition(undefined, 0.22)} aria-hidden />}
              <span className={styles.content}>
                <span className={styles.icon} style={{ color }}>
                  <Icon size={20} />
                </span>
                <span className={styles.label}>{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
