'use client';

import { IconLayoutWindow } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLayoutWindow';
import { IconPhone } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhone';
import { Glass, TEXT_GLASS } from '@/components/liquid-glass';
import type { PreviewMode } from '@/statement/lifecycle';
import styles from './DeviceToggle.module.scss';

export function DeviceToggle({
  value,
  onChange,
}: {
  value: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  return (
    <Glass {...TEXT_GLASS} className={styles.glass}>
      <div className={styles.group} role="radiogroup" aria-label="Preview device">
        {[
          { id: 'mobile', label: 'Mobile', Icon: IconPhone },
          { id: 'desktop', label: 'Desktop', Icon: IconLayoutWindow },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            className={styles.option}
            data-active={value === id || undefined}
            onClick={() => onChange(id as PreviewMode)}
          >
            <Icon size={18} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </Glass>
  );
}
