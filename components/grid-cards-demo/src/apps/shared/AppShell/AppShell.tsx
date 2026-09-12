'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { isCardParked, usePhoneBoot } from '@/components/DotGridCanvas/PhoneBootContext';
import { useAdaptiveStatusBarTone } from './useAdaptiveStatusBarTone';
import type { GlassConfig } from '@/components/liquid-glass';
import { Glass, PHONE_SHELL_GLASS, squirclePath } from '@/components/liquid-glass';
import {
  APP_SHELL_OUTER_HEIGHT,
  APP_SHELL_OUTER_WIDTH,
  usePhoneFitScale,
} from './usePhoneFitScale';
import { PhoneStatusBar } from './PhoneStatusBar';
import { ScreenOverlayContext } from './ScreenOverlayContext';
import styles from './AppShell.module.scss';

interface AppShellProps {
  glassConfig?: GlassConfig;
  showGlassOutline?: boolean;
  /** Mirrors DotGridCanvas — glass refracts its *children*, not the canvas behind. */
  glassDemoBg?: boolean;
  /** Refraction handled by the external WebGL stage (StageGL); render only a
   *  transparent shell (silhouette + shadow) so the lens shows through. */
  externalGlass?: boolean;
  /** Dev — overlay a reference phone bezel (centered, on top) to match the
   *  corner by eye while tuning. Lives in the phone's scaled space so it tracks
   *  the fit transform. */
  bezelOverlay?: { src: string; opacity: number } | null;
  /** Screen content below the status bar. */
  children?: ReactNode;
  /** Full-screen overlay above the status bar (e.g. Face ID blur + island). */
  screenOverlay?: ReactNode;
  /** Stage controls laid out against the phone's outer box, above the stage
   *  (e.g. a close in its top-right corner). */
  stageChrome?: ReactNode;
  /** The shell's outer corner radii (top-left, top-right, bottom-right,
   *  bottom-left), when they differ from `glassConfig.radius`: a tighter
   *  corner makes room in the bezel for a control. The screen keeps its own. */
  shellRadii?: [number, number, number, number];
  /** Light status bar icons/time on dark or colored backgrounds. */
  screenTone?: 'default' | 'light';
  /** Extra inline style on the screen root — the playground sets the
   *  `--brand-*` tokens here for the customizable skin. */
  screenStyle?: CSSProperties;
}

/**
 * Shared phone bezel — Figma phone-gga (2121:17475).
 * Glass shell over the dot grid; opaque screen stacked on top.
 */
