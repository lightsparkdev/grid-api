'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { GlassConfig, GlassEngine } from '@/components/liquid-glass';
import { useGlassEngine } from '@/components/liquid-glass';
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

/**
 * Trim a glass preset for the running engine. On WebKit, chromatic aberration
 * fans the displacement out to three `feDisplacementMap` passes for a fringe
 * that's invisible under the sheet's tint — so we collapse it to a single pass.
 * (The heavier blur→backdrop-filter swap lives in the presets/LiquidGlass and
 * applies to every engine, so it isn't gated here.)
 */
function adaptGlassForEngine(cfg: GlassConfig, engine: GlassEngine): GlassConfig {
  if (!engine.isSafari || !cfg.chromaticAberration) return cfg;
  return { ...cfg, chromaticAberration: 0 };
}

/**
 * The single chokepoint: every sheet and glass button reads its preset here, so
 * the engine adaptation is applied once and nothing downstream needs an
 * `if (Safari)`.
 */
export function useOverlayGlass(): OverlayGlassPresets {
  const presets = useContext(OverlayGlassContext);
  const engine = useGlassEngine();
  return useMemo(
    () => ({
      sheet: adaptGlassForEngine(presets.sheet, engine),
      symbol: adaptGlassForEngine(presets.symbol, engine),
      text: adaptGlassForEngine(presets.text, engine),
    }),
    [presets, engine],
  );
}
