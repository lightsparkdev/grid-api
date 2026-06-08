'use client';

import { useRef, useState, type CSSProperties } from 'react';
import type { GlassConfig } from '@/components/liquid-glass';
import { Glass, PHONE_SHELL_GLASS, squirclePath } from '@/components/liquid-glass';
import { usePhoneDrag } from './usePhoneDrag';
import {
  APP_SHELL_OUTER_HEIGHT,
  APP_SHELL_OUTER_WIDTH,
  usePhoneFitScale,
} from './usePhoneFitScale';
import { PhoneStatusBar } from './PhoneStatusBar';
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

  // Hover "bloom": the glass shell grows GROW px outward (bezel 16 -> 16+GROW) while
  // the inner screen stays put. Radius grows additively (not scaled) so the corners
  // stay concentric; the WebGL lens reads the shell's geometry each frame, so the
  // refraction tracks the growth for free.
  const [hovered, setHovered] = useState(false);
  const GROW = 4;
  const bloom = externalGlass && hovered;
  const shellInset = bloom ? -GROW : 0;
  const shellRadius = glassConfig.radius + (bloom ? GROW : 0);
  const shadowScaleX = (APP_SHELL_OUTER_WIDTH + 2 * GROW) / APP_SHELL_OUTER_WIDTH;
  const shadowScaleY = (APP_SHELL_OUTER_HEIGHT + 2 * GROW) / APP_SHELL_OUTER_HEIGHT;

  // Match the DOM corner to the shader's superellipse so the shell shadow and the
  // inner screen trace the same curve as the refracted bezel. corner-shape
  // superellipse(K) has exponent 2K; the shader uses (2 + smoothing*4), so
  // K = 1 + smoothing*2. (smoothing 0.75 -> superellipse(2.5)/n=5 ~= iOS.)
  const cornerShape = `superellipse(${(1 + glassConfig.cornerSmoothing * 2).toFixed(3)})`;

  // The phone shell is a hero element, so it must NOT fall back to circular corners
  // on Safari/Firefox (which ignore the Chromium-only `corner-shape`). The WebGL
  // lens (StageGL) always draws a superellipse, so we clip the opaque screen to the
  // *same* superellipse: squirclePath shares the shader's exponent (2 + smoothing*4)
  // and `clip-path: path()` works in every browser — so the screen and the refracted
  // bezel stay squircle and lined up everywhere. (General Glass/GlassOver components
  // keep the circular fallback via useSquircleSupport; the phone opts out of it.)
  const SCREEN_INSET = 16; // --app-shell-padding
  const screenClip = `path('${squirclePath(
    APP_SHELL_OUTER_WIDTH - SCREEN_INSET * 2,
    APP_SHELL_OUTER_HEIGHT - SCREEN_INSET * 2,
    glassConfig.radius - SCREEN_INSET,
    glassConfig.cornerSmoothing,
  )}')`;

  // Drop shadow as an SVG *outset* filter rather than box-shadow. box-shadow rides
  // the Chromium-only `corner-shape`, so on Safari/Firefox it falls back to a circle
  // while the glass stays a squircle (the faint corner ghost). The SVG filter traces
  // the squircle `path`, blurs/offsets it, then keeps only the part *outside* the
  // shape (`operator="out"`) — i.e. a true outset shadow that's a squircle on every
  // browser, and leaves the bezel transparent so the lens still shows through.
  // Tunable via the Shadow sliders (offset / blur / spread / opacity).
  const shadowId = useRef(`phsh-${Math.random().toString(36).slice(2)}`).current;
  const shellPath = squirclePath(
    APP_SHELL_OUTER_WIDTH,
    APP_SHELL_OUTER_HEIGHT,
    glassConfig.radius,
    glassConfig.cornerSmoothing,
  );

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
        <div
          className={styles.frame}
          onPointerEnter={externalGlass ? () => setHovered(true) : undefined}
          onPointerLeave={externalGlass ? () => setHovered(false) : undefined}
        >
          {externalGlass ? (
            <>
              {/* Squircle drop shadow (cross-browser) — see shellPath/shadowId above. */}
              <svg
                className={styles.dropShadow}
                viewBox={`0 0 ${APP_SHELL_OUTER_WIDTH} ${APP_SHELL_OUTER_HEIGHT}`}
                aria-hidden
                style={{ transform: `scale(${bloom ? shadowScaleX : 1}, ${bloom ? shadowScaleY : 1})` }}
              >
                <defs>
                  <filter
                    id={shadowId}
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    colorInterpolationFilters="sRGB"
                  >
                    <feMorphology
                      in="SourceAlpha"
                      operator="dilate"
                      radius={Math.max(0, glassConfig.shadowSpread ?? 0)}
                      result="sil"
                    />
                    <feGaussianBlur in="sil" stdDeviation={(glassConfig.shadowBlur ?? 24) / 2} result="blr" />
                    <feOffset in="blr" dy={glassConfig.shadowOffsetY ?? 8} result="off" />
                    <feComposite in="off" in2="sil" operator="out" result="outset" />
                    <feFlood floodColor="#000" floodOpacity={glassConfig.shadowOpacity ?? 0.12} />
                    <feComposite in2="outset" operator="in" />
                  </filter>
                </defs>
                <path d={shellPath} fill="#000" filter={`url(#${shadowId})`} />
              </svg>
              <div
                className={styles.shell}
                style={{
                  // Grows GROW px outward on hover (inset < 0) with radius +GROW so the
                  // corner stays concentric with the fixed screen; the lens follows.
                  inset: shellInset,
                  borderRadius: `${shellRadius}px`,
                  cornerShape,
                }}
                aria-hidden
              />
            </>
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
                    // border-radius MUST be 0: clipPath below is the sole corner
                    // shaper. A non-zero radius clips the screen to a *circle* on
                    // Safari/Firefox (no corner-shape) — tighter than the squircle
                    // clip-path — knocking the screen out of concentricity with the
                    // lens. clip-path path() is a squircle on every browser.
                    borderRadius: 0,
                    clipPath: screenClip,
                    WebkitClipPath: screenClip,
                  }
                : undefined
            }
          >
            <PhoneStatusBar />
          </div>
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
