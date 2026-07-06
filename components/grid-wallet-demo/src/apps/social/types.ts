import type { ComponentType } from 'react';

/** central-icons / ZLogo-compatible glyph component (accepts `size`/`className`). */
export type SkinIcon = ComponentType<{ size?: number | string; className?: string }>;

export interface SkinTabBarItem {
  Icon: SkinIcon;
  /** Glyph shown when active (e.g. a filled variant); falls back to `Icon`. */
  activeIcon?: SkinIcon;
  label: string;
  active?: boolean;
}

export interface SkinTabBarConfig {
  items: SkinTabBarItem[];
}
