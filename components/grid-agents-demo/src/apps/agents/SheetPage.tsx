import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { IconCrossSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossSmall';
import { GlassPill, PressButton } from './glass';
import { AppSheet } from './sheet';
import styles from './SheetPage.module.scss';

/** iOS's page sheet present (Muse, Grok and Claude rise alike): ~450ms, a long settle. */
export const PAGE_SHEET_IN: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] };
const PUSH: Transition = { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] };
/** Pushes like iOS navigation: forward slides in from the right over a parallaxed page, back from the left. */
const SLIDE = {
  enter: (back: boolean) => ({ x: back ? '-30%' : '100%', opacity: back ? 0 : 1 }),
  center: { x: 0, opacity: 1 },
  exit: (back: boolean) => ({ x: back ? '100%' : '-30%', opacity: back ? 1 : 0 }),
};

/**
 * The page sheet the apps open their settings in (IMG_1907, IMG_1922, IMG_1930): 62pt from the screen's top,
 * 38pt top corners, the screen's own curve at the foot. `className` themes it (the --sp-* variables).
 */
export function PageSheet({
  open,
  onDismiss,
  present = PAGE_SHEET_IN,
  className,
  children,
}: {
  open: boolean;
  onDismiss: () => void;
  present?: Transition;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AppSheet open={open} present={present} dim={0.25} className={styles.panel} onDismiss={onDismiss}>
      <div className={`${styles.surface} ${className ?? ''}`}>{children}</div>
    </AppSheet>
  );
}

/** One step of a sheet at a time, pushed and popped. */
export function SheetSteps({ step, back, children }: { step: string; back: boolean; children: ReactNode }) {
  return (
    <div className={styles.steps}>
      <AnimatePresence initial={false} custom={back}>
        <motion.div key={step} className={styles.step} custom={back} variants={SLIDE} initial="enter" animate="center" exit="exit" transition={PUSH}>
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export interface SheetSearch {
  /** Muse pins it under the bar; Dots, Grok and Claude float it in glass at the foot. */
  at: 'top' | 'bottom';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** A 44pt glass disc in a sheet's bar: close, back, or a control that goes nowhere. */
export function SheetDisc({ label, onClick, disabled, children }: { label: string; onClick?: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <PressButton label={label} onClick={onClick} disabled={disabled} className={styles.disc}>
      <GlassPill radius={22} className={styles.discGlass}>
        <span className={styles.discInner}>{children}</span>
      </GlassPill>
    </PressButton>
  );
}

function SearchField({ search, className }: { search: SheetSearch; className: string }) {
  return (
    <label className={className}>
      <IconMagnifyingGlass size={18} className={styles.searchIcon} />
      <input
        className={styles.searchInput}
        value={search.value}
        placeholder={search.placeholder}
        onChange={(e) => search.onChange(e.target.value)}
      />
      {search.value && (
        <button type="button" className={styles.clear} aria-label="Clear" onClick={() => search.onChange('')}>
          <IconCrossSmall size={14} />
        </button>
      )}
    </label>
  );
}

/**
 * A page inside an app's sheet, with iOS's navigation bar: glass discs at either end and the title between.
 * - `large` (Muse's Settings, recording 21-06): a 34pt title opens the page and scrolls with it; once it has
 *   passed under the bar, the 17pt title fades in at the bar's center.
 * - Otherwise the title sits in the bar from the start (Dots, Grok, Claude).
 * Content scrolls under the bar through a progressive blur over a wash of the page's color, which appears once
 * anything is underneath. Every color comes from the host's --sp-* variables.
 */
export function SheetPage({
  title,
  large: largeTitle,
  heading: hero,
  leading,
  trailing,
  search,
  footer,
  className,
  children,
}: {
  title: string;
  large?: boolean;
  /** A page's own header in place of the large title (Muse's Wallet: a tile, a centered title, a line); it hands
   *  the title to the bar the same way once it scrolls under. */
  heading?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  search?: SheetSearch;
  /** Pinned at the foot over a blur of the page: the primary button. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const large = largeTitle || !!hero;
  const scroller = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [under, setUnder] = useState(false);
  const [titled, setTitled] = useState(!large);
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setUnder(el.scrollTop > 1);
    const h = heading.current;
    // The scroller is the heading's offset parent; the bar covers its top.
    if (large && h) setTitled(el.scrollTop > h.offsetTop + h.offsetHeight - (bar.current?.offsetHeight ?? 0) - 6);
  };
  const floating = search?.at === 'bottom';
  return (
    <div className={`${styles.page} ${className ?? ''}`} data-large={large || undefined} data-floating={floating || footer ? true : undefined}>
      <div ref={scroller} className={styles.scroll} onScroll={onScroll}>
        {hero ? (
          <div ref={heading}>{hero}</div>
        ) : (
          large && (
            <div ref={heading}>
              <h1 className={styles.large}>{title}</h1>
            </div>
          )
        )}
        {search?.at === 'top' && (
          <div className={styles.pinned}>
            <SearchField search={search} className={styles.searchTop} />
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
      <div className={styles.edge} data-shown={under || undefined} aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div ref={bar} className={styles.bar}>
        <span className={styles.end}>{leading}</span>
        <strong className={styles.title} data-shown={titled || undefined}>
          {title}
        </strong>
        <span className={`${styles.end} ${styles.trailing}`}>{trailing}</span>
      </div>
      {(floating || footer) && (
        <div className={styles.footEdge} aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      {floating && (
        <GlassPill radius={24} absolute className={styles.searchGlass}>
          <SearchField search={search} className={styles.searchBottom} />
        </GlassPill>
      )}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
