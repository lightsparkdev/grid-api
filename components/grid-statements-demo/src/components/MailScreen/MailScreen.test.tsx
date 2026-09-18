import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, PERIODS, buildStatement } from '@/statement/fixtures';
import { MailScreen } from './MailScreen';

afterEach(cleanup);

describe('MailScreen', () => {
  it('opens the statement attachment in the document viewer', () => {
    render(
      <MailScreen
        statement={buildStatement('consumer', DEFAULT_BRAND, PERIODS[0])}
      />,
    );

    expect(screen.getByRole('article', { name: 'July statement' })).toBeTruthy();
    expect(screen.getByText('The Platform sends your monthly statement by email.')).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open July statement attachment' }),
    );
    expect(
      screen.getByRole('region', { name: 'Statement document viewer' }),
    ).toBeTruthy();
    expect(screen.getByText('$3,373.95')).toBeTruthy();
  });
});
