import React, { useState } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

function FocusHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Export
      </button>
      <ShareSheet
        open={open}
        statement={buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD)}
        previewMode="mobile"
        onClose={() => setOpen(false)}
        onCopyLink={vi.fn()}
        onSavePdf={vi.fn()}
        onSaveHtml={vi.fn()}
      />
    </>
  );
}

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

    expect(
      screen
        .getByRole('dialog', { name: 'Export statement' })
        .getAttribute('aria-modal'),
    ).toBe('true');
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

  it('traps focus and returns it after Escape or an outside click', async () => {
    const { container } = render(<FocusHarness />);
    const trigger = screen.getByRole('button', { name: 'Export' });

    trigger.focus();
    fireEvent.click(trigger);
    const first = screen.getByRole('button', { name: 'Copy link' });
    const last = screen.getByRole('button', { name: 'Save HTML' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    fireEvent.click(trigger);
    fireEvent.click(container.querySelector('[data-share-backdrop]') as HTMLElement);
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('shows a hint only when the logo is an upload', () => {
    const props = {
      open: true,
      previewMode: 'mobile' as const,
      onClose: vi.fn(),
      onCopyLink: vi.fn(),
      onSavePdf: vi.fn(),
      onSaveHtml: vi.fn(),
    };
    const hint = 'Uploaded logos are not included in the link.';
    const view = render(
      <ShareSheet
        {...props}
        statement={buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD)}
      />,
    );
    expect(screen.queryByText(hint)).toBeNull();

    view.rerender(
      <ShareSheet
        {...props}
        statement={buildStatement(
          'consumer',
          {
            ...DEFAULT_BRAND,
            logo: { kind: 'image', src: 'blob:https://example.com/logo', alt: 'Logo' },
          },
          STATEMENT_PERIOD,
        )}
      />,
    );
    expect(screen.getByText(hint)).toBeTruthy();
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
