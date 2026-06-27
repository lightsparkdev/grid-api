'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const [presented, setPresented] = useState(false);

  // `register` is stable so consumers' effects don't re-run when `presented`
  // flips (which would re-register and loop).
  const register = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => c - 1);
  }, []);

  // Rising edge is immediate; the falling edge lingers a beat so a sheet→sheet
  // swap (close A, open B) doesn't blip the stage back to rest between them.
  useEffect(() => {
    if (count > 0) {
      setPresented(true);
      return;
    }
    const t = window.setTimeout(() => setPresented(false), 80);
    return () => window.clearTimeout(t);
  }, [count]);

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

/** Register a sheet's open state with the nearest provider (no-op without one). */
export function useRegisterSheet(open: boolean): void {
  const register = useContext(SheetPresentationContext)?.register;
  useEffect(() => {
    if (!register || !open) return;
    return register();
  }, [register, open]);
}

/** True while any registered sheet is open (false without a provider). */
export function useSheetPresented(): boolean {
  return useContext(SheetPresentationContext)?.presented ?? false;
}
