'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { readCssVarPx } from '@/apps/shared/figmaSquircleRadius';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { useNow } from '@/hooks/useNow';
import { motionTransition } from '@/lib/easing';
import { relativeTime } from '@/lib/relativeTime';
import { WalletListItem, type WalletListItemData } from './WalletListItem';
import styles from './WalletListCard.module.scss';

// Hold the loading skeleton this long before the empty-state reveal (cover fades
// the skeleton out, then the "Nothing here, yet" group animates in).
const INITIAL_DELAY_S = 1.2;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;

const hiddenMessage = { opacity: 0, y: 24, filter: 'blur(10px)' };
const visibleMessage = { opacity: 1, y: 0, filter: 'blur(0px)' };

// Rows present at mount blur/slide in from above (staggered)…
const ITEM_HIDDEN = { opacity: 0, y: -12, filter: 'blur(6px)' };
const ITEM_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const ITEM_STAGGER_S = 0.06;
// …while rows added LATER (a finished tap-to-pay) grow from zero height — pushing
// the list down — as the row content slides DOWN into the opening slot from
// above (clipped by the wrapper's overflow: hidden).
const ROW_H = 80; // Figma row height — .row in WalletListItem.module.scss
const INSERT_HIDDEN = { height: 0, opacity: 0, filter: 'blur(8px)' };
const INSERT_VISIBLE = { height: ROW_H, opacity: 1, filter: 'blur(0px)' };
const INSERT_DURATION_S = 0.5;

interface WalletListCardProps {
  emptyTitle: string;
  emptySub: ReactNode;
  /** Optional CTA inside the empty message (e.g. "Add money"). */
  cta?: ReactNode;
  /** Hug the phone bezel with concentric bottom corners (wallet home activity). */
  concentricBottom?: boolean;
  /** Real rows to render; falls back to the skeleton + empty state when absent. */
  items?: WalletListItemData[];
  /** Grow with content (so a scrolling parent scrolls) instead of fill + clip. */
  grow?: boolean;
  /** Round (vs squircle) skeleton avatar placeholder — the send recipient list. */
  roundGraphic?: boolean;
  /** Each row is its own filled card (10px squircle, 4px gap) instead of one
   *  shared elevated container. Empty state collapses to a simple centered line. */
  itemCards?: boolean;
}

/** One activity row, optionally wrapped as its own squircle card (itemCards). Its
 *  own component so each card can own a `useSquircleClip` (hooks can't run in a
 *  map). Mount rows stagger-reveal; later rows grow-in (clipped by overflow). */
function ListRow({
  item,
  index,
  fresh,
  itemCards,
  reduceMotion,
  now,
}: {
  item: WalletListItemData;
  index: number;
  fresh: boolean;
  itemCards: boolean;
  reduceMotion: boolean | null;
  now: number;
}) {
  // 10px Figma corner (×1.2 superellipse), cross-browser via clip-path. The hook
  // is a no-op for Aurora rows (ref never attached).
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: 10 });
  const row = (
    <WalletListItem {...item} time={relativeTime(item.timestamp, now)} itemCard={itemCards} />
  );
  const style = itemCards
    ? { ...clip.style, ...(fresh ? { overflow: 'hidden' as const } : null) }
    : fresh
      ? { overflow: 'hidden' as const }
      : undefined;
  return (
    <motion.div
      ref={itemCards ? clip.ref : undefined}
      className={itemCards ? styles.itemCard : undefined}
      style={style}
      initial={reduceMotion ? false : fresh ? INSERT_HIDDEN : ITEM_HIDDEN}
      animate={fresh ? INSERT_VISIBLE : ITEM_VISIBLE}
      transition={
        fresh
          ? motionTransition(undefined, INSERT_DURATION_S)
          : motionTransition(undefined, 0.4, { delay: index * ITEM_STAGGER_S })
      }
    >
      {fresh ? (
        // Slide the row down into the slot as it opens.
        <motion.div
          initial={reduceMotion ? false : { y: -ROW_H }}
          animate={{ y: 0 }}
          transition={motionTransition(undefined, INSERT_DURATION_S)}
        >
          {row}
        </motion.div>
      ) : (
        row
      )}
    </motion.div>
  );
}

/**
 * Elevated card with skeleton rows under a gradient cover and a centered empty
 * message that reveals in. Shared by the wallet "Activity" and card-home
 * "Transactions" sections (Figma 84:12456 / 2143:40930).
 */
