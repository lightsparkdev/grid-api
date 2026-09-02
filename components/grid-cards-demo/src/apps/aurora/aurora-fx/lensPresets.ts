import { TEXT_GLASS } from '@/apps/shared/glass';

// Safari WebGL notification-lens optics — the SAME knobs as the Chromium
// GlassOver in GlassNotification (keep in sync by eye): the issuance-X tuning
// family with the prominent rim/specular. The lens recomputes the live aurora at
// bent coordinates, so it needs no displacement map. The highlight reads hotter
// over the dark field, so dark mode pulls the specular back.
export const NOTIFICATION_LENS_GLASS = {
  ...TEXT_GLASS,
  depth: 2,
  scale: 22,
  splay: 0.7,
  chromaticAberration: 0.5,
  edgeStrength: 1.6,
  edgeWidth: 1,
  specularStrength: 1.6,
};
export const NOTIFICATION_LENS_GLASS_DARK = {
  ...NOTIFICATION_LENS_GLASS,
  edgeStrength: 1.1,
  specularStrength: 0.9,
};

// Aurora's sign-in field is tagged fieldId="signin" (AuthSheet's AuroraBackground).
export const AURORA_FIELD_SELECTOR = '[data-aurora-field="signin"]';
