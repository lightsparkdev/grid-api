import { useEffect, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'motion/react';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconChevronLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeft';
import { IconGroup1 } from '@central-icons-react/round-filled-radius-2-stroke-2/IconGroup1';
import { SfSymbol } from '@/apps/shared/icons';
import type { AgentAsk, AskState } from '../conversation';
import { GlassPill } from '../glass';
import { askButtons } from '../parts';
import { AppSheet } from '../sheet';
import { PaymentCard, type CardDesign, type CardNetwork } from './PaymentCard';
import styles from './CardScan.module.scss';

/*
 * Adding a card, rebuilt from the Apple Wallet recording (Nov 5, 13:58):
 * - The intro sheet: a phone holding card art that crossfades every ~1.4s
 *   (450ms fades), the face-scan glyph, "Debit or Credit Card", the fine
 *   print, and a blue Continue.
 * - Continue: the sheet dims and blurs away into black (~350ms); the phone
 *   fades in at ~430ms and the card's back blurs in at ~530ms. "Place iPhone
 *   on Back of Card" while it reads.
 * - Once read, the card it found, and Save card puts it in the vault.
 */

const SHEET_IN: Transition = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] };
const READ_MS = 2400;
const CYCLE_MS = 1400;

const ART: { design: CardDesign; network: CardNetwork; last4: string }[] = [
  { design: 'white', network: 'mastercard', last4: '9112' },
  { design: 'emerald', network: 'visa', last4: '3008' },
  { design: 'navy', network: 'visa', last4: '4242' },
  { design: 'black', network: 'visa-debit', last4: '7781' },
];

/** The intro's phone: card art crossfading through the kinds of cards you can add. */
function CardCycle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % ART.length), CYCLE_MS);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className={styles.cycle}>
      <AnimatePresence initial={false}>
        <motion.span
          key={i}
          className={styles.cycleCard}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'linear' }}
        >
          <PaymentCard width={207} {...ART[i]} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Sheet({
  ask,
  wallet,
  found,
  onContinue,
  onSave,
  onClose,
}: {
  ask: AgentAsk;
  wallet: string;
  found: boolean;
  onContinue: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const last4 = ask.card?.last4 ?? '4242';
  return (
    <div className={styles.sheet}>
      <div className={styles.stage}>
        <button type="button" className={styles.back} aria-label="Back" onClick={onClose}>
          <GlassPill radius={22}>
            <span className={styles.backGlyph}>
              <IconChevronLeft size={24} />
            </span>
          </GlassPill>
        </button>
        {found ? (
          <motion.span className={styles.found} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={SHEET_IN}>
            <PaymentCard width={268} design="navy" network="visa" last4={last4} chip />
          </motion.span>
        ) : (
          <span className={styles.phone}>
            <CardCycle />
            <span className={styles.scanGlyph}>
              <SfSymbol name="faceid" size={30} />
            </span>
          </span>
        )}
      </div>
      <div className={styles.copy}>
        <strong className={styles.title}>{found ? `Visa •••• ${last4}` : 'Debit or Credit Card'}</strong>
        <p className={styles.body}>
          {found
            ? `Save it to your ${wallet} vault. Your agent only ever sees a card id, never the number.`
            : `Fund your ${wallet} and pay at checkout with a card you already have, without typing the number.`}
        </p>
        <span className={styles.privacy}>
          <IconGroup1 size={28} />
        </span>
        <p className={styles.fine}>
          Card details are kept in a PCI vault and are never shared with your agent. Your card issuer may be asked to
          verify the card. <span>See how your data is managed…</span>
        </p>
        <button type="button" className={styles.continue} onClick={found ? onSave : onContinue}>
          {found ? (ask.allow ?? 'Save Card') : 'Continue'}
        </button>
        {found && (
          <button type="button" className={styles.notNow} onClick={onClose}>
            {ask.deny ?? 'Not now'}
          </button>
        )}
      </div>
    </div>
  );
}

/** Black: the card's back, the phone over it, Place iPhone on Back of Card. */
function Reading({ onCancel, onManual }: { onCancel: () => void; onManual: () => void }) {
  return (
    <motion.div
      className={styles.reading}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <button type="button" className={styles.close} aria-label="Cancel" onClick={onCancel}>
        <IconCrossMedium size={20} />
      </button>
      <motion.span
        className={styles.cardBack}
        initial={{ opacity: 0, filter: 'blur(12px) brightness(2.4)' }}
        animate={{ opacity: 1, filter: 'blur(0px) brightness(1)' }}
        transition={{ delay: 0.53, duration: 0.12 }}
      >
        <i className={styles.stripe} />
        <i className={styles.contactless} />
      </motion.span>
      <motion.span className={styles.device} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.43, duration: 0.1 }}>
        <i className={styles.island} />
      </motion.span>
      <span className={styles.readCopy}>
        <strong>Place iPhone on Back of Card</strong>
        <span>Keep in place until the card is read.</span>
        <button type="button" onClick={onManual}>
          Enter Card Details Manually
        </button>
      </span>
    </motion.div>
  );
}

