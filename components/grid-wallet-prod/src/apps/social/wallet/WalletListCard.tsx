'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
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

  const cardClip = useSquircleClip({ figmaRadii: 10 });

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
      className={clsx(
        styles.cardWrap,
        concentricBottom && styles.cardWrapInsetBottom,
        grow && styles.cardWrapGrow,
      )}
    >
      <div
        ref={cardClip.ref}
        style={cardClip.style}
        className={clsx(styles.card, grow && styles.cardGrow)}
      >
        {/* popLayout pops the exiting empty state out of flow, so the first row
            grows in from the top of the card while the skeleton/message dissolve
            out underneath it instead of hard-swapping. NO initial={false} here:
            its presence context would suppress the `initial` of every row that
            mounts later inside this subtree — killing the insert animation on
            the second and subsequent tap-to-pays. */}
        <AnimatePresence mode="popLayout">
        {hasItems ? (
          <div key="items" className={styles.items}>
            {(items ?? []).map((item, i) => {
              const fresh = freshIds.current.has(item.id);
              return (
                <motion.div
                  key={item.id}
                  style={fresh ? { overflow: 'hidden' } : undefined}
                  initial={reduceMotion ? false : fresh ? INSERT_HIDDEN : ITEM_HIDDEN}
                  animate={fresh ? INSERT_VISIBLE : ITEM_VISIBLE}
                  transition={
                    fresh
                      ? motionTransition(undefined, INSERT_DURATION_S)
                      : motionTransition(undefined, 0.4, { delay: i * ITEM_STAGGER_S })
                  }
                >
                  {fresh ? (
                    // Slide the row down into the slot as it opens.
                    <motion.div
                      initial={reduceMotion ? false : { y: -ROW_H }}
                      animate={{ y: 0 }}
                      transition={motionTransition(undefined, INSERT_DURATION_S)}
                    >
                      <WalletListItem {...item} time={relativeTime(item.timestamp, now)} />
                    </motion.div>
                  ) : (
                    <WalletListItem {...item} time={relativeTime(item.timestamp, now)} />
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            key="empty"
            className={styles.cardInner}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)' }
            }
            transition={motionTransition(undefined, 0.35)}
          >
            <div className={styles.skeletonLayer}>
              <div className={styles.list} aria-hidden>
                <SkeletonRow round={roundGraphic} />
                <SkeletonRow round={roundGraphic} />
                <div
                  className={clsx(
                    styles.gradientMask,
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

// Matches the flat contact list row: 40px round graphic + a title/sub pill pair,
// no divider, no trailing amount (the picker rows aren't transactions).
function SkeletonRow({ round }: { round?: boolean }) {
  return (
    <div className={styles.row}>
      <div className={clsx(styles.rowGraphic, round && styles.rowGraphicRound)} />
      <div className={styles.rowContent}>
        <div className={styles.rowLabels}>
          <SkeletonPill width="143.25px" />
          <SkeletonPill width="92px" />
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
