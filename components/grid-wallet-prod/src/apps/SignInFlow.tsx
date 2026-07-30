'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { AuthMethod } from '@/data/flow';
import type { ExternalAccountInput, ReceivePaymentInfo, TransferDest } from '@/data/apiCalls';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import type { DepositInstructions } from '@/lib/gridReads';
import { currencyFor } from '@/data/bankCountries';
import { useMoneySheet, useWalletHome } from '@/apps/shared/wallet';
import type {
  WalletEntry,
  WalletTransferMode,
  WalletListItemData,
  SavedBank,
} from '@/apps/shared/wallet';
import type { SkinAuthFlow, SkinAuthScreen, SkinWalletScreen } from './types';
import styles from './SignInFlow.module.scss';

/** Per-skin wallet-brain options (mirrors AppSkin.walletOptions). */
interface WalletBrainOptions {
  transferSuccessScreen?: boolean;
}

// The auth screen plays the sign-in intro (content out → mask dissolve → logo
// to center → "Creating your account..." hold) on `dismissed`. The exit is
// strictly sequenced: the caption animates OUT first (`leaving`), and only
// then does the swap + reveal begin.
const INTRO_HOLD_MS = 2300; // dismiss → caption starts leaving
const INTRO_LEAVE_MS = 300; // caption exit room before the swap/reveal

// The reveal: the wallet mounts UNDER the held auth screen, which then blur-fades
// out in place — a one-shot exit on a single layer.
const REVEAL_OUT = motionTransition(easeOutQuick, 0.45);
// Coming BACK to sign-in: the auth screen blur-fades in over the held home.
const REVEAL_IN = motionTransition(easeOutSnappy, 0.4);
// Reduced motion (and the wallet's entry beneath): a plain quick crossfade.
const SWAP_FADE = motionTransition(easeOutQuick, 0.25);

// Skin switch: the old skin's view blur-fades out while the new one fades in —
// same state, new face. Short, same motion language as the app's step swaps.
// The resting layer must carry NO filter: a lingering blur(0px) is a no-op on
// Chrome but forces WebKit to composite the whole wallet (3D canvas included)
// through the filter path — Safari drops the entrance stagger and stalls first
// paints. `transitionEnd` strips it the moment the fade lands.
const SKIN_FADE = motionTransition(easeOutQuick, 0.3);
const SKIN_ENTER = {
  opacity: 1,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' as const },
};
const SKIN_HIDDEN = { opacity: 0, filter: 'blur(8px)' };
// The exiting layer must never eat taps meant for the incoming skin.
const SKIN_EXIT = { ...SKIN_HIDDEN, pointerEvents: 'none' as const };

interface SignInFlowProps {
  /** The active skin's auth + wallet screens (from the registry). */
  AuthScreen: SkinAuthScreen;
  WalletScreen: SkinWalletScreen;
  /** Active skin id — keys the skin-switch crossfade. */
  skinId: string;
  /** Demo screen from the wallet logic — flips auth → wallet on sign-in. */
  screen: 'auth' | 'wallet';
  busy?: boolean;
  /** Auth methods selected in the Configure panel — drives the auth CTAs. */
  methods: AuthMethod[];
  onSignIn: (method: AuthMethod) => void;
  /** Skip the sign-in intro hold (fast-forward jumps land on the wallet instantly). */
  skipIntro?: boolean;
  /** Auth ⇄ wallet reveal style (from the skin registry). 'blur' (default)
   *  blur-dissolves the auth layer; 'fade' is the plain quick crossfade (what
   *  reduced motion already uses) — for skins whose auth screen ends on the
   *  wallet layout, where a full-screen blur pulse would read as a glitch. */
  authReveal?: 'blur' | 'fade';
  /** The live OTP flow, for skins that render it INLINE in their auth screen
   *  (registry `inlineAuthFlow`) — handed through so it shares the auth
   *  screen's render clock. Undefined for overlay (AuthSheet) skins. */
  authFlow?: SkinAuthFlow;
  /** Jump command handed to the wallet so the sidebar can provision + open a flow. */
  entry?: WalletEntry;
  /** The active skin's wallet-brain options (from the registry). */
  walletOptions?: WalletBrainOptions;
  /** Real book balance from the demo logic (e.g. "$225.00") — the wallet home's
   *  source of truth; see `UseWalletHomeOptions.balance`. */
  balance?: string;
  /** The account's real transaction history (GET /transactions), newest first. */
  activity?: WalletListItemData[];
  /** Real deposit details for the customer's fiat account (Add money → Bank). */
  depositInstructions?: DepositInstructions | null;
  /** The wallet account's total balance in cents (USDB `totalBalance`). */
  totalCents?: number;
  /** One-shot toast raised by an arrival webhook (nonce bumps per delivery). */
  walletToast?: { nonce: number; text: string } | null;
  /** Accounts Grid already holds, for the saved-banks list. */
  storedBanks?: SavedBank[];
  /** A stored account was picked — quote against that ExternalAccount id. */
  onSelectStoredBank?: (externalAccountId: string | null) => void;
  /** A country's deposit details came into (or left) view — the host offers the
   *  sandbox funding stand-in in the request panel off the back of this. */
  onDepositView?: (view: { label: string; currency: string; cents?: number } | null) => void;
  /** Bumped by the panel's "Simulate funding" button. */
  simulateDeposit?: { nonce: number; cents: number; last4: string } | null;
  /** Wallet events bubbled up so the demo logs the matching Grid API calls. */
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: (cents: number, merchant: string) => void;
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
  /** Credential state + the add-a-passkey action (the wallet's security nudge). */
  addPasskey?: { added: boolean; onAdd: () => void };
  /** Auth-side overlays (passkey / email sheets) — rendered with the auth screen. */
  children?: ReactNode;
  /** The same overlays for the WALLET screen: a signed action whose session has
   *  lapsed re-authenticates in place (an OTP sheet over the wallet), so the
   *  prompt needs a surface on this side of the flip too. */
  walletOverlays?: ReactNode;
}

