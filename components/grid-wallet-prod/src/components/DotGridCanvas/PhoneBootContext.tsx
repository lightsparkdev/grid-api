'use client';

import { createContext, useContext } from 'react';

export interface PhoneBootState {
  /** Boot sequence armed — fit scale + aurora are settled. */
  ready: boolean;
  /** 0→1 while the phone + glass bezel fade in together. */
  bootOpacity: number;
  /** Re-sync the WebGL glass lens to the shell (after fit-scale / boot motion). */
  realignLens: () => void;
}

const PhoneBootContext = createContext<PhoneBootState>({
  ready: true,
  bootOpacity: 1,
  realignLens: () => {},
});

export const PhoneBootProvider = PhoneBootContext.Provider;

export function usePhoneBoot() {
  return useContext(PhoneBootContext);
}
