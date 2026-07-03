'use client';

import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { Toast } from '@/apps/shared/Toast';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { motionTransition } from '@/lib/easing';
import { formatUsdCents, useWalletHome } from '@/apps/shared/wallet';
import type { SkinWalletScreenProps } from '@/apps/types';
import type { SkinIcon } from '../types';
// Z's own money sheet (forked from Glitch's flat sheet onto the shared brain).
import { AddMoneySheet } from './AddMoneySheet';
import { CardIssuanceSheet } from './CardIssuanceSheet';
import {
  IconPeopleCircle,
  IconCircleQuestionmark,
  IconSettingsGear2,
  IconEyeSlash,
  IconArrowInbox,
  IconArrowOutOfBox,
  IconPaperPlaneTopRight,
} from '../icons';
import { SOCIAL_MONEY, SOCIAL_TAB_BAR } from '../config';
import { SocialTabBar } from '../blocks/SocialTabBar';
import { SocialActivityList } from './SocialActivityList';
import { ZCardGraphic } from './ZCardGraphic';
import styles from './SocialWalletScreen.module.scss';

// Aurora press feel: a slight grow on hover, a bigger grow on press (same curve
// + duration as the shared glass-button-press mixin / the auth screen).
const PRESS = motionTransition([0.22, 1, 0.36, 1], 0.28);
const CARD_HOVER = 1.02;
const CARD_PRESS = 1.04;

/** One Deposit/Withdraw/Send chip (Figma 2543:21247) — squircle-clipped
 *  (Safari-safe), solid fill, Aurora scale on hover/press. */
function ActionChip({
  Icon,
  label,
  onClick,
}: {
  Icon: SkinIcon;
  label: string;
  onClick: () => void;
}) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 16 });
  return (
    <motion.button
      type="button"
      className={styles.actionChip}
      onClick={onClick}
      ref={clip.ref}
      style={clip.style}
      whileHover={{ scale: CARD_HOVER, transition: PRESS }}
      whileTap={{ scale: CARD_PRESS, transition: PRESS }}
    >
      <Icon size={20} />
      <span className={styles.actionLabel}>{label}</span>
    </motion.button>
  );
}

/** Z (social) Money home (Figma 2543:21291 / 21281 / 21322) — nav, hidden-balance
 *  hero, Deposit/Withdraw/Send chips, Rewards + Z Card tiles, activity list, and
 *  the decorative tab bar. All money logic is the shared `useWalletHome`; the
 *  chips drive the reused flat money sheet (which logs the Grid API calls). Flat,
 *  no glass; cards use the squircle clip + Aurora press scale. */
export function SocialWalletScreen(props: SkinWalletScreenProps) {
  const { entrance = false, onQuoteCreate, onLinkExternalAccount, onCardIssued } = props;
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
    earningsTodayCents,
    apyPercent,
    homeActivity,
    openSheet,
    startSend,
    finishTransfer,
    confirmTransfer,
    handleReceivePayment,
    // Card issuance (intro → creating → ready → home). Once issued, the tile
    // opens straight onto the card home (hero card, no re-issuance).
    cardView,
    setCardView,
    isIssuance,
    issued,
    // Card home: tap-to-pay sub-flow + the card's transaction history.
    tapPhase,
    setTapPhase,
    startTapToPay,
    transactions,
    // Z keeps the sheet open after confirm and shows an in-sheet success screen
    // (Done closes it) instead of the toast.
  } = useWalletHome({ ...props, transferSuccessScreen: true });

  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  const rewardsClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 16 });
  const cardClip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 16 });

  // One Face ID surface for both flows that need it: transfer confirms and the
  // tap-to-pay auth beat.
  const tapAuth = tapPhase === 'auth';
  const overlayContent = (
    <>
      <FaceIdAuth
        active={sheetConfirming || tapAuth}
        onDone={() => (tapAuth ? setTapPhase('done') : finishTransfer())}
      />
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
        <button type="button" className={styles.navBtn} aria-label="Community">
          <IconPeopleCircle size={24} />
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
        </motion.div>

        <motion.div {...enter(2)} className={styles.actions}>
          <ActionChip Icon={IconArrowInbox} label="Deposit" onClick={() => openSheet('add')} />
          <ActionChip Icon={IconArrowOutOfBox} label="Withdraw" onClick={() => openSheet('withdraw')} />
          <ActionChip Icon={IconPaperPlaneTopRight} label="Send" onClick={startSend} />
        </motion.div>

        <motion.div {...enter(3)} className={styles.tiles}>
          <motion.button
            type="button"
            className={styles.rewardsTile}
            ref={rewardsClip.ref}
            style={rewardsClip.style}
            whileHover={{ scale: CARD_HOVER, transition: PRESS }}
            whileTap={{ scale: CARD_PRESS, transition: PRESS }}
          >
            <span className={styles.tileHeading}>{SOCIAL_MONEY.rewardsLabel}</span>
            <div className={styles.rewardsFooter}>
              <span className={styles.apy}>{apyPercent.toFixed(2)}% APY</span>
              <span className={styles.rewardsAmount}>{formatUsdCents(earningsTodayCents)}</span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            className={styles.cardTile}
            ref={cardClip.ref}
            style={cardClip.style}
            onClick={() => setCardView(issued ? 'home' : 'intro')}
            whileHover={{ scale: CARD_HOVER, transition: PRESS }}
            whileTap={{ scale: CARD_PRESS, transition: PRESS }}
          >
            <span className={styles.cardHeading}>{SOCIAL_MONEY.cardLabel}</span>
            <ZCardGraphic />
          </motion.button>
        </motion.div>

        <motion.div {...enter(4)} className={styles.activityWrap}>
          <SocialActivityList items={homeActivity} onAddMoney={() => openSheet('add')} />
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

      <CardIssuanceSheet
        open={isIssuance || cardView === 'home'}
        cardView={cardView}
        issued={issued}
        tapPhase={tapPhase}
        transactions={transactions}
        onClose={() => setCardView('closed')}
        onCreate={() => {
          setCardView('creating');
          onCardIssued?.();
        }}
        // Continue morphs the live 3D card from its perch to the card-home hero
        // rect — same sheet, same canvas, one continuous element.
        onContinue={() => setCardView('home')}
        onTapToPay={startTapToPay}
      />

      {screenOverlay}
    </div>
  );
}
