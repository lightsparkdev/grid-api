import type { Entry, EntryGroup } from '@/components/ApiPanel/types';

/** Collapse flat entries into ordered action groups. */
export function groupApiEntries(entries: Entry[]): EntryGroup[] {
  const order: string[] = [];
  const map = new Map<string, EntryGroup>();

  for (const entry of entries) {
    let group = map.get(entry.groupId);
    if (!group) {
      order.push(entry.groupId);
      group = {
        groupId: entry.groupId,
        groupLabel: entry.groupLabel,
        createdAt: entry.createdAt,
        entries: [],
      };
      map.set(entry.groupId, group);
    }
    group.entries.push(entry);
  }

  return order.map((id) => map.get(id)!);
}
