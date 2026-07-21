// Aurora's signature visual: the procedural "aurora" WebGL/CSS field + the glass
// lenses that refract it. Lives in apps/aurora (not shared) — it's Aurora's look;
// other skins bring their own background. The shared glass/notification layer
// stays skin-blind and accepts this as an injected lens.
export { AuroraBackground } from './AuroraBackground';
export { AuroraCssField } from './AuroraCssField';
export { AuroraLensButton } from './AuroraLensButton';
export { AuroraLensPanel } from './AuroraLensPanel';
export {
  NOTIFICATION_LENS_GLASS,
  NOTIFICATION_LENS_GLASS_DARK,
  AURORA_FIELD_SELECTOR,
} from './lensPresets';
