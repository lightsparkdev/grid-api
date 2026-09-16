'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { initialDesign, type CardDesign } from '@/data/design';

/** The live "Design your card" state, read by the card face and the phone chrome. */
const BrandContext = createContext<CardDesign>(initialDesign);

export function BrandProvider({ value, children }: { value: CardDesign; children: ReactNode }) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): CardDesign {
  return useContext(BrandContext);
}

/** The program name as shown in the app header and on the card. */
export function programNameOf(design: CardDesign): string {
  return design.programName.trim() || 'Your brand';
}
