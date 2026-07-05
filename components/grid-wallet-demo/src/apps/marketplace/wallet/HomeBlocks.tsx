'use client';

import { useRef, useState, type ReactNode, type UIEvent } from 'react';
import clsx from 'clsx';
import { motion } from 'motion/react';
import NumericText from '@/components/NumericText';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { SquircleFocusHalo } from '@/apps/shared/SquircleFocusHalo';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { formatUsdCents, type WalletListItemData } from '@/apps/shared/wallet';
import { motionTransition } from '@/lib/easing';
import { IconSettingsGear2, IconPaperPlaneTopRight } from '../icons';
import { MarketplaceActivityList } from './ActivityList';
import styles from './HomeBlocks.module.scss';

// Aurora press feel — slight grow on hover, a bit more on press.
const PRESS = motionTransition([0.22, 1, 0.36, 1], 0.28);
const HOVER_SCALE = 1.02;
const PRESS_SCALE = 1.04;

/** White marketplace card (Figma r18): squircle clip (Chrome+Safari) with the
 *  0.5px hairline drawn as an SVG halo (clip-path eats box borders) and the
 *  soft shadow on the shell (clip-path eats box-shadows too). */
function MkCard({ children, className }: { children: ReactNode; className?: string }) {
  const clip = useSquircleClip<HTMLDivElement>({ figmaRadii: 18 });
  return (
    <div className={clsx(styles.cardShell, className)}>
      <div ref={clip.ref} style={clip.style} className={styles.cardClip}>
        {children}
      </div>
      <SquircleFocusHalo
        path={clip.path}
        width={clip.width}
        height={clip.height}
        className={styles.cardHalo}
      />
    </div>
  );
}

/** Deposit / Withdraw pill (no onClick = decorative, press feel only). */
function ActionPill({ label, onClick }: { label: string; onClick?: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  return (
    <motion.button
      type="button"
      className={styles.actionPill}
      ref={clip.ref}
      style={clip.style}
      onClick={onClick}
      whileHover={{ scale: HOVER_SCALE, transition: PRESS }}
      whileTap={{ scale: PRESS_SCALE, transition: PRESS }}
    >
      {label}
    </motion.button>
  );
}

function SendButton({ onClick }: { onClick?: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  return (
    <motion.button
      type="button"
      className={clsx(styles.actionPill, styles.actionSquare)}
      aria-label="Send"
      onClick={onClick}
      ref={clip.ref}
      style={clip.style}
      whileHover={{ scale: HOVER_SCALE, transition: PRESS }}
      whileTap={{ scale: PRESS_SCALE, transition: PRESS }}
    >
      <IconPaperPlaneTopRight size={24} />
    </motion.button>
  );
}

export interface MarketplaceHomeContentProps {
  balanceCents: number;
  apyPercent: number;
  rewardsMonthCents: number;
  /** Live rows on the signed-in home; none on the zeroed auth backdrop. */
  showActivity?: boolean;
  /** The wallet brain's activity feed (transfers + received payments). */
  activity?: WalletListItemData[];
  /** Auth-backdrop mode: hold the activity skeletons with no reveal, so the
   *  sign-in crossfade lands on pixel-identical content. */
  activityFrozen?: boolean;
  /** One-shot sign-in entrance stagger. */
  entrance?: boolean;
  /** Balance rolls (NumericText) on the live home; static on the backdrop. */
  animatedBalance?: boolean;
  /** Opens the deposit flow (absent on the zeroed auth backdrop). */
  onDeposit?: () => void;
  /** Opens the withdraw flow (absent on the auth backdrop). */
  onWithdraw?: () => void;
  /** Opens the Send/Receive chooser sheet (absent on the auth backdrop). */
  onSend?: () => void;
}

/** The marketplace Wallet home content (Figma 2610:11075) — gear nav, title,
 *  balance card, debit-card promo, Rewards + Performance tiles, activity.
 *  Purely presentational and props-driven so the auth screen can render it
 *  zeroed behind the sign-in sheet. */
/** Scroll distance (px) over which the large title migrates into the header
 *  bar — matched to its translate so it tracks the content 1:1, iOS-style. */
const TITLE_COLLAPSE_RANGE = 42;

export function MarketplaceHomeContent({
  balanceCents,
  apyPercent,
  rewardsMonthCents,
  showActivity = false,
  activity = [],
  activityFrozen = false,
  entrance = false,
  animatedBalance = false,
  onDeposit,
  onWithdraw,
  onSend,
}: MarketplaceHomeContentProps) {
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
      <header className={styles.headerBar} data-collapsed={collapsed || undefined}>
        <button type="button" className={styles.gearBtn} aria-label="Settings">
          <IconSettingsGear2 size={24} />
        </button>
      </header>
      <div className={styles.titleLayer} ref={titleLayerRef}>
        <motion.h1 {...enter(0)} className={styles.title}>
          Wallet
        </motion.h1>
      </div>

      <div className={styles.body} onScroll={handleScroll}>
        <motion.div {...enter(1)}>
          <MkCard>
            <div className={styles.balanceTop}>
              <span className={styles.balanceLabel}>Available balance</span>
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
            </div>
            <div className={styles.balanceActions}>
              <ActionPill label="Deposit" onClick={onDeposit} />
              <ActionPill label="Withdraw" onClick={onWithdraw} />
              <SendButton onClick={onSend} />
            </div>
          </MkCard>
        </motion.div>

        <motion.div {...enter(2)}>
          <MkCard>
            <div className={styles.promo}>
              <img
                className={styles.promoArt}
                src="/assets/marketplace/card-promo.webp"
                alt=""
                draggable={false}
              />
              <div className={styles.promoCopy}>
                <span className={styles.promoTitle}>Get your free debit card</span>
                <span className={styles.promoSub}>
                  Spend your balance online, in person, and around the world.
                </span>
              </div>
            </div>
          </MkCard>
        </motion.div>

        <motion.div {...enter(3)} className={styles.tiles}>
          <MkCard className={styles.tileShell}>
            <div className={styles.rewardsTile}>
              <div className={styles.tileHead}>
                <span className={styles.tileTitle}>Rewards</span>
                <span className={styles.tileSub}>{apyPercent}% APY</span>
              </div>
              <div className={styles.rewardsFoot}>
                <span className={styles.rewardsCaption}>This month</span>
                <span className={styles.rewardsAmount}>{formatUsdCents(rewardsMonthCents)}</span>
              </div>
            </div>
          </MkCard>

          <MkCard className={styles.tileShell}>
            <div className={styles.performanceTile}>
              <div className={styles.tileHead}>
                <span className={styles.tileTitle}>Performance</span>
                <span className={styles.performanceDelta}>
                  +$1,224.21 in{' '}
                  {new Date().toLocaleDateString('en-US', { month: 'long' })}
                </span>
              </div>
              <div className={styles.bars} aria-hidden>
                <span className={clsx(styles.bar, styles.barFull)} />
                <span className={clsx(styles.bar, styles.barSplit)}>
                  <span className={styles.barProjection} />
                  <span className={styles.barFill} />
                </span>
              </div>
            </div>
          </MkCard>
        </motion.div>

        <motion.div {...enter(4)} className={styles.activity}>
          <h2 className={styles.activityTitle}>Activity</h2>
          {showActivity ? (
            <MarketplaceActivityList
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
