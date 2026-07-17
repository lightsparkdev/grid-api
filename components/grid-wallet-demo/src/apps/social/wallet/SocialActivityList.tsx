'use client';

import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { IconHotDrinkCup } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconHotDrinkCup';
import { IconCheeseburger } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCheeseburger';
import { IconStore1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconStore1';
import { IconCup } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCup';
import { IconFashion } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconFashion';
import { IconShoppingBag1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconShoppingBag1';
import { IconTag } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconTag';
import { IconSofa } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconSofa';
import { IconDeskLamp } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconDeskLamp';
import { IconBasket1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBasket1';
import { useNow } from '@/hooks/useNow';
import { motionTransition } from '@/lib/easing';
import { relativeTime } from '@/lib/relativeTime';
import type { MerchantCategory, WalletListItemData } from '@/apps/shared/wallet';
import { Flag } from '@/apps/shared/Flag';
import { IconArrowInbox } from '../icons';
import { SOCIAL_MONEY } from '../config';
import styles from './SocialActivityList.module.scss';

// Tap-to-pay merchant glyphs (the brain supplies only `category`) — Z's icon
// variant (radius-2, stroke-2).
const MERCHANT_ICONS: Record<MerchantCategory, typeof IconHotDrinkCup> = {
  coffee: IconHotDrinkCup,
  'fast-food': IconCheeseburger,
  convenience: IconStore1,
  cafe: IconCup,
  fashion: IconFashion,
  apparel: IconShoppingBag1,
  accessories: IconTag,
  furniture: IconSofa,
  homeware: IconDeskLamp,
  grocery: IconBasket1,
};

// Skeleton hold → gradient cover fades in → the empty message + CTA reveal
// (same beat structure as Aurora/Glitch's WalletListCard).
const INITIAL_DELAY_S = 1.2;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;

const MSG_HIDDEN = { opacity: 0, y: 24, filter: 'blur(10px)' };
const MSG_SHOWN = { opacity: 1, y: 0, filter: 'blur(0px)' };

// Mount rows blur/slide in (staggered); rows inserted later (a finished transfer)
// grow from zero height, pushing the list down as the content slides into the slot.
const ITEM_HIDDEN = { opacity: 0, y: -12, filter: 'blur(6px)' };
const ITEM_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };
const ITEM_STAGGER_S = 0.06;
const ROW_H = 62; // py10 (20) + two 21px lines (42)
const INSERT_HIDDEN = { height: 0, opacity: 0, filter: 'blur(8px)' };
const INSERT_VISIBLE = { height: ROW_H, opacity: 1, filter: 'blur(0px)' };
const INSERT_DURATION_S = 0.5;

/** Z transactions (Figma 2548:21380) — flat list on the page: a "Transactions"
 *  header, then either real rows or the skeleton→empty reveal (2 skeleton rows
 *  under a gradient cover, with the empty message + "Add money" CTA revealing on
 *  top). Same loading choreography as Aurora/Glitch, restyled flat for Z. */
export function SocialActivityList({
  items,
  onAddMoney,
  emptyTitle = 'No transactions yet',
  emptySub,
  hideCta = false,
}: {
  items: WalletListItemData[];
  onAddMoney?: () => void;
  /** Empty-state copy overrides (defaults are the wallet-home wording). */
  emptyTitle?: string;
  emptySub?: ReactNode;
  /** Drop the "Add money" CTA (e.g. the card home's card-only list). */
  hideCta?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const now = useNow();
  const hasItems = items.length > 0;

  // Mount rows vs later inserts: mount rows stagger-reveal, inserts height-grow.
  const seenIds = useRef<Set<string> | null>(null);
  const freshIds = useRef(new Set<string>());
  if (seenIds.current === null) {
    seenIds.current = new Set(items.map((it) => it.id));
  } else {
    for (const it of items) {
      if (!seenIds.current.has(it.id)) {
        seenIds.current.add(it.id);
        freshIds.current.add(it.id);
      }
    }
  }

  const [coverVisible, setCoverVisible] = useState(reduceMotion === true);
  const [contentVisible, setContentVisible] = useState(reduceMotion === true);
  useEffect(() => {
    if (reduceMotion || hasItems) return;
    const cover = window.setTimeout(() => setCoverVisible(true), INITIAL_DELAY_S * 1000);
    const content = window.setTimeout(
      () => setContentVisible(true),
      (INITIAL_DELAY_S + CONTENT_STAGGER_S) * 1000,
    );
    return () => {
      window.clearTimeout(cover);
      window.clearTimeout(content);
    };
  }, [reduceMotion, hasItems]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>Transactions</h2>
      </header>

      <div className={styles.list}>
        <AnimatePresence mode="popLayout">
          {hasItems ? (
            <div key="items" className={styles.items}>
              {items.map((item, i) => {
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
                      <motion.div
                        initial={reduceMotion ? false : { y: -ROW_H }}
                        animate={{ y: 0 }}
                        transition={motionTransition(undefined, INSERT_DURATION_S)}
                      >
                        <Row item={item} time={relativeTime(item.timestamp, now)} />
                      </motion.div>
                    ) : (
                      <Row item={item} time={relativeTime(item.timestamp, now)} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              key="empty"
              className={styles.emptyWrap}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)' }}
              transition={motionTransition(undefined, 0.35)}
            >
              <div className={styles.skeletonLayer} aria-hidden>
                <SkeletonRow />
                <SkeletonRow />
                <div
                  className={clsx(
                    styles.gradientMask,
                    (coverVisible || reduceMotion === true) && styles.gradientMaskVisible,
                  )}
                  style={{ ['--cover-duration' as string]: `${REVEAL_DURATION_S}s` }}
                />
              </div>

              <div className={styles.messageLayer}>
                <motion.div
                  className={styles.message}
                  initial={reduceMotion ? false : MSG_HIDDEN}
                  animate={contentVisible ? MSG_SHOWN : MSG_HIDDEN}
                  transition={motionTransition(undefined, REVEAL_DURATION_S)}
                >
                  <div className={styles.emptyText}>
                    <p className={styles.emptyTitle}>{emptyTitle}</p>
                    <p className={styles.emptySub}>
                      {emptySub ?? (
                        <>
                          Deposit to your {SOCIAL_MONEY.cardLabel.split(' ')[0]} account
                          <br />
                          to get started
                        </>
                      )}
                    </p>
                  </div>
                  {!hideCta && (
                    <button type="button" className={styles.addCta} onClick={onAddMoney}>
                      Add money
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Row({ item, time }: { item: WalletListItemData; time: string }) {
  const positive = item.amount.includes('+');
  const MerchantIcon = item.category ? MERCHANT_ICONS[item.category] : null;
  return (
    <div className={styles.row}>
      <span className={clsx(styles.graphic, item.avatar && styles.graphicAvatar)} aria-hidden>
        {item.avatar ? (
          <>
            <span className={styles.avatarInitials}>{item.avatar.initials}</span>
            <span className={styles.avatarFlag}>
              <Flag code={item.avatar.code} size={16} />
            </span>
          </>
        ) : item.image ? (
          <img className={styles.graphicImage} src={item.image} alt="" draggable={false} />
        ) : MerchantIcon ? (
          <MerchantIcon size={20} />
        ) : (
          <IconArrowInbox size={20} />
        )}
      </span>
      <div className={styles.info}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.desc}>{item.detail}</p>
      </div>
      <div className={styles.amount}>
        <p className={clsx(styles.amountValue, positive && styles.amountPositive)}>{item.amount}</p>
        <p className={styles.timestamp}>{time}</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className={styles.row}>
      <span className={styles.graphicSkeleton} />
      <div className={styles.info}>
        <span className={styles.pill} style={{ width: 84 }} />
        <span className={styles.pill} style={{ width: 132 }} />
      </div>
      <div className={styles.amountSkeleton}>
        <span className={styles.pill} style={{ width: 48 }} />
        <span className={styles.pill} style={{ width: 64 }} />
      </div>
    </div>
  );
}
