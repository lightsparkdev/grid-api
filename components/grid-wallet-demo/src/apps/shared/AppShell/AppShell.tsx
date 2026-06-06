'use client';

import type { CSSProperties } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { Glass, PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { usePhoneDrag } from './usePhoneDrag';
import {
  APP_SHELL_OUTER_HEIGHT,
  APP_SHELL_OUTER_WIDTH,
  usePhoneFitScale,
} from './usePhoneFitScale';
import styles from './AppShell.module.scss';

interface AppShellProps {
  glassConfig?: GlassConfig;
  showGlassOutline?: boolean;
  /** Dev — drag phone over canvas bg to preview glass refraction. */
  draggable?: boolean;
  /** Mirrors DotGridCanvas — glass refracts its *children*, not the canvas behind. */
  glassDemoBg?: boolean;
}

/**
 * Shared phone bezel — Figma phone-gga (2121:17475).
 * Glass shell over the dot grid; opaque screen stacked on top.
 */
export function AppShell({
  glassConfig = PHONE_SHELL_GLASS,
  showGlassOutline = false,
  draggable = false,
  glassDemoBg = false,
}: AppShellProps) {
  const { wrapRef, scale, size } = usePhoneFitScale();
  const { offset, dragHandlers } = usePhoneDrag(draggable);

  // The glass bends its *children*, never the real page behind it (that's the
  // Aave technique — backdrop-filter is Chromium-only). So we drop a copy of the
  // stage backdrop *inside* the glass, positioned to coincide with the real
  // backdrop so the bezel refracts exactly what's behind the phone, and tracks
  // it while dragging. Geometry is expressed in the glass's local space; the
  // .scaled transform maps it back onto the stage 1:1.
  const s = scale || 1;
  let backdropStyle: CSSProperties = {
    left: 0,
    top: 0,
    width: APP_SHELL_OUTER_WIDTH,
    height: APP_SHELL_OUTER_HEIGHT,
  };
  if (size.w > 0 && size.h > 0) {
    const glassLeft = size.w / 2 + offset.x - (APP_SHELL_OUTER_WIDTH * s) / 2;
    const glassTop = size.h / 2 + offset.y - (APP_SHELL_OUTER_HEIGHT * s) / 2;
    backdropStyle = {
      left: -glassLeft / s,
      top: -glassTop / s,
      width: size.w / s,
      height: size.h / s,
    };
  }

  return (
    <div className={styles.stage} ref={wrapRef}>
      <div
        className={`${styles.scaled} ${draggable ? styles.scaledDraggable : ''}`}
        style={{
          transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
        }}
        {...dragHandlers}
      >
        <div className={styles.frame}>
          <Glass
            {...glassConfig}
            className={styles.shell}
            style={{
              borderRadius: glassConfig.radius,
              cornerShape: 'squircle',
            }}
            showOutline={showGlassOutline}
          >
            <div
              className={
                glassDemoBg ? styles.shellBackdropDemo : styles.shellBackdropDots
              }
              style={backdropStyle}
              aria-hidden
            />
          </Glass>
          <div className={styles.screen} />
        </div>
      </div>
    </div>
  );
}
