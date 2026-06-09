'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import {
  SHEET_GLASS,
  SYMBOL_GLASS,
  TEXT_GLASS,
} from './presets';

export interface OverlayGlassPresets {
  sheet: GlassConfig;
  symbol: GlassConfig;
  text: GlassConfig;
}

export const DEFAULT_OVERLAY_GLASS: OverlayGlassPresets = {
  sheet: SHEET_GLASS,
  symbol: SYMBOL_GLASS,
  text: TEXT_GLASS,
};

const OverlayGlassContext = createContext<OverlayGlassPresets>(DEFAULT_OVERLAY_GLASS);

export function OverlayGlassProvider({
  value,
  children,
}: {
  value: OverlayGlassPresets;
  children: ReactNode;
}) {
  return (
    <OverlayGlassContext.Provider value={value}>{children}</OverlayGlassContext.Provider>
  );
}

export function useOverlayGlass(): OverlayGlassPresets {
  return useContext(OverlayGlassContext);
}
