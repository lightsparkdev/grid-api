'use client';

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
  /** The stage edits the design too: the brand is moved and resized on the card. */
  onDesignChange?: (patch: Partial<CardDesign>) => void;
  /** Bumped on reset; remounts the brain so everything starts clean. */
  session: number;
  /** The flow the phone is up for; null = the card floats alone. */
  activeFlow: ActionId | null;
  /** Jump command for the brain (sidebar → provision + run a flow). */
  walletEntry?: WalletEntry;
  onCardIssued?: () => void;
  onTapToPay?: UseCardHomeOptions['onTapToPay'];
  onTapDeclined?: UseCardHomeOptions['onTapDeclined'];
  cardOptions?: UseCardHomeOptions['card'];
  onSettled?: () => void;
}

/** The stage: the card, always; the cardholder's phone comes in for a flow and the card goes into it. */
export function AppPanel({ session, ...props }: AppPanelProps) {
  // Keyed on the session so Reset remounts the brain with fresh state.
  return <StageHost key={session} {...props} />;
}

function StageHost({
  design,
  onDesignChange,
  activeFlow,
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
  // Two states only: the card floats alone, or it is in the phone. Any flow
  // brings the phone in and the card flies into its slot.
  const phoneVisible = activeFlow !== null;

  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS} phoneVisible={phoneVisible}>
            <DemoPhone
              design={design}
              home={home}
              glassConfig={PHONE_SHELL_GLASS}
              overlayGlass={DEFAULT_OVERLAY_GLASS}
              glassDemoBg
              externalGlass
            />
            <CardStage design={design} home={home} onDesignChange={onDesignChange} />
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
