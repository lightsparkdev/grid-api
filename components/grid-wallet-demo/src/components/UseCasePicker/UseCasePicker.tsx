'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { LayoutGroup, motion } from 'motion/react';
import { USE_CASES, type UseCaseId } from '@/data/configure';
import { motionTransition } from '@/lib/easing';
import styles from './UseCasePicker.module.scss';

interface UseCasePickerProps {
  selected: UseCaseId;
  onSelect: (id: UseCaseId) => void;
}

export function UseCasePicker({ selected, onSelect }: UseCasePickerProps) {
  return (
    <LayoutGroup>
      <div className={styles.group}>
        {USE_CASES.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={clsx(styles.card, isSelected && styles.cardSelected)}
              // Only the built use case selects; the others are clickable no-ops so
              // the active indicator stays put (they dim on group hover instead).
              onClick={opt.built ? () => onSelect(opt.id) : undefined}
              data-unbuilt={!opt.built || undefined}
              disabled={!opt.enabled}
              aria-pressed={isSelected}
            >
              {isSelected ? (
                <motion.span
                  layoutId="use-case-active-ring"
                  className={styles.activeRing}
                  transition={motionTransition(undefined, 0.22)}
                  aria-hidden
                />
              ) : null}
              <span className={styles.content}>
                <Image
                  src={opt.iconSrc}
                  alt=""
                  width={48}
                  height={48}
                  className={styles.icon}
                />
                <span className={styles.label}>{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
