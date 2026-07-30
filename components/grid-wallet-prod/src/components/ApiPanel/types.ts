import type { ApiCall } from '@/data/flow';

/** Sandbox-only actions the panel can offer inline (see ApiCallList). */
export type EntryAction = 'simulate-funding';

export interface Entry extends ApiCall {
  key: string;
  createdAt: number;
  groupId: string;
  /** Flow name for grouping. Not rendered — the feed has no flow headings. */
  groupLabel: string;
  /**
   * Renders as an ACTION card instead of a request: a line of copy plus a button
   * the panel wires to `onAction`. Used where the demo has to stand in for
   * something the sandbox can't do for real (an inbound wire).
   */
  action?: EntryAction;
  /** Button label for `action` cards. */
  actionLabel?: string;
  /** The action already ran — the button reads as done and stops firing. */
  actionDone?: boolean;
  /** Amount (cents) this action should fund, when the screen stated one. */
  simulateCents?: number;
}

export interface EntryGroup {
  groupId: string;
  groupLabel: string;
  createdAt: number;
  entries: Entry[];
}
