'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { FrostPanel } from '@/components/liquid-glass';
import { useThemeMode } from '@/hooks/useThemeMode';
import { MessagingSfSymbol, type MessagingSfSymbolName } from '../sfSymbols';
import styles from './MessagingTabBar.module.scss';

/** Tab icons + labels from the home Figma (2640:19597) — SF Symbols; Money is
 *  the active tab (filled glyph). */
const TABS: { symbol: MessagingSfSymbolName; label: string; active?: boolean }[] = [
  { symbol: 'message', label: 'Chats' },
  { symbol: 'bell', label: 'Updates' },
  { symbol: 'person.2', label: 'Groups' },
  { symbol: 'dollarsign.circle.fill', label: 'Money', active: true },
  { symbol: 'person.crop.circle', label: 'You' },
];

/** How far the active pill extends past the tab's content on each side —
 *  painted by the indicator, NOT layout (the tabs never move for it). */
const INDICATOR_BLEED_PX = 8;

/** Decorative floating GLASS pill tab bar (construction Figma 2640:20119 —
 *  62px tall, 21px insets): a FrostPanel — heavy backdrop blur + specular
 *  edge, NO refraction (bending live scrolling DOM is too costly; frost is
 *  the big-surface treatment). Tabs read label-primary; the active tab's
 *  fills/tertiary pill is a SEPARATE indicator layered UNDER the tabs (the
 *  real apps slide it between tabs independently), sized off the active
 *  tab's content + 16px bleed each side. */
export function MessagingTabBar() {
  const theme = useThemeMode();
  const itemsRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLSpanElement | null>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Measure the active tab's content and park the indicator under it — in a
  // layout effect, AFTER every ref is attached (a callback ref on the span
  // fires before the parent's ref, so measuring there always bailed). offset*
  // geometry is relative to .items (the positioned ancestor) and immune to
  // the phone shell's fit-scale transform, unlike getBoundingClientRect.
  useLayoutEffect(() => {
    const el = activeRef.current;
    const items = itemsRef.current;
    if (!el || !items) return;
    // Accumulate offsets up to .items (the span's offsetParent is the
    // position:relative button, not the row).
    let left = 0;
    let top = 0;
    for (
      let n: HTMLElement | null = el;
      n && n !== items;
      n = n.offsetParent as HTMLElement | null
    ) {
      left += n.offsetLeft;
      top += n.offsetTop;
    }
    setIndicator({
      left: left - INDICATOR_BLEED_PX,
      top,
      width: el.offsetWidth + INDICATOR_BLEED_PX * 2,
      height: el.offsetHeight,
    });
  }, []);

  return (
    <nav className={styles.bar} aria-label="Navigation">
      <FrostPanel
        className={styles.frost}
        radius={31}
        cornerSmoothing={0}
        tint="var(--msg-tabbar-fill)"
        tintBlur={25}
        // LIGHT only: bake the buttons' geometry-aware specular onto the pill
        // so the rim reads on the white page (the hairline alone vanished) —
        // hotter gain, a wider rim band, a whisper more glow. Dark keeps the
        // plain frost + hairline (the baked rim glared there).
        specular={
          theme === 'dark' ? undefined : { strength: 1.9, edgeWidth: 2.5, glowStrength: 0.09 }
        }
      >
        <div ref={itemsRef} className={styles.items}>
          {/* The active indicator — its own element beneath the tab buttons,
              free to move without touching their layout. */}
          {indicator && (
            <span className={styles.indicator} style={indicator} aria-hidden />
          )}
          {TABS.map(({ symbol, label, active }) => (
            <button
              key={label}
              type="button"
              className={styles.item}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <span ref={active ? activeRef : undefined} className={styles.itemInner}>
                <MessagingSfSymbol name={symbol} size={24} />
                <span className={styles.label}>{label}</span>
              </span>
            </button>
          ))}
        </div>
      </FrostPanel>
    </nav>
  );
}
