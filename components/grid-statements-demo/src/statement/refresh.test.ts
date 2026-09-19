import { describe, expect, it } from 'vitest';
import { apiRefreshKey, apiRefreshSelectionAfter } from './refresh';

const initial = {
  variant: 'consumer',
  presetSequence: 0,
} as const;

describe('statement API refresh triggers', () => {
  it.each([
    { type: 'account', value: 'commercial' },
    { type: 'preset', value: 'finance' },
  ] as const)('changes the refresh key for $type changes', (event) => {
    expect(apiRefreshKey(apiRefreshSelectionAfter(initial, event))).not.toBe(
      apiRefreshKey(initial),
    );
  });

  it.each([
    { type: 'companyName', value: 'Changed name' },
    { type: 'logo', value: 'data:image/png;base64,AAAA' },
    { type: 'color', value: '#000000' },
  ] as const)('keeps the refresh key for $type changes', (event) => {
    expect(apiRefreshKey(apiRefreshSelectionAfter(initial, event))).toBe(
      'consumer:0',
    );
  });
});
