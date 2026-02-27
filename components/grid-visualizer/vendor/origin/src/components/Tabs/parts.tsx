'use client';

import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import clsx from 'clsx';
import styles from './Tabs.module.scss';

export interface RootProps extends BaseTabs.Root.Props {}

export const Root = React.forwardRef<HTMLDivElement, RootProps>(
  function Root({ className, ...props }, ref) {
    return (
      <BaseTabs.Root
        ref={ref}
        className={clsx(styles.root, className)}
        {...props}
      />
    );
  }
);

export interface ListProps extends BaseTabs.List.Props {
  variant?: 'default' | 'minimal';
}

/**
 * Tab list container - compose with Tabs.Indicator for the active indicator.
 * 
 * @example
 * ```tsx
 * <Tabs.List>
 *   <Tabs.Indicator />
 *   <Tabs.Tab value="a">Tab A</Tabs.Tab>
 *   <Tabs.Tab value="b">Tab B</Tabs.Tab>
 * </Tabs.List>
 * ```
 */
export const List = React.forwardRef<HTMLDivElement, ListProps>(
  function List({ className, variant = 'default', ...props }, ref) {
    return (
      <BaseTabs.List
        ref={ref}
        className={clsx(styles.list, styles[variant], className)}
        {...props}
      />
    );
  }
);

export interface IndicatorProps extends BaseTabs.Indicator.Props {}

export const Indicator = React.forwardRef<HTMLSpanElement, IndicatorProps>(
  function Indicator({ className, ...props }, ref) {
    return (
      <BaseTabs.Indicator
        ref={ref}
        className={clsx(styles.indicator, className)}
        {...props}
      />
    );
  }
);

export interface TabProps extends BaseTabs.Tab.Props {}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  function Tab({ className, ...props }, ref) {
    return (
      <BaseTabs.Tab
        ref={ref}
        className={clsx(styles.tab, className)}
        {...props}
      />
    );
  }
);

export interface PanelProps extends BaseTabs.Panel.Props {}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel({ className, ...props }, ref) {
    return (
      <BaseTabs.Panel
        ref={ref}
        className={clsx(styles.panel, className)}
        {...props}
      />
    );
  }
);
