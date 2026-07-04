'use client';

import { useState, type UIEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { MoneySheet } from '@/apps/shared/wallet';
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
import { MARKETPLACE_PUSH_DURATION } from '../config';
import styles from './AddMoneyPage.module.scss';

const PUSH_TRANSITION = motionTransition(easeOutSnappy, MARKETPLACE_PUSH_DURATION);
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

/** Source visuals — the FACE owns icon + copy per source id; the brain supplies
 *  only the ordered ids + routing (same split as Aurora's SOURCE_COPY). */
const SOURCE_COPY: Record<string, { Icon: MarketplaceIcon; title: string; sub: string }> = {
  bank: { Icon: IconBank, title: 'Bank account', sub: 'Local transfer in 65+ countries' },
  crypto: { Icon: IconWallet2, title: 'Crypto wallet', sub: 'Spark, Solana, Base address' },
  cashapp: { Icon: IconCash, title: 'Cash App', sub: 'Use your Cash App balance' },
  applepay: { Icon: IconApple, title: 'Apple Pay', sub: 'Use Apple Wallet' },
};

const PAGE_TITLE = 'Deposit';

interface AddMoneyPageProps {
  /** The shared money-sheet brain (step machine, sources, routing). */
  m: MoneySheet;
  open: boolean;
  onDismiss: () => void;
}

/**
 * Marketplace deposit flow — an iOS navigation PUSH, not a sheet: the page
 * slides in from the right over the wallet (left-edge drop shadow riding the
 * slide) while the wallet parallax-shifts behind it (see MarketplaceWalletScreen).
 * Header echoes the wallet home's bar; on scroll the large title tucks under
 * the bar, which then gains its hairline + a 14px centered bar title.
 * First screen only this pass: the source list (rows are decorative until the
 * next steps get their marketplace faces).
 */
export function AddMoneyPage({ m, open, onDismiss }: AddMoneyPageProps) {
  const reduceMotion = useReducedMotion();

  const [collapsed, setCollapsed] = useState(false);
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setCollapsed(e.currentTarget.scrollTop >= TITLE_COLLAPSE_AT);
  };

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
            <button type="button" className={styles.backBtn} aria-label="Back" onClick={onDismiss}>
              <IconArrowLeft size={24} />
            </button>
            <AnimatePresence initial={false}>
              {collapsed && (
                <motion.span
                  key="bar-title"
                  className={styles.barTitle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={BAR_TITLE_TRANSITION}
                >
                  {PAGE_TITLE}
                </motion.span>
              )}
            </AnimatePresence>
          </header>

          <div className={styles.scroll} onScroll={handleScroll}>
            <h1 className={styles.title}>{PAGE_TITLE}</h1>
            <div className={styles.list}>
              {m.sources.map((id, i) => {
                const copy = SOURCE_COPY[id];
                if (!copy) return null;
                const { Icon } = copy;
                // No demo path (the brain lists it but routes nowhere) → the
                // row is a no-op and dims when the pointer enters the list.
                const active = m.activeSources.some((a) => a.id === id);
                return (
                  <SourceRow
                    key={id}
                    Icon={Icon}
                    title={copy.title}
                    sub={copy.sub}
                    disabled={!active}
                    bordered={i < m.sources.length - 1}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** One source row — bare icon (no tile), two lines, inset divider below. */
function SourceRow({
  Icon,
  title,
  sub,
  disabled,
  bordered,
}: {
  Icon: MarketplaceIcon;
  title: string;
  sub: string;
  disabled: boolean;
  bordered: boolean;
}) {
  return (
    <button
      type="button"
      className={styles.row}
      disabled={disabled}
      data-bordered={bordered || undefined}
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
