export { default as LiquidGlass } from './LiquidGlass';
/** Alias — same component, shorter name for app UI. */
export { default as Glass } from './LiquidGlass';
export type { GlassConfig, LiquidGlassProps, LensRect } from './LiquidGlass';
/** Wrapper for "glass over a known backdrop" (button / tab bar / card). */
export { GlassOver } from './GlassOver';
export type { GlassOverProps } from './GlassOver';
/** Cheap, non-refractive frosted surface (sheets/modals) — no SVG filter. */
export { FrostPanel } from './FrostPanel';
export type { FrostPanelProps } from './FrostPanel';
export { DEFAULT_GLASS, PHONE_SHELL_GLASS, SWITCH_GLASS, SLIDER_GLASS } from './presets';
export {
  renderDisplacementMap,
  displacementMapToDataURL,
  computeDomeConstants,
  domeGradient,
  erf,
} from './displacement';
export type { DisplacementMapOptions } from './displacement';
export { squirclePath } from './squircle';
/** Engine gate — WebKit (Safari/iOS) needs a trimmed filter graph. */
export { useGlassEngine } from './useGlassEngine';
export type { GlassEngine } from './useGlassEngine';
