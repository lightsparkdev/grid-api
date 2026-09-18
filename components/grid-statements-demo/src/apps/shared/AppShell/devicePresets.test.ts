import { describe, expect, it } from 'vitest';
import { APP_SHELL_PRESETS } from './devicePresets';

describe('AppShell device presets', () => {
  it('keeps the Cards iPhone geometry', () => {
    expect(APP_SHELL_PRESETS.iphone).toMatchObject({
      outerWidth: 434,
      outerHeight: 906,
      screenWidth: 402,
      screenHeight: 874,
      screenInset: [16, 16, 16, 16],
      shellRadii: [89, 89, 89, 89],
    });
  });

  it('uses the official open iPhone Duo landscape proportions', () => {
    expect(APP_SHELL_PRESETS.duo).toEqual({
      id: 'duo',
      outerWidth: 716,
      outerHeight: 511,
      screenWidth: 678,
      screenHeight: 477,
      screenInset: [17, 19, 17, 19],
      shellRadii: [28, 28, 28, 28],
      screenRadii: [18, 18, 18, 18],
      cameraHole: null,
    });
    expect(APP_SHELL_PRESETS.duo.outerWidth / APP_SHELL_PRESETS.duo.outerHeight)
      .toBeCloseTo(164.6 / 117.8, 2);
    expect(APP_SHELL_PRESETS.duo.screenWidth / APP_SHELL_PRESETS.duo.screenHeight)
      .toBeCloseTo(2670 / 1878, 2);
  });
});