interface WalletHostProps {
  WalletScreen: SkinWalletScreen;
  /** Active skin id — keys the view crossfade on skin switch. */
  skinId: string;
  entrance: boolean;
  entry?: WalletEntry;
  walletOptions?: WalletBrainOptions;
  balance?: string;
  activity?: WalletListItemData[];
  depositInstructions?: DepositInstructions | null;
  totalCents?: number;
  walletToast?: { nonce: number; text: string } | null;
  storedBanks?: SavedBank[];
  onSelectStoredBank?: (externalAccountId: string | null) => void;
  onDepositView?: (view: { label: string; currency: string; cents?: number } | null) => void;
  simulateDeposit?: { nonce: number; cents: number; last4: string } | null;
  onQuoteCreate?: (mode: WalletTransferMode, cents: number, dest?: TransferDest) => void;
  onLinkExternalAccount?: (input: ExternalAccountInput, label: string) => void;
  onTransferExecute?: (mode: WalletTransferMode, cents: number) => void;
  onCardIssued?: () => void;
  onTapToPay?: (cents: number, merchant: string) => void;
  onReceivePayment?: (info: ReceivePaymentInfo) => void;
  addPasskey?: { added: boolean; onAdd: () => void };
}

/**
 * Hosts the wallet + money-sheet BRAINS above the skin boundary. This component
 * stays mounted across skin switches (only the `WalletScreen` view type swaps
 * beneath it), so balance, activity, saved banks, mid-flow sheet position, and
 * the consumed `entry` nonce all survive a platform change — switching skins is
 * literally just a reskin. It unmounts on reset / return-to-sign-in, which is
 * what clears the session.
 */
