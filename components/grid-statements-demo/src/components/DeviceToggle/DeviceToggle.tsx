'use client';

import React, { type KeyboardEvent } from 'react';
import dynamic from 'next/dynamic';
import { IconLayoutWindow } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLayoutWindow';
import { IconPhone } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhone';
import {
  TEXT_GLASS,
  TEXT_GLASS_BACKDROP,
} from '@/components/liquid-glass';
import type { PreviewMode } from '@/statement/lifecycle';
import styles from './DeviceToggle.module.scss';

const GlassOver = dynamic(
  () =>
    import('@/components/liquid-glass/WalletGlassOver').then(
      (module) => module.GlassOver,
    ),
  { ssr: false },
);

const DEVICES = [
  { id: 'mobile', label: 'Mobile', Icon: IconPhone },
  { id: 'desktop', label: 'Desktop', Icon: IconLayoutWindow },
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
    <GlassOver
      {...TEXT_GLASS}
      backdrop={TEXT_GLASS_BACKDROP}
      className={styles.glass}
    >
      <div
        className={styles.group}
        role="radiogroup"
        aria-label="Preview device"
        onKeyDown={onKeyDown}
      >
        {DEVICES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            tabIndex={value === id ? 0 : -1}
            data-device={id}
            className={styles.option}
            data-active={value === id || undefined}
            onClick={() => onChange(id)}
          >
            <Icon size={18} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </GlassOver>
  );
}
