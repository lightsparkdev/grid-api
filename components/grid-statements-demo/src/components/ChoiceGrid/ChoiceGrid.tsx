'use client';

import React, { type ElementType, type KeyboardEvent, useId } from 'react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import { motionTransition } from '@/lib/easing';
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
  const layoutGroupId = useId();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const current = options.findIndex((option) => option.id === value);
    const next = options[(current + direction + options.length) % options.length];
    if (next.id === value) return;
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[data-choice="${next.id}"]`)
      ?.focus();
    onChange(next.id);
  };

  return (
    <div
      className={styles.group}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {options.map(({ id, label: optionLabel, Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-choice={id}
            className={clsx(styles.option, selected && styles.optionSelected)}
            {...pressable({ onClick: () => onChange(id) })}
          >
            {selected ? (
              <motion.span
                layoutId={`${layoutGroupId}-active-ring`}
                className={styles.activeRing}
                data-active-ring
                transition={motionTransition(undefined, 0.22)}
                aria-hidden
              />
            ) : null}
            <span className={styles.content}>
              <span className={styles.optionIcon}>
                <Icon size={22} />
              </span>
              <span className={styles.optionLabel}>{optionLabel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
