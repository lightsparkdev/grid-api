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
  },
  duo: {
    id: 'duo',
    outerWidth: 716,
    outerHeight: 511,
    screenWidth: 678,
    screenHeight: 477,
    screenInset: [17, 19, 17, 19],
    shellRadii: [28, 28, 28, 28],
    screenRadii: [18, 18, 18, 18],
  },
};
