'use client';

import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { SkinWalletScreenProps } from '@/apps/types';
import { SheetPresentationProvider, PresentationStage } from '@/apps/shared/SheetPresentation';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { Toast } from '@/apps/shared/Toast';
import { figmaSquircleRadius } from '@/apps/shared/figmaSquircleRadius';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
import { MarketplaceHomeContent } from './HomeBlocks';
import { AddMoneyPage } from './AddMoneyPage';
import { AddBankSheet } from './AddBankSheet';
import { MarketplaceCardScreen } from './CardScreen';
import { SendReceiveSheet } from './SendReceiveSheet';
import { PasteAddressSheet } from './PasteAddressSheet';
import { MarketplaceTabBar } from '../blocks/MarketplaceTabBar';
import {
  MARKETPLACE_PUSH_DURATION,
  MARKETPLACE_PUSH_PARALLAX,
  MARKETPLACE_SHEET_DURATION,
} from '../config';
import styles from './MarketplaceWalletScreen.module.scss';

const PUSH_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_PUSH_DURATION);

/** Marketplace Wallet home (Figma 2610:11075) — Airbnb-style, flat. All values
 *  come from the shared wallet brain (`home`); the layout blocks live in
 *  HomeBlocks so the auth screen can reuse them zeroed. Deposit pushes the
 *  AddMoneyPage in from the right, iOS-nav style, while the home parallax-
 *  shifts left beneath it. Withdraw/Send stay decorative this pass.
 *
 *  No entrance stagger: the sign-in sheet dismisses OVER this exact layout
 *  (the auth screen's zeroed backdrop), so the reveal choreography already
 *  happened — re-staggering the items here would double it. */
export function MarketplaceWalletScreen(props: SkinWalletScreenProps) {
  const { home, money } = props;
  const reduceMotion = useReducedMotion();
  const pageOpen = home.sheetOpen;
  // A close from the confirm step = a completed transfer: the page settles
  // DOWN (sheet dismissal) instead of popping right, so the wallet must
  // already SIT at rest beneath it — no parallax return to watch. The brain
  // keeps its step until the next open, so this reads the close reason.
  const confirmedClose = !pageOpen && money.step === 'confirm';
  // The pageSheet presents while the brain sits on a sheet step: Add bank's
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
      <Toast toast={home.toast} onDismiss={() => home.setToast(null)} variant="inverted" />
    </>
  );

  return (
    <div className={styles.root}>
      <SheetPresentationProvider>
        {/* The whole nav stack (wallet + pushed deposit page) is the presenting
            card — it recedes together when the Add bank sheet slides up, the
            auth-sheet mechanic. */}
        <PresentationStage
          className={styles.stage}
          offset={62}
          duration={MARKETPLACE_SHEET_DURATION}
          radius={figmaSquircleRadius(40)}
        >
          {/* iOS nav-stack parallax: the home shifts left behind the pushed
              page, in lockstep with the page's slide. */}
          <motion.div
            className={styles.underlay}
            initial={false}
            animate={{ x: pageOpen && !reduceMotion ? -MARKETPLACE_PUSH_PARALLAX : 0 }}
            transition={confirmedClose ? { duration: 0 } : PUSH_TRANSITION}
          >
            <MarketplaceHomeContent
              balanceCents={home.availableCents}
              apyPercent={home.apyPercent}
              rewardsMonthCents={home.earningsMonthCents}
              showActivity
              activity={home.homeActivity}
              animatedBalance
              onDeposit={() => home.openSheet('add')}
              onWithdraw={() => home.openSheet('withdraw')}
              onSend={() => home.setSendReceiveOpen(true)}
              onCard={home.openCard}
            />
            <MarketplaceTabBar />
          </motion.div>

          {/* Dim over the receding wallet — fades in with the page's slide. */}
          <AnimatePresence initial={false}>
            {pageOpen && (
              <motion.div
                key="push-scrim"
                className={styles.pushScrim}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={PUSH_TRANSITION}
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
          <MarketplaceCardScreen
            cardView={home.cardView}
            tapPhase={home.tapPhase}
            transactions={home.transactions}
            onClose={() => home.setCardView('closed')}
            onCreate={() => home.setCardView('creating')}
            onRevealed={() => home.setCardView('home')}
            onTapToPay={home.startTapToPay}
          />
        </PresentationStage>

        <AddBankSheet
          m={money}
          open={addBankOpen}
          // X walks the brain back to the step the sheet launched from
          // (add: banks; send: the Add-recipient chooser; receive: the list).
          onDismiss={() => money.go(money.backFrom.country ?? 'banks', true)}
        />

        {/* Paste address — the network sheet stacked over the send flow
            (iOS stack effect: the whole nav stack scales down behind it). */}
        <PasteAddressSheet
          m={money}
          open={pageOpen && money.pickerOpen}
          onDismiss={() => money.setPickerOpen(false)}
        />

        {/* "Send or receive" chooser — a partial-height Airbnb sheet over
            home; picking either drops it as the flow pushes in. */}
        <SendReceiveSheet
          open={home.sendReceiveOpen}
          onDismiss={() => home.setSendReceiveOpen(false)}
          onSend={home.startSend}
          onReceive={home.startReceive}
        />
      </SheetPresentationProvider>

      {overlayEl ? createPortal(overlayContent, overlayEl) : overlayContent}
    </div>
  );
}
