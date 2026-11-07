import type { ToolCall } from '@/data/agentApiCalls';
import type { ApiCall } from '@/data/flow';

export interface Entry extends ApiCall {
  key: string;
  createdAt: number;
  groupId: string;
  groupLabel: string;
  /** The agent's tool call this row is (its Grid calls point back with `parent`). */
  tool?: ToolCall;
  /** The tool call this Grid call was made for. */
  parent?: string;
}

export interface EntryGroup {
  groupId: string;
  groupLabel: string;
  createdAt: number;
  entries: Entry[];
}