export function AppShell({
  glassConfig = PHONE_SHELL_GLASS,
  showGlassOutline = false,
  glassDemoBg = false,
  externalGlass = false,
  bezelOverlay = null,
  children,
  screenOverlay,
  stageChrome,
  shellRadii,
  screenTone = 'default',
  screenStyle,
}: AppShellProps) {
  const { wrapRef, scale, size } = usePhoneFitScale();
  const { ready: stageBootReady, bootOpacity, bootProgress, realignLens } = usePhoneBoot();
  const showPhone = stageBootReady && size.w > 0 && size.h > 0;
  const phoneVisible = showPhone && bootOpacity > 0;
  const bootY = (1 - bootOpacity) * 128;
  const bootScale = 0.9 + bootOpacity * 0.1;
  const screenRef = useRef<HTMLDivElement>(null);
  const screenBodyRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLElement>(null);
  const statusBarTone = useAdaptiveStatusBarTone(screenRef, screenBodyRef, statusBarRef);
  // Overlay layer node handed to descendants so they can portal Face ID, the
  // notification, and the toast into it. It is the phone's twin above the
  // stage (`.overStage`), not a child of the screen: the stage's card canvas
  // covers the phone, and these must paint over the card parked in the slot.
  const [overlayEl, setOverlayEl] = useState<HTMLDivElement | null>(null);

  // The glass shell sits REST_INSET px inset at rest and lifts back out
  // HOVER_GROW px on hover (so the bezel is a touch thinner until you hover). The
  // inner screen stays put; radius grows additively (not scaled) so corners stay
  // concentric, and the WebGL lens reads the shell's geometry so the refraction
  // tracks it. Slop keeps the base geometry (changing it would re-bake the map).
  const [hovered, setHovered] = useState(false);
  const REST_INSET = 2; // inset at rest
  const HOVER_GROW = 2; // lift back out on hover
  const frameRef = useRef<HTMLDivElement>(null);
  // Hovered is geometric (the pointer inside the frame's box), not an enter
  // on the frame: the card parked in the slot takes the pointer above the
  // phone, and the bezel should stay bloomed while the pointer is over it.
  useEffect(() => {
    if (!externalGlass) return;
    let over = false;
    let raf = 0;
    let last: { x: number; y: number } | null = null;
    const check = () => {
      raf = 0;
      const el = frameRef.current;
      if (!el || !last) return;
      const r = el.getBoundingClientRect();
      const inside = last.x >= r.left && last.x <= r.right && last.y >= r.top && last.y <= r.bottom;
      if (inside !== over) {
        over = inside;
        setHovered(inside);
      }
    };
    const onMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(check);
    };
    const onLeave = () => {
      last = null;
      if (over) {
        over = false;
        setHovered(false);
      }
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [externalGlass]);
  const growOut = externalGlass ? (hovered ? HOVER_GROW : 0) - REST_INSET : 0;
  const shellInset = -growOut;
  // Each outer corner grows with the bloom; the lens reads them back off the DOM.
  const baseRadii = shellRadii ?? [glassConfig.radius, glassConfig.radius, glassConfig.radius, glassConfig.radius];
  const shellCorners = baseRadii.map((r) => Math.max(0, r + growOut)) as [number, number, number, number];
  const shadowScaleX = (APP_SHELL_OUTER_WIDTH + 2 * growOut) / APP_SHELL_OUTER_WIDTH;
  const shadowScaleY = (APP_SHELL_OUTER_HEIGHT + 2 * growOut) / APP_SHELL_OUTER_HEIGHT;

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
  const screenW = APP_SHELL_OUTER_WIDTH - SCREEN_INSET * 2;
  const screenH = APP_SHELL_OUTER_HEIGHT - SCREEN_INSET * 2;
  const screenPathD = squirclePath(
    screenW,
    screenH,
    glassConfig.radius - SCREEN_INSET,
    glassConfig.cornerSmoothing,
  );
  const screenClip = `path('${screenPathD}')`;

  // Drop shadow as an SVG *outset* filter rather than box-shadow. box-shadow rides
  // the Chromium-only `corner-shape`, so on Safari/Firefox it falls back to a circle
  // while the glass stays a squircle (the faint corner ghost). The SVG filter traces
  // the squircle `path`, blurs/offsets it, then keeps only the part *outside* the
  // shape (`operator="out"`) — i.e. a true outset shadow that's a squircle on every
  // browser, and leaves the bezel transparent so the lens still shows through.
  // Tunable via the Shadow sliders (offset / blur / spread / opacity).
  const shadowId = useRef(`phsh-${Math.random().toString(36).slice(2)}`).current;
  const [shadowOpacity, setShadowOpacity] = useState(
    glassConfig.shadowOpacity ?? 0.12,
  );

  useEffect(() => {
    const read = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--phone-shell-shadow-opacity')
        .trim();
      const themed = raw ? Number.parseFloat(raw) : Number.NaN;
      setShadowOpacity(
        Number.isFinite(themed) ? themed : (glassConfig.shadowOpacity ?? 0.12),
      );
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => obs.disconnect();
  }, [glassConfig.shadowOpacity]);
  const shellPath = squirclePath(
    APP_SHELL_OUTER_WIDTH,
    APP_SHELL_OUTER_HEIGHT,
    baseRadii,
    glassConfig.cornerSmoothing,
  );

  // The glass bends its *children*, never the real page behind it (that's the
  // Aave technique — backdrop-filter is Chromium-only). So we drop a copy of the
  // stage backdrop *inside* the glass, positioned to coincide with the real
  // backdrop so the bezel refracts exactly what's behind the phone. Geometry is
  // expressed in the glass's local space; the .scaled transform maps it back
  // onto the stage 1:1.
  const s = scale || 1;
  let backdropStyle: CSSProperties = {
    left: 0,
    top: 0,
    width: APP_SHELL_OUTER_WIDTH,
    height: APP_SHELL_OUTER_HEIGHT,
  };
  if (size.w > 0 && size.h > 0) {
    const glassLeft = size.w / 2 - (APP_SHELL_OUTER_WIDTH * s) / 2;
    const glassTop = size.h / 2 - (APP_SHELL_OUTER_HEIGHT * s) / 2;
    backdropStyle = {
      left: -glassLeft / s,
      top: -glassTop / s,
      width: size.w / s,
      height: size.h / s,
    };
  }

  useEffect(() => {
    if (!phoneVisible || bootOpacity >= 1) return;

    // Keep the WebGL lens glued to the shell while boot opacity animates.
    let raf = 0;
    const tick = () => {
      realignLens();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [phoneVisible, bootOpacity, realignLens]);

  const bootStyle: CSSProperties = {
    ['--fit-scale' as string]: scale,
    ['--boot-scale' as string]: bootScale,
    ['--boot-y' as string]: `${bootY}px`,
    opacity: showPhone ? bootOpacity : 0,
    filter: showPhone && bootOpacity < 1 ? `blur(${(1 - bootOpacity) * 48}px)` : undefined,
  };
  // The card is parked in the slot (not in flight): the content layer sits
  // above the stage's canvas. Same landing test as the stage's.
  const cardParked = isCardParked(bootProgress);
  // The screen's shape, on the surface below the stage and on the content
  // layer above it alike, so the two trace one squircle.
  // border-radius MUST be 0: clipPath is the sole corner shaper. A non-zero
  // radius clips to a *circle* on Safari/Firefox (no corner-shape), tighter
  // than the squircle, knocking the screen out of concentricity with the
  // lens. clip-path path() is a squircle on every browser.
  const screenShape: CSSProperties = externalGlass
    ? {
        borderRadius: 0,
        clipPath: screenClip,
        WebkitClipPath: screenClip,
        // Concentric corner radius for descendants (e.g. a bottom sheet
        // hugging the screen edge). Inherits via the cascade.
        ['--screen-corner-radius' as string]: `${glassConfig.radius - SCREEN_INSET}px`,
      }
    : {};

  return (
    <div className={styles.stage} ref={wrapRef}>
      <div
        className={styles.scaled}
        style={{ ...bootStyle, pointerEvents: bootOpacity >= 1 ? 'auto' : 'none' }}
        aria-hidden={!phoneVisible}
      >
        <div ref={frameRef} className={styles.frame}>
          {externalGlass ? (
            <>
              {/* Squircle drop shadow (cross-browser) — see shellPath/shadowId above. */}
              <svg
                className={styles.dropShadow}
                viewBox={`0 0 ${APP_SHELL_OUTER_WIDTH} ${APP_SHELL_OUTER_HEIGHT}`}
                aria-hidden
                style={{ transform: `scale(${shadowScaleX}, ${shadowScaleY})` }}
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
                    <feFlood floodColor="#000" floodOpacity={shadowOpacity} />
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
                  borderRadius: shellCorners.map((r) => `${r}px`).join(' '),
                  cornerShape,
                }}
                aria-hidden
              />
              {/* Hairline edge contrast OUTSIDE the screen: stroke the screen's exact
                  path and sit below the opaque screen, which hides the stroke's inner
                  half — leaving ~0.5px in the bezel, hugging the curve. */}
              <svg
                className={styles.screenBorder}
                viewBox={`0 0 ${screenW} ${screenH}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d={screenPathD} strokeWidth={1} />
              </svg>
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
          {/* The screen's surface only. Its content lives in the layer above
              the stage (below), so the card parked in the slot is under the
              app's chrome, sheets, and covers, and shows through the slot. */}
          <div
            ref={screenRef}
            className={`${styles.screen} ${screenTone === 'light' ? styles.screenToneLight : ''}`}
            style={{ ...screenStyle, ...screenShape }}
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
              // exactly on the 402x874 phone screen, centered. No scaling needed.
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
      {/* The screen's content, in a layer above the stage: it rides the same
          boot transform as the shell, is clipped to the screen, and holds the
          status bar, the app, and the overlays (Face ID, notifications, the
          toast). The card's canvas covers the whole stage above the phone's
          shell, so this is what puts the app over the card parked in the slot:
          the slot is a hole in the content the card shows through. While the
          card flies in or out the layer drops under the canvas, so the card
          crosses the phone on top; the swap lands while the card is in the
          slot, where nothing overlaps it. */}
      <div
        className={`${styles.overStage} ${cardParked ? '' : styles.overStageUnder}`}
        style={{ ...bootStyle, ['--shell-grow' as string]: `${growOut}px` }}
        aria-hidden={!phoneVisible}
      >
        <div
          className={`${styles.overStageScreen} ${screenTone === 'light' ? styles.screenToneLight : ''}`}
          style={{ ...screenStyle, ...screenShape }}
        >
          <PhoneStatusBar ref={statusBarRef} tone={statusBarTone} />
          {children ? (
            <ScreenOverlayContext.Provider value={overlayEl}>
              <div ref={screenBodyRef} className={styles.screenBody} data-screen-body>
                {children}
              </div>
            </ScreenOverlayContext.Provider>
          ) : null}
          {/* Above the status bar and the app: the portal target for overlays. */}
          <div ref={setOverlayEl} className={styles.screenOverlay}>
            {screenOverlay}
          </div>
        </div>
        {stageChrome ? <div className={styles.overStageChrome}>{stageChrome}</div> : null}
      </div>
    </div>
  );
}
