import type { ApiCall } from '@/data/flow';

export interface Entry extends ApiCall {
  key: string;
  createdAt: number;
  groupId: string;
  groupLabel: string;
}

export interface EntryGroup {
  groupId: string;
  groupLabel: string;
  createdAt: number;
  entries: Entry[];
}