export function WalletListCard({
  emptyTitle,
  emptySub,
  cta,
  concentricBottom = false,
  items,
  grow = false,
  roundGraphic = false,
  itemCards = false,
}: WalletListCardProps) {
  const reduceMotion = useReducedMotion();
  const hasItems = !!items && items.length > 0;
  // Live "Just now" → "1m ago" → … labels; re-sampled every 30s.
  const now = useNow();

  // Track which row ids were present at mount vs added later: mount rows get the
  // stagger reveal, later rows get the height-grow insert. Ref bookkeeping is
  // idempotent, so doing it during render is safe.
  const seenIds = useRef<Set<string> | null>(null);
  const freshIds = useRef(new Set<string>());
  if (seenIds.current === null) {
    seenIds.current = new Set((items ?? []).map((it) => it.id));
  } else {
    for (const it of items ?? []) {
      if (!seenIds.current.has(it.id)) {
        seenIds.current.add(it.id);
        freshIds.current.add(it.id);
      }
    }
  }
  const [coverVisible, setCoverVisible] = useState(reduceMotion === true);
  const [contentVisible, setContentVisible] = useState(reduceMotion === true);

  const revealTransition = motionTransition(undefined, REVEAL_DURATION_S);

  // Bottom corners hug the phone screen (same math as BottomSheet) when concentric.
  const [cornerRadii, setCornerRadii] = useState<
    [number, number, number, number] | undefined
  >();
  const roRef = useRef<ResizeObserver | null>(null);
  const wrapRef = useCallback(
    (el: HTMLElement | null) => {
      roRef.current?.disconnect();
      if (!el || !concentricBottom) return;
      const measure = () => {
        const cs = getComputedStyle(el);
        const screenRaw = cs.getPropertyValue('--screen-corner-radius').trim();
        const screenR = screenRaw ? Number.parseFloat(screenRaw) : Number.NaN;
        const topR = readCssVarPx(el, '--corner-radius-wallet-card-squircle');
        const inset = Number.parseFloat(cs.paddingLeft.trim());
        if (Number.isFinite(screenR) && Number.isFinite(topR) && Number.isFinite(inset)) {
          const bottom = Math.max(0, screenR - inset);
          setCornerRadii([topR, topR, bottom, bottom]);
        } else {
          setCornerRadii(undefined);
        }
      };
      measure();
      roRef.current = new ResizeObserver(measure);
      roRef.current.observe(el);
    },
    [concentricBottom],
  );

  const cardClip = useSquircleClip({ cornerRadii });

  useEffect(() => {
    if (reduceMotion || hasItems) return;
    const coverTimer = window.setTimeout(
      () => setCoverVisible(true),
      INITIAL_DELAY_S * 1000,
    );
    const contentTimer = window.setTimeout(
      () => setContentVisible(true),
      (INITIAL_DELAY_S + CONTENT_STAGGER_S) * 1000,
    );
    return () => {
      window.clearTimeout(coverTimer);
      window.clearTimeout(contentTimer);
    };
  }, [reduceMotion, hasItems]);

  return (
    <div
      ref={wrapRef}
      className={clsx(
        styles.cardWrap,
        concentricBottom && styles.cardWrapInsetBottom,
        grow && styles.cardWrapGrow,
      )}
    >
      <div
        // Per-item mode: the container is transparent and the rows (real or
        // skeleton) carry the fill/shape — so no shared card clip.
        ref={itemCards ? undefined : cardClip.ref}
        style={itemCards ? undefined : cardClip.style}
        className={clsx(styles.card, grow && styles.cardGrow, itemCards && styles.cardItems)}
      >
        {/* popLayout pops the exiting empty state out of flow, so the first row
            grows in from the top of the card while the skeleton/message dissolve
            out underneath it instead of hard-swapping. NO initial={false} here:
            its presence context would suppress the `initial` of every row that
            mounts later inside this subtree — killing the insert animation on
            the second and subsequent tap-to-pays. */}
        <AnimatePresence mode="popLayout">
        {hasItems ? (
          <div key="items" className={clsx(styles.items, itemCards && styles.itemsGap)}>
            {(items ?? []).map((item, i) => (
              <ListRow
                key={item.id}
                item={item}
                index={i}
                fresh={freshIds.current.has(item.id)}
                itemCards={itemCards}
                reduceMotion={reduceMotion}
                now={now}
              />
            ))}
          </div>
        ) : (
          <motion.div
            key="empty"
            className={clsx(styles.cardInner, itemCards && styles.cardInnerItemCards)}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)' }
            }
            transition={motionTransition(undefined, 0.35)}
          >
            <div className={styles.skeletonLayer}>
              <div className={clsx(styles.list, itemCards && styles.listItemCards)} aria-hidden>
                <SkeletonRow bordered={!itemCards} round={roundGraphic} itemCard={itemCards} />
                <SkeletonRow round={roundGraphic} itemCard={itemCards} />
                <div
                  className={clsx(
                    styles.gradientMask,
                    itemCards && styles.gradientMaskItemCards,
                    (coverVisible || reduceMotion === true) && styles.gradientMaskVisible,
                  )}
                  style={{ ['--cover-duration' as string]: `${REVEAL_DURATION_S}s` }}
                  aria-hidden
                />
              </div>
            </div>

            <div className={styles.messageLayer}>
              <motion.div
                className={styles.message}
                initial={reduceMotion ? false : hiddenMessage}
                animate={contentVisible ? visibleMessage : hiddenMessage}
                transition={revealTransition}
              >
                <div className={styles.emptyText}>
                  <p className={styles.emptyTitle}>{emptyTitle}</p>
                  <p className={styles.emptySub}>{emptySub}</p>
                </div>
                {cta}
              </motion.div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SkeletonRow({
  bordered,
  round,
  itemCard,
}: {
  bordered?: boolean;
  round?: boolean;
  itemCard?: boolean;
}) {
  return (
    <div className={clsx(styles.row, itemCard && styles.rowSkeletonCard)}>
      <div className={clsx(styles.rowGraphic, round && styles.rowGraphicRound)} />
      <div className={bordered ? styles.rowContentBordered : styles.rowContent}>
        <div className={styles.rowInner}>
          <div className={styles.rowLabels}>
            <SkeletonPill width="72.215px" />
            <SkeletonPill width="143.25px" />
            <SkeletonPill width="108.723px" />
          </div>
          <div className={styles.rowAmount}>
            <SkeletonPill width="50px" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonPill({ width }: { width: string }) {
  return (
    <div className={styles.skeletonLine}>
      <span className={styles.skeletonPill} style={{ width }} />
    </div>
  );
}
