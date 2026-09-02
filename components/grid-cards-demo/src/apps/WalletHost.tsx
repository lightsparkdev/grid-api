'use client';

import { useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import { easeOutQuick, motionTransition } from '@/lib/easing';
import { useMoneySheet, useWalletHome } from '@/apps/shared/wallet';
import type { UseWalletHomeOptions, WalletEntry, WalletTransferMode } from '@/apps/shared/wallet';
import type { SkinWalletScreen } from './types';
import styles from './WalletHost.module.scss';

/** Per-skin wallet-brain options (mirrors AppSkin.walletOptions). */
interface WalletBrainOptions {
  transferSuccessScreen?: boolean;
}

// Skin switch: the old skin's view blur-fades out while the new one fades in —
// same state, new face. The resting layer must carry NO filter: a lingering
// blur(0px) forces WebKit to composite the whole wallet (3D canvas included)
// through the filter path. `transitionEnd` strips it the moment the fade lands.
const SKIN_FADE = motionTransition(easeOutQuick, 0.3);
const SKIN_ENTER = {
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' as const },
};
const SKIN_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
// The exiting layer must never eat taps meant for the incoming skin.
const SKIN_EXIT = { ...SKIN_HIDDEN, pointerEvents: 'none' as const };

export interface WalletHostProps {
  WalletScreen: SkinWalletScreen;
  /** Active skin id — keys the view crossfade on skin switch. */
  skinId: string;
  /** Jump command handed to the wallet so the sidebar can provision + open a flow. */
  entry?: WalletEntry;
  walletOptions?: WalletBrainOptions;
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: UseWalletHomeOptions['onTapToPay'];
  onTapDeclined?: UseWalletHomeOptions['onTapDeclined'];
  cardOptions?: UseWalletHomeOptions['card'];
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
}

/**
 * Hosts the wallet + money-sheet BRAINS above the skin boundary. This component
 * stays mounted across skin switches (only the `WalletScreen` view type swaps
 * beneath it), so balance, activity, card state, mid-flow sheet position, and
 * the consumed `entry` nonce all survive a platform change — switching skins is
 * literally just a reskin. It unmounts on reset, which is what clears the session.
 *
 * There is no sign-in: the cardholder is a Customer the platform already
 * onboarded, so the phone boots straight into the app.
 */
export function WalletHost({
  WalletScreen,
  skinId,
  entry,
  walletOptions,
  onQuoteCreate,
  onLinkExternalAccount,
  onTransferExecute,
  onCardIssued,
  onTapToPay,
  onTapDeclined,
  cardOptions,
  onReceivePayment,
}: WalletHostProps) {
  const reduceMotion = useReducedMotion();
  const entrance = !reduceMotion;
  const home = useWalletHome({
    entrance,
    entry,
    transferSuccessScreen: walletOptions?.transferSuccessScreen,
    onTransferExecute,
    onTapToPay,
    onTapDeclined,
    card: cardOptions,
    onReceivePayment,
  });
  // The skin this host MOUNTED with — any other id means the user switched
  // platforms mid-session, so the incoming view is a fresh face over live state.
  const mountSkin = useRef(skinId);
  const switchedIn = skinId !== mountSkin.current;

  const money = useMoneySheet({
    open: home.sheetOpen,
    mode: home.sheetMode,
    availableCents: home.availableCents,
    confirming: home.sheetConfirming,
    onDismiss: () => home.setSheetOpen(false),
    onConfirm: home.confirmTransfer,
    onQuote: (cents, dest) => {
      // Receive never reaches the amount step, so no quote fires for it.
      if (home.sheetMode !== 'receive') onQuoteCreate?.(home.sheetMode, cents, dest);
    },
    onLinkExternalAccount: (input, label) => {
      onLinkExternalAccount?.(input, label);
      home.showToast(
        label === 'Add bank account'
          ? 'Bank account saved'
          : label === 'Add crypto wallet'
            ? 'Wallet added'
            : 'Recipient saved',
      );
    },
    onReceive: home.handleReceivePayment,
  });

  return (
    <div className={styles.flow}>
      <AnimatePresence initial={false}>
        <motion.div
          key={skinId}
          className={styles.skinLayer}
          initial={SKIN_HIDDEN}
          animate={{ ...SKIN_ENTER, transition: SKIN_FADE }}
          exit={{ ...SKIN_EXIT, transition: SKIN_FADE }}
        >
          <WalletScreen
            entrance={entrance}
            switchedIn={switchedIn}
            home={home}
            money={money}
            onCardIssued={onCardIssued}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
