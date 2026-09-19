export type PreviewMode = 'mobile' | 'desktop';
export type PreviewPhase = 'loading' | 'ready';

export interface StatementPreview {
  mode: PreviewMode;
  phase: PreviewPhase;
  loadId: number;
}

export type StatementPreviewEvent =
  | { type: 'account-selected' }
  | { type: 'load-completed'; loadId: number }
  | { type: 'view-selected'; mode: PreviewMode };

export const INITIAL_STATEMENT_PREVIEW: StatementPreview = {
  mode: 'mobile',
  phase: 'loading',
  loadId: 0,
};

export function nextStatementPreview(
  current: StatementPreview,
  event: StatementPreviewEvent,
): StatementPreview {
  switch (event.type) {
    case 'account-selected':
      return { ...current, phase: 'loading', loadId: current.loadId + 1 };
    case 'load-completed':
      return event.loadId === current.loadId
        ? { ...current, phase: 'ready' }
        : current;
    case 'view-selected':
      return { ...current, mode: event.mode };
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}
