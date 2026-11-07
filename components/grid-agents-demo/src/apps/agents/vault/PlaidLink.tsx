import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BANK_COUNTRIES } from '@/data/bankCountries';
import { BankMark } from '../BankMark';
import type { AgentAsk, Message } from '../conversation';
import { bankFor, linkBank, type LinkedBank } from '../linkedBank';
import { useKeptAsk } from '../openSheets';
import { GlassPill, NoopButton, PressButton } from '../glass';
import { AppSheet } from '../sheet';
import styles from './PlaidLink.module.scss';

/*
 * Plaid Link, rebuilt from Muse's recordings (ScreenRecording_11-05-2026 18-17-29 and 18-18-29, 1206x2622 at
 * 60fps): iOS asks to let the app use secure.plaid.com to sign in, then Plaid opens in the system's web sheet.
 * A returning Plaid user's path: their phone number, the texted code, the institutions they've saved with Plaid,
 * the account to share, then "Returning to {app}". Every field comes filled in; the visitor taps Continue.
 */

const US = BANK_COUNTRIES.find((c) => c.code === 'us')!;
const PHONE = '(415) 555-0132';
const PHONE_MASKED = '(•••) ••• 0132';
const CODE = '482915';

interface Institution {
  name: string;
  account: string;
  last4: string;
}

const INSTITUTIONS: Institution[] = [
  { name: 'Chase', account: 'Total Checking', last4: '4821' },
  { name: 'Bank of America', account: 'Adv Plus Banking', last4: '7310' },
  { name: 'Wells Fargo', account: 'Everyday Checking', last4: '2264' },
  { name: 'Citibank', account: 'Regular Checking', last4: '0937' },
];

/** Measured from the recordings: the spinners between steps, and the beat on "Returning to". */
const MS = { load: 900, verify: 1000, connect: 1400, finish: 1100, returning: 1300, autofill: 1100 } as const;
const SHEET_IN = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] } as const;
/** The sheet drops before the app hears back, as the recording returns to Muse. */
const DROP_MS = 380;

type Step = 'loading' | 'phone' | 'verify' | 'institutions' | 'connecting' | 'accounts' | 'finishing' | 'returning';

/** How far along the bar under Plaid's header is, by step. */
const PROGRESS: Partial<Record<Step, number>> = { verify: 1, institutions: 2, connecting: 2, accounts: 3, finishing: 3, returning: 4 };

const STEP_IN = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } } as const;

function Spinner({ light }: { light?: boolean }) {
  return <span className={styles.spinner} data-light={light || undefined} aria-label="Loading" />;
}

function Logo() {
  return <img src="/assets/agents/plaid/logo.svg" alt="Plaid" className={styles.logo} />;
}

function Chevron() {
  return (
    <svg width="11" height="18" viewBox="0 0 11 18" aria-hidden>
      <path d="M9 2 2 9l7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="m2 2 12 12M14 2 2 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Bolt() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden>
      <path d="M7.2 0 0 9.2h4.6L3.6 16 12 6.4H7.2L7.2 0Z" fill="currentColor" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="11" viewBox="0 0 14 11" aria-hidden>
      <path d="m1.5 5.5 3.6 3.6L12.5 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Flag() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" className={styles.flag} aria-hidden>
      <rect width="26" height="18" rx="2.5" fill="#f4f4f4" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={i * (18 / 13)} width="26" height={18 / 13} fill="#d22f3c" />
      ))}
      <rect width="11.5" height={18 * (7 / 13)} rx="1" fill="#2f3f8f" />
    </svg>
  );
}

function Header({ step, onBack, onClose }: { step: Step; onBack?: () => void; onClose: () => void }) {
  const progress = PROGRESS[step] ?? 0;
  return (
    <header className={styles.header}>
      {onBack && (
        <button type="button" className={styles.back} aria-label="Back" onClick={onBack}>
          <Chevron />
        </button>
      )}
      <Logo />
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <Cross />
      </button>
      {progress > 0 && (
        <span className={styles.progress} aria-hidden>
          {[1, 2, 3, 4].map((i) => (
            <i key={i} data-on={i <= progress || undefined} />
          ))}
        </span>
      )}
    </header>
  );
}

function Primary({ enabled, busy, onClick, children }: { enabled: boolean; busy?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" className={styles.primary} disabled={!enabled || busy} data-busy={busy || undefined} onClick={onClick}>
      {busy ? <Spinner light /> : children}
    </button>
  );
}

