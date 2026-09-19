import { describe, expect, it } from 'vitest';
import { INITIAL_STATEMENT_PREVIEW, nextStatementPreview } from './lifecycle';

describe('statement lifecycle', () => {
  it('loads each selected account and ignores stale completions', () => {
    const selected = nextStatementPreview(INITIAL_STATEMENT_PREVIEW, {
      type: 'account-selected',
    });

    expect(selected).toMatchObject({ phase: 'loading', loadId: 1 });
    expect(
      nextStatementPreview(selected, { type: 'load-completed', loadId: 0 }),
    ).toBe(selected);
    expect(
      nextStatementPreview(selected, { type: 'load-completed', loadId: 1 }),
    ).toMatchObject({ phase: 'ready', loadId: 1 });
  });

  it('changes preview mode without reloading the account', () => {
    expect(
      nextStatementPreview(INITIAL_STATEMENT_PREVIEW, {
        type: 'view-selected',
        mode: 'desktop',
      }),
    ).toEqual({ mode: 'desktop', phase: 'loading', loadId: 0 });
  });
});
