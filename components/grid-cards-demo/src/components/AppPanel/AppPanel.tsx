'use client';

import clsx from 'clsx';
import { DotGridCanvas } from '@/components/DotGridCanvas/DotGridCanvas';
import { CardStage } from '@/components/CardStage/CardStage';
import { DemoPhone } from '@/components/DemoPhone/DemoPhone';
import { PHONE_SHELL_GLASS } from '@/components/liquid-glass';
import { DEFAULT_OVERLAY_GLASS, GlassSymbolButton, headerGlassBrightness } from '@/apps/shared/glass';
import { SfSymbol } from '@/apps/shared/icons';
import { useCardHome, type UseCardHomeOptions, type WalletEntry } from '@/apps/shared/card';
import type { CardDesign } from '@/data/design';
import { useThemeMode } from '@/hooks/useThemeMode';
import styles from './AppPanel.module.scss';

export interface AppPanelProps {
  design: CardDesign;
  /** The stage edits the design too: the brand is moved and resized on the card. */
  onDesignChange?: (patch: Partial<CardDesign>) => void;
  /** Bumped on reset; remounts the brain so everything starts clean. */
  /** The playground's Reset (see useCardHome). */
  brainReset: { nonce: number; afterMs: number };
  /** The cardholder's phone is on stage with the card in it; false = the card floats alone. */
  phoneUp: boolean;
  /** A flow is playing out on the phone. */
  running: boolean;
  /** The visitor sends the phone away to get back to the card. */
  onDismissPhone?: () => void;
  /** Jump command for the brain (sidebar → provision + run a flow). */
  walletEntry?: WalletEntry;
  onCardIssued?: () => void;
  onTapToPay?: UseCardHomeOptions['onTapToPay'];
  onTapDeclined?: UseCardHomeOptions['onTapDeclined'];
  cardOptions?: UseCardHomeOptions['card'];
  onSettled?: () => void;
}

/** The stage: the card, always; the cardholder's phone comes in with the first flow, the card goes into it, and it stays until sent away. */
export function AppPanel({
  design,
  onDesignChange,
  phoneUp,
  running,
  onDismissPhone,
  walletEntry,
  onCardIssued,
  onTapToPay,
  onTapDeclined,
  cardOptions,
  onSettled,
  brainReset,
}: AppPanelProps) {
  const home = useCardHome({
    entry: walletEntry,
    onCardIssued,
    onTapToPay,
    onTapDeclined,
    card: cardOptions,
    onSettled,
    reset: brainReset,
    phoneUp,
  });
  const theme = useThemeMode();
  // Two states only: the card floats alone, or it is in the phone. The first
  // flow brings the phone in and the card flies into its slot; the phone stays
  // through later flows until the visitor sends it away.
  const showBack = phoneUp;

  // At the phone's top-right corner, outside the bezel, whenever the phone is
  // up: back to the card alone. Disabled, not hidden, while a flow plays (it
  // used to vanish for every flow and return after, a flicker on every tile).
  // The phone is the cardholder's; this control is the developer's, so it
  // sits on the stage against the phone, not on the screen.
  const closePhone = (
    <span className={clsx(styles.back, !showBack && styles.backHidden)} aria-hidden={!showBack}>
      <GlassSymbolButton
        aria-label="Back to the card"
        size={44}
        type="button"
        glass={{ brightness: headerGlassBrightness(theme) }}
        tabIndex={showBack ? 0 : -1}
        disabled={running}
        // The phone goes as it is, whatever is up on it (a page, a sheet,
        // Apple's cover): one motion, not a dismiss and then a flight. The
        // next flow clears the screen before it starts (useCardHome's entry).
        onClick={onDismissPhone}
      >
        <SfSymbol name="xmark" size={16} />
      </GlassSymbolButton>
    </span>
  );

  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        <div className={styles.phoneStage}>
          <DotGridCanvas glassConfig={PHONE_SHELL_GLASS} phoneVisible={phoneUp}>
            <DemoPhone
              design={design}
              home={home}
              glassConfig={PHONE_SHELL_GLASS}
              overlayGlass={DEFAULT_OVERLAY_GLASS}
              glassDemoBg
              externalGlass
              stageChrome={closePhone}
            />
            <CardStage design={design} home={home} onDesignChange={onDesignChange} />
          </DotGridCanvas>
        </div>
      </div>
    </section>
  );
}
