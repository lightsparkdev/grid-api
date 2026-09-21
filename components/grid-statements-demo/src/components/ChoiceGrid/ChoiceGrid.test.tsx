import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ChoiceGrid } from './ChoiceGrid';

afterEach(cleanup);

const options = [
  { id: 'consumer', label: 'Consumer', Icon: TestIcon },
  { id: 'commercial', label: 'Commercial', Icon: TestIcon },
] as const;

function TestIcon() {
  return <svg />;
}

function StatefulChoiceGrid() {
  const [value, setValue] = useState<(typeof options)[number]['id']>('consumer');
  return (
    <ChoiceGrid
      label="Account"
      value={value}
      options={options}
      onChange={setValue}
    />
  );
}

describe('ChoiceGrid', () => {
  it('keeps only the selected radio in the tab order', () => {
    render(<StatefulChoiceGrid />);

    const consumer = screen.getByRole('radio', { name: 'Consumer' });
    const commercial = screen.getByRole('radio', { name: 'Commercial' });

    expect(consumer.tabIndex).toBe(0);
    expect(commercial.tabIndex).toBe(-1);
    expect(consumer.hasAttribute('disabled')).toBe(false);
    expect(commercial.hasAttribute('disabled')).toBe(false);
  });

  it('moves selection and focus with arrow keys', () => {
    render(<StatefulChoiceGrid />);

    const consumer = screen.getByRole('radio', { name: 'Consumer' });
    const commercial = screen.getByRole('radio', { name: 'Commercial' });
    consumer.focus();
    fireEvent.keyDown(consumer, { key: 'ArrowRight' });

    expect(commercial.getAttribute('aria-checked')).toBe('true');
    expect(commercial.tabIndex).toBe(0);
    expect(consumer.tabIndex).toBe(-1);
    expect(document.activeElement).toBe(commercial);
  });
});
