'use client';

import clsx from 'clsx';
import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import { IconSnowFlakes } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSnowFlakes';
import { IconEyeOpen } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeOpen';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconGauge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGauge';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconChevronRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRight';
import type { CardControls, WalletListItemData } from '@/apps/shared/wallet';
import { formatUsdCents } from '@/apps/shared/wallet';
import { WalletListSection } from './WalletListSection';
import styles from './CardHomeContent.module.scss';

interface CardHomeContentProps {
  /** Card-home transactions; the empty state shows when there are none. */
  transactions?: WalletListItemData[];
  card: CardControls;
  /** Start the tap-to-pay flow. */
  onTapToPay?: () => void;
  /** Reveal details (Face ID first). */
  onReveal?: () => void;
}

function limitsSummary(card: CardControls): string {
  const { perTransactionCents, perDayCents } = card.limits;
  if (perTransactionCents === null && perDayCents === null) return 'No limits set';
  const parts = [
    perTransactionCents !== null ? `${formatUsdCents(perTransactionCents)} per purchase` : null,
    perDayCents !== null ? `${formatUsdCents(perDayCents)} per day` : null,
  ].filter(Boolean);
  return parts.join(' · ');
}

/** Card-home body: action row (Freeze / Details / Wallet), Tap to pay, the
 *  controls list, then the transactions list. */
export function CardHomeContent({ transactions, card, onTapToPay, onReveal }: CardHomeContentProps) {
  const { frozen, closed, inWallet, limits } = card;
  const dailyPct =
    limits.perDayCents !== null
      ? Math.min(1, card.dailyUsedCents / Math.max(1, limits.perDayCents))
      : 0;

  return (
    <>
      <div className={styles.actionRow} role="group" aria-label="Card actions">
        <button
          type="button"
          className={clsx(styles.action, frozen && styles.actionOn)}
          onClick={() => card.setFrozen(!frozen)}
          disabled={closed}
          aria-pressed={frozen}
        >
          <span className={styles.actionIcon}>
            <IconSnowFlakes size={22} />
          </span>
          <span className={styles.actionLabel}>{frozen ? 'Unfreeze' : 'Freeze'}</span>
        </button>
        <button type="button" className={styles.action} onClick={onReveal} disabled={closed}>
          <span className={styles.actionIcon}>
            <IconEyeOpen size={22} />
          </span>
          <span className={styles.actionLabel}>Details</span>
        </button>
        <button
          type="button"
          className={clsx(styles.action, inWallet && styles.actionOn)}
          onClick={card.startAddToWallet}
          disabled={closed || inWallet}
        >
          <span className={styles.actionIcon}>
            <IconWallet1 size={22} />
          </span>
          <span className={styles.actionLabel}>{inWallet ? 'In Wallet' : 'Wallet'}</span>
        </button>
      </div>

      <div className={styles.walletBtnWrap}>
        <button type="button" className={styles.walletBtn} onClick={onTapToPay} disabled={closed}>
          <span className={styles.walletLabel}>{closed ? 'Card closed' : 'Tap to pay'}</span>
          {!closed && <IconNfc1 className={styles.walletIcon} size={20} aria-hidden />}
        </button>
      </div>

      <section className={styles.controls} aria-label="Card controls">
        <button
          type="button"
          className={styles.controlRow}
          onClick={() => card.setSheet('limits')}
          disabled={closed}
        >
          <span className={styles.controlIcon}>
            <IconGauge size={20} />
          </span>
          <span className={styles.controlText}>
            <span className={styles.controlTitle}>Spending limits</span>
            <span className={styles.controlSub}>{limitsSummary(card)}</span>
            {limits.perDayCents !== null && (
              <span className={styles.gauge} aria-hidden>
                <span className={styles.gaugeFill} style={{ transform: `scaleX(${dailyPct})` }} />
              </span>
            )}
          </span>
          <IconChevronRight className={styles.chevron} size={16} aria-hidden />
        </button>
        <button
          type="button"
          className={clsx(styles.controlRow, styles.controlRowDanger)}
          onClick={() => card.setSheet('close')}
        >
          <span className={styles.controlIcon}>
            <IconCrossMedium size={20} />
          </span>
          <span className={styles.controlText}>
            <span className={styles.controlTitle}>{closed ? 'Card closed' : 'Close card'}</span>
            <span className={styles.controlSub}>
              {closed ? 'This card can no longer be used' : 'Permanent — you can issue a new one'}
            </span>
          </span>
          <IconChevronRight className={styles.chevron} size={16} aria-hidden />
        </button>
      </section>

      <WalletListSection
        title="Transactions"
        emptyTitle="Nothing here, yet"
        emptySub={
          <>
            Transactions using your debit
            <br />
            card will show up here
          </>
        }
        items={transactions}
        onItemClick={card.openTransaction}
        concentricBottom
        grow
      />
    </>
  );
}
