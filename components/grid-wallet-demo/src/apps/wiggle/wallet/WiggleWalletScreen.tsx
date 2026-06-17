'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  IconArrowBottomTop,
  IconArrowDownLeft,
  IconCreditCard2,
  IconPlusMedium,
  IconSettingsGear2,
} from '../icons';
import { useScreenOverlay } from '@/apps/shared/AppShell/ScreenOverlayContext';
import { FaceIdAuth } from '@/apps/shared/FaceIdAuth';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { GlassToast } from '@/apps/shared/GlassToast';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import { formatUsdCents, useWalletHome } from '@/apps/shared/wallet';
import { AddMoneySheet } from './AddMoneySheet';
import { CardHomeContent } from '@/apps/aurora/wallet/CardHomeContent';
import { CreatingCaption, IntroContent, ReadyContent } from '@/apps/aurora/wallet/CardIssuanceContent';
import { DebitCard } from '@/apps/aurora/wallet/DebitCard';
import { SendReceiveSheet } from '@/apps/aurora/wallet/SendReceiveSheet';
import { TapToPayStatus } from '@/apps/aurora/wallet/TapToPayStatus';
import { WalletCardDetailHeader } from '@/apps/aurora/wallet/WalletCardDetailHeader';
import { WalletListSection } from '@/apps/aurora/wallet/WalletListSection';
import type { SkinWalletScreenProps } from '@/apps/types';
import { SkinTabBar } from '../blocks/SkinTabBar';
import { WIGGLE_LOGO, WIGGLE_TAB_BAR } from '../config';
import { WiggleInsightCards } from './WiggleInsightCards';
import styles from './WiggleWalletScreen.module.scss';

const SHEET_DURATION = 0.4;
const HEADER_DURATION = 0.2;
const CARD_ISSUANCE_SCALE = 338 / 370;
const SHEET_OFFSCREEN = 'calc(100% + 224px)';
const TAP_LIFT = -56;

const HEADER_TRANSITION = motionTransition(easeOutQuick, HEADER_DURATION);
const SHEET_SLIDE = motionTransition(easeOutSnappy, SHEET_DURATION);
const CARD_TRANSITION = motionTransition(easeOutSnappy, 0.5);
const WASH_IN = motionTransition(easeOutQuick, 0.5, { delay: 0.15 });
const WASH_OUT = motionTransition(easeOutQuick, 0.3);
const CONTENT_IN = motionTransition(easeOutQuick, 0.4, { delay: 0.3 });
const CONTENT_OUT = motionTransition(easeOutQuick, 0.2);
const TAB_INDICATOR = motionTransition(easeOutSnappy, 0.35);

const HEADER_HIDDEN = { opacity: 0, filter: 'blur(10px)' };
const HEADER_VISIBLE = { opacity: 1, filter: 'blur(0px)' };
const CONTENT_HIDDEN = { opacity: 0, y: 12, filter: 'blur(8px)' };
const CONTENT_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

const ACTIVITY_TABS = ['All', 'Sent', 'Received'];

/** Wiggle (creator) wallet home — Twitch-style: scrolling brand header, purple
 *  wash balance hero, Deposit/Withdraw/Send, Yield + Followers metrics, filtered
 *  activity, decorative tab bar. All app logic is the shared `useWalletHome`; the
 *  card-issuance / tap-to-pay choreography reuses the shared flows. */
