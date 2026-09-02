import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import styles from './SheetButton.module.scss';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

/** Flat secondary pill — replaces GlassTextButton secondary in Glitch sheets. */
export function SecondaryButton({ className, type = 'button', ...rest }: SecondaryButtonProps) {
  return (
    <ContentAreaButton
      type={type}
      variant="secondary"
      className={clsx(styles.pill, styles.secondary, className)}
      {...rest}
    />
  );
}
