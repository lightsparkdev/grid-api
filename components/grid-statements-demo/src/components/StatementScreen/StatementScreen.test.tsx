import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { StatementScreen } from './StatementScreen';

afterEach(cleanup);

describe('StatementScreen', () => {
  it('renders one app title with the brand logo and no period line', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(<StatementScreen statement={statement} loading={false} />);
    const header = container.querySelector('[data-statement-header]');

    expect(header).toBeTruthy();
    expect(screen.getAllByText('September statement')).toHaveLength(1);
    expect(within(header as HTMLElement).queryByText(STATEMENT_PERIOD.range)).toBeNull();
    expect(within(header as HTMLElement).getByRole('img', { name: 'Aurora logo' })).toBeTruthy();
    expect(screen.getByText('Statement period')).toBeTruthy();
    expect(screen.getByText(STATEMENT_PERIOD.range)).toBeTruthy();
    expect(screen.getByText('Issued')).toBeTruthy();
    expect(container.querySelector('[class*="masthead"]')).toBeNull();
    expect(container.querySelector('article')?.getAttribute('data-surface')).toBe('bleed');
  });

  it('shows the Wallet loading state before the document', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(<StatementScreen statement={statement} loading />);

    expect(within(view.container).getByRole('status', { name: 'Loading statement' })).toBeTruthy();
    expect(within(view.container).queryByText('Statement period')).toBeNull();
    view.rerender(<StatementScreen statement={statement} loading={false} />);
    expect(within(view.container).getByText('Statement period')).toBeTruthy();
  });

  it('marks the header only after the document scrolls and clears it while loading', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(<StatementScreen statement={statement} loading={false} />);
    const header = () => view.container.querySelector('[data-statement-header]');
    const scroller = view.container.querySelector('[data-statement-scroll]') as HTMLElement;

    expect(header()?.hasAttribute('data-scrolled')).toBe(false);
    Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 1 });
    fireEvent.scroll(scroller);
    expect(header()?.getAttribute('data-scrolled')).toBe('true');
    Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 0 });
    fireEvent.scroll(scroller);
    expect(header()?.hasAttribute('data-scrolled')).toBe(false);

    Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 12 });
    fireEvent.scroll(scroller);
    expect(header()?.getAttribute('data-scrolled')).toBe('true');
    view.rerender(<StatementScreen statement={statement} loading />);
    expect(header()?.hasAttribute('data-scrolled')).toBe(false);
  });
});
