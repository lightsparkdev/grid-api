'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { SkinWalletScreenProps } from '@/apps/types';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { Toast } from '@/apps/shared/Toast';
import { motionTransition } from '@/lib/easing';
import { OndemandHomeContent } from './HomeBlocks';
import { AddMoneyPage } from './AddMoneyPage';
import { AddBankSheet } from './AddBankSheet';
import { OndemandCardScreen } from './CardScreen';
import { SendReceiveSheet } from './SendReceiveSheet';
import { PasteAddressSheet } from './PasteAddressSheet';
import { OndemandTabBar } from '../blocks/OndemandTabBar';
import { ONDEMAND_SHEET_DURATION } from '../config';
import styles from './OndemandWalletScreen.module.scss';

const SCRIM_TRANSITION = motionTransition(undefined, ONDEMAND_SHEET_DURATION);

/** Ondemand Wallet home (Figma 2610:11075) — Airbnb-style, flat. All values
 *  come from the shared wallet brain (`home`); the layout blocks live in
 *  HomeBlocks so the auth handoff can render them zeroed. NO iOS sheet
 *  stacking in this app: tapping a home tile SLIDES the flow page up
 *  full-screen over the static home (dim scrim, no parallax, no recede);
 *  screens within a flow push horizontally.
 *
 *  One-shot entrance stagger on sign-in (the Z choreography): the flow sets
 *  `entrance` once when the wallet lands after auth. */
export function OndemandWalletScreen(props: SkinWalletScreenProps) {
  const { entrance = false, home, money } = props;
  const pageOpen = home.sheetOpen;
  // The Add-bank screen presents while the brain sits on one of its steps:
  // country/bankForm, plus Receive's funding instructions.
  const addBankOpen =
    pageOpen &&
    (money.step === 'country' || money.step === 'bankForm' || money.step === 'fundingDetails');

  // Face ID (transfer confirm + the tap-to-pay auth beat) and the toast render
  // in AppShell's overlay layer so they slide over the status bar.
  const tapAuth = home.tapPhase === 'auth';
  const overlayEl = useScreenOverlay();
  const overlayContent = (
    <>
      <FaceIdAuth
        active={home.sheetConfirming || tapAuth}
        onDone={() => {
          if (tapAuth) home.setTapPhase('done');
          else if (home.sheetConfirming) home.finishTransfer();
        }}
      />
      {/* Solid contrast pill — the truly flat voice ('flat' is frosted). */}
      <Toast toast={home.toast} onDismiss={() => home.setToast(null)} variant="inverted" />
    </>
  );

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        {/* The home sits STILL beneath presented flows — no parallax shift,
            no stack recede. */}
        <div className={styles.underlay}>
          <OndemandHomeContent
            balanceCents={home.availableCents}
            earningsTodayCents={home.earningsTodayCents}
            showActivity
            activity={home.homeActivity}
            entrance={entrance}
            animatedBalance
            onWithdraw={() => home.openSheet('withdraw')}
            onSend={() => home.setSendReceiveOpen(true)}
            onCard={home.openCard}
            onDeposit={() => home.openSheet('add')}
          />
          <OndemandTabBar />
        </div>

        {/* Dim over the home — fades in with the flow page's rise. */}
        <AnimatePresence initial={false}>
          {pageOpen && (
            <motion.div
              key="present-scrim"
              className={styles.pushScrim}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SCRIM_TRANSITION}
            />
          )}
        </AnimatePresence>

        <AddMoneyPage
          m={money}
          mode={home.sheetMode}
          open={pageOpen}
          onDismiss={money.dismiss}
          confirming={home.sheetConfirming}
          onConfirm={home.confirmTransfer}
          onReceive={home.handleReceivePayment}
        />

        {/* The debit-card flow — a full-screen rise over everything. */}
        <OndemandCardScreen
          cardView={home.cardView}
          tapPhase={home.tapPhase}
          transactions={home.transactions}
          onClose={() => home.setCardView('closed')}
          onCreate={() => home.setCardView('creating')}
          onRevealed={() => home.setCardView('home')}
          onTapToPay={home.startTapToPay}
        />
      </div>

      <AddBankSheet
        m={money}
        open={addBankOpen}
        // X walks the brain back to the step the sheet launched from
        // (add: banks; send: the Add-recipient chooser; receive: the list).
        onDismiss={() => money.go(money.backFrom.country ?? 'banks', true)}
      />

      {/* Paste address — the network chooser on the partial sheet (plain
          slide-up over a dim scrim). */}
      <PasteAddressSheet
        m={money}
        open={pageOpen && money.pickerOpen}
        onDismiss={() => money.setPickerOpen(false)}
      />

      {/* "Send or receive" chooser — a partial-height sheet over home;
          picking either drops it as the flow presents. */}
      <SendReceiveSheet
        open={home.sendReceiveOpen}
        onDismiss={() => home.setSendReceiveOpen(false)}
        onSend={home.startSend}
        onReceive={home.startReceive}
      />

      {overlayEl ? createPortal(overlayContent, overlayEl) : overlayContent}
    </div>
  );
}
