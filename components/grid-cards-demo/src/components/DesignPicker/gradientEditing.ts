import { useSyncExternalStore } from 'react';

/**
 * Whether a gradient is being edited: the color picker is open on its
 * gradient tab. The stage shows the gradient's handles on the card while it
 * is, as Figma does while a gradient fill's picker is open. A tiny store
 * rather than a prop, since the picker and the stage sit in different
 * panels.
 */
let editing = false;
const listeners = new Set<() => void>();

export function setGradientEditing(on: boolean) {
  if (editing === on) return;
  editing = on;
  listeners.forEach((l) => l());
}

export function useGradientEditing(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => editing,
    () => false,
  );
}
