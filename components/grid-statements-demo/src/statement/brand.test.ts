import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BRAND_COLORS,
  brandContrast,
  contrastRatio,
  normalizeHexColor,
  statementColorProperties,
} from './brand';

describe('statement brand colors', () => {
  it('calculates WCAG contrast for readable and unreadable pairs', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.478, 3);
    expect(brandContrast(DEFAULT_BRAND_COLORS)).toMatchObject({
      primaryPasses: true,
      secondaryPasses: true,
    });
  });

  it('normalizes valid colors and rejects invalid input', () => {
    expect(normalizeHexColor(' ABC ')).toBe('#aabbcc');
    expect(normalizeHexColor('#12ef90')).toBe('#12ef90');
    expect(normalizeHexColor('transparent')).toBeNull();
  });

  it('maps only the three public tokens to print CSS properties', () => {
    expect(statementColorProperties(DEFAULT_BRAND_COLORS)).toEqual({
      '--statement-primary-background': '#ffffff',
      '--statement-primary-text': '#1a1a1a',
      '--statement-secondary-text': '#656565',
    });
  });
});
