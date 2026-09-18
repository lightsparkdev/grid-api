import { describe, expect, it } from 'vitest';
import { APP_SHELL_PRESETS } from './devicePresets';

describe('AppShell device presets', () => {
  it('keeps the Cards iPhone geometry', () => {
    expect(APP_SHELL_PRESETS.mail).toMatchObject({
      outerWidth: 434,
      outerHeight: 906,
      screenWidth: 402,
      screenHeight: 874,
      screenInset: [16, 16, 16, 16],
      shellRadii: [89, 89, 89, 89],
    });
  });

  it('uses the measured iPhone Duo outer display geometry', () => {
    expect(APP_SHELL_PRESETS.duo).toEqual({
      id: 'duo',
      outerWidth: 511,
      outerHeight: 716,
      screenWidth: 466,
      screenHeight: 678,
      screenInset: [19, 26, 19, 19],
      shellRadii: [62, 7, 7, 62],
      screenRadii: [43, 7, 7, 43],
      cameraHole: { diameter: 36, top: 48, outer: 48 },
    });
  });
});
