'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { initialDesign, type CardDesign } from '@/data/design';

export interface Brand {
  /** The live "Design your card" state. */
  design: CardDesign;
  /** True for the customizable skin ("Your brand"); the six showcase skins
   *  keep their own art direction and ignore the design. */
  customizable: boolean;
}

const BrandContext = createContext<Brand>({ design: initialDesign, customizable: false });

export function BrandProvider({ value, children }: { value: Brand; children: ReactNode }) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

/** The playground's card design, for skins that render it. */
export function useBrand(): Brand {
  return useContext(BrandContext);
}
