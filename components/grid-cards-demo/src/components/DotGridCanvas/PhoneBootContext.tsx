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
  /** Where the curve is headed: the phone is wanted on stage (1) or off (0). */
  phoneWanted: boolean;
  /** The phone fades in place (see `fade` below) rather than rising in. */
  fade: boolean;
  /** Re-sync the WebGL glass lens to the shell (after fit-scale / boot motion). */
  realignLens: () => void;
}

/** Phone (and glass bezel) materializing — the card flies into it on this curve. */
export const PHONE_IN_DURATION_S = 0.7;
/** Phone dissolving back to the bare card (Reset). */
export const PHONE_OUT_DURATION_S = 0.45;

/**
 * The phone's fade, as CSS transitions, for WebKit. There the phone can't
 * ride the curve frame by frame: a transform that changes from script makes
 * WebKit paint the whole phone again each frame (Chromium scales what it has
 * painted), and the flight ran at ten frames a second. So in WebKit the
 * phone doesn't rise or scale; its opacity and focus go to their end values
 * at once and these transitions carry them, on the compositor, on the same
 * clock as the card's flight (which stays on the curve, in script).
 *
 * The shell's opacity is easeOutQuart of the linear curve. In: that is the
 * out-quart of elapsed time. Out: the curve runs 1→0, so opacity is
 * 1 − u⁴ of elapsed time, the in-quart. The blur is linear in opacity, so
 * it takes the same timing.
 */
const OUT_QUART = 'cubic-bezier(0.165, 0.84, 0.44, 1)';
const IN_QUART = 'cubic-bezier(0.895, 0.03, 0.685, 0.22)';
export const PHONE_FADE_IN_TRANSITION = `opacity ${PHONE_IN_DURATION_S}s ${OUT_QUART}, filter ${PHONE_IN_DURATION_S}s ${OUT_QUART}`;
export const PHONE_FADE_OUT_TRANSITION = `opacity ${PHONE_OUT_DURATION_S}s ${IN_QUART}, filter ${PHONE_OUT_DURATION_S}s ${IN_QUART}`;

const PhoneBootContext = createContext<PhoneBootState>({
  ready: true,
  bootOpacity: 1,
  bootProgress: 1,
  phoneWanted: true,
  fade: false,
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
