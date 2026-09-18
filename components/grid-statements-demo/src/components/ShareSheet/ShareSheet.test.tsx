import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from '@/statement/fixtures';
import { ShareSheet } from './ShareSheet';

describe('ShareSheet', () => {
  it('shows the statement and the three approved actions', () => {
    render(
      <ShareSheet
        open
        statement={buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD)}
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

  it('shortens the ripple for reduced motion', () => {
    const styles = readFileSync(
      resolve(process.cwd(), 'src/components/ShareSheet/ShareSheet.module.scss'),
      'utf8',
    );
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('animation-duration: 1ms');
  });
});
