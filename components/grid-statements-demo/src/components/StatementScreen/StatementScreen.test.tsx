import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { StatementScreen } from './StatementScreen';

describe('StatementScreen', () => {
  it('shows the cycle state and then the statement', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(
      <StatementScreen statement={statement} lifecycle="in-progress" />,
    );

    expect(screen.getByText('Statement arrives Oct 1')).toBeTruthy();
    view.rerender(<StatementScreen statement={statement} lifecycle="statement" />);
    expect(screen.getByText('Consumer prepaid account')).toBeTruthy();
  });

  it('updates brand values on the next render', () => {
    const initial = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(<StatementScreen statement={initial} lifecycle="in-progress" />);
    const changed = buildStatement(
      'consumer',
      { ...DEFAULT_BRAND, companyName: 'Changed company' },
      STATEMENT_PERIOD,
    );

    view.rerender(<StatementScreen statement={changed} lifecycle="in-progress" />);
    expect(screen.getByText('Changed company')).toBeTruthy();
  });
});
