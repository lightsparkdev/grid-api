'use client';

import { createContext, useContext } from 'react';

export interface PhoneBootState {
  /** Boot sequence armed — fit scale + aurora are settled. */
  ready: boolean;
  /** 0→1 while the phone + glass bezel fade in together (eased out). */
  bootOpacity: number;
  /** The same transition as linear progress, for layers that want their own
   *  easing (the card's flight into the phone). */
  bootProgress: number;
  /** Re-sync the WebGL glass lens to the shell (after fit-scale / boot motion). */
  realignLens: () => void;
}

const PhoneBootContext = createContext<PhoneBootState>({
  ready: true,
  bootOpacity: 1,
  bootProgress: 1,
  realignLens: () => {},
});

export const PhoneBootProvider = PhoneBootContext.Provider;

/** The card's flight follows the boot curve eased in-out; past this it has
 *  landed in the slot. Shared by the stage (which holds the card still and
 *  clips it to the screen while parked) and the shell (which lifts the
 *  screen's content above the card once it is parked). */
export const CARD_PARKED_T = 0.999;
export function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}
export function isCardParked(bootProgress: number) {
  return easeInOutCubic(bootProgress) >= CARD_PARKED_T;
}

export function usePhoneBoot() {
  return useContext(PhoneBootContext);
}
