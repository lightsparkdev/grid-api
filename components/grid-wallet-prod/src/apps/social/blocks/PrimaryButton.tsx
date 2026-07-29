import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import styles from './SheetButton.module.scss';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

/** Flat brand-primary pill — replaces GlassTextButton primary in Glitch sheets. */
export function PrimaryButton({ className, type = 'button', ...rest }: PrimaryButtonProps) {
  return (
    <ContentAreaButton
      type={type}
      variant="filled"
      className={clsx(styles.pill, className)}
      {...rest}
    />
  );
}
