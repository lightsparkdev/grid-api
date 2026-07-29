'use client';

import { Component, type ReactNode } from 'react';

/**
 * Guards the 3D card: if three.js / WebGL throws at runtime, fall back to the
 * flat placeholder instead of crashing the whole issuance sheet.
 */
export class CanvasErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[Z card 3D] render failed, using fallback', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
