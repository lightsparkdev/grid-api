import React, { type PropsWithChildren } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { StatementPreview } from './StatementPreview';

vi.mock('@/apps/shared/AppShell', () => ({
  AppShell: ({
    children,
    device,
  }: PropsWithChildren<{ device?: string; externalGlass?: boolean }>) => (
    <div data-app-shell={device ?? 'phone'}>{children}</div>
  ),
}));

afterEach(cleanup);

describe('StatementPreview', () => {
  it('renders the live desktop identity, colors, and one document title', () => {
    const statement = buildStatement(
      'consumer',
      {
        companyName: 'Live Company',
        logo: {
          kind: 'image',
          src: '/live-logo.svg',
          alt: 'Ignored logo text',
        },
        colors: {
          primaryBackground: '#102030',
          primaryText: '#fefefe',
          secondaryText: '#dedede',
        },
      },
      STATEMENT_PERIOD,
    );
    const { container, rerender } = render(
      <StatementPreview mode="desktop" phase="ready" statement={statement} />,
    );
    const frame = container.querySelector('[data-statement-frame]');
    const mark = container.querySelector('[data-statement-brand-mark]');
    const image = mark?.querySelector('img');
    const themedScreen = frame?.parentElement;

    expect(frame).toBeTruthy();
    expect(within(frame as HTMLElement).getByText('Live Company')).toBeTruthy();
    expect(image?.getAttribute('src')).toBe('/live-logo.svg');
    expect(image?.getAttribute('alt')).toBe('');
    expect(themedScreen?.getAttribute('style')).toBe(
      '--statement-primary-background: #102030; --statement-primary-text: #fefefe; --statement-secondary-text: #dedede;',
    );
    expect(screen.getAllByText('September statement')).toHaveLength(1);
    expect(within(frame as HTMLElement).queryByText('Statements')).toBeNull();

    const updated = buildStatement(
      'consumer',
      {
        companyName: 'Updated Company',
        logo: {
          kind: 'image',
          src: '/updated-logo.svg',
          alt: 'Updated logo text',
        },
        colors: {
          primaryBackground: '#fafafa',
          primaryText: '#202020',
          secondaryText: '#606060',
        },
      },
      STATEMENT_PERIOD,
    );
    rerender(<StatementPreview mode="desktop" phase="ready" statement={updated} />);

    expect(within(frame as HTMLElement).getByText('Updated Company')).toBeTruthy();
    expect(image?.getAttribute('src')).toBe('/updated-logo.svg');
    expect(themedScreen?.getAttribute('style')).toBe(
      '--statement-primary-background: #fafafa; --statement-primary-text: #202020; --statement-secondary-text: #606060;',
    );
  });

  it('renders a decorative initial and three inert sidebar rows without a logo', () => {
    const statement = buildStatement(
      'consumer',
      {
        ...DEFAULT_BRAND,
        companyName: '  Nimbus',
        logo: { kind: 'none' },
      },
      STATEMENT_PERIOD,
    );
    const { container } = render(
      <StatementPreview mode="desktop" phase="ready" statement={statement} />,
    );
    const mark = container.querySelector('[data-statement-brand-mark]');
    const sidebar = container.querySelector('[data-statement-sidebar]');

    expect(mark?.textContent).toBe('N');
    expect(mark?.getAttribute('aria-hidden')).toBe('true');
    expect(sidebar?.getAttribute('aria-hidden')).toBe('true');
    expect(sidebar?.querySelectorAll('[data-statement-placeholder]')).toHaveLength(3);
    expect(sidebar?.textContent).toBe('');
  });

  it('keeps the desktop loading branch on the themed screen', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(
      <StatementPreview mode="desktop" phase="loading" statement={statement} />,
    );

    expect(screen.getByRole('status', { name: 'Loading statement' })).toBeTruthy();
    expect(container.querySelector('[data-preview-shell="desktop"]')).toBeTruthy();
    expect(container.querySelector('[data-statement-frame]')).toBeNull();
  });

  it('keeps the mobile StatementScreen branch', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(
      <StatementPreview mode="mobile" phase="ready" statement={statement} />,
    );

    expect(container.querySelector('[data-preview-shell="mobile"]')).toBeTruthy();
    expect(container.querySelector('[data-app-shell="phone"]')).toBeTruthy();
    expect(screen.getByText('September statement')).toBeTruthy();
    expect(container.querySelector('[data-statement-frame]')).toBeNull();
  });
});
