'use client';

import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { Toast } from '@/apps/shared/Toast';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { formatUsdCents, useWalletHome } from '@/apps/shared/wallet';
import type { SkinWalletScreenProps } from '@/apps/types';
import type { SkinIcon } from '../types';
// Reuse Glitch's flat (no-glass) money sheet on the shared brain — solid
// CREATOR_FLAT_SHEET surface, retinted by the Z tokens it renders under.
import { AddMoneySheet } from '@/apps/creator/wallet/AddMoneySheet';
import {
  IconArrowLeft,
  IconCircleQuestionmark,
  IconSettingsGear2,
  IconEyeSlash,
  IconInfoSimple,
  IconArrowInbox,
  IconSend,
  IconQrCode,
  IconChevronRightSmall,
} from '../icons';
import { SOCIAL_MONEY, SOCIAL_TAB_BAR } from '../config';
import { SocialTabBar } from '../blocks/SocialTabBar';
import { SocialActivityList } from './SocialActivityList';
import { ZCardGraphic } from './ZCardGraphic';
import styles from './SocialWalletScreen.module.scss';

/** One Deposit/Send/Request chip — squircle-clipped (Safari-safe), solid fill. */
function ActionChip({
  Icon,
  label,
  onClick,
}: {
  Icon: SkinIcon;
  label: string;
  onClick: () => void;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 14 });
  return (
    <button
      type="button"
      className={styles.actionChip}
      onClick={onClick}
      ref={clip.ref}
      style={clip.style}
    >
      <Icon size={22} />
      <span className={styles.actionLabel}>{label}</span>
    </button>
  );
}

/** Z (social) Money home — X-style: nav, hidden-balance hero, Deposit/Send/Request,
 *  the Rewards + Z Card tiles, and the activity list. All money logic is the shared
 *  `useWalletHome`; Deposit/Send/Request drive the reused flat money sheet (which
 *  logs the Grid API calls). Flat, no glass; cards use the squircle clip. */
export function SocialWalletScreen(props: SkinWalletScreenProps) {
  const { entrance = false, onQuoteCreate, onLinkExternalAccount } = props;
  const overlayEl = useScreenOverlay();

  const {
    sheetMode,
    sheetOpen,
    setSheetOpen,
    sheetConfirming,
    toast,
    setToast,
    showToast,
    availableCents,
    apyPercent,
    homeActivity,
    openSheet,
    startSend,
    startReceive,
    finishTransfer,
    confirmTransfer,
    handleReceivePayment,
  } = useWalletHome(props);

  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  const rewardsClip = useSquircleClip<HTMLDivElement>({ figmaRadii: 16 });
  const cardClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 16 });

  const overlayContent = (
    <>
      <FaceIdAuth active={sheetConfirming} onDone={() => finishTransfer()} />
      <Toast toast={toast} onDismiss={() => setToast(null)} variant="flat" />
    </>
  );
  const screenOverlay = overlayEl ? (
    createPortal(overlayContent, overlayEl)
  ) : (
    <div className={styles.faceIdLayer}>{overlayContent}</div>
  );

  return (
    <div className={styles.root}>
      <header className={styles.nav}>
        <button type="button" className={styles.navBtn} aria-label="Back">
          <IconArrowLeft size={24} />
        </button>
        <span className={styles.navTitle}>{SOCIAL_MONEY.title}</span>
        <div className={styles.navRight}>
          <button type="button" className={styles.navBtn} aria-label="Help">
            <IconCircleQuestionmark size={24} />
          </button>
          <button type="button" className={styles.navBtn} aria-label="Settings">
            <IconSettingsGear2 size={24} />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <motion.div {...enter(1)} className={styles.balanceBlock}>
          <div className={styles.balanceLabelRow}>
            <span className={styles.balanceLabel}>{SOCIAL_MONEY.balanceLabel}</span>
            <IconEyeSlash size={16} className={styles.muted} />
          </div>
          <span className={styles.balanceAmount}>{formatUsdCents(availableCents)}</span>
          <div className={styles.assuranceRow}>
            <span className={styles.assurance}>{SOCIAL_MONEY.balanceCaption}</span>
            <IconInfoSimple size={15} className={styles.muted} />
          </div>
        </motion.div>

        <motion.div {...enter(2)} className={styles.actions}>
          <ActionChip Icon={IconArrowInbox} label="Deposit" onClick={() => openSheet('add')} />
          <ActionChip Icon={IconSend} label="Send" onClick={startSend} />
          <ActionChip Icon={IconQrCode} label="Request" onClick={startReceive} />
        </motion.div>

        <motion.div {...enter(3)} className={styles.tiles}>
          <div className={styles.rewardsTile} ref={rewardsClip.ref} style={rewardsClip.style}>
            <span className={styles.tileHeading}>{SOCIAL_MONEY.rewardsLabel}</span>
            <div className={styles.rewardsFooter}>
              <span className={styles.apy}>{apyPercent.toFixed(2)}% APY</span>
              <span className={styles.rewardsAmount}>{formatUsdCents(availableCents)}</span>
            </div>
          </div>

          <button type="button" className={styles.cardTile} ref={cardClip.ref} style={cardClip.style}>
            <span className={styles.cardHeading}>
              {SOCIAL_MONEY.cardLabel}
              <IconChevronRightSmall size={16} className={styles.muted} />
            </span>
            <ZCardGraphic />
          </button>
        </motion.div>

        <motion.div {...enter(4)} className={styles.activityWrap}>
          <SocialActivityList items={homeActivity} />
        </motion.div>
      </div>

      <SocialTabBar {...SOCIAL_TAB_BAR} />

      <AddMoneySheet
        open={sheetOpen}
        mode={sheetMode}
        availableCents={availableCents}
        confirming={sheetConfirming}
        onDismiss={() => setSheetOpen(false)}
        onQuote={(cents, dest) => {
          if (sheetMode !== 'receive') onQuoteCreate?.(sheetMode, cents, dest);
        }}
        onLinkExternalAccount={(input, label) => {
          onLinkExternalAccount?.(input, label);
          showToast(
            label === 'Add bank account'
              ? 'Bank account saved'
              : label === 'Add crypto wallet'
                ? 'Wallet added'
                : 'Recipient saved',
          );
        }}
        onReceive={handleReceivePayment}
        onConfirm={confirmTransfer}
      />

      {screenOverlay}
    </div>
  );
}
