import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { NoopButton } from '@/apps/agents/glass';
import { SAFARI_GLYPHS } from './safariGlyphs';
import styles from './SafariBar.module.scss';

function Glyph({ name, size }: { name: keyof typeof SAFARI_GLYPHS; size: number }) {
  const [d, x, y, w, h] = SAFARI_GLYPHS[name];
  const k = size / 24;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={w * k} height={h * k} aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** iOS 26 Safari's page menu (a private symbol): three bars, the last at 0.68 length. */
function PageMenu() {
  return (
    <svg width="16.5" height="12.25" viewBox="0 0 16.5 12.25" aria-hidden>
      <rect x="0" y="0" width="16.5" height="1.85" rx="0.925" fill="currentColor" />
      <rect x="0" y="5.2" width="16.5" height="1.85" rx="0.925" fill="currentColor" />
      <rect x="0" y="10.4" width="11.2" height="1.85" rx="0.925" fill="currentColor" />
    </svg>
  );
}

/** A toolbar control that presses like Safari's and goes nowhere; the slot carries the collapse's motion. */
function Piece({
  refEl,
  label,
  size,
  className,
  children,
  onClick,
}: {
  refEl: RefObject<HTMLDivElement>;
  label: string;
  size: number;
  className: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div ref={refEl} className={`${styles.slot} ${className}`} onClick={onClick}>
      <NoopButton label={label} size={size} className={styles.press}>
        <span className={styles.glass}>{children}</span>
      </NoopButton>
    </div>
  );
}

/*
 * Scrolling collapses the toolbar into the domain alone, ported from the GoFundMe demo (safari-scroll-collapse.mp4,
 * Pat's iPhone at 60fps): a 124 x 30.7pt capsule centred 843.3pt down, the domain at 0.724 of its size, Back and Tabs
 * drifting 48pt inward at 0.7 of their size as they fade, the page menu and reload gone in the first frames. Every
 * part follows one progress value over 333ms, eased by a cubic-bezier fitted to the recording's frames (within 2%;
 * the raw frames jitter), which differ collapsing and expanding.
 */
const BAR_TOP = 792;
const H = 48;
const PILL = { cx: 200.75, w: 222.5 };
const CAPSULE = { w: 124, h: 30.7, cy: 843.3 - BAR_TOP };
const HOST_COLLAPSED = 0.724;
const DURATION = 333;
const COLLAPSE = [0.5, 0.96, 0.8, 1] as const;
const EXPAND = [0.74, 0.88, 0.6, 0.8] as const;
/** Scroll down this far (px) collapses the toolbar; up this far brings it back. */
const COLLAPSE_AFTER = 4;
const EXPAND_AFTER = 12;
/** The blur under the toolbar: tall enough to soften the page behind the pieces, shorter behind the capsule. */
const EDGE = { open: 118, collapsed: 74 };

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** CSS's cubic-bezier(x1, y1, x2, y2) at progress x, solved by bisection. */
function ease([x1, y1, x2, y2]: readonly [number, number, number, number], x: number) {
  if (x >= 1) return 1;
  const at = (a: number, b: number, t: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    if (at(x1, x2, t) < x) lo = t;
    else hi = t;
  }
  return at(y1, y2, (lo + hi) / 2);
}

/**
 * iOS 26 Safari's bottom toolbar, ported from the GoFundMe demo (measured from Pat's iPhone): three glass pieces 48pt
 * tall, 792pt down (Back, the address pill with the page menu, domain and reload, Tabs), 33pt from the edges with 8pt
 * between, over a progressive blur of the page. Any scroller in the page collapses it; reaching either end of the
 * page, scrolling back up, or tapping the capsule brings it back.
 */
export function SafariBar({ host }: { host: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const edge = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLSpanElement>(null);
  const reload = useRef<HTMLSpanElement>(null);
  const expand = useRef<() => void>(() => {});

  useEffect(() => {
    const el = bar.current;
    const page = el?.parentElement;
    if (!el || !page) return;
    let p = 0;
    let target = 0;
    let raf = 0;
    const apply = () => {
      const w = PILL.w + (CAPSULE.w - PILL.w) * p;
      const h = H + (CAPSULE.h - H) * p;
      const cy = H / 2 + (CAPSULE.cy - H / 2) * p;
      const pl = pill.current!.style;
      pl.left = `${PILL.cx - w / 2}px`;
      pl.width = `${w}px`;
      pl.height = `${h}px`;
      pl.top = `${cy - h / 2}px`;
      hostRef.current!.style.scale = `${1 + (HOST_COLLAPSED - 1) * p}`;
      for (const icon of [menu.current, reload.current]) if (icon) icon.style.opacity = `${1 - clamp01(p / 0.18)}`;
      for (const [node, dir] of [[back.current, 1], [tabs.current, -1]] as const) {
        if (!node) continue;
        node.style.transform = `translate(${dir * 48 * p}px, ${cy - H / 2}px) scale(${1 - 0.3 * p})`;
        node.style.opacity = `${1 - clamp01(p / 0.7)}`;
      }
      // Slid down rather than resized, so the stacked blurs only move.
      edge.current!.style.transform = `translateY(${(EDGE.open - EDGE.collapsed) * p}px)`;
      el.dataset.collapsed = p > 0.5 ? '1' : '0';
    };
    const animate = (to: 0 | 1) => {
      if (to === target) return;
      target = to;
      cancelAnimationFrame(raf);
      const from = p;
      const curve = to === 1 ? COLLAPSE : EXPAND;
      const t0 = performance.now();
      const step = (now: number) => {
        const k = ease(curve, (now - t0) / DURATION);
        p = from + (to - from) * k;
        apply();
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    expand.current = () => animate(0);
    apply();

    // Scroll events don't bubble, but a capturing listener on the page hears whichever scroller moved.
    const last = new WeakMap<EventTarget, number>();
    let down = 0;
    let up = 0;
    const onScroll = (e: Event) => {
      const sc = e.target;
      if (!(sc instanceof HTMLElement)) return;
      const top = sc.scrollTop;
      const max = sc.scrollHeight - sc.clientHeight;
      // A scroller seen for the first time started at its top.
      const d = top - (last.get(sc) ?? 0);
      last.set(sc, top);
      if (d > 0) {
        down += d;
        up = 0;
      } else if (d < 0) {
        up -= d;
        down = 0;
      }
      if (top <= 0 || top >= max - 1) animate(0);
      else if (down > COLLAPSE_AFTER) animate(1);
      else if (up > EXPAND_AFTER) animate(0);
    };
    page.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      page.removeEventListener('scroll', onScroll, { capture: true });
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={edge} className={styles.edge} aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div ref={bar} className={styles.bar} aria-hidden data-collapsed="0">
        <Piece refEl={back} label="Back" size={48} className={styles.back}>
          <Glyph name="chevron.left" size={21} />
        </Piece>
        <Piece refEl={pill} label="Address" size={222} className={styles.pill} onClick={() => expand.current()}>
          <span ref={menu} className={styles.menu}>
            <PageMenu />
          </span>
          <span ref={hostRef} className={styles.host}>
            {host}
          </span>
          <span ref={reload} className={styles.reload}>
            <Glyph name="arrow.clockwise" size={17} />
          </span>
        </Piece>
        <Piece refEl={tabs} label="Tabs" size={48} className={styles.tabs}>
          <Glyph name="square.on.square" size={20} />
        </Piece>
      </div>
    </>
  );
}
