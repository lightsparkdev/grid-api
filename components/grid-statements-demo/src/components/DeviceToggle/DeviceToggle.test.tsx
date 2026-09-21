import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeviceToggle } from './DeviceToggle';

vi.mock('next/dynamic', () => ({
  default: () => ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));

afterEach(cleanup);

function StatefulDeviceToggle() {
  const [mode, setMode] = useState<'mobile' | 'desktop'>('mobile');
  return <DeviceToggle value={mode} onChange={setMode} />;
}

describe('DeviceToggle', () => {
  it('keeps only the selected device in the tab order', () => {
    render(<StatefulDeviceToggle />);

    expect(screen.getByRole('radio', { name: 'Mobile' }).tabIndex).toBe(0);
    expect(screen.getByRole('radio', { name: 'Desktop' }).tabIndex).toBe(-1);
  });

  it('moves selection and focus with arrow keys', () => {
    render(<StatefulDeviceToggle />);

    const mobile = screen.getByRole('radio', { name: 'Mobile' });
    const desktop = screen.getByRole('radio', { name: 'Desktop' });
    mobile.focus();
    fireEvent.keyDown(mobile, { key: 'ArrowRight' });

    expect(desktop.getAttribute('aria-checked')).toBe('true');
    expect(desktop.tabIndex).toBe(0);
    expect(mobile.tabIndex).toBe(-1);
    expect(document.activeElement).toBe(desktop);
  });
});
