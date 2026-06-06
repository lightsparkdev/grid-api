import type { Entry } from '@/components/ApiPanel/types';
import { addMoneyCalls, sendCalls, signInCalls } from './apiCalls';

/** Flip false (or delete this file) when API panel styling is done. */
export const SEED_API_PANEL = true;

export function seedApiEntries(): Entry[] {
  const calls = [
    ...signInCalls('oauth'),
    ...addMoneyCalls(500_000).slice(0, 2),
    ...sendCalls(25_000).slice(0, 2),
  ];

  return calls.map((call, i) => ({
    ...call,
    key: `seed-${i}`,
    fresh: false,
  }));
}
