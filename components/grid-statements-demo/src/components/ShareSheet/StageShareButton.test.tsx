import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { StageShareButton } from './StageShareButton';

vi.mock('torph/react', async () => {
  const { createElement } = await import('react');
  return {
    TextMorph: ({
      as = 'span',
      children,
      className,
    }: {
      as?: 'span';
      children?: React.ReactNode;
      className?: string;
    }) => createElement(as, { className }, children),
  };
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

afterEach(cleanup);

describe('StageShareButton', () => {
  it('labels the closed control Export and the open control Cancel', () => {
    const view = render(
      <StageShareButton visible open={false} onClick={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Export' }).textContent).toBe(
      'Export',
    );

    view.rerender(<StageShareButton visible open onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Cancel' }).textContent).toBe(
      'Cancel',
    );
  });
});
