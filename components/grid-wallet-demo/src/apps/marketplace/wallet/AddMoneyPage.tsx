'use client';

import { useEffect, useState, type ReactNode, type UIEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { accountLast4, type MoneySheet, type SavedBank } from '@/apps/shared/wallet';
import { useSquircleClip } from '@/apps/shared/useSquircleClip';
import { easeOutQuick, easeOutSnappy, motionTransition } from '@/lib/easing';
import {
  IconArrowLeft,
  IconChevronRightMedium,
  IconBank,
  IconWallet2,
  IconCash,
  IconApple,
  type MarketplaceIcon,
} from '../icons';
import { MARKETPLACE_PUSH_DURATION, MARKETPLACE_PUSH_PARALLAX } from '../config';
import { SquareFlag } from '../blocks/SquareFlag';
import styles from './AddMoneyPage.module.scss';

const PUSH_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_PUSH_DURATION);
const STEP_TRANSITION = PUSH_TRANSITION;
const BAR_TITLE_TRANSITION = motionTransition(easeOutQuick, 0.2);

// The left-edge drop shadow rides the slide as an ANIMATED value: a static CSS
// shadow still casts onto the screen when the page sits just off the right
// edge, then pops when the exit unmounts — fading it with the travel instead
// makes it arrive and leave with the page.
const EDGE_SHADOW_ON = '-16px 0 48px rgba(0, 0, 0, 0.2)';
const EDGE_SHADOW_OFF = '-16px 0 48px rgba(0, 0, 0, 0)';

/** Scroll distance (px) after which the large title is fully under the header
 *  bar — the hairline shows and the 14px bar title slides in. */
const TITLE_COLLAPSE_AT = 46;

// In-page step navigation — the SAME layered push as wallet home → this page:
// the deeper screen slides in ON TOP (edge shadow riding the travel, z 2)
// while the one underneath parallax-shifts back behind a scrim (z 1). On pop
// the top screen slides back out and the underlayer glides forward again.
// The element travelling the full width is always the top layer, so z-order
// follows the direction: forward → the ENTERING step is on top; back → the
// EXITING one is.
type NavDir = { back: boolean; reduceMotion: boolean };
const stepVariants = {
  enter: ({ back, reduceMotion }: NavDir) =>
    reduceMotion
      ? { x: 0, opacity: 1 }
      : back
        ? { x: -MARKETPLACE_PUSH_PARALLAX, zIndex: 1, boxShadow: EDGE_SHADOW_OFF }
        : { x: '100%', zIndex: 2, boxShadow: EDGE_SHADOW_OFF },
  center: ({ back, reduceMotion }: NavDir) =>
    reduceMotion
      ? { x: 0, opacity: 1 }
      : { x: 0, zIndex: back ? 1 : 2, boxShadow: back ? EDGE_SHADOW_OFF : EDGE_SHADOW_ON },
  exit: ({ back, reduceMotion }: NavDir) =>
    reduceMotion
      ? { opacity: 0 }
      : back
        ? { x: '100%', zIndex: 2, boxShadow: EDGE_SHADOW_OFF }
        : { x: -MARKETPLACE_PUSH_PARALLAX, zIndex: 1, boxShadow: EDGE_SHADOW_OFF },
};

// Empty-state reveal (the Z/Aurora WalletListCard choreography): skeleton rows
// hold, a cover fades them down, then the message + CTA blur/slide in.
const EMPTY_INITIAL_DELAY_S = 1.2;
const EMPTY_REVEAL_DURATION_S = 0.55;
const EMPTY_CONTENT_STAGGER_S = 0.2;
const MESSAGE_HIDDEN = { opacity: 0, y: 24, filter: 'blur(10px)' };
const MESSAGE_VISIBLE = { opacity: 1, y: 0, filter: 'blur(0px)' };

/** Source visuals — the FACE owns icon + copy per source id; the brain supplies
 *  only the ordered ids + routing (same split as Aurora's SOURCE_COPY). */
const SOURCE_COPY: Record<string, { Icon: MarketplaceIcon; title: string; sub: string }> = {
  bank: { Icon: IconBank, title: 'Bank account', sub: 'Local transfer in 65+ countries' },
  crypto: { Icon: IconWallet2, title: 'Crypto wallet', sub: 'Spark, Solana, Base address' },
  cashapp: { Icon: IconCash, title: 'Cash App', sub: 'Use your Cash App balance' },
  applepay: { Icon: IconApple, title: 'Apple Pay', sub: 'Use Apple Wallet' },
};

const PAGE_TITLE = 'Deposit';

/** Steps that have a marketplace face so far — a source row only navigates when
 *  its target is built (the rest stay press-feel no-ops until designed). */
const BUILT_STEPS = new Set(['banks']);

