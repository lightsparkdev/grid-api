import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { HexColor } from '@/statement/types';
import { ColorSwatches } from './DesignControls';

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: ResizeObserverStub,
  });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
});

afterEach(cleanup);

const COLORS: readonly HexColor[] = ['#ffffff', '#1a1a1a', '#0196c9'];

function StatefulColorSwatches({ initial }: { initial: HexColor }) {
  const [value, setValue] = useState<HexColor>(initial);
  return (
    <ColorSwatches label="Background" value={value} colors={COLORS} onChange={setValue} />
  );
}

const swatch = (color: HexColor) => screen.getByRole('radio', { name: `Background ${color}` });

describe('ColorSwatches', () => {
  it('keeps only the checked swatch in the tab order', () => {
    render(<StatefulColorSwatches initial="#1a1a1a" />);

    expect(swatch('#ffffff').tabIndex).toBe(-1);
    expect(swatch('#1a1a1a').tabIndex).toBe(0);
    expect(swatch('#0196c9').tabIndex).toBe(-1);
  });

  it('keeps the first swatch reachable when the active color is custom', () => {
    render(<StatefulColorSwatches initial="#123456" />);

    expect(COLORS.map((color) => swatch(color).getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'false',
    ]);
    expect(swatch('#ffffff').tabIndex).toBe(0);
    expect(swatch('#1a1a1a').tabIndex).toBe(-1);
    expect(swatch('#0196c9').tabIndex).toBe(-1);
  });

  it('moves from a custom color into the swatches with arrow keys', () => {
    render(<StatefulColorSwatches initial="#123456" />);

    const first = swatch('#ffffff');
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });

    const second = swatch('#1a1a1a');
    expect(second.getAttribute('aria-checked')).toBe('true');
    expect(second.tabIndex).toBe(0);
    expect(first.tabIndex).toBe(-1);
    expect(document.activeElement).toBe(second);
  });

  it('moves selection and focus with arrow keys', () => {
    render(<StatefulColorSwatches initial="#1a1a1a" />);

    const second = swatch('#1a1a1a');
    second.focus();
    fireEvent.keyDown(second, { key: 'ArrowLeft' });

    const first = swatch('#ffffff');
    expect(first.getAttribute('aria-checked')).toBe('true');
    expect(first.tabIndex).toBe(0);
    expect(document.activeElement).toBe(first);
  });
});
