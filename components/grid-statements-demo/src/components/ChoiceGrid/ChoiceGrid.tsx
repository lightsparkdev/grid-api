'use client';

import { useEffect, useRef, type ElementType, type KeyboardEvent } from 'react';
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
  const groupRef = useRef<HTMLDivElement>(null);
  const followSelection = useRef(false);

  // Selecting a cell disables it, so focus has to move after the render. Moving
  // it inside the key handler targets a cell that is about to go disabled.
  useEffect(() => {
    if (!followSelection.current) return;
    followSelection.current = false;
    groupRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
  }, [value]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const current = options.findIndex((option) => option.id === value);
    const next = options[(current + direction + options.length) % options.length];
    if (next.id === value) return;
    followSelection.current = true;
    onChange(next.id);
  };

  return (
    <div
      ref={groupRef}
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
