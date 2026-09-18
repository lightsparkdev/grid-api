export type StatementLifecycle = 'in-progress' | 'statement';
export type StatementLifecycleEvent = 'period-closes' | 'reset';

export function nextStatementLifecycle(
  current: StatementLifecycle,
  event: StatementLifecycleEvent,
): StatementLifecycle {
  switch (event) {
    case 'period-closes':
      return 'statement';
    case 'reset':
      return 'in-progress';
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}
