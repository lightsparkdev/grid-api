import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRESETS, colorSwatchesForPreset, presetIconSrc } from './presets';

describe('statement presets', () => {
  it('uses the exact Cards preset IDs', () => {
    const cardsSource = readFileSync(
      resolve(process.cwd(), '../grid-cards-demo/src/data/presets.ts'),
      'utf8',
    );
    const cardsIds = [...cardsSource.matchAll(/^\s{4}id: '([^']+)'/gm)].map((match) => match[1]);

    expect(PRESETS.map((preset) => preset.id)).toEqual(cardsIds);
    expect(cardsIds).toEqual([
      'finance',
      'creator',
      'social',
      'marketplace',
      'ondemand',
      'messaging',
    ]);
  });

  it('uses the Cards company names and app icons', () => {
    expect(PRESETS.map((preset) => [preset.companyName, presetIconSrc(preset).split('/').at(-1)])).toEqual([
      ['Aurora', 'app-icon-finance.png'],
      ['Glitch', 'app-icon-creator.png'],
      ['Z', 'app-icon-social.png'],
      ['Waterbnb', 'app-icon-marketplace.png'],
      ['Super', 'app-icon-ondemand.png'],
      ['ChatsApp', 'app-icon-messaging.png'],
    ]);
  });

  it('returns exactly two distinct swatches for every preset token', () => {
    for (const preset of PRESETS) {
      for (const key of [
        'primaryBackground',
        'primaryText',
        'secondaryBackground',
        'secondaryText',
      ] as const) {
        const swatches = colorSwatchesForPreset(preset, key);
        expect(swatches).toHaveLength(2);
        expect(new Set(swatches).size).toBe(2);
      }
    }
  });
});
