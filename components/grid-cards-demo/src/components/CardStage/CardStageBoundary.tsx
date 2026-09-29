'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface CardStageBoundaryProps {
  /** What stands in for the 3D card once it has failed (the flat card). */
  fallback: ReactNode;
  onFallback?: () => void;
  children: ReactNode;
}

/** Catches the 3D card failing (no WebGL, so no context to render with, or
 *  anything else it throws) so the rest of the page stays up with `fallback`
 *  in its place. Uncaught, React unmounts the whole tree and Next shows its
 *  error page. */
export class CardStageBoundary extends Component<CardStageBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The 3D card failed; showing the flat card instead.', error, info.componentStack);
    this.props.onFallback?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
