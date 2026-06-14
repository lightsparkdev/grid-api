import type { Entry } from '@/components/ApiPanel/types';
import type { ApiCall } from '@/data/flow';
import { addMoneyCalls, sendCalls, signInCalls, withdrawCalls } from './apiCalls';

/** Flip false (or delete this file) when API panel styling is done. */
export const SEED_API_PANEL = false;

interface SeedGroup {
  label: string;
  calls: ApiCall[];
  agoMs: number;
}

export function seedApiEntries(): Entry[] {
  const now = Date.now();
  const groups: SeedGroup[] = [
    { label: 'Sign in', calls: signInCalls('oauth'), agoMs: 8 * 60 * 1000 },
    { label: 'Add money', calls: addMoneyCalls(500_000), agoMs: 3 * 60 * 1000 },
    { label: 'Send payment', calls: sendCalls(250_000), agoMs: 90 * 1000 },
    { label: 'Withdraw', calls: withdrawCalls(200_000), agoMs: 12 * 1000 },
  ];

  return groups.flatMap((group, groupIndex) => {
    const groupId = `seed-group-${groupIndex}`;
    const groupTime = now - group.agoMs;

    return group.calls.map((call, callIndex) => ({
      ...call,
      key: `seed-${groupIndex}-${callIndex}`,
      createdAt: groupTime + callIndex * 400,
      groupId,
      groupLabel: group.label,
    }));
  });
}
