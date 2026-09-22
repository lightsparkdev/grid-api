import React from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { StatementDocument } from './StatementDocument';

afterEach(cleanup);

describe('StatementDocument', () => {
  it('renders the derived title only when the standalone masthead is enabled', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(
      <StatementDocument statement={statement} width="full" showMasthead />,
    );

    expect(screen.getByText('September statement')).toBeTruthy();
    view.rerender(
      <StatementDocument statement={statement} width="narrow" showMasthead={false} />,
    );
    expect(screen.queryByText('September statement')).toBeNull();
  });

  it('renders the consumer overlay and reconciled closing balance', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(
      <StatementDocument statement={statement} width="full" showMasthead />,
    );

    expect(screen.getByText('$3,373.95')).toBeTruthy();
    expect(
      screen.getByText(/In case of errors or questions about your electronic transfers/),
    ).toBeTruthy();
    expect(container.querySelectorAll('[data-flag="disputable"]')).toHaveLength(3);
    expect(
      Array.from(container.querySelectorAll('[data-flag="disputable"]')).every(
        (flag) => flag.tagName === 'SUP' && flag.parentElement?.className.includes('amount'),
      ),
    ).toBe(true);
    expect(screen.getByText('Blue Bottle Coffee').parentElement?.textContent).toContain(
      'Blue Bottle Coffee · Los Angeles, CA',
    );
    expect(screen.getByText(/Lightspark is the program manager and is not a bank/)).toBeTruthy();
    const notice = screen
      .getByText(/In case of errors or questions about your electronic transfers/)
      .closest('section');
    expect(notice).toBeTruthy();
    expect(within(notice as HTMLElement).getByText(/\(855\) 516-0103/)).toBeTruthy();
    expect(
      within(notice as HTMLElement).getByText(
        /8605 Santa Monica Blvd, PMB 64461, West Hollywood, CA 90069/,
      ),
    ).toBeTruthy();
    expect(within(notice as HTMLElement).getAllByRole('listitem')).toHaveLength(3);
    expect(container.textContent).not.toContain('www.lightspark.com');
  });

  it('removes all consumer overlay content from commercial statements', () => {
    const statement = buildStatement('commercial', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(
      <StatementDocument statement={statement} width="narrow" showMasthead />,
    );

    expect(screen.getByText('$14,459.75')).toBeTruthy();
    expect(container.textContent).not.toMatch(/In case of errors|60 days|disputable/i);
    expect(container.querySelectorAll('[data-flag="disputable"]')).toHaveLength(0);
  });

  it('defaults to card and bleeds only when surface is bleed', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(
      <StatementDocument statement={statement} width="full" showMasthead />,
    );
    const document = view.container.querySelector('article');

    expect(document?.getAttribute('data-surface')).toBe('card');
    view.rerender(
      <StatementDocument
        statement={statement}
        width="narrow"
        showMasthead={false}
        surface="bleed"
      />,
    );
    expect(view.container.querySelector('article')?.getAttribute('data-surface')).toBe('bleed');
  });

  it('keeps standalone export callers on the default card surface', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(
      <StatementDocument statement={statement} width="full" showMasthead />,
    );

    expect(container.querySelector('article')?.getAttribute('data-surface')).toBe('card');
    expect(container.querySelector('article')?.getAttribute('data-preview-width')).toBe('full');
  });

  it('renders one commercial footer hairline and two consumer footer hairlines', () => {
    const commercial = buildStatement('commercial', DEFAULT_BRAND, STATEMENT_PERIOD);
    const consumer = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const view = render(
      <StatementDocument statement={commercial} width="full" showMasthead />,
    );

    expect(view.container.querySelectorAll('[data-footer-hairline]')).toHaveLength(1);
    view.rerender(
      <StatementDocument statement={consumer} width="full" showMasthead />,
    );
    expect(view.container.querySelectorAll('[data-footer-hairline]')).toHaveLength(2);
  });

  it('uses company name when no logo is present', () => {
    const statement = buildStatement(
      'consumer',
      { ...DEFAULT_BRAND, companyName: 'Waterbnb', logo: { kind: 'none' } },
      STATEMENT_PERIOD,
    );
    render(<StatementDocument statement={statement} width="full" showMasthead />);

    expect(screen.getByText('Waterbnb')).toBeTruthy();
  });

  it('applies all three brand tokens to the printable statement', () => {
    const statement = buildStatement(
      'consumer',
      {
        ...DEFAULT_BRAND,
        colors: {
          primaryBackground: '#102030',
          primaryText: '#fefefe',
          secondaryText: '#eeeeee',
        },
      },
      STATEMENT_PERIOD,
    );
    const { container } = render(
      <StatementDocument statement={statement} width="full" showMasthead />,
    );
    const document = container.querySelector('article');

    expect(document?.getAttribute('style')).toBe(
      '--statement-primary-background: #102030; --statement-primary-text: #fefefe; --statement-secondary-text: #eeeeee;',
    );
  });
});
