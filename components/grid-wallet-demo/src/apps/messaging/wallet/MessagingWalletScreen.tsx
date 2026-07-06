'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { Toast } from '@/apps/shared/Toast';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { SfSymbol } from '@/apps/shared/icons';
import { formatUsdCents } from '@/apps/shared/wallet';
import { SendReceiveSheet } from '@/apps/aurora/wallet/SendReceiveSheet';
import { AddMoneySheet } from './AddMoneySheet';
import type { SkinWalletScreenProps } from '@/apps/types';
import clsx from 'clsx';
import {
  IconArrowUpRight,
  IconArrowDownLeft,
  IconQrCode,
  IconPlusLarge,
  IconReceiptBill,
  IconCreditCard2,
  IconBank,
  IconPiggyBank,
  type MessagingIcon,
} from '../icons';
import { GlassCircleButton } from '../blocks/GlassCircleButton';
import { MessagingActivityList } from './ActivityList';
import { MessagingTabBar } from './MessagingTabBar';
import { MessagingCardScreen } from './CardScreen';
import styles from './MessagingWalletScreen.module.scss';

interface ActionSpec {
  Icon: MessagingIcon;
  label: string;
  onTap?: () => void;
}

/* Figma 2640:19781 / 2640:19803 — solid flat circles: 56px fills/secondary,
   28px label-primary glyph, no glass. */
function ActionButton({ Icon, label, onTap }: ActionSpec) {
  return (
    <div className={styles.action} data-noop={!onTap || undefined}>
      <button
        type="button"
        className={clsx(styles.circleBtn, styles.actionCircle)}
        aria-label={label}
        aria-disabled={!onTap || undefined}
        data-noop={!onTap || undefined}
        onClick={onTap}
      >
        <Icon className={styles.actionIcon} size={28} />
      </button>
      <span className={styles.actionLabel}>{label}</span>
    </div>
  );
}

/** ChatsApp Money home (Figma 2640:19597) — glass header chips, large-title
 *  balance, two 4-column glass action rows, the WhatsApp activity list, and
 *  the frosted docked tab bar. All values come from the shared wallet brain
 *  (`home`); the money-flow faces are Aurora's (glass fits this app) and the
 *  card flow is the skin's own full-screen rise. */
