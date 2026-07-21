'use client';

import { Checkbox } from '@lightsparkdev/origin/checkbox';
import { AUTH_METHOD_ICONS } from '@/apps/shared/authMethodIcons';
import type { AuthMethod } from '@/data/flow';
import { AUTH_METHODS } from '@/data/configure';
import styles from './AuthMethodPicker.module.scss';

const METHOD_ICONS = AUTH_METHOD_ICONS;

interface AuthMethodPickerProps {
  methods: AuthMethod[];
  onToggle: (method: AuthMethod) => void;
  disabled?: boolean;
}

export function AuthMethodPicker({ methods, onToggle, disabled }: AuthMethodPickerProps) {
  return (
    <div className={styles.group}>
      {AUTH_METHODS.map((opt) => {
        const Icon = METHOD_ICONS[opt.id];
        const isSelected = methods.includes(opt.id);
        const isDisabled = disabled || !opt.enabled;

        return (
          <button
            key={opt.id}
            type="button"
            className={styles.card}
            onClick={() => !isDisabled && onToggle(opt.id)}
            disabled={isDisabled}
            aria-pressed={isSelected}
          >
            <span className={styles.icon}>
              <Icon size={24} />
            </span>
            <span className={styles.label}>
              {opt.compactLabel ? (
                <>
                  <span className={styles.labelFull}>{opt.label}</span>
                  <span className={styles.labelCompact}>{opt.compactLabel}</span>
                </>
              ) : (
                opt.label
              )}
            </span>
            <Checkbox.Indicator
              checked={isSelected}
              disabled={isDisabled}
              className={styles.checkIndicator}
            />
          </button>
        );
      })}
    </div>
  );
}
