import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { StatementDocument } from './StatementDocument';

afterEach(cleanup);

describe('StatementDocument', () => {
  it('renders the consumer overlay and reconciled closing balance', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(<StatementDocument statement={statement} width="full" />);

    expect(screen.getByText('$3,373.95')).toBeTruthy();
    expect(
      screen.getByText(/In Case of Errors or Questions About Your Electronic Transfers/),
    ).toBeTruthy();
    expect(container.querySelectorAll('[data-flag="disputable"]')).toHaveLength(3);
    expect(screen.getByText(/Lightspark is the program manager and is not a bank/)).toBeTruthy();
  });

  it('removes all consumer overlay content from commercial statements', () => {
    const statement = buildStatement('commercial', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(<StatementDocument statement={statement} width="narrow" />);

    expect(screen.getByText('$14,459.75')).toBeTruthy();
    expect(container.textContent).not.toMatch(/In Case of Errors|60 days|disputable/i);
    expect(container.querySelectorAll('[data-flag="disputable"]')).toHaveLength(0);
  });

  it('uses company name when no logo is present', () => {
    const statement = buildStatement(
      'consumer',
      { ...DEFAULT_BRAND, companyName: 'Waterbnb', logo: { kind: 'none' } },
      STATEMENT_PERIOD,
    );
    render(<StatementDocument statement={statement} width="full" />);

    expect(screen.getByText('Waterbnb')).toBeTruthy();
  });

  it('applies all four brand tokens to the printable statement', () => {
    const statement = buildStatement(
      'consumer',
      {
        ...DEFAULT_BRAND,
        colors: {
          primaryBackground: '#102030',
          secondaryBackground: '#203040',
          primaryText: '#fefefe',
          secondaryText: '#eeeeee',
        },
      },
      STATEMENT_PERIOD,
    );
    const { container } = render(<StatementDocument statement={statement} width="full" />);
    const document = container.querySelector('article');

    expect(document?.getAttribute('style')).toBe(
      '--statement-primary-background: #102030; --statement-secondary-background: #203040; --statement-primary-text: #fefefe; --statement-secondary-text: #eeeeee;',
    );
  });
});
