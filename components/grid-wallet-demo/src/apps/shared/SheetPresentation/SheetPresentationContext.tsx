'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Drives the iOS "stacked sheet" presentation: any BottomSheet under a provider
 * registers itself while open, and the presenting content (a PresentationStage)
 * scales back behind the rising sheet. Single-level — N concurrently-open sheets
 * keep `presented` true; depth isn't tracked.
 *
 * Opt-in: a BottomSheet with no provider above it is a no-op, so skins that don't
 * wrap their screen in a provider (e.g. aurora, the sign-in auth screen) are
 * unaffected.
 */
interface SheetPresentationValue {
  presented: boolean;
  /** Count one open sheet; returns the matching un-count for cleanup. */
  register: () => () => void;
}

const SheetPresentationContext = createContext<SheetPresentationValue | null>(null);

export function SheetPresentationProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  // `register` is stable so consumers' effects don't re-run when `presented`
  // flips (which would re-register and loop). Sheets register via a LAYOUT effect
  // (see useRegisterSheet), so the count bump — and thus `presented` — lands in
  // the same frame the sheet starts animating, keeping the stage in lockstep.
  const register = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => c - 1);
  }, []);

  // Derived (not stored) so both edges are immediate: opening any sheet presents,
  // and the last close un-presents in the same commit the sheet starts closing.
  const presented = count > 0;

  const value = useMemo<SheetPresentationValue>(
    () => ({ presented, register }),
    [presented, register],
  );

  return (
    <SheetPresentationContext.Provider value={value}>
      {children}
    </SheetPresentationContext.Provider>
  );
}

/** Register a sheet's open state with the nearest provider (no-op without one).
 *  Layout effect so the presenting stage updates in the same frame the sheet
 *  starts animating (no one-frame stagger between the sheet and the scale). */
export function useRegisterSheet(open: boolean): void {
  const register = useContext(SheetPresentationContext)?.register;
  useLayoutEffect(() => {
    if (!register || !open) return;
    return register();
  }, [register, open]);
}

/** True while any registered sheet is open (false without a provider). */
export function useSheetPresented(): boolean {
  return useContext(SheetPresentationContext)?.presented ?? false;
}
