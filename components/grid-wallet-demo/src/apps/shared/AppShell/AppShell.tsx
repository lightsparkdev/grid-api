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
  /** Refraction handled by the external WebGL stage (StageGL); render only a
   *  transparent shell (silhouette + shadow) so the lens shows through. */
  externalGlass?: boolean;
  /** Dev — overlay a reference phone bezel (centered, on top) to match the
   *  corner by eye while tuning. Lives in the phone's scaled space so it tracks
   *  the fit transform. */
  bezelOverlay?: { src: string; opacity: number } | null;
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
  externalGlass = false,
  bezelOverlay = null,
}: AppShellProps) {
  const { wrapRef, scale, size } = usePhoneFitScale();
  const { offset, dragHandlers } = usePhoneDrag(draggable);

  // Match the DOM corner to the shader's superellipse so the shell shadow and the
  // inner screen trace the same curve as the refracted bezel. corner-shape
  // superellipse(K) has exponent 2K; the shader uses (2 + smoothing*4), so
  // K = 1 + smoothing*2. (smoothing 0.75 -> superellipse(2.5)/n=5 ~= iOS.)
  const cornerShape = `superellipse(${(1 + glassConfig.cornerSmoothing * 2).toFixed(3)})`;

  // Build the drop shadow from tunable components (grounding shadow: offset down +
  // negative spread, so it pools under the phone without haloing the corners).
  const swagShadow = `0 ${glassConfig.shadowOffsetY ?? 30}px ${glassConfig.shadowBlur ?? 40}px ${glassConfig.shadowSpread ?? -40}px rgba(0, 0, 0, ${glassConfig.shadowOpacity ?? 0.3})`;

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
          {externalGlass ? (
            <div
              className={styles.shell}
              style={{
                // Driven by the Radius control; the inner screen tracks this minus
                // the 16px inset (below) so the two stay concentric as it changes.
                borderRadius: `${glassConfig.radius}px`,
                cornerShape,
                boxShadow: swagShadow,
              }}
              aria-hidden
            />
          ) : (
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
          )}
          <div
            className={styles.screen}
            style={
              externalGlass
                ? {
                    borderRadius: `calc(${glassConfig.radius}px - var(--app-shell-padding))`,
                    cornerShape,
                  }
                : undefined
            }
          />
        </div>
        {bezelOverlay && (
          <img
            src={bezelOverlay.src}
            alt=""
            aria-hidden
            draggable={false}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              // Fixed at 450x920 (the PNG's natural aspect): the reference's
              // transparent screen cavity (804x1748 in a 900x1840 canvas) then lands
              // exactly on the 402x874 swag screen, centered. No scaling needed.
              width: '450px',
              height: '920px',
              // Bypass the global `img { max-width: 100% }` reset, which otherwise
              // clamps the overlay to the shell width (434) and squishes it narrow.
              maxWidth: 'none',
              maxHeight: 'none',
              transform: 'translate(-50%, -50%)',
              opacity: bezelOverlay.opacity,
              pointerEvents: 'none',
              zIndex: 50,
            }}
          />
        )}
      </div>
    </div>
  );
}
