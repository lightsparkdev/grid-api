'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ContentAreaButton } from '@/apps/shared/ContentAreaButton';
import { Flag } from '@/apps/shared/Flag';
import { relativeTime } from '@/lib/relativeTime';
import { motionTransition } from '@/lib/easing';
import type { WalletListItemData, MerchantCategory } from '@/apps/shared/wallet';
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
import { IconDoupleCheckmark1Small, IconPeople } from '../icons';
import { avatarColor } from '../avatarPalette';
import styles from './ActivityList.module.scss';

/** Merchant glyphs in the ChatsApp icon voice (radius-2, stroke-2) — the
 *  category is shared brain data; the icon style is the skin's. */
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

// Rows present at mount slide in from above (staggered)…
const ROW_IN = { opacity: 0, y: -8 };
const ROW_REST = { opacity: 1, y: 0 };
const ROW_STAGGER_S = 0.06;
// …while rows added LATER (a finished tap-to-pay / transfer) grow from zero
// height — pushing the list down — as the row content slides DOWN into the
// opening slot from above (clipped by the wrapper's overflow: hidden). Same
// insert choreography as Aurora's WalletListCard.
const ROW_H = 80; // .row height — 56px avatar + 12px vertical padding
const INSERT_HIDDEN = { height: 0, opacity: 0, filter: 'blur(8px)' };
const INSERT_VISIBLE = { height: ROW_H, opacity: 1, filter: 'blur(0px)' };
const INSERT_DURATION_S = 0.5;

/* Empty-state choreography (the Aurora WalletListCard clock): skeleton rows
   hold, a page-bg gradient cover fades them down, then the message reveals. */
const INITIAL_DELAY_S = 1.2;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;
const MESSAGE_HIDDEN = { opacity: 0, y: 24, filter: 'blur(10px)' };
const MESSAGE_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Skeleton row shaped like the REAL ChatsApp row: 56px circular avatar,
 *  title + status lines left, amount right. Pill heights sit inside the
 *  matching type line boxes (body 22 / subheadline 20). */
function SkeletonRow({ bordered }: { bordered?: boolean }) {
  return (
    <div className={styles.row}>
      <span className={clsx(styles.graphic, styles.skeletonGraphic)} aria-hidden />
      <div className={clsx(styles.content, !bordered && styles.skeletonContentBare)}>
        <div className={styles.labels}>
          <span className={clsx(styles.skeletonLineTitle, styles.skeletonLine)}>
            <span className={styles.skeletonPill} style={{ width: 96 }} />
          </span>
          <span className={clsx(styles.skeletonLineStatus, styles.skeletonLine)}>
            <span className={styles.skeletonPill} style={{ width: 140 }} />
          </span>
        </div>
        <span className={clsx(styles.skeletonLineTitle, styles.skeletonLine)}>
          <span className={styles.skeletonPill} style={{ width: 50 }} />
        </span>
      </div>
    </div>
  );
}

function ActivityRow({ item, now }: { item: WalletListItemData; now: number }) {
  const MerchantIcon = item.category ? MERCHANT_ICONS[item.category] : null;
  const received = item.amount.startsWith('+');
  // WhatsApp generic-contact tile for human recipients AND merchant charges
  // (tap-to-pay): pastel fill + deeper same-hue glyph, color hashed from the
  // name (stable per recipient/merchant). Flag/logo images keep their tile.
  const color = item.avatar || MerchantIcon ? avatarColor(item.title) : null;
  return (
    <div className={styles.row}>
      <span
        className={styles.graphic}
        style={color ? { background: color.bg, color: color.fg } : undefined}
        aria-hidden
      >
        {item.avatar ? (
          <>
            <IconPeople size={30} />
            <span className={styles.avatarFlag}>
              <Flag code={item.avatar.code} size={16} />
            </span>
          </>
        ) : item.image ? (
          <img
            className={clsx(styles.graphicImage, item.imageSquare && styles.graphicImageSquare)}
            src={item.image}
            alt=""
            draggable={false}
          />
        ) : (
          MerchantIcon && <MerchantIcon size={24} />
        )}
      </span>
      <div className={styles.content}>
        <div className={styles.labels}>
          <p className={styles.title}>{item.title}</p>
          <p className={styles.status}>
            <IconDoupleCheckmark1Small className={styles.check} size={18} />
            <span className={styles.statusText}>{relativeTime(item.timestamp, now)}</span>
          </p>
        </div>
        <p className={clsx(styles.amount, received && styles.amountReceived)}>{item.amount}</p>
      </div>
    </div>
  );
}

