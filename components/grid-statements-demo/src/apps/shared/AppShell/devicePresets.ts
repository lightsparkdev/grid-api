export type AppShellDevice = 'iphone' | 'duo';

export interface AppShellPreset {
  id: AppShellDevice;
  outerWidth: number;
  outerHeight: number;
  screenWidth: number;
  screenHeight: number;
  screenInset: [number, number, number, number];
  shellRadii: [number, number, number, number];
  screenRadii: [number, number, number, number];
  cameraHole: { diameter: number; top: number; outer: number } | null;
}

export const APP_SHELL_PRESETS: Record<AppShellDevice, AppShellPreset> = {
  iphone: {
    id: 'iphone',
    outerWidth: 434,
    outerHeight: 906,
    screenWidth: 402,
    screenHeight: 874,
    screenInset: [16, 16, 16, 16],
    shellRadii: [89, 89, 89, 89],
    screenRadii: [73, 73, 73, 73],
    cameraHole: null,
  },
  duo: {
    id: 'duo',
    outerWidth: 511,
    outerHeight: 716,
    screenWidth: 466,
    screenHeight: 678,
    screenInset: [19, 26, 19, 19],
    shellRadii: [62, 7, 7, 62],
    screenRadii: [43, 7, 7, 43],
    cameraHole: { diameter: 36, top: 48, outer: 48 },
  },
};
