'use client';

import React, { type KeyboardEvent } from 'react';
import type { PreviewMode } from '@/statement/lifecycle';
import styles from './DeviceToggle.module.scss';

const DEVICES = [
  { id: 'mobile', label: 'Mobile' },
  { id: 'desktop', label: 'Desktop' },
] as const;

export function DeviceToggle({
  value,
  onChange,
}: {
  value: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const current = DEVICES.findIndex((device) => device.id === value);
    const next = DEVICES[(current + direction + DEVICES.length) % DEVICES.length];
    if (next.id === value) return;
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[data-device="${next.id}"]`)
      ?.focus();
    onChange(next.id);
  };

  return (
    <div
      className={styles.audienceToggle}
      role="radiogroup"
      aria-label="Preview device"
      onKeyDown={onKeyDown}
    >
      {DEVICES.map(({ id, label }) => (
        <button
          key={id}
          className={`${styles.audienceTab} ${value === id ? styles.audienceTabActive : ''}`}
          onClick={() => onChange(id)}
          type="button"
          role="radio"
          aria-checked={value === id}
          tabIndex={value === id ? 0 : -1}
          data-device={id}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
