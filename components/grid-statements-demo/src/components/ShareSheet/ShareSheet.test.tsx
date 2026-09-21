import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { ShareSheet } from './ShareSheet';

vi.mock('@/components/StatementPreview/StatementPreview', () => ({
  StatementPreview: ({
    mode,
    statement,
  }: {
    mode: string;
    statement: { brand: { companyName: string } };
  }) =>
    React.createElement(
      'div',
      { 'data-preview-shell': mode },
      statement.brand.companyName,
    ),
}));

afterEach(cleanup);

describe('ShareSheet', () => {
  it('shows the statement and the three approved actions', () => {
    render(
      <ShareSheet
        open
        statement={buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD)}
        previewMode="mobile"
        onClose={vi.fn()}
        onCopyLink={vi.fn()}
        onSavePdf={vi.fn()}
        onSaveHtml={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Copy link' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save PDF' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save HTML' })).toBeTruthy();
    expect(document.querySelector('[data-share-ripple]')).toBeTruthy();
  });

  it('shares both live preview modes and brand edits through the shared tree', () => {
    const initial = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    const props = {
      open: true,
      onClose: vi.fn(),
      onCopyLink: vi.fn(),
      onSavePdf: vi.fn(),
      onSaveHtml: vi.fn(),
    };
    const view = render(
      <ShareSheet {...props} statement={initial} previewMode="mobile" />,
    );

    expect(document.querySelector('[data-preview-shell="mobile"]')).toBeTruthy();
    const edited = buildStatement(
      'consumer',
      { ...DEFAULT_BRAND, companyName: 'Edited brand' },
      STATEMENT_PERIOD,
    );
    view.rerender(
      <ShareSheet {...props} statement={edited} previewMode="desktop" />,
    );
    expect(document.querySelector('[data-preview-shell="desktop"]')).toBeTruthy();
    expect(screen.getByText('Edited brand')).toBeTruthy();
  });

  it('dismisses on Escape and on a click outside the panel', () => {
    const onClose = vi.fn();
    const { container } = render(
      <ShareSheet
        open
        statement={buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD)}
        previewMode="mobile"
        onClose={onClose}
        onCopyLink={vi.fn()}
        onSavePdf={vi.fn()}
        onSaveHtml={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    const backdrop = container.querySelector('div[aria-hidden]');
    fireEvent.click(backdrop as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('shortens the ripple for reduced motion', () => {
    const styles = readFileSync(
      resolve(process.cwd(), 'src/components/ShareSheet/ShareSheet.module.scss'),
      'utf8',
    );
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('animation-duration: 1ms');
  });
});
