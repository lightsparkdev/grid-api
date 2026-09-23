import { normalizeHexColor } from './brand';
import { PRESETS, presetIconSrc, type PresetId } from './presets';
import type { PreviewMode } from './lifecycle';
import type { StatementBrand, StatementLogo, StatementVariant } from './types';

export interface StatementShareState {
  variant: StatementVariant;
  mode: PreviewMode;
  presetId: PresetId;
  brand: StatementBrand;
}

const PRESET_IDS = new Set<PresetId>([
  'finance',
  'creator',
  'social',
  'marketplace',
  'ondemand',
  'messaging',
]);

/**
 * Uploaded logos are `blob:` object URLs scoped to the uploader's document.
 * They cannot travel in a share link, so the link drops them.
 */
export function isUploadedLogo(logo: StatementLogo) {
  return logo.kind === 'image' && logo.src.startsWith('blob:');
}

export function statementShareUrl(currentUrl: string, state: StatementShareState) {
  const url = new URL(currentUrl);
  url.searchParams.set('variant', state.variant);
  url.searchParams.set('view', state.mode);
  url.searchParams.set('preset', state.presetId);
  url.searchParams.set('brand', state.brand.companyName);
  url.searchParams.set('background', state.brand.colors.primaryBackground);
  url.searchParams.set('text', state.brand.colors.primaryText);
  url.searchParams.set('muted', state.brand.colors.secondaryText);
  const shareableLogo =
    state.brand.logo.kind === 'none' || isUploadedLogo(state.brand.logo) ? 'none' : 'preset';
  url.searchParams.set('logo', shareableLogo);
  return url.toString();
}

export function parseStatementShareState(
  currentUrl: string,
  fallback: StatementShareState,
): StatementShareState {
  const params = new URL(currentUrl).searchParams;
  const variant = params.get('variant');
  const mode = params.get('view');
  const preset = params.get('preset');
  const presetId = PRESET_IDS.has(preset as PresetId)
    ? (preset as PresetId)
    : fallback.presetId;
  const selectedPreset =
    PRESETS.find((candidate) => candidate.id === presetId) ?? PRESETS[0];
  const presetBrand: StatementBrand = {
    companyName: selectedPreset.companyName,
    logo: {
      kind: 'image',
      src: presetIconSrc(selectedPreset),
      alt: `${selectedPreset.companyName} logo`,
    },
    colors: selectedPreset.colors,
  };
  const colors = {
    primaryBackground:
      normalizeHexColor(params.get('background') ?? '') ??
      presetBrand.colors.primaryBackground,
    primaryText:
      normalizeHexColor(params.get('text') ?? '') ?? presetBrand.colors.primaryText,
    secondaryText:
      normalizeHexColor(params.get('muted') ?? '') ??
      presetBrand.colors.secondaryText,
  };

  return {
    variant:
      variant === 'consumer' || variant === 'commercial' ? variant : fallback.variant,
    mode: mode === 'mobile' || mode === 'desktop' ? mode : fallback.mode,
    presetId,
    brand: {
      ...presetBrand,
      companyName: params.get('brand')?.slice(0, 40) || presetBrand.companyName,
      colors,
      logo: params.get('logo') === 'none' ? { kind: 'none' } : presetBrand.logo,
    },
  };
}
