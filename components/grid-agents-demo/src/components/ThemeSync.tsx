'use client';

import { useTheme } from '@/hooks/useTheme';

/** Headless theme listener — keeps data-theme in sync with Mintlify embed. */
export function ThemeSync() {
  useTheme();
  return null;
}
