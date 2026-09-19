import type { CSSProperties } from 'react';
import type { HexColor, StatementBrandColors } from './types';

export const DEFAULT_BRAND_COLORS: StatementBrandColors = {
  primaryBackground: '#ffffff',
  secondaryBackground: '#f7f7f6',
  primaryText: '#1a1a1a',
  secondaryText: '#656565',
};

export const BRAND_COLOR_SWATCHES: readonly HexColor[] = [
  '#ffffff',
  '#f7f7f6',
  '#1a1a1a',
  '#656565',
  '#0196c9',
  '#9147ff',
  '#ff385c',
  '#1daa61',
];

function rgbChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

export function normalizeHexColor(value: string): HexColor | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const expanded =
    match[1].length === 3
      ? match[1].replace(/./g, (character) => character + character)
      : match[1];
  return `#${expanded.toLowerCase()}`;
}

export function contrastRatio(foreground: HexColor, background: HexColor): number {
  const luminance = (hex: HexColor) => {
    const normalized = normalizeHexColor(hex);
    if (!normalized) return 0;
    const channels = [1, 3, 5].map((offset) =>
      rgbChannel(Number.parseInt(normalized.slice(offset, offset + 2), 16)),
    );
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export function brandContrast(colors: StatementBrandColors) {
  const primary = contrastRatio(colors.primaryText, colors.primaryBackground);
  const secondary = contrastRatio(colors.secondaryText, colors.secondaryBackground);
  return {
    primary,
    secondary,
    primaryPasses: primary >= 4.5,
    secondaryPasses: secondary >= 4.5,
  };
}

export function statementColorProperties(colors: StatementBrandColors) {
  return {
    '--statement-primary-background': colors.primaryBackground,
    '--statement-secondary-background': colors.secondaryBackground,
    '--statement-primary-text': colors.primaryText,
    '--statement-secondary-text': colors.secondaryText,
  } as CSSProperties;
}