interface AddMoneyPageProps {
  /** The shared money-sheet brain (step machine, sources, banks, routing). */
  m: MoneySheet;
  open: boolean;
  onDismiss: () => void;
}

/**
 * Marketplace deposit flow — an iOS navigation PUSH, not a sheet: the page
 * slides in from the right over the wallet (left-edge drop shadow riding the
 * slide) while the wallet parallax-shifts behind it (see MarketplaceWalletScreen).
 * In-page steps (source list → select bank) push with the same mechanism.
 * Header echoes the wallet home's bar; on scroll the large title tucks under
 * the bar, which then gains its hairline + a 14px centered bar title.
 */
export function AddMoneyPage({ m, open, onDismiss }: AddMoneyPageProps) {
  const reduceMotion = useReducedMotion();
  const navDir: NavDir = { back: m.back, reduceMotion: !!reduceMotion };

  // Only source + banks have marketplace faces so far. A mid-flow skin switch
  // can land the brain DEEPER (country/amount/…) — show the nearest built view
  // so the page never renders blank; back still walks the brain's real path.
  const viewStep: 'source' | 'banks' = m.step === 'source' ? 'source' : 'banks';
  const stepTitle = viewStep === 'banks' ? m.titles.banks : PAGE_TITLE;
  const handleBack = () => {
    const backTo = m.backFrom[m.step];
    if (m.isEntryStep || !backTo) onDismiss();
    else m.go(backTo, true);
  };

  // Large-title collapse tracks the CURRENT step's scroll; a push lands on a
  // fresh, un-collapsed screen.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setCollapsed(false), [viewStep]);
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setCollapsed(e.currentTarget.scrollTop >= TITLE_COLLAPSE_AT);
  };

  // Saved banks only (the shared list can carry crypto recipients in send mode).
  const banks = m.banks.filter((b): b is SavedBank => !('address' in b));

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="deposit-page"
          className={styles.page}
          initial={reduceMotion ? { opacity: 0 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF }}
          animate={reduceMotion ? { opacity: 1 } : { x: 0, boxShadow: EDGE_SHADOW_ON }}
          exit={reduceMotion ? { opacity: 0 } : { x: '100%', boxShadow: EDGE_SHADOW_OFF }}
          transition={PUSH_TRANSITION}
        >
          <header className={styles.headerBar} data-collapsed={collapsed || undefined}>
            <button type="button" className={styles.backBtn} aria-label="Back" onClick={handleBack}>
              <IconArrowLeft size={24} />
            </button>
            <AnimatePresence initial={false}>
              {collapsed && (
                <motion.span
                  key={`bar-title-${viewStep}`}
                  className={styles.barTitle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={BAR_TITLE_TRANSITION}
                >
                  {stepTitle}
                </motion.span>
              )}
            </AnimatePresence>
            {/* "Add bank" pill (the Airbnb "Details" header button) — rides the
                banks step, empty or not. */}
            <AnimatePresence initial={false}>
              {viewStep === 'banks' && (
                <motion.button
                  key="add-bank-pill"
                  type="button"
                  className={styles.headerPill}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={BAR_TITLE_TRANSITION}
                >
                  Add bank
                </motion.button>
              )}
            </AnimatePresence>
          </header>

          <div className={styles.steps} key={m.openKey}>
            <AnimatePresence initial={false} custom={navDir}>
              {viewStep === 'source' && (
                <motion.div
                  key="source"
                  className={styles.step}
                  custom={navDir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>{PAGE_TITLE}</h1>
                    <div className={styles.list}>
                      {m.sources.map((id, i) => {
                        const copy = SOURCE_COPY[id];
                        if (!copy) return null;
                        const { Icon } = copy;
                        const active = m.activeSources.find((a) => a.id === id);
                        return (
                          <SourceRow
                            key={id}
                            Icon={Icon}
                            title={copy.title}
                            sub={copy.sub}
                            disabled={!active}
                            bordered={i < m.sources.length - 1}
                            onClick={
                              active && BUILT_STEPS.has(active.next)
                                ? () => m.go(active.next)
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {viewStep === 'banks' && (
                <motion.div
                  key="banks"
                  className={styles.step}
                  custom={navDir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_TRANSITION}
                >
                  <div className={styles.scroll} onScroll={handleScroll}>
                    <h1 className={styles.title}>{m.titles.banks}</h1>
                    {banks.length === 0 ? (
                      <BanksEmptyState reduceMotion={!!reduceMotion} />
                    ) : (
                      <div className={styles.list}>
                        {banks.map((b) => (
                          <button key={b.id} type="button" className={styles.row}>
                            <BankFlagTile code={b.country.code} />
                            <span className={styles.rowLines}>
                              <span className={styles.rowTitle}>{b.bankName}</span>
                              <span className={styles.rowSub}>
                                {/* Middle dots (U+00B7) — Circular's real bullet is huge. */}
                                {b.country.name} &middot;&middot;&middot;&middot; {accountLast4(b.values)}
                              </span>
                            </span>
                            <span className={styles.rowChevron} aria-hidden>
                              <IconChevronRightMedium size={20} />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Depth scrim — sits between the two layers (after the steps in
                DOM at z 1, so above the receding underlayer, under the z-2 top
                screen). Fades with the push on the same clock, exactly like
                the wallet-level pushScrim behind this page. */}
            {!reduceMotion && (
              <motion.div
                className={styles.stepScrim}
                initial={false}
                animate={{ opacity: viewStep === 'banks' ? 1 : 0 }}
                transition={STEP_TRANSITION}
                aria-hidden
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 40px squircle (r10) tile clipping the SQUARE flag. */
function BankFlagTile({ code }: { code: string }) {
  const clip = useSquircleClip<HTMLSpanElement>({ figmaRadii: 10 });
  return (
    <span ref={clip.ref} style={clip.style} className={styles.flagTile} aria-hidden>
      <SquareFlag code={code} />
    </span>
  );
}

/** Brand-pink CTA — hugs its contents, 48px tall. */
function PinkCta({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const clip = useSquircleClip<HTMLButtonElement>({ figmaRadii: 12 });
  return (
    <button type="button" className={styles.pinkCta} ref={clip.ref} style={clip.style} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * "Select bank" empty state — the Z/Aurora reveal on marketplace chrome:
 * skeleton bank rows (40px squircle flag tile + two pills, no dividers) hold
 * for a beat, a cover gradient fades them down, and the centered message +
 * pink CTA blur/slide in.
 */
function BanksEmptyState({ reduceMotion }: { reduceMotion: boolean }) {
  const [coverVisible, setCoverVisible] = useState(reduceMotion);
  const [contentVisible, setContentVisible] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const coverTimer = window.setTimeout(
      () => setCoverVisible(true),
      EMPTY_INITIAL_DELAY_S * 1000,
    );
    const contentTimer = window.setTimeout(
      () => setContentVisible(true),
      (EMPTY_INITIAL_DELAY_S + EMPTY_CONTENT_STAGGER_S) * 1000,
    );
    return () => {
      window.clearTimeout(coverTimer);
      window.clearTimeout(contentTimer);
    };
  }, [reduceMotion]);

  return (
    <div className={styles.empty}>
      <div className={styles.skeletonList} aria-hidden>
        <SkeletonBankRow titleWidth={96} subWidth={150} />
        <SkeletonBankRow titleWidth={128} subWidth={112} />
        <div
          className={styles.skeletonCover}
          data-visible={coverVisible || undefined}
          style={{ ['--cover-duration' as string]: `${EMPTY_REVEAL_DURATION_S}s` }}
        />
      </div>

      <div className={styles.emptyMessageLayer}>
        <motion.div
          className={styles.emptyMessage}
          initial={reduceMotion ? false : MESSAGE_HIDDEN}
          animate={contentVisible ? MESSAGE_VISIBLE : MESSAGE_HIDDEN}
          transition={motionTransition(undefined, EMPTY_REVEAL_DURATION_S)}
        >
          <div className={styles.emptyText}>
            <p className={styles.emptyTitle}>No bank accounts yet</p>
            <p className={styles.emptySub}>Add a bank account in 65+ countries to get started</p>
          </div>
          <PinkCta>Add bank</PinkCta>
        </motion.div>
      </div>
    </div>
  );
}

function SkeletonBankRow({ titleWidth, subWidth }: { titleWidth: number; subWidth: number }) {
  const clip = useSquircleClip<HTMLSpanElement>({ figmaRadii: 10 });
  return (
    <div className={styles.skeletonRow}>
      <span ref={clip.ref} style={clip.style} className={styles.skeletonTile} />
      <span className={styles.skeletonLines}>
        <span className={styles.skeletonPill} style={{ width: titleWidth, height: 14 }} />
        <span className={styles.skeletonPill} style={{ width: subWidth, height: 12 }} />
      </span>
    </div>
  );
}

/** One source row — bare icon (no tile), two lines, inset divider below. */
function SourceRow({
  Icon,
  title,
  sub,
  disabled,
  bordered,
  onClick,
}: {
  Icon: MarketplaceIcon;
  title: string;
  sub: string;
  disabled: boolean;
  bordered: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.row}
      disabled={disabled}
      data-bordered={bordered || undefined}
      onClick={onClick}
    >
      <span className={styles.rowIcon}>
        <Icon size={28} />
      </span>
      <span className={styles.rowLines}>
        <span className={styles.rowTitle}>{title}</span>
        <span className={styles.rowSub}>{sub}</span>
      </span>
      <span className={styles.rowChevron} aria-hidden>
        <IconChevronRightMedium size={20} />
      </span>
    </button>
  );
}
