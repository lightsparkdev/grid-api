import { describe, expect, it } from 'vitest';
import { DEFAULT_BRAND } from './fixtures';
import {
  isUploadedLogo,
  parseStatementShareState,
  statementShareUrl,
} from './shareState';

const initial = {
  variant: 'consumer' as const,
  mode: 'mobile' as const,
  presetId: 'finance' as const,
  brand: DEFAULT_BRAND,
};

describe('statement share state', () => {
  it('round-trips the public statement choices', () => {
    const url = statementShareUrl('https://example.com/?theme=dark', {
      variant: 'commercial',
      mode: 'desktop',
      presetId: 'social',
      brand: {
        companyName: 'Shared brand',
        logo: { kind: 'none' },
        colors: {
          primaryBackground: '#102030',
          primaryText: '#fefefe',
          secondaryText: '#dddddd',
        },
      },
    });

    expect(parseStatementShareState(url, initial)).toMatchObject({
      variant: 'commercial',
      mode: 'desktop',
      presetId: 'social',
      brand: {
        companyName: 'Shared brand',
        logo: { kind: 'none' },
        colors: {
          primaryBackground: '#102030',
          primaryText: '#fefefe',
          secondaryText: '#dddddd',
        },
      },
    });
    expect(new URL(url).searchParams.get('theme')).toBe('dark');
  });

  it('drops uploaded blob: logos from the share link', () => {
    const uploaded = { kind: 'image' as const, src: 'blob:https://example.com/abc', alt: 'Logo' };
    const url = statementShareUrl('https://example.com/', {
      ...initial,
      brand: { ...DEFAULT_BRAND, logo: uploaded },
    });

    expect(isUploadedLogo(uploaded)).toBe(true);
    expect(isUploadedLogo(DEFAULT_BRAND.logo)).toBe(false);
    expect(isUploadedLogo({ kind: 'none' })).toBe(false);
    expect(new URL(url).searchParams.get('logo')).toBe('none');
    expect(parseStatementShareState(url, initial).brand.logo).toEqual({ kind: 'none' });
  });

  it('keeps preset logos in the share link', () => {
    const url = statementShareUrl('https://example.com/', initial);

    expect(new URL(url).searchParams.get('logo')).toBe('preset');
    expect(parseStatementShareState(url, initial).brand.logo.kind).toBe('image');
  });

  it('uses the selected preset for missing and invalid values', () => {
    const parsed = parseStatementShareState(
      'https://example.com/?preset=messaging&background=invalid',
      initial,
    );

    expect(parsed.presetId).toBe('messaging');
    expect(parsed.brand.companyName).toBe('ChatsApp');
    expect(parsed.brand.colors.primaryBackground).toBe('#ffffff');
  });
});
