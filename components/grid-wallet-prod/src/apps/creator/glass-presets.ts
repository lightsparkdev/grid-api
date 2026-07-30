import type { FrostConfig } from '@/components/liquid-glass';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';

/** Flat solid bottom sheet for Glitch overlays (email/phone auth + Send/Receive)
 *  — no backdrop blur, no glassy edge glint. FrostPanel still handles squircle
 *  clip + shadow; the fill is the app background token so these sheets match the
 *  money sheet's surface exactly. */
export const CREATOR_FLAT_SHEET: FrostConfig = {
  radius: 40,
  cornerSmoothing: PHONE_SHELL_GLASS.cornerSmoothing,
  tint: 'var(--app-bg)',
  tintBlur: 0,
  edge: 'var(--sheet-flat-edge)',
  edgeGlint: false,
  edgeWidth: 0.5,
  shadow: '0 15px 37.5px rgba(0, 0, 0, 0.18)',
};