export function WiggleWalletScreen(props: SkinWalletScreenProps) {
  const { entrance = false, onQuoteCreate, onLinkExternalAccount, onCardIssued } = props;
  const reduceMotion = useReducedMotion();
  const overlayEl = useScreenOverlay();

  const {
    cardView,
    setCardView,
    issued,
    tapPhase,
    setTapPhase,
    transactions,
    sheetMode,
    sheetOpen,
    setSheetOpen,
    sheetConfirming,
    sendReceiveOpen,
    setSendReceiveOpen,
    toast,
    setToast,
    showToast,
    availableCents,
    earningsTodayCents,
    apyPercent,
    homeActivity,
    isOpen,
    isIssuance,
    showFullAurora,
    cardCentered,
    isTap,
    openSheet,
    startSend,
    startReceive,
    openCard,
    startTapToPay,
    finishTransfer,
    confirmTransfer,
    handleReceivePayment,
  } = useWalletHome(props);

  const reveal = useStaggerReveal({ baseDelay: 0.05, stagger: 0.07 });
  const enter = (index: number) => (entrance ? reveal(index) : { initial: false as const });

  const [activityTab, setActivityTab] = useState(0);
  const filteredActivity = useMemo(() => {
    const tab = ACTIVITY_TABS[activityTab];
    if (tab === 'Sent') return homeActivity.filter((r) => !r.amount.includes('+'));
    if (tab === 'Received') return homeActivity.filter((r) => r.amount.includes('+'));
    return homeActivity;
  }, [activityTab, homeActivity]);

  const overlayContent = (
    <>
      <FaceIdAuth
        active={tapPhase === 'auth' || sheetConfirming}
        onDone={() => {
          if (sheetConfirming) finishTransfer();
          else setTapPhase('done');
        }}
      />
      <GlassToast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
  const screenOverlay = overlayEl ? (
    createPortal(overlayContent, overlayEl)
  ) : (
    <div className={styles.faceIdLayer}>{overlayContent}</div>
  );

  return (
    <div className={styles.root}>
      {/* Purple brand wash behind the card during issuance (in place of Aurora's
          WebGL field). Same fade language so the bottom content reads on the bg. */}
      <AnimatePresence>
        {showFullAurora && (
          <motion.div
            key="wash"
            className={styles.fullAurora}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, transition: WASH_IN }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transition: WASH_OUT }}
          >
            <div className={styles.fullWash} />
            <div
              className={clsx(styles.auroraFade, cardView === 'creating' && styles.auroraFadeHidden)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinned header only for the card-detail view — the home header rides the
          scroll (first child of the body below). */}
      {isOpen && (
        <header className={styles.header}>
          <AnimatePresence initial={false}>
            {isTap ? null : (
              <motion.div
                key="detail-header"
                className={styles.headerInner}
                initial={reduceMotion ? false : HEADER_HIDDEN}
                animate={HEADER_VISIBLE}
                exit={HEADER_HIDDEN}
                transition={HEADER_TRANSITION}
              >
                <WalletCardDetailHeader
                  onClose={() => setCardView('closed')}
                  showActions={cardView === 'home'}
                  closeOnAurora={showFullAurora}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      {!isOpen && !isTap && (
        <div className={styles.topFade} aria-hidden>
          <div className={clsx(styles.fadeBlur, styles.fadeBlurStrong)} />
          <div className={clsx(styles.fadeBlur, styles.fadeBlurMid)} />
          <div className={clsx(styles.fadeBlur, styles.fadeBlurSoft)} />
          <div className={styles.fadeTint} />
        </div>
      )}

      <motion.div
        className={clsx(
          styles.body,
          !isOpen && styles.bodyHome,
          isOpen && styles.bodyOpen,
          isTap && styles.bodyTap,
        )}
        initial={false}
        animate={{ y: isTap ? TAP_LIFT : 0 }}
        transition={CARD_TRANSITION}
      >
        {/* Scrolling brand header — avatar + settings + debit card. */}
        {!isOpen && !isTap && (
          <div className={styles.headerScroll}>
            <img
              className={styles.avatar}
              src={WIGGLE_LOGO}
              alt=""
              aria-hidden
              draggable={false}
            />
            <div className={styles.headerButtons}>
              <button type="button" className={styles.headerButton} aria-label="Settings">
                <IconSettingsGear2 size={24} />
              </button>
              <button
                type="button"
                className={styles.headerButton}
                aria-label="Debit card"
                onClick={openCard}
              >
                <IconCreditCard2 size={24} />
              </button>
            </div>
          </div>
        )}

        {/* The debit card — hidden on the closed home (the balance hero takes the
            slot); it still mounts for the issuance / card-home flow. */}
        {isOpen && (
          <div
            className={clsx(
              styles.cardArea,
              cardCentered ? styles.cardAreaCentered : styles.cardAreaTop,
              cardView === 'creating' && styles.cardAreaCreating,
            )}
          >
            <motion.div
              layout={!reduceMotion && !isTap}
              className={styles.cardCarry}
              transition={CARD_TRANSITION}
            >
              <motion.div
                className={styles.cardScale}
                initial={false}
                animate={{ scale: isIssuance ? CARD_ISSUANCE_SCALE : 1 }}
                transition={CARD_TRANSITION}
              >
                <motion.div {...enter(0)}>
                  <DebitCard
                    interactive={!isOpen}
                    onOpen={openCard}
                    bordered={showFullAurora}
                    showNumber={!showFullAurora}
                    issued={issued}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
            {cardView === 'creating' && <CreatingCaption />}
          </div>
        )}

        {/* Closed-home content rides the scroll; slides down out of the way when
            the card opens. */}
        <motion.div
          className={clsx(styles.sheetWrap, isOpen && styles.sheetWrapOpen)}
          initial={false}
          animate={{ y: isOpen ? SHEET_OFFSCREEN : 0 }}
          transition={SHEET_SLIDE}
        >
          {!isOpen && (
            <>
              <motion.div {...enter(1)} className={styles.heroWash}>
                <span className={styles.balanceLabel}>Available Balance</span>
                <span className={styles.balanceAmount}>{formatUsdCents(availableCents)}</span>
                <div className={styles.actions}>
                  <button type="button" className={styles.action} onClick={() => openSheet('add')}>
                    <IconPlusMedium size={20} />
                    <span>Deposit</span>
                  </button>
                  <button
                    type="button"
                    className={styles.action}
                    onClick={() => openSheet('withdraw')}
                  >
                    <IconArrowDownLeft size={20} />
                    <span>Withdraw</span>
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.action, styles.actionIcon)}
                    aria-label="Send"
                    onClick={() => setSendReceiveOpen(true)}
                  >
                    <IconArrowBottomTop size={20} />
                  </button>
                </div>
              </motion.div>

              <motion.div {...enter(2)}>
                <WiggleInsightCards earningsTodayCents={earningsTodayCents} apyPercent={apyPercent} />
              </motion.div>

              <motion.div
                {...enter(3)}
                className={styles.activityTabs}
                role="tablist"
                aria-label="Activity filter"
              >
                {ACTIVITY_TABS.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={i === activityTab}
                    className={clsx(styles.activityTab, i === activityTab && styles.activityTabActive)}
                    onClick={() => setActivityTab(i)}
                  >
                    {t}
                    {i === activityTab && (
                      <motion.span
                        layoutId="wiggleTabIndicator"
                        className={styles.activityIndicator}
                        transition={reduceMotion ? { duration: 0 } : TAB_INDICATOR}
                      />
                    )}
                  </button>
                ))}
              </motion.div>

              <WalletListSection
                title="Activity"
                hideTitle
                emptyTitle="Nothing here, yet"
                emptySub={
                  <>
                    Fund your account to start
                    <br />
                    using your wallet
                  </>
                }
                cta={{ label: 'Add money', onClick: () => openSheet('add') }}
                items={filteredActivity}
                concentricBottom
                grow
              />
            </>
          )}
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          {cardView === 'intro' && (
            <motion.div
              key="intro"
              className={styles.bottomContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <IntroContent
                onCreate={() => {
                  setCardView('creating');
                  onCardIssued?.();
                }}
              />
            </motion.div>
          )}
          {cardView === 'ready' && (
            <motion.div
              key="ready"
              className={styles.bottomContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <ReadyContent onContinue={() => setCardView('home')} />
            </motion.div>
          )}
          {cardView === 'home' && !isTap && (
            <motion.div
              key="home"
              className={styles.homeContent}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <CardHomeContent transactions={transactions} onTapToPay={startTapToPay} />
            </motion.div>
          )}
          {isTap && (
            <motion.div
              key="tap"
              className={styles.tapStatus}
              initial={reduceMotion ? false : CONTENT_HIDDEN}
              animate={reduceMotion ? CONTENT_VISIBLE : { ...CONTENT_VISIBLE, transition: CONTENT_IN }}
              exit={reduceMotion ? { opacity: 0 } : { ...CONTENT_HIDDEN, transition: CONTENT_OUT }}
            >
              <TapToPayStatus phase={tapPhase === 'idle' ? 'hold' : tapPhase} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!isOpen && !isTap ? <SkinTabBar {...WIGGLE_TAB_BAR} /> : null}

      <SendReceiveSheet
        open={sendReceiveOpen}
        onDismiss={() => setSendReceiveOpen(false)}
        onSend={startSend}
        onReceive={startReceive}
      />

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
