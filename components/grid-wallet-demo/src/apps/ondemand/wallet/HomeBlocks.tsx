'use client';

import { useRef, useState, type UIEvent } from 'react';
import { motion } from 'motion/react';
import NumericText from '@/components/NumericText';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { formatUsdCents, type WalletListItemData } from '@/apps/shared/wallet';
import { OndemandActivityList } from './ActivityList';
import styles from './HomeBlocks.module.scss';

/** Action tile (Figma 2636:17743/17785) — grey r8 squircle, 3D graphic,
 *  11px label. Big tiles (h104) label left; small tiles (h96) label centered
 *  with the graphic floating above. No onClick = decorative. */
function ActionTile({
  label,
  art,
  big = false,
  onClick,
}: {
  label: string;
  art: string;
  big?: boolean;
  onClick?: () => void;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 8 });
  return (
    <button
      type="button"
      className={big ? styles.tileBig : styles.tileSmall}
      ref={clip.ref}
      style={clip.style}
      onClick={onClick}
    >
      <span className={styles.tileArtSlot}>
        <img className={styles.tileArt} src={art} alt="" draggable={false} />
      </span>
      <span className={styles.tileLabel}>{label}</span>
    </button>
  );
}

export interface OndemandHomeContentProps {
  balanceCents: number;
  /** The green "+$X today" chip value. */
  earningsTodayCents: number;
  /** Live rows on the signed-in home; none on the zeroed auth backdrop. */
  showActivity?: boolean;
  /** The wallet brain's activity feed (transfers + received payments). */
  activity?: WalletListItemData[];
  /** Auth-backdrop mode: hold the activity skeletons with no reveal. */
  activityFrozen?: boolean;
  /** One-shot sign-in entrance stagger. */
  entrance?: boolean;
  /** Balance rolls (NumericText) on the live home; static on the backdrop. */
  animatedBalance?: boolean;
  /** Cash out → the withdraw flow. */
  onWithdraw?: () => void;
  /** Send → the Send/Receive chooser. */
  onSend?: () => void;
  /** Pay → the card flow (tap-to-pay lives on the card home). */
  onPay?: () => void;
  /** Card → the debit-card flow. */
  onCard?: () => void;
  /** Add → the deposit flow. */
  onDeposit?: () => void;
}

/** Scroll distance (px) over which the large title migrates into the header
 *  bar — matched to its translate so it tracks the content 1:1, iOS-style. */
const TITLE_COLLAPSE_RANGE = 42;

/** The ondemand Wallet home content (Figma 2636:17730) — large title, total
 *  balance + today chip, 3D action tiles, activity. Purely presentational and
 *  props-driven so the auth → wallet handoff can render it zeroed. */
export function OndemandHomeContent({
  balanceCents,
  earningsTodayCents,
  showActivity = false,
  activity = [],
  activityFrozen = false,
  entrance = false,
  animatedBalance = false,
  onWithdraw,
  onSend,
  onPay,
  onCard,
  onDeposit,
}: OndemandHomeContentProps) {
  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  // Large-title collapse: scroll drives a CSS var directly (no re-render per
  // frame); React state only flips at the fully-collapsed edge for the hairline.
  const titleLayerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const p = Math.min(1, Math.max(0, e.currentTarget.scrollTop / TITLE_COLLAPSE_RANGE));
    titleLayerRef.current?.style.setProperty('--collapse', p.toFixed(4));
    setCollapsed(p >= 1);
  };

  return (
    <div className={styles.root}>
      <header className={styles.headerBar} data-collapsed={collapsed || undefined} />
      <div className={styles.titleLayer} ref={titleLayerRef}>
        <motion.h1 {...enter(0)} className={styles.title}>
          Wallet
        </motion.h1>
      </div>

      <div className={styles.body} onScroll={handleScroll}>
        <motion.div {...enter(1)} className={styles.balanceBlock}>
          <div className={styles.balanceRow}>
            <span className={styles.balanceLabel}>Total balance</span>
            <span className={styles.todayChip}>
              +{formatUsdCents(earningsTodayCents)} today
            </span>
          </div>
          <span className={styles.balanceAmount}>
            {animatedBalance ? (
              <NumericText
                value={balanceCents / 100}
                format={{ style: 'currency', currency: 'USD' }}
                style={{ padding: '0.08em 0' }}
              />
            ) : (
              formatUsdCents(balanceCents)
            )}
          </span>
        </motion.div>

        <motion.div {...enter(2)} className={styles.tileRowBig}>
          <ActionTile
            big
            label="Cash out"
            art="/assets/ondemand/tile-cashout.svg"
            onClick={onWithdraw}
          />
          <ActionTile big label="Send" art="/assets/ondemand/tile-send.svg" onClick={onSend} />
        </motion.div>

        <motion.div {...enter(3)} className={styles.tileRowSmall}>
          <ActionTile label="Pay" art="/assets/ondemand/tile-pay.svg" onClick={onPay} />
          <ActionTile label="Card" art="/assets/ondemand/tile-card.svg" onClick={onCard} />
          <ActionTile label="Save" art="/assets/ondemand/tile-save.svg" />
          <ActionTile label="Add" art="/assets/ondemand/tile-add.svg" onClick={onDeposit} />
        </motion.div>

        <motion.div {...enter(4)} className={styles.activity}>
          <h2 className={styles.activityTitle}>Activity</h2>
          {showActivity ? (
            <OndemandActivityList
              items={activity}
              frozen={activityFrozen}
              onDeposit={onDeposit}
            />
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
