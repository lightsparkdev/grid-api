'use client';

import * as React from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import clsx from 'clsx';
import styles from './Toggle.module.scss';

// --- Toggle ---

export interface ToggleProps extends BaseToggle.Props {}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle({ className, ...props }, ref) {
    return (
      <BaseToggle
        ref={ref}
        className={clsx(styles.toggle, className)}
        {...props}
      />
    );
  },
);

// --- ToggleGroup ---

export interface ToggleGroupProps extends BaseToggleGroup.Props {}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup({ className, ...props }, ref) {
    return (
      <BaseToggleGroup
        ref={ref}
        className={clsx(styles.toggleGroup, className)}
        {...props}
      />
    );
  },
);

// Display names for debugging
if (process.env.NODE_ENV !== 'production') {
  Toggle.displayName = 'Toggle';
  ToggleGroup.displayName = 'ToggleGroup';
}