/** WhatsApp-style activity rows (home Figma 2640:19681): 56px round avatar,
 *  name + green delivered double-check status line, right amount (green when
 *  inbound). Full-bleed rows — hairlines run avatar-inset like iOS lists. */
export function MessagingActivityList({
  items,
  emptyTitle,
  emptySub,
  cta,
}: {
  items: WalletListItemData[];
  emptyTitle: string;
  emptySub: string;
  /** Optional empty-state CTA (wallet Activity uses "Add money"). */
  cta?: { label: string; onClick?: () => void };
}) {
  const reduceMotion = useReducedMotion();
  // Live relative times — refresh each minute (the Aurora list's clock).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const hasItems = items.length > 0;

  // Track which row ids were present at mount vs added later: mount rows get
  // the stagger reveal, later rows get the height-grow insert (the Aurora
  // WalletListCard bookkeeping — idempotent, so safe during render).
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

  // Skeleton → empty reveal (Aurora's WalletListCard interaction): the cover
  // fades the skeleton down after the hold, the message follows a beat later.
  // Reduced motion lands on the settled state immediately.
  const [coverVisible, setCoverVisible] = useState(reduceMotion === true);
  const [contentVisible, setContentVisible] = useState(reduceMotion === true);
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
    // popLayout pops the exiting empty state out of flow so the first real row
    // animates in on top while the skeleton/message dissolve out beneath it.
    <AnimatePresence mode="popLayout">
      {hasItems ? (
        <div key="items" className={styles.list}>
          {items.map((item, i) => {
            const fresh = freshIds.current.has(item.id);
            return (
              <motion.div
                key={item.id}
                style={fresh ? { overflow: 'hidden' } : undefined}
                initial={reduceMotion ? false : fresh ? INSERT_HIDDEN : ROW_IN}
                animate={fresh ? INSERT_VISIBLE : ROW_REST}
                transition={
                  fresh
                    ? motionTransition(undefined, INSERT_DURATION_S)
                    : motionTransition(undefined, 0.35, { delay: i * ROW_STAGGER_S })
                }
              >
                {fresh ? (
                  // Slide the row down into the slot as it opens.
                  <motion.div
                    initial={reduceMotion ? false : { y: -ROW_H }}
                    animate={{ y: 0 }}
                    transition={motionTransition(undefined, INSERT_DURATION_S)}
                  >
                    <ActivityRow item={item} now={now} />
                  </motion.div>
                ) : (
                  <ActivityRow item={item} now={now} />
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          key="empty"
          className={styles.empty}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)' }}
          transition={motionTransition(undefined, 0.35)}
        >
          <div className={styles.skeletonLayer} aria-hidden>
            <SkeletonRow bordered />
            <SkeletonRow />
            <div
              className={clsx(
                styles.skeletonCover,
                (coverVisible || reduceMotion === true) && styles.skeletonCoverVisible,
              )}
              style={{ ['--cover-duration' as string]: `${REVEAL_DURATION_S}s` }}
            />
          </div>

          <div className={styles.messageLayer}>
            <motion.div
              className={styles.message}
              initial={reduceMotion ? false : MESSAGE_HIDDEN}
              animate={contentVisible ? MESSAGE_VISIBLE : MESSAGE_HIDDEN}
              transition={motionTransition(undefined, REVEAL_DURATION_S)}
            >
              <div className={styles.messageText}>
                <p className={styles.emptyTitle}>{emptyTitle}</p>
                <p className={styles.emptySub}>{emptySub}</p>
              </div>
              {cta && (
                <ContentAreaButton
                  className={styles.emptyCta}
                  type="button"
                  variant="filled"
                  onClick={cta.onClick}
                >
                  {cta.label}
                </ContentAreaButton>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
