import { describe, expect, it } from 'vitest';
import { DEFAULT_BRAND } from './fixtures';
import { parseStatementShareState, statementShareUrl } from './shareState';

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