/** A skin's card flow: `open(ask)` from its card ask, and the layers to render in its screen. */
export function useCardScan({ wallet, onAllow, onDeny }: { wallet: string; onAllow: () => void; onDeny: () => void }) {
  const [ask, setAsk] = useState<AgentAsk | null>(null);
  const [stage, setStage] = useState<'closed' | 'intro' | 'reading' | 'found'>('closed');
  useEffect(() => {
    if (stage !== 'reading') return;
    const t = window.setTimeout(() => setStage('found'), READ_MS);
    return () => window.clearTimeout(t);
  }, [stage]);
  const close = () => setStage('closed');
  return {
    open: (next: AgentAsk) => {
      setAsk(next);
      setStage('intro');
    },
    sheet: (
      <>
        <AppSheet open={stage === 'intro' || stage === 'found'} present={SHEET_IN} dim={0.3} className={styles.panel} onDismiss={close}>
          {ask && (
            <Sheet
              ask={ask}
              wallet={wallet}
              found={stage === 'found'}
              onContinue={() => setStage('reading')}
              onSave={() => {
                close();
                onAllow();
              }}
              onClose={() => {
                close();
                onDeny();
              }}
            />
          )}
        </AppSheet>
        <AnimatePresence>
          {stage === 'reading' && <Reading key="reading" onCancel={() => setStage('intro')} onManual={() => setStage('found')} />}
        </AnimatePresence>
      </>
    ),
  };
}

/** The card ask in the thread: the card, what it's for, and Add Card (which opens the flow above). */
export function VaultCardAsk({
  ask,
  state,
  onOpen,
  onDeny,
  className,
}: {
  ask: AgentAsk;
  state: AskState;
  onOpen: () => void;
  onDeny: () => void;
  className?: string;
}) {
  const b = askButtons(ask, state);
  const last4 = ask.card?.last4 ?? '4242';
  return (
    <div className={`${styles.ask} ${className ?? ''}`}>
      <PaymentCard width={316} design={state === 'done' ? 'navy' : 'black'} network="visa" last4={state === 'done' ? last4 : undefined} chip />
      <strong className={styles.askTitle}>{state === 'done' ? `Visa •••• ${last4} saved` : ask.title}</strong>
      <span className={styles.askNote}>Kept in a PCI vault. Your agent sees a card id, never the number.</span>
      {!b.settled && (
        <span className={styles.askActions}>
          <button type="button" className={styles.askDeny} disabled={b.pressing} onClick={onDeny}>
            {b.denyLabel}
          </button>
          <button type="button" className={styles.askAdd} disabled={b.pressing} onClick={onOpen} data-opens-sheet>
            Add Card
          </button>
        </span>
      )}
      {state === 'denied' && <span className={styles.askNote}>{b.denyLabel}</span>}
    </div>
  );
}
