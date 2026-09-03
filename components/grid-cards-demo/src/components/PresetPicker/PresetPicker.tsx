'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { PRESETS, type PresetId } from '@/data/presets';
import { motionTransition } from '@/lib/easing';
import styles from './PresetPicker.module.scss';

interface PresetPickerProps {
  selected: PresetId;
  onSelect: (id: PresetId) => void;
}

/** The six platforms as a tile grid (the Global Accounts platform picker).
 *  Picking one fills the Design controls below it. */
export function PresetPicker({ selected, onSelect }: PresetPickerProps) {
  return (
    <LayoutGroup>
      <div className={styles.group} role="group" aria-label="Platform preset">
        {PRESETS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={clsx(styles.card, isSelected && styles.cardSelected)}
              onClick={() => onSelect(opt.id)}
              aria-pressed={isSelected}
            >
              {isSelected ? (
                <motion.span
                  layoutId="preset-active-ring"
                  className={styles.activeRing}
                  transition={motionTransition(undefined, 0.22)}
                  aria-hidden
                />
              ) : null}
              <span className={styles.content}>
                <Image src={opt.iconSrc} alt="" width={48} height={48} className={styles.icon} />
                <span className={styles.label}>{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
