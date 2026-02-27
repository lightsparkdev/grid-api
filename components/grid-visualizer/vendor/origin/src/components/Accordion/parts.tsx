'use client';

import * as React from 'react';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { CentralIcon } from '../Icon';
import clsx from 'clsx';
import styles from './Accordion.module.scss';

export interface RootProps extends BaseAccordion.Root.Props {}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(
  function Root({ className, ...props }, ref) {
    return (
      <BaseAccordion.Root
        ref={ref}
        className={clsx(styles.root, className)}
        {...props}
      />
    );
  }
);

export interface ItemProps extends BaseAccordion.Item.Props {}

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  function Item({ className, ...props }, ref) {
    return (
      <BaseAccordion.Item
        ref={ref}
        className={clsx(styles.item, className)}
        {...props}
      />
    );
  }
);

export interface HeaderProps extends BaseAccordion.Header.Props {}

export const Header = React.forwardRef<HTMLHeadingElement, HeaderProps>(
  function Header({ className, ...props }, ref) {
    return (
      <BaseAccordion.Header
        ref={ref}
        className={clsx(styles.header, className)}
        {...props}
      />
    );
  }
);

export interface TriggerProps extends BaseAccordion.Trigger.Props {}

/**
 * Accordion trigger - renders children directly for full composition control.
 * Use with Accordion.Icon for the chevron indicator.
 * 
 * @example
 * ```tsx
 * <Accordion.Trigger>
 *   What is Base UI?
 *   <Accordion.Icon />
 * </Accordion.Trigger>
 * ```
 */
export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  function Trigger({ className, ...props }, ref) {
    return (
      <BaseAccordion.Trigger
        ref={ref}
        className={clsx(styles.trigger, className)}
        {...props}
      />
    );
  }
);

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Chevron icon for accordion triggers. Rotates when item is open.
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  function Icon({ className, ...props }, ref) {
    return (
      <span ref={ref} className={clsx(styles.icon, className)} {...props}>
        <CentralIcon name="IconChevronDownSmall" size={24} />
      </span>
    );
  }
);

export interface PanelProps extends BaseAccordion.Panel.Props {}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ className, children, ...props }, ref) {
    return (
      <BaseAccordion.Panel
        ref={ref}
        className={clsx(styles.panel, className)}
        {...props}
      >
        <div className={styles.panelContent}>{children}</div>
      </BaseAccordion.Panel>
    );
  }
);

