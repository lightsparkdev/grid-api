'use client';

import type { ReactNode } from 'react';
import { AuroraLensButton, GlassSymbolButton, GlassWindowButtonGroup, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './WalletCardDetailHeader.module.scss';

interface WalletCardDetailHeaderProps {
  onClose: () => void;
  /** Card-actions pill (card numbers / more). Hidden during issuance — the card
   *  doesn't exist yet, so only the close button shows. */
  showActions?: boolean;
  /** The button sits over the full-screen issuance aurora — use the live WebGL
   *  aurora lens (refracts the real drifting field) and the white glyph. Off when
   *  it's over the flat wallet/card-home surface (plain SVG glass). */
  closeOnAurora?: boolean;
  /** Scroll-synced copy of the page content behind the header (card-home) — the
   *  buttons refract it live as the page scrolls underneath them. */
  scrollBackdrop?: ReactNode;
  /** Bumped per scroll frame on Safari — mints a fresh SVG filter id so the
   *  lens repaints (Safari caches filter output by id; see GlassConfig.refreshKey). */
  scrollRefreshKey?: number;
}

/** Figma 2143:40972 — close + card actions while debit card detail is open. */
export function WalletCardDetailHeader({
  onClose,
  showActions = true,
  closeOnAurora = false,
  scrollBackdrop,
  scrollRefreshKey,
}: WalletCardDetailHeaderProps) {
  const theme = useThemeMode();
  const brightness = headerGlassBrightness(theme);
  // The live aurora lens already shows the refracted field, so it needs only a
  // hint of the white lift the flat SVG glass uses — full brightness washes it
  // out on the light surface. (Dark stays 0.)
  const lensBrightness = brightness * 0.2;
  // Card-home buttons refract the live scrolling page — punch the optics up over
  // the SYMBOL_GLASS preset (depth 0.5 / scale 10 / chroma 0.25) so the bend and
  // color fringing read clearly as content passes under. A light themed frost
  // (~half the sheet tint) softens the busy content like the gear button's
  // neutral backdrop, while the refraction stays visible through it.
  const scrollGlass = scrollBackdrop
    ? {
        brightness,
        // Aave's circle-lens recipe (from their bundle), scaled to a 40px button
        // (half = 20): depth ~40% of the radius, a full hemispherical dome
        // (curvature 1.0 x half), and ALWAYS splay 1 — their lenses never splay
        // (SYMBOL_GLASS's 0.7 is what read square-ish). Highlights run gentler
        // than our preset: chroma ~0.2, glow 0.1, edge 0.25 @ 2.5px.
        depth: 4,
        // Hairline in-filter blur: feDisplacementMap samples nearest-neighbor (no
        // AA on displaced pixels), so a sub-px blur rounds the jaggies at the rim.
        blur: 0.4,
        domeDepth: 20,
        // True circular lens: dome the radial distance, bend along (x/r, y/r) —
        // Aave's circle-lens generator (vs. our per-axis rounded-rect dome).
        radialDome: true,
        splay: 1,
        scale: 24,
        chromaticAberration: 0.5,
        glowStrength: 0.1,
        glowSpread: 0.5,
        edgeStrength: 1,
        edgeWidth: 2,
        tint: 'color-mix(in srgb, var(--glass-sheet-tint) 50%, transparent)',
        tintBlur: 1,
        refreshKey: scrollRefreshKey,
      }
    : { brightness };

  return (
    <div className={styles.root}>
      {closeOnAurora ? (
        <AuroraLensButton
          aria-label="Close"
          size={40}
          type="button"
          className={styles.closeOnAurora}
          brightness={lensBrightness}
          onClick={onClose}
        >
          <SfSymbol name="xmark" size={14} />
        </AuroraLensButton>
      ) : (
        <GlassSymbolButton
          aria-label="Close"
          size={40}
          type="button"
          glass={scrollGlass}
          backdropNode={scrollBackdrop}
          onClick={onClose}
        >
          <SfSymbol name="xmark" size={14} />
        </GlassSymbolButton>
      )}

      {showActions ? (
        <GlassWindowButtonGroup
          symbols={[
            { name: 'creditcard.and.numbers', size: 24 },
            { name: 'ellipsis', size: 20 },
          ]}
          glass={scrollGlass}
          backdropNode={scrollBackdrop}
        />
      ) : null}
    </div>
  );
}
