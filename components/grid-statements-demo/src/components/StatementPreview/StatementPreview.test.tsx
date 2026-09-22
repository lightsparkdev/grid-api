import React, { type PropsWithChildren } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
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
  it('renders live desktop colors and one document title', () => {
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
    const themedScreen = frame?.parentElement;

    expect(frame).toBeTruthy();
    expect(frame?.textContent).not.toContain('Live Company');
    expect(themedScreen?.getAttribute('style')).toBe(
      '--statement-primary-background: #102030; --statement-primary-text: #fefefe; --statement-secondary-text: #dedede;',
    );
    expect(screen.getAllByText('September statement')).toHaveLength(1);
    expect(frame?.textContent).not.toContain('Statements');

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

    expect(frame?.textContent).not.toContain('Updated Company');
    expect(themedScreen?.getAttribute('style')).toBe(
      '--statement-primary-background: #fafafa; --statement-primary-text: #202020; --statement-secondary-text: #606060;',
    );
  });

  it('keeps exactly two empty sidebar zones', () => {
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
    const sidebar = container.querySelector('[data-statement-sidebar]');
    const content = container.querySelector('[data-statement-rail-content]');
    const footer = container.querySelector('[data-statement-rail-footer]');
    const zones = Array.from(sidebar?.children ?? [], (child) =>
      ['rail-content', 'rail-footer'].find((zone) =>
        child.hasAttribute(`data-statement-${zone}`),
      ),
    );

    expect(container.querySelector('[data-statement-rail-header]')).toBeNull();
    expect(zones).toEqual(['rail-content', 'rail-footer']);
    expect(content?.children).toHaveLength(0);
    expect(content?.textContent).toBe('');
    expect(footer?.children).toHaveLength(0);
    expect(footer?.textContent).toBe('');
  });

  it('lays the desktop frame out as a rail beside a main column', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const { container } = render(
      <StatementPreview mode="desktop" phase="ready" statement={statement} />,
    );
    const frame = container.querySelector('[data-statement-frame]') as HTMLElement;
    const sidebar = container.querySelector('[data-statement-sidebar]') as HTMLElement;
    const main = container.querySelector('[data-statement-main]') as HTMLElement;
    const header = container.querySelector('[data-statement-header]') as HTMLElement;
    const footer = container.querySelector('[data-statement-rail-footer]') as HTMLElement;
    const scroll = container.querySelector('[data-statement-scroll]') as HTMLElement;
    const tagsOf = (element: Element) => Array.from(element.children, (child) => child.tagName);
    const railZones = Array.from(sidebar.children, (child) =>
      ['rail-content', 'rail-footer'].find((zone) =>
        child.hasAttribute(`data-statement-${zone}`),
      ),
    );

    expect(tagsOf(frame)).toEqual(['ASIDE', 'DIV']);
    expect(frame.children[0]).toBe(sidebar);
    expect(frame.children[1]).toBe(main);
    expect(railZones).toEqual(['rail-content', 'rail-footer']);
    expect(sidebar.lastElementChild).toBe(footer);
    expect(tagsOf(main)).toEqual(['DIV', 'DIV']);
    expect(main.children[0]).toBe(header);
    expect(main.children[1]).toBe(scroll);
    expect(header.children).toHaveLength(0);
    expect(header.textContent).toBe('');
    expect(footer.children).toHaveLength(0);
    expect(footer.textContent).toBe('');
    expect(scroll.hasAttribute('data-statement-main')).toBe(false);
    expect(main.hasAttribute('data-statement-scroll')).toBe(false);
    expect(scroll.querySelector('article')?.getAttribute('data-surface')).toBe('card');
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
    expect(container.querySelector('article')?.getAttribute('data-surface')).toBe('bleed');
  });
});
