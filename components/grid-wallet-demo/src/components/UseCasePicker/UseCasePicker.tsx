'use client';

import Image from 'next/image';
import clsx from 'clsx';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { USE_CASES, type UseCaseId } from '@/data/configure';
import styles from './UseCasePicker.module.scss';

interface UseCasePickerProps {
  selected: UseCaseId;
  onSelect: (id: UseCaseId) => void;
}

export function UseCasePicker({ selected, onSelect }: UseCasePickerProps) {
  return (
    <div className={styles.list}>
      {USE_CASES.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={clsx(styles.card, isSelected && styles.cardSelected)}
            onClick={() => onSelect(opt.id)}
            disabled={!opt.enabled}
            aria-pressed={isSelected}
          >
            <span className={styles.iconBox}>
              <Image
                src={opt.iconSrc}
                alt=""
                width={28}
                height={28}
                className={styles.icon}
              />
            </span>
            <span className={styles.label}>{opt.label}</span>
            {isSelected && (
              <span className={styles.check} aria-hidden>
                <IconCheckmark2Small size={24} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
