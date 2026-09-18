import { describe, expect, it } from 'vitest';
import { nextStatementLifecycle } from './lifecycle';

describe('statement lifecycle', () => {
  it('starts in progress, closes, and resets', () => {
    const initial = 'in-progress' as const;
    const closed = nextStatementLifecycle(initial, 'period-closes');

    expect(closed).toBe('statement');
    expect(nextStatementLifecycle(closed, 'reset')).toBe('in-progress');
  });
});
