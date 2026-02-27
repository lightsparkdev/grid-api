'use client';

import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import clsx from 'clsx';
import styles from './Switch.module.scss';

export interface SwitchProps extends Omit<BaseSwitch.Root.Props, 'className'> {
  /**
   * The size variant of the switch.
   * @default 'md'
   */
  size?: 'sm' | 'md';
  className?: string;
}

export const Switch = React.forwardRef<HTMLSpanElement, SwitchProps>(
  function Switch(props, ref) {
    const { size = 'md', className, ...other } = props;

    return (
      <BaseSwitch.Root
        ref={ref}
        className={clsx(styles.root, styles[size], className)}
        {...other}
      >
        <BaseSwitch.Thumb className={styles.thumb} />
      </BaseSwitch.Root>
    );
  }
);

if (process.env.NODE_ENV !== 'production') {
  Switch.displayName = 'Switch';
}

export default Switch;