export function MessagingWalletScreen(props: SkinWalletScreenProps) {
  const { entrance = false, home, money, onCardIssued } = props;

  // Sign-in entrance: header → title → balance → actions → activity reveal in
  // once on mount. `entrance` off spreads a no-op (rest pose).
  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  // Row 1 — Send / Request / Scan / Add; Row 2 — Pay bills / Cards / Withdraw
  // / Savings. Scan, Pay bills, and Savings are decorative (no brain flow).
  const actionsRow1: ActionSpec[] = [
    { Icon: IconArrowUpRight, label: 'Send', onTap: home.startSend },
    { Icon: IconArrowDownLeft, label: 'Receive', onTap: home.startReceive },
    { Icon: IconQrCode, label: 'Scan' },
    { Icon: IconPlusLarge, label: 'Add', onTap: () => home.openSheet('add') },
  ];
  const actionsRow2: ActionSpec[] = [
    { Icon: IconReceiptBill, label: 'Pay bills' },
    { Icon: IconCreditCard2, label: 'Card', onTap: home.openCard },
    { Icon: IconBank, label: 'Withdraw', onTap: () => home.openSheet('withdraw') },
    { Icon: IconPiggyBank, label: 'Savings' },
  ];

  // Face ID (transfer confirm + the tap-to-pay auth beat) and the glass toast
  // render in AppShell's overlay layer so they slide over the status bar.
  const tapAuth = home.tapPhase === 'auth';
  const overlayEl = useScreenOverlay();
  const overlayContent: ReactNode = (
    <>
      <FaceIdAuth
        active={home.sheetConfirming || tapAuth}
        onDone={() => {
          if (tapAuth) home.setTapPhase('done');
          else if (home.sheetConfirming) home.finishTransfer();
        }}
      />
      <Toast toast={home.toast} onDismiss={() => home.setToast(null)} />
    </>
  );

  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <motion.div {...enter(0)} className={styles.topRow}>
          <GlassCircleButton size={40} aria-label="More">
            <SfSymbol name="ellipsis" size={17} />
          </GlassCircleButton>
          <GlassCircleButton size={40} green aria-label="New payment">
            <SfSymbol name="plus" size={17} />
          </GlassCircleButton>
        </motion.div>

        <motion.h1 {...enter(1)} className={styles.title}>
          Money
        </motion.h1>

        <motion.div {...enter(2)} className={styles.balance}>
          <p className={styles.balanceLabel}>Total balance</p>
          <p className={styles.balanceValue}>{formatUsdCents(home.availableCents)}</p>
        </motion.div>

        {/* ONE hover group: entering the grid dims the decorative no-ops
            (Scan / Pay bills / Savings) — the money sheet's no-op-source
            pattern — and leaving restores them. */}
        <div className={styles.actionsGroup}>
          <motion.div {...enter(3)} className={styles.actionsRow}>
            {actionsRow1.map((a) => (
              <ActionButton key={a.label} {...a} />
            ))}
          </motion.div>
          <motion.div {...enter(4)} className={styles.actionsRow}>
            {actionsRow2.map((a) => (
              <ActionButton key={a.label} {...a} />
            ))}
          </motion.div>
        </div>

        <motion.div {...enter(5)} className={styles.activitySection}>
          <h2 className={styles.activityTitle}>Activity</h2>
          <MessagingActivityList
            items={home.homeActivity}
            emptyTitle="Nothing here, yet"
            emptySub="Add money to start sending and spending"
            cta={{ label: 'Add money', onClick: () => home.openSheet('add') }}
          />
        </motion.div>
      </div>

      {/* Progressive scroll-edge blur (the country picker's 3-layer recipe):
          content melts under the status bar and the floating tab bar instead
          of hard-clipping. */}
      <div className={clsx(styles.edgeFade, styles.edgeFadeTop)} aria-hidden>
        <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
      </div>
      <div className={clsx(styles.edgeFade, styles.edgeFadeBottom)} aria-hidden>
        <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
        <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
      </div>

      <MessagingTabBar />

      {/* The debit-card flow — a full-screen rise over everything (tab bar
          included); tap-to-pay lives inside it. */}
      <MessagingCardScreen
        cardView={home.cardView}
        tapPhase={home.tapPhase}
        transactions={home.transactions}
        onClose={() => home.setCardView('closed')}
        onCreate={() => {
          // POST /cards fires when you tap Create; the reveal that follows is
          // just provisioning.
          home.setCardView('creating');
          onCardIssued?.();
        }}
        onRevealed={() => home.setCardView('home')}
        onTapToPay={home.startTapToPay}
      />

      {/* Send or receive chooser — Aurora's glass face (reachable via a
          mid-flow skin switch; the home buttons jump straight to the flows). */}
      <SendReceiveSheet
        open={home.sendReceiveOpen}
        onDismiss={() => home.setSendReceiveOpen(false)}
        onSend={home.startSend}
        onReceive={home.startReceive}
      />

      {/* Add money / Withdraw / Send / Receive — the skin's fork of Aurora's
          full-bleed frost face (green glass CTAs) over the lifted `money`
          brain; tints arrive via --ios-tint. */}
      <AddMoneySheet
        m={money}
        open={home.sheetOpen}
        mode={home.sheetMode}
        confirming={home.sheetConfirming}
        onReceive={home.handleReceivePayment}
        onConfirm={home.confirmTransfer}
      />

      {overlayEl ? createPortal(overlayContent, overlayEl) : overlayContent}
    </div>
  );
}