function WalletHost({
  WalletScreen,
  skinId,
  entrance,
  entry,
  walletOptions,
  balance,
  activity,
  depositInstructions,
  totalCents,
  walletToast,
  storedBanks,
  onSelectStoredBank,
  onDepositView,
  simulateDeposit,
  onQuoteCreate,
  onLinkExternalAccount,
  onTransferExecute,
  onCardIssued,
  onTapToPay,
  onReceivePayment,
  addPasskey,
}: WalletHostProps) {
  const home = useWalletHome({
    balance,
    serverActivity: activity,
    entrance,
    entry,
    transferSuccessScreen: walletOptions?.transferSuccessScreen,
    onTransferExecute,
    onTapToPay,
    onReceivePayment,
  });
  // The money-sheet brain rides the wallet brain's sheet state. The wiring here
  // (quote guard, save-confirmation toasts) was identical across every skin —
  // it lives with the brains now.
  // The skin this host MOUNTED with — any other id means the user switched
  // platforms mid-session, so the incoming view is a fresh face over live
  // state (not the sign-in reveal). Skins that skip the sign-in stagger on
  // their live home (marketplace) still cascade in on a switch.
  const mountSkin = useRef(skinId);
  const switchedIn = skinId !== mountSkin.current;


  const money = useMoneySheet({
    open: home.sheetOpen,
    mode: home.sheetMode,
    availableCents: home.availableCents,
    depositInstructions,
    storedBanks,
    onSelectStoredBank,
    confirming: home.sheetConfirming,
    onDismiss: () => home.setSheetOpen(false),
    onConfirm: home.confirmTransfer,
    onQuote: (cents, dest) => {
      // Receive never reaches the amount step, so no quote fires for it.
      if (home.sheetMode !== 'receive') onQuoteCreate?.(home.sheetMode, cents, dest);
    },
    onLinkExternalAccount: (input, label) => {
      onLinkExternalAccount?.(input, label);
      // Confirm the save (fires after the sheet's 500ms validate beat).
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

  // Tell the host when a country's deposit details are on screen: in sandbox it
  // offers the funding stand-in as a card in the request list (no real wire is
  // coming), and the button there drives `simulateDeposit` below.
  const onDetails = money.step === 'fundingDetails' && home.sheetMode === 'add';
  const onCryptoAddress = money.step === 'depositAddress' && home.sheetMode === 'add';
  const detailsCountry = money.pickedCountry;
  const cryptoChain = money.depositChain;
  const cryptoCents = money.cents;
  useEffect(() => {
    if (onDetails && detailsCountry) {
      onDepositView?.({
        label: detailsCountry.name,
        currency: currencyFor(detailsCountry),
      });
      return;
    }
    if (onCryptoAddress && cryptoChain) {
      // The payer told us the amount here, so the stand-in can match it exactly.
      onDepositView?.({
        label: cryptoChain.name,
        currency: money.depositAsset,
        cents: cryptoCents,
      });
      return;
    }
    onDepositView?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDetails, detailsCountry, onCryptoAddress, cryptoChain, cryptoCents, onDepositView]);

  // An arrival webhook landed: show it on the phone (the brain owns the toast).
  const lastToast = useRef(0);
  useEffect(() => {
    if (!walletToast || walletToast.nonce === lastToast.current) return;
    lastToast.current = walletToast.nonce;
    home.showToast(walletToast.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletToast]);

  // The panel's "Simulate funding" button: same money path a confirmed add takes.
  const lastSimulated = useRef(0);
  useEffect(() => {
    if (!simulateDeposit || simulateDeposit.nonce === lastSimulated.current) return;
    lastSimulated.current = simulateDeposit.nonce;
    home.simulateBankDeposit(simulateDeposit.cents, simulateDeposit.last4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulateDeposit]);

  return (
    // Skin switch = same brain, new face: the outgoing view blur-fades out over
    // the incoming one, exactly where it was (same sheet step, same balance).
    <AnimatePresence initial={false}>
      <motion.div
        key={skinId}
        className={styles.skinLayer}
        initial={SKIN_HIDDEN}
        animate={{ ...SKIN_ENTER, transition: SKIN_FADE }}
        exit={{ ...SKIN_EXIT, transition: SKIN_FADE }}
      >
        <WalletScreen
          totalCents={totalCents}
          entrance={entrance}
          switchedIn={switchedIn}
          home={home}
          money={money}
          onCardIssued={onCardIssued}
          addPasskey={addPasskey}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Shared auth ⇄ wallet handoff with the post-sign-in intro — used by every skin.
 * When the demo flips `screen` to `wallet` (any auth method that lands directly —
 * passkey today), the auth screen is HELD while it plays its dismiss choreography
 * ending on the "Creating your account..." beat; then the wallet mounts BENEATH
 * it and the whole auth screen blur-fades away as the home staggers in. Reduced
 * motion skips the hold — just the crossfade.
 */
export function SignInFlow({
  AuthScreen,
  WalletScreen,
  skinId,
  screen,
  busy,
  methods,
  onSignIn,
  skipIntro,
  authReveal = 'blur',
  authFlow,
  entry,
  walletOptions,
  balance,
  activity,
  depositInstructions,
  totalCents,
  walletToast,
  storedBanks,
  onSelectStoredBank,
  onDepositView,
  simulateDeposit,
  onQuoteCreate,
  onLinkExternalAccount,
  onTransferExecute,
  onCardIssued,
  onTapToPay,
  onReceivePayment,
  addPasskey,
  children,
  walletOverlays,
}: SignInFlowProps) {
  const reduceMotion = useReducedMotion();
  // Plain crossfade instead of the blur dissolve: reduced motion, or a skin
  // that opts out because its auth screen already ends on the wallet layout.
  const plainSwap = reduceMotion || authReveal === 'fade';
  const [shown, setShown] = useState(screen);
  // 'hold' = intro playing (creating beat); 'leaving' = caption exiting.
  const [intro, setIntro] = useState<'none' | 'hold' | 'leaving'>('none');
  const introTimer = useRef(0);

  // Derive on prop change DURING render (the money sheet's reset pattern) so
  // the intro starts on the same frame the demo flips the screen.
  const [prevScreen, setPrevScreen] = useState(screen);
  if (screen !== prevScreen) {
    setPrevScreen(screen);
    // skipIntro = a fast-forward jump: land on the wallet immediately, no hold.
    if (screen === 'wallet' && !reduceMotion && !skipIntro) {
      setIntro('hold'); // hold the auth screen; the timers below sequence out
    } else {
      setShown(screen);
      setIntro('none');
    }
  }

  useEffect(() => {
    if (intro === 'none') return;
    introTimer.current = window.setTimeout(
      () => {
        if (intro === 'hold') {
          setIntro('leaving'); // caption out…
        } else {
          setShown('wallet'); // …then the swap + blur-fade reveal
          setIntro('none');
        }
      },
      intro === 'hold' ? INTRO_HOLD_MS : INTRO_LEAVE_MS,
    );
    return () => window.clearTimeout(introTimer.current);
  }, [intro]);

  return (
    <div className={styles.flow}>
      <AnimatePresence initial={false}>
        {shown === 'auth' ? (
          <motion.div
            key="auth"
            // Above the entering wallet so the exit reads as the auth screen
            // dissolving off the home, not the home fading in over it.
            className={clsx(styles.screen, styles.screenAuth)}
            initial={plainSwap ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)' }}
            animate={
              plainSwap
                ? { opacity: 1, transition: SWAP_FADE }
                : { opacity: 1, filter: 'blur(0px)', transition: REVEAL_IN }
            }
            exit={
              plainSwap
                ? { opacity: 0, transition: SWAP_FADE }
                : { opacity: 0, filter: 'blur(10px)', transition: REVEAL_OUT }
            }
          >
            {/* Keyed on the skin so a platform switch crossfades the auth face
                too (the overlays below are shared chrome and stay put). */}
            <AnimatePresence initial={false}>
              <motion.div
                key={skinId}
                className={styles.skinLayer}
                initial={SKIN_HIDDEN}
                animate={{ ...SKIN_ENTER, transition: SKIN_FADE }}
                exit={{ ...SKIN_EXIT, transition: SKIN_FADE }}
              >
                <AuthScreen
                  busy={busy}
                  methods={methods}
                  dismissed={intro !== 'none'}
                  leaving={intro === 'leaving'}
                  onSignIn={onSignIn}
                  authFlow={authFlow}
                />
              </motion.div>
            </AnimatePresence>
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="wallet"
            className={styles.screen}
            // Mount SOLID under the exiting auth screen — only the top layer
            // fades. Cross-fading both (wallet 0→1 while auth 1→0) lets the
            // page background bleed through mid-fade (~25% at the midpoint),
            // a visible flash even when the two layers are pixel-identical.
            // An EXPLICIT solid pose, not initial={false}: false propagates
            // down the motion tree and suppresses every descendant's entrance
            // (the wallet home's stagger reveal hard-cut in instead of
            // cascading under the dissolving auth layer).
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            // Stay solid underneath while the auth screen blur-fades in over it,
            // then unmount hidden — no peek at the background mid-transition.
            exit={{ opacity: 1, transition: REVEAL_IN }}
          >
            <WalletHost
              WalletScreen={WalletScreen}
              skinId={skinId}
              entrance={!reduceMotion}
              entry={entry}
              walletOptions={walletOptions}
              balance={balance}
              activity={activity}
              depositInstructions={depositInstructions}
              totalCents={totalCents}
              walletToast={walletToast}
              storedBanks={storedBanks}
              onSelectStoredBank={onSelectStoredBank}
              onDepositView={onDepositView}
              simulateDeposit={simulateDeposit}
              onQuoteCreate={onQuoteCreate}
              onLinkExternalAccount={onLinkExternalAccount}
              onTransferExecute={onTransferExecute}
              onCardIssued={onCardIssued}
              onTapToPay={onTapToPay}
              onReceivePayment={onReceivePayment}
              addPasskey={addPasskey}
            />
            {walletOverlays}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
