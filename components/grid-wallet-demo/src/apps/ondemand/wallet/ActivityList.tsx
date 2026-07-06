'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconHotDrinkCup } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconHotDrinkCup';
import { IconCheeseburger } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCheeseburger';
import { IconStore1 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconStore1';
import { IconCup } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCup';
import { IconFashion } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconFashion';
import { IconShoppingBag1 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconShoppingBag1';
import { IconTag } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconTag';
import { IconSofa } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconSofa';
import { IconDeskLamp } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconDeskLamp';
import { IconBasket1 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconBasket1';
import type { MerchantCategory, WalletListItemData } from '@/apps/shared/wallet';
import { useNow } from '@/hooks/useNow';
import { relativeTime } from '@/lib/relativeTime';
import { motionTransition } from '@/lib/easing';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { DarkCta } from '../blocks/DarkCta';
import { CircleLogo } from '../blocks/PlainMarks';
import { IconBank, IconCash } from '../icons';
import styles from './ActivityList.module.scss';

// Same reveal clock as the Select bank empty state (the Z/Aurora choreography):
// skeleton rows hold, a cover fades them down, the message blurs/slides in.
const INITIAL_DELAY_S = 1.2;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;
const MESSAGE_HIDDEN = { opacity: 0, y: 24, filter: 'blur(10px)' };
const MESSAGE_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Tap-to-pay merchant icons — the ondemand voice (radius-0, stroke-2 sharp).
 *  The brain supplies only the `category`; the icon style is the skin's. */
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

/** The leading graphic (Figma 2636:17854): a 56px grey r8 square holding one
 *  simple 24px mark — a bare 2px-stroke glyph, plain initials, or a small
 *  logo. Deliberately unadorned (no sticker rings, no flag tiles) so the
 *  treatment is easy to swap later. */
function RowGraphic({ item }: { item: WalletListItemData }) {
  const clip = useSquircleClip<HTMLSpanElement>({ figmaRadii: 8 });
  let mark: React.ReactNode;
  if (item.avatar) {
    mark = <span className={styles.graphicInitials}>{item.avatar.initials}</span>;
  } else if (item.category) {
    const Icon = MERCHANT_ICONS[item.category];
    mark = <Icon size={24} />;
  } else if (item.imageSquare && item.image) {
    // Crypto — the coin logo as a plain circle on the grey square (the logo
    // SVGs carry a baked-in brand background; the circle clip owns it).
    mark = <CircleLogo src={item.image} size={28} />;
  } else if (item.image) {
    // Your own bank moving the balance — the bank glyph, not a flag tile.
    mark = <IconBank size={24} />;
  } else {
    mark = <IconCash size={24} />;
  }
  return (
    <span ref={clip.ref} style={clip.style} className={styles.graphic} aria-hidden>
      {mark}
    </span>
  );
}

/**
 * Live Activity list for the ondemand wallet home — the Figma row anatomy
 * (56px grey graphic square + stacked labels + right-aligned amount, 0.5px
 * bottom hairline on the content only) fed by the shared wallet brain's
 * activity. Empty state reserves four rows of height: skeletons hold, then
 * reveal into the "No activity yet" message. New rows fade in at the top
 * while the rest layout-shift down.
 */
export function OndemandActivityList({
  items,
  frozen = false,
  onDeposit,
  emptyTitle = 'No activity yet',
  emptySub = 'Money you add, send, and receive will show up here',
}: {
  items: WalletListItemData[];
  /** Hold the skeletons forever (no reveal) — for the zeroed auth backdrop,
   *  so the sign-in crossfade lands on pixel-identical content and the reveal
   *  beat plays on the LIVE home after landing. */
  frozen?: boolean;
  /** Empty-state CTA — opens the deposit flow. */
  onDeposit?: () => void;
  emptyTitle?: string;
  emptySub?: string;
}) {
  const reduceMotion = useReducedMotion();
  const now = useNow();

  const [coverVisible, setCoverVisible] = useState(!frozen && reduceMotion);
  const [contentVisible, setContentVisible] = useState(!frozen && reduceMotion);
  useEffect(() => {
    if (frozen || reduceMotion || items.length > 0) return;
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
  }, [frozen, reduceMotion, items.length]);

  if (items.length === 0) {
    return (
      <div className={`${styles.list} ${styles.listEmpty}`}>
        <div className={styles.skeletons} aria-hidden>
          {/* Mirrors the real row anatomy: graphic square + lines + amount. */}
          {[
            [112, 150, 88],
            [88, 128, 72],
            [128, 96, 104],
            [96, 140, 80],
          ].map(([title, sub, sub2], i) => (
            <div key={i} className={styles.skeletonRow}>
              <span className={styles.skeletonTile} />
              <span className={styles.content}>
                <span className={styles.skeletonLines}>
                  <span className={styles.skeletonPill} style={{ width: title, height: 12 }} />
                  <span className={styles.skeletonPill} style={{ width: sub, height: 10 }} />
                  <span className={styles.skeletonPill} style={{ width: sub2, height: 10 }} />
                </span>
                <span className={styles.skeletonRight}>
                  <span className={styles.skeletonPill} style={{ width: 56, height: 12 }} />
                </span>
              </span>
            </div>
          ))}
          <div
            className={styles.skeletonCover}
            data-visible={coverVisible || undefined}
            style={{ ['--cover-duration' as string]: `${REVEAL_DURATION_S}s` }}
          />
        </div>
        <div className={styles.emptyLayer}>
          <motion.div
            className={styles.emptyMessage}
            initial={reduceMotion ? false : MESSAGE_HIDDEN}
            animate={contentVisible ? MESSAGE_VISIBLE : MESSAGE_HIDDEN}
            transition={motionTransition(undefined, REVEAL_DURATION_S)}
          >
            <div className={styles.emptyText}>
              <p className={styles.emptyTitle}>{emptyTitle}</p>
              <p className={styles.emptySub}>{emptySub}</p>
            </div>
            {onDeposit && <DarkCta onClick={onDeposit}>Add money</DarkCta>}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout={reduceMotion ? false : 'position'}
            className={styles.row}
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTransition(undefined, 0.45)}
          >
            <RowGraphic item={item} />
            <div className={styles.content}>
              <div className={styles.lines}>
                <span className={styles.lineTitle}>{item.title}</span>
                <span className={styles.lineMeta}>{item.detail}</span>
                <span className={styles.lineMeta}>{relativeTime(item.timestamp, now)}</span>
              </div>
              <span className={styles.amount}>{item.amount}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
