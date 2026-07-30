import type { FrostConfig } from '@/components/liquid-glass';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';

/** Flat solid bottom sheet for Z overlays (email/phone auth) — NO glass: no
 *  backdrop blur, no edge glint. FrostPanel only handles the squircle clip +
 *  shadow; the fill is the app background token so the sheet is fully opaque and
 *  matches the screen surface. */
export const SOCIAL_FLAT_SHEET: FrostConfig = {
  radius: 32,
  cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
  tint: 'var(--z-sheet-bg)',
  tintBlur: 0,
  // Fully flat: no specular rim, no keyline — just the surface + a soft drop shadow.
  edge: 'none',
  edgeGlint: false,
  edgeWidth: 0,
  shadow: '0 15px 40px rgba(0, 0, 0, 0.18)',
};
