'use client';

import { motion } from 'motion/react';
import NumericText from '@/components/NumericText';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { formatUsdCents, type WalletListItemData } from '@/apps/shared/wallet';
import { OndemandActivityList } from './ActivityList';
import styles from './HomeBlocks.module.scss';

/** Action tile (Figma 2636:17743/17785) — grey r8 squircle, 3D graphic,
 *  12px semibold label. Big tiles (h104) label left; small tiles (h96) label
 *  centered with the graphic floating above. No onClick = decorative. */
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
  const tileClass = big ? styles.tileBig : styles.tileSmall;
  return (
    <button
      type="button"
      className={onClick ? tileClass : `${tileClass} ${styles.tileInert}`}
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
  /** Card → the debit-card flow. */
  onCard?: () => void;
  /** Add → the deposit flow. */
  onDeposit?: () => void;
}

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
  onCard,
  onDeposit,
}: OndemandHomeContentProps) {
  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  return (
    <div className={styles.root}>
      {/* Static opaque title strip — no collapse animation, no hairline;
          content just scrolls under it. */}
      <header className={styles.headerBar}>
        <motion.h1 {...enter(0)} className={styles.title}>
          Wallet
        </motion.h1>
      </header>

      <div className={styles.body}>
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
          <ActionTile label="Add" art="/assets/ondemand/tile-add.svg" onClick={onDeposit} />
          <ActionTile label="Card" art="/assets/ondemand/tile-card.svg" onClick={onCard} />
          <ActionTile label="Save" art="/assets/ondemand/tile-save.svg" />
          <ActionTile label="Bills" art="/assets/ondemand/tile-bills.svg" />
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
