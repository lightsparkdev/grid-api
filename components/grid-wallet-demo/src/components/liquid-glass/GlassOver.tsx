'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { GlassConfig } from './LiquidGlass';
import Glass from './LiquidGlass';

/**
 * Convenience wrapper around <Glass> for the common "glass surface over a KNOWN
 * background" case (button, tab bar, card, panel).
 *
 * Why this exists: <Glass> refracts its *children*, not the page behind it (the
 * Aave cross-browser technique — backdrop-filter can't refract portably). So to
 * make glass appear to bend a background, you drop a copy of that background
 * inside the glass. GlassOver does that copy for you: pass the same `backdrop`
 * the surface sits on, put your real content as `children` (it renders on top,
 * un-refracted), and you get a glass chip.
 *
 * Caveats:
 *  - `backdrop` must be something you can re-draw as a CSS background (a color,
 *    gradient, or url(...) image). It can't refract arbitrary live/scrolling DOM
 *    behind it — that's a fundamental limit of the technique.
 *  - Refraction is only visible when the backdrop has texture (gradient/pattern/
 *    image). Over a flat color you only get the specular/edge highlights.
 *  - For a tiled/positioned background to line up seamlessly, pass `backdropOffset`
 *    = this element's {x,y} offset within the element that owns the background.
 */
export interface GlassOverProps extends Partial<GlassConfig> {
  /** CSS `background` to refract — a color, gradient, or url(...) image. */
  backdrop: string;
  /** Foreground content, rendered on top of the glass (not refracted). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * This element's pixel offset within the backdrop's origin, so a tiled or
   * positioned background lines up with the real one. Solid colors and most
   * gradients don't need it.
   */
  backdropOffset?: { x: number; y: number };
}

/** Margin the backdrop copy bleeds past the glass so edge blur/chroma samples
 *  real pixels instead of transparent (matches <Glass>'s internal bleed). */
const BLEED = 48;

export function GlassOver({
  backdrop,
  children,
  className,
  style,
  backdropOffset,
  ...config
}: GlassOverProps) {
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <Glass {...config} style={{ position: 'absolute', inset: 0 }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -BLEED,
            left: -BLEED,
            right: -BLEED,
            bottom: -BLEED,
            background: backdrop,
            backgroundPosition: backdropOffset
              ? `${BLEED - backdropOffset.x}px ${BLEED - backdropOffset.y}px`
              : undefined,
          }}
        />
      </Glass>
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

export default GlassOver;
