'use client';

import { Checkbox } from '@lightsparkdev/origin/checkbox';
import { IconGoogle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGoogle';
import { IconUserKey } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconUserKey';
import { IconApple } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconApple';
import { IconPhone } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhone';
import { IconEmail1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEmail1';
import type { AuthMethod } from '@/data/flow';
import { AUTH_METHODS } from '@/data/configure';
import styles from './AuthMethodPicker.module.scss';

type IconCmp = typeof IconGoogle;

const METHOD_ICONS: Record<AuthMethod, IconCmp> = {
  oauth: IconGoogle,
  passkey: IconUserKey,
  apple: IconApple,
  email_otp: IconEmail1,
  sms: IconPhone,
};

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
            <span className={styles.label}>{opt.label}</span>
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
