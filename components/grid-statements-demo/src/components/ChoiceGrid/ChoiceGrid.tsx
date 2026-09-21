'use client';

import type { ElementType, KeyboardEvent } from 'react';
import clsx from 'clsx';
import { pressable } from '@/lib/sounds';
import styles from './ChoiceGrid.module.scss';

type ChoiceIcon = ElementType<{ size?: string | number }>;

interface Choice<Value extends string> {
  id: Value;
  label: string;
  Icon: ChoiceIcon;
}

interface ChoiceGridProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly Choice<Value>[];
  onChange: (value: Value) => void;
}

export function ChoiceGrid<Value extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceGridProps<Value>) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const focused = (document.activeElement as HTMLElement | null)?.dataset.choice;
    const current = options.findIndex((option) => option.id === (focused ?? value));
    const next = options[(current + direction + options.length) % options.length];
    onChange(next.id);
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[data-choice="${next.id}"]`)
      ?.focus();
  };

  return (
    <div
      className={styles.group}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map(({ id, label: optionLabel, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          disabled={value === id}
          tabIndex={value === id ? 0 : -1}
          data-choice={id}
          className={clsx(styles.option, value !== id && styles.optionEnabled)}
          {...pressable({ onClick: () => onChange(id) })}
        >
          <span className={styles.optionIcon}>
            <Icon size={24} />
          </span>
          <span className={styles.optionLabel}>{optionLabel}</span>
        </button>
      ))}
    </div>
  );
}
