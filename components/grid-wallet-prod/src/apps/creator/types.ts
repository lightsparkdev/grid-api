import type { ComponentType } from 'react';

/** central-icons / SfSymbol-compatible glyph component (accepts `size`). */
export type SkinIcon = ComponentType<{ size?: number | string; className?: string }>;

export interface SkinTabBarItem {
  Icon: SkinIcon;
  /** Glyph shown when the item is active (e.g. a filled variant); falls back to `Icon`. */
  activeIcon?: SkinIcon;
  label: string;
  active?: boolean;
}

export interface SkinTabBarConfig {
  items: SkinTabBarItem[];
  /** Center floating action button (decorative for v1). */
  fab?: { Icon: SkinIcon; ariaLabel: string };
}
