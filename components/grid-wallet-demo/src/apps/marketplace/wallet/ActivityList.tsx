'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { WalletListItemData } from '@/apps/shared/wallet';
import { useNow } from '@/hooks/useNow';
import { relativeTime } from '@/lib/relativeTime';
import { motionTransition } from '@/lib/easing';
import { CircleDollarIcon } from '../blocks/CircleDollarIcon';
import { FlagTile, StickerTile } from '../blocks/FlagTile';
import { NetworkTile } from '../blocks/NetworkTile';
import styles from './ActivityList.module.scss';

// Same reveal clock as the Select bank empty state (the Z/Aurora choreography):
// skeleton rows hold, a cover fades them down, the message blurs/slides in.
const INITIAL_DELAY_S = 1.2;
const REVEAL_DURATION_S = 0.55;
const CONTENT_STAGGER_S = 0.2;
const MESSAGE_HIDDEN = { opacity: 0, y: 24, filter: 'blur(10px)' };
const MESSAGE_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Activity graphics run larger than the list stickers (the stay-thumb scale). */
const TILE_SIZE = 56;

/** Soft "graphic" avatar tints (the Airbnb beige-circle voice) — a small
 *  palette picked deterministically per person so a counterparty keeps their
 *  color across rows. */
const AVATAR_TINTS: Array<{ bg: string; fg: string }> = [
  { bg: '#EFE7DC', fg: '#8A6A4C' }, // beige
  { bg: '#E4EBE3', fg: '#5F7A5F' }, // sage
  { bg: '#E9E4F0', fg: '#6F5E8C' }, // lilac
  { bg: '#F0E4E2', fg: '#8C5E56' }, // clay
  { bg: '#E2EAEF', fg: '#547182' }, // slate
];

function tintFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

/** The row graphic — the app's STICKER chrome (the country-list flag tile),
 *  one shape + one circular badge (the Airbnb collage voice, single badge):
 *  person → tinted initials sticker with the country flag riding bottom-right;
 *  your own bank (deposit/withdraw) → the flag sticker itself; crypto → the
 *  network's brand tile; the balance-only edge case → the pink cash sticker. */
function RowAvatar({ item }: { item: WalletListItemData }) {
  if (item.avatar) {
    const tint = tintFor(item.avatar.initials);
    return (
      <span className={styles.avatarWrap} aria-hidden>
        <StickerTile size={TILE_SIZE}>
          <span
            className={styles.initialsArt}
            style={{ background: tint.bg, color: tint.fg }}
          >
            {item.avatar.initials}
          </span>
        </StickerTile>
        {/* The flag assets are circular by design — badge them as-is. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.flagBadge}
          src={`/assets/flags/${item.avatar.code}.svg`}
          alt=""
          draggable={false}
        />
      </span>
    );
  }
  if (item.imageSquare && item.image) {
    return (
      <span className={styles.avatarWrap} aria-hidden>
        <NetworkTile logo={item.image} size={TILE_SIZE} />
      </span>
    );
  }
  // Your own bank moving the balance — the flag sticker, like everywhere else.
  const flagCode = item.image?.match(/\/flags\/([a-z]+)\.svg$/)?.[1];
  if (flagCode) {
    return (
      <span className={styles.avatarWrap} aria-hidden>
        <FlagTile code={flagCode} size={TILE_SIZE} />
      </span>
    );
  }
  return (
    <span className={styles.avatarWrap} aria-hidden>
      <StickerTile brand size={TILE_SIZE}>
        <CircleDollarIcon size={30} />
      </StickerTile>
    </span>
  );
}

/**
 * Live Activity list for the marketplace wallet home — the static stay-row
 * SHAPE (50px graphic + three lines + right-aligned amount/USD) fed by the
 * shared wallet brain's activity. Empty state reserves four rows of height:
 * skeletons hold, then reveal into the "No activity yet" message. New rows
 * fade in at the top while the rest layout-shift down.
 */
export function MarketplaceActivityList({
  items,
  frozen = false,
}: {
  items: WalletListItemData[];
  /** Hold the skeletons forever (no reveal) — for the zeroed auth backdrop,
   *  so the sign-in crossfade lands on pixel-identical content and the reveal
   *  beat plays on the LIVE home after landing. */
  frozen?: boolean;
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
          {/* Mirrors the real row anatomy: sticker + three lines + amount/USD. */}
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
                  <span className={styles.skeletonPill} style={{ width: 30, height: 10 }} />
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
            <p className={styles.emptyTitle}>No activity yet</p>
            <p className={styles.emptySub}>
              Money you add, send, and receive will show up here
            </p>
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
            <RowAvatar item={item} />
            {/* Text columns grouped so the PAIR centers against the avatar;
                within it, title and amount stay top-aligned to each other. */}
            <div className={styles.content}>
              <div className={styles.lines}>
                <span className={styles.lineTitle}>{item.title}</span>
                <span className={styles.lineMeta}>{item.detail}</span>
                <span className={styles.lineMeta}>{relativeTime(item.timestamp, now)}</span>
              </div>
              <div className={styles.right}>
                <span className={styles.amount}>{item.amount}</span>
                <span className={styles.currency}>USD</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
