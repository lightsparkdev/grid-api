import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { StatementScreen } from './StatementScreen';

afterEach(cleanup);

describe('StatementScreen', () => {
  it('renders one app title with no duplicate brand or period line', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(<StatementScreen statement={statement} loading={false} />);
    const header = container.querySelector('header');

    expect(header).toBeTruthy();
    expect(screen.getAllByText('September statement')).toHaveLength(1);
    expect(within(header as HTMLElement).queryByText(STATEMENT_PERIOD.range)).toBeNull();
    expect(within(header as HTMLElement).queryByRole('img')).toBeNull();
    expect(within(header as HTMLElement).queryByText(DEFAULT_BRAND.companyName)).toBeNull();
    expect(screen.getByText('Statement period')).toBeTruthy();
    expect(screen.getByText(STATEMENT_PERIOD.range)).toBeTruthy();
    expect(screen.getByText('Issued')).toBeTruthy();
    expect(container.querySelector('[class*="masthead"]')).toBeNull();
  });

  it('shows the Wallet loading state before the document', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(<StatementScreen statement={statement} loading />);

    expect(within(view.container).getByRole('status', { name: 'Loading statement' })).toBeTruthy();
    expect(within(view.container).queryByText('Statement period')).toBeNull();
    view.rerender(<StatementScreen statement={statement} loading={false} />);
    expect(within(view.container).getByText('Statement period')).toBeTruthy();
  });
});