/**
 * Plaid's pages, without the browser around them: the system sheet wraps them in the apps (PlaidLink), and
 * Instinct's Safari page shows them as they are.
 */
export function PlaidFlow({
  app,
  icon,
  onLinked,
  onClose,
  onManual,
}: {
  app: string;
  icon: string;
  onLinked: (bank: LinkedBank) => void;
  onClose: () => void;
  /** "My bank isn't listed": back to the app's own form. */
  onManual: () => void;
}) {
  const [step, setStep] = useState<Step>('loading');
  const linked = useRef(onLinked);
  linked.current = onLinked;
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [picked, setPicked] = useState<Institution | null>(null);
  const [resend, setResend] = useState(14);

  useEffect(() => {
    const after: Partial<Record<Step, [Step, number]>> = {
      loading: ['phone', MS.load],
      connecting: ['accounts', MS.connect],
      finishing: ['returning', MS.finish],
    };
    const next = after[step];
    if (!next) return;
    const t = window.setTimeout(() => setStep(next[0]), next[1]);
    return () => window.clearTimeout(t);
  }, [step]);

  // iOS fills in the texted code a beat after the page shows, and the resend timer counts down.
  useEffect(() => {
    if (step !== 'verify') return;
    const fill = window.setTimeout(() => setCode(CODE), MS.autofill);
    const tick = window.setInterval(() => setResend((s) => Math.max(0, s - 1)), 1000);
    return () => {
      window.clearTimeout(fill);
      window.clearInterval(tick);
    };
  }, [step]);

  useEffect(() => {
    if (!verifying) return;
    const t = window.setTimeout(() => {
      setVerifying(false);
      setStep('institutions');
    }, MS.verify);
    return () => window.clearTimeout(t);
  }, [verifying]);

  useEffect(() => {
    if (step !== 'returning' || !picked) return;
    const t = window.setTimeout(() => {
      const bank: LinkedBank = { ...bankFor(US), bankName: picked.name, last4: picked.last4 };
      linkBank(bank);
      linked.current(bank);
    }, MS.returning);
    return () => window.clearTimeout(t);
  }, [step, picked]);

  const spinner = step === 'loading' || step === 'connecting' || step === 'finishing';
  return (
    <div className={styles.flow}>
      {step !== 'loading' && <Header step={step} onBack={step === 'verify' ? () => setStep('phone') : undefined} onClose={onClose} />}
      <div className={styles.stage}>
        <AnimatePresence mode="wait" initial={false}>
          {spinner && (
            <motion.div key={`spin-${step}`} className={styles.center} {...STEP_IN}>
              <Spinner />
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div key="phone" className={styles.page} {...STEP_IN}>
              <div className={styles.body}>
                <span className={styles.pair}>
                  <img src={icon} alt="" className={styles.appTile} />
                  <span className={styles.plaidTile}>
                    <img src="/assets/agents/plaid/mark.svg" alt="" />
                  </span>
                </span>
                <h1 className={styles.title}>{app} uses Plaid to connect your accounts.</h1>
                <label className={styles.phone}>
                  <Flag />
                  <span className={styles.dial}>+1</span>
                  <span className={styles.value}>{PHONE}</span>
                </label>
                <p className={styles.hint}>
                  <span className={styles.bolt}>
                    <Bolt />
                  </span>
                  <span>
                    Use your phone number to log in or sign up with Plaid to go faster next time. <u>Learn more</u>
                  </span>
                </p>
              </div>
              <footer className={styles.foot}>
                <p className={styles.legal}>
                  <u>Terms</u> apply. By continuing, you agree to Plaid&apos;s <u>Privacy Policy</u>.
                </p>
                <Primary enabled onClick={() => setStep('verify')}>
                  Continue
                </Primary>
                <button type="button" className={styles.secondary} onClick={onManual}>
                  Continue without phone number
                </button>
              </footer>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div key="verify" className={styles.page} {...STEP_IN}>
              <div className={styles.body}>
                <h1 className={styles.heading}>Verify your phone number</h1>
                <p className={styles.sub}>Enter the code sent to {PHONE_MASKED} to access your saved accounts.</p>
                <label className={styles.code} data-filled={code ? true : undefined}>
                  <span className={styles.codeLabel}>Code</span>
                  {code && <span className={styles.codeValue}>{code}</span>}
                </label>
                <Primary enabled={!!code} busy={verifying} onClick={() => setVerifying(true)}>
                  Continue
                </Primary>
                <span className={styles.resend}>Resend code (0:{String(resend).padStart(2, '0')})</span>
              </div>
            </motion.div>
          )}

          {step === 'institutions' && (
            <motion.div key="institutions" className={styles.page} {...STEP_IN}>
              <div className={styles.body}>
                <h1 className={styles.heading}>Select a saved institution</h1>
                <p className={styles.sub}>
                  {INSTITUTIONS.length} institutions are saved with {PHONE_MASKED} for this device.
                </p>
                <div className={styles.cards}>
                  {INSTITUTIONS.map((inst, i) => (
                    <button key={inst.name} type="button" className={styles.card} data-picked={picked === inst || undefined} onClick={() => setPicked(inst)}>
                      <BankMark bank={inst.name} size={32} className={styles.round} />
                      <span className={styles.cardText}>
                        <strong>{inst.name}</strong>
                        <small>Previously connected</small>
                      </span>
                      {i === 0 && (
                        <span className={styles.instant}>
                          <Bolt />
                        </span>
                      )}
                      <span className={styles.radio} />
                    </button>
                  ))}
                </div>
                <button type="button" className={styles.link} onClick={onManual}>
                  My bank isn&apos;t listed
                </button>
              </div>
              <footer className={styles.foot}>
                <p className={styles.legal}>
                  By continuing, you agree that {app} and Plaid will, in accordance with <u>open banking law</u>, collect contact details, account and balance info, transactions, credit and loans, and investments and process them to help you track and manage your finances. Disconnect at my.plaid.com. <u>Learn more</u>
                </p>
                <Primary enabled={!!picked} onClick={() => setStep('connecting')}>
                  Continue
                </Primary>
              </footer>
            </motion.div>
          )}

          {step === 'accounts' && picked && (
            <motion.div key="accounts" className={styles.page} {...STEP_IN}>
              <div className={styles.body}>
                <h1 className={styles.heading}>Select saved accounts</h1>
                <p className={styles.sub}>
                  Plaid will only share data from the {picked.name} accounts you select with {app}.
                </p>
                <div className={styles.account}>
                  <span className={styles.checkbox}>
                    <Check />
                  </span>
                  <span className={styles.cardText}>
                    <strong>{picked.account}</strong>
                    <small className={styles.accountLine}>
                      <BankMark bank={picked.name} size={18} className={styles.round} />
                      {picked.name} ••••{picked.last4}
                    </small>
                  </span>
                </div>
              </div>
              <footer className={`${styles.foot} ${styles.plain}`}>
                <Primary enabled onClick={() => setStep('finishing')}>
                  Continue
                </Primary>
              </footer>
            </motion.div>
          )}

          {step === 'returning' && (
            <motion.div key="returning" className={styles.center} {...STEP_IN}>
              <span className={styles.done}>
                <Check />
              </span>
              <p className={styles.returning}>
                Returning to
                <br />
                {app}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Alert({ app, onCancel, onContinue }: { app: string; onCancel: () => void; onContinue: () => void }) {
  return (
    <motion.div className={styles.alertDim} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <motion.div
        className={styles.alert}
        role="alertdialog"
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
      >
        <strong>
          “{app}” Wants to Use “secure.plaid.com” to Sign In
        </strong>
        <p>This allows the app and website to share information about you.</p>
        <span className={styles.alertButtons}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onContinue}>
            Continue
          </button>
        </span>
      </motion.div>
    </motion.div>
  );
}

function ShareGlyph() {
  return (
    <svg width="17" height="22" viewBox="0 0 17 22" aria-hidden>
      <path d="M8.5 1v12.5M4.5 5 8.5 1l4 4M5.5 8.5H3A1.5 1.5 0 0 0 1.5 10v9A1.5 1.5 0 0 0 3 20.5h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14 8.5h-2.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReloadGlyph() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden>
      <path d="M15.5 11.5A6.5 6.5 0 1 1 9 5h3.5M10.5 2l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuGlyph() {
  return (
    <svg width="17" height="13" viewBox="0 0 17 13" aria-hidden>
      <rect width="17" height="1.9" rx="0.95" fill="currentColor" />
      <rect y="5.4" width="17" height="1.9" rx="0.95" fill="currentColor" />
      <rect y="10.8" width="11.5" height="1.9" rx="0.95" fill="currentColor" />
    </svg>
  );
}

/** iOS's light glass: Plaid's page stays light in dark mode, so its controls do too. */
const LIGHT_GLASS = 'rgba(244, 244, 246, 0.6)';

/** The system's web sheet: × and the domain over the page, Back and share-and-reload under it, all on glass. */
function Browser({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className={styles.browser}>
      <div className={styles.top}>
        <PressButton label="Close" className={styles.disc} onClick={onClose}>
          <GlassPill radius={22} tint={LIGHT_GLASS} className={styles.glass}>
            <Cross />
          </GlassPill>
        </PressButton>
        <span className={styles.domain}>secure.plaid.com</span>
        <NoopButton label="Menu" className={styles.disc}>
          <GlassPill radius={22} tint={LIGHT_GLASS} className={styles.glass}>
            <MenuGlyph />
          </GlassPill>
        </NoopButton>
      </div>
      <div className={styles.webview}>{children}</div>
      <div className={styles.bottom}>
        <NoopButton label="Back" size={48} className={styles.disc}>
          <GlassPill radius={24} tint={LIGHT_GLASS} className={styles.glass}>
            <Chevron />
          </GlassPill>
        </NoopButton>
        <NoopButton label="Share and reload" size={104} className={styles.capsule}>
          <GlassPill radius={24} tint={LIGHT_GLASS} className={styles.glass}>
            <span className={styles.glyphs}>
              <ShareGlyph />
              <ReloadGlyph />
            </span>
          </GlassPill>
        </NoopButton>
      </div>
    </div>
  );
}

/** Plaid is for the person's own bank in the US; anywhere else, or someone else's bank, it's the app's own form. */
export const opensPlaid = (ask: AgentAsk) => !ask.recipient && (ask.home ?? 'us') === 'us';

/** Each app's icon, for Plaid's pair of tiles. */
export const APP_ICONS = {
  muse: '/assets/connectors/muse-app.png',
  grok: '/assets/connectors/bot-app.png',
  dot: '/assets/connectors/chatgpt-app.png',
  duet: '/assets/connectors/duet-app.png',
  instinct: '/assets/connectors/instinct-app.png',
  yourapp: '/assets/connectors/your-app.svg',
} as const;

/**
 * Plaid for a bank ask: `open(id, ask)` shows iOS's alert, then the web sheet. Done, it links the bank and calls
 * `onLinked`; "My bank isn't listed" hands the ask back to the app's own form (`onManual`). An ask that's been
 * answered or replaced takes Plaid with it.
 */
export function usePlaidLink({
  app,
  icon,
  messages,
  onLinked,
  onManual,
}: {
  app: string;
  icon: string;
  messages: Message[];
  onLinked: () => void;
  onManual: (id: number, ask: AgentAsk) => void;
}) {
  // Kept across an app switch: the next app opens Plaid again, past the alert already answered.
  const kept = useKeptAsk('plaid', messages, (a) => !!a.bank);
  const [run, setRun] = useState<{ id: number; ask: AgentAsk; stage: 'alert' | 'sheet' } | null>(kept.initial && { ...kept.initial, stage: 'sheet' });
  const live = !!run && messages.some((m) => m.kind === 'ask' && m.id === run.id && m.state === 'open');
  useEffect(() => {
    if (run && !live) {
      setRun(null);
      kept.release(run.id);
    }
  }, [run, live]);
  const close = () => {
    setRun(null);
    kept.release(run?.id);
  };
  const handOff = (after: () => void) => {
    close();
    window.setTimeout(after, DROP_MS);
  };
  return {
    open: (id: number, ask: AgentAsk) => {
      setRun({ id, ask, stage: 'alert' });
      kept.keep(id);
    },
    overlay: (
      <>
        <AnimatePresence>{run?.stage === 'alert' && <Alert key="alert" app={app} onCancel={close} onContinue={() => setRun({ ...run, stage: 'sheet' })} />}</AnimatePresence>
        <AppSheet open={run?.stage === 'sheet'} present={SHEET_IN} dim={0.25} className={styles.panel} onDismiss={close}>
          <Browser onClose={close}>
            {run && (
              <PlaidFlow
                key={run.id}
                app={app}
                icon={icon}
                onClose={close}
                onLinked={() => handOff(onLinked)}
                onManual={() => {
                  const { id, ask } = run;
                  handOff(() => onManual(id, ask));
                }}
              />
            )}
          </Browser>
        </AppSheet>
      </>
    ),
  };
}
