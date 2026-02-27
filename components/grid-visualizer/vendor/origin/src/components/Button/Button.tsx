'use client';

import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import clsx from 'clsx';
import { Loader } from '../Loader';
import styles from './Button.module.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'secondary' | 'outline' | 'ghost' | 'critical' | 'link';
  size?: 'default' | 'compact' | 'dense';
  loading?: boolean;
  loadingIndicator?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  iconOnly?: boolean;
  children?: React.ReactNode;
}

const defaultLoadingIndicator = <Loader />;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'filled',
      size = 'default',
      loading = false,
      loadingIndicator = defaultLoadingIndicator,
      disabled = false,
      leadingIcon,
      trailingIcon,
      iconOnly = false,
      children,
      className,
      ...props
    },
    ref
  ) {
    return (
      <BaseButton
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={clsx(
          styles.button,
          styles[variant],
          styles[size],
          iconOnly && styles.iconOnly,
          loading && styles.loading,
          className
        )}
        {...props}
      >
        {/* Content wrapper - hidden but preserved during loading to maintain width */}
        <span className={clsx(styles.content, loading && styles.contentHidden)}>
          {leadingIcon && <span className={styles.leadingIcon}>{leadingIcon}</span>}
          {iconOnly && children}
          {!iconOnly && children && <span className={styles.label}>{children}</span>}
          {trailingIcon && <span className={styles.trailingIcon}>{trailingIcon}</span>}
        </span>
        {/* Loader overlay - absolutely centered */}
        {loading && <span className={styles.loader}>{loadingIndicator}</span>}
      </BaseButton>
    );
  }
);

export default Button;
