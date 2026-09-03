'use client';

import clsx from 'clsx';
import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import { CardStage } from '@/components/CardStage/CardStage';
import { DemoPhone } from '@/components/DemoPhone/DemoPhone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { DEFAULT_OVERLAY_GLASS } from '@/apps/shared/glass';
import { useCardHome, type UseCardHomeOptions, type WalletEntry } from '@/apps/shared/card';
import type { ActionId } from '@/data/actions';
import type { CardDesign } from '@/data/design';
import styles from './AppPanel.module.scss';

export interface AppPanelProps {
  design: CardDesign;
  /** Bumped on reset; remounts the brain so everything starts clean. */
  session: number;
  /** The flow the phone is up for; null = bare card stage. */
  activeFlow: ActionId | null;
  /** The last flow that brought the phone in (survives the dismiss). */
  phoneFlow: ActionId | null;
  /** Issue tapped on the bare-card stage. */
  onIssue: () => void;
  /** Jump command for the brain (sidebar → provision + run a flow). */
  walletEntry?: WalletEntry;
  onCardIssued?: () => void;
  onTapToPay?: UseCardHomeOptions['onTapToPay'];
  onTapDeclined?: UseCardHomeOptions['onTapDeclined'];
  cardOptions?: UseCardHomeOptions['card'];
  onSettled?: () => void;
}

/** The stage: the card, always; the cardholder's phone slides in for a flow. */
export function AppPanel({ session, ...props }: AppPanelProps) {
  // Keyed on the session so Reset remounts the brain with fresh state.
  return <StageHost key={session} {...props} />;
}

function StageHost({
  design,
  activeFlow,
  phoneFlow,
  onIssue,
  walletEntry,
  onCardIssued,
  onTapToPay,
  onTapDeclined,
  cardOptions,
  onSettled,
}: Omit<AppPanelProps, 'session'>) {
  const home = useCardHome({
    entry: walletEntry,
    onCardIssued,
    onTapToPay,
    onTapDeclined,
    card: cardOptions,
    onSettled,
  });
  const phoneVisible = activeFlow !== null;
  // Issue is the one flow where the card goes INTO the phone, so the phone
  // takes the whole stage; every other flow puts the phone beside the card.
  const dive = phoneFlow === 'card';

  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS} phoneVisible={phoneVisible}>
            <div
              className={clsx(styles.zones, phoneVisible && styles.zonesPhone, phoneVisible && dive && styles.zonesDive)}
            >
              {/* Where the stage card rests (CardStage measures this). */}
              <div className={styles.cardZone} data-card-zone />
              <div className={styles.phoneZone}>
                <DemoPhone
                  design={design}
                  home={home}
                  cardOnPhone={dive}
                  glassConfig={PHONE_SHELL_GLASS}
                  overlayGlass={DEFAULT_OVERLAY_GLASS}
                  glassDemoBg
                  externalGlass
                />
              </div>
            </div>
            <CardStage design={design} home={home} dive={dive} onIssue={onIssue} />
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
