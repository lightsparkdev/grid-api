import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark1';
import type { Verification } from '../conversation';
import { AppSheet } from '../sheet';
import { APP_ICONS, WebSheet } from './PlaidLink';
import styles from './BusinessVerify.module.scss';

/* The app's hosted business verification page (its KYB link), in the system's web sheet as Plaid is: the business's
   details filled in from what the platform has, one Submit, a moment's check, then Verified and back to the chat. */

export type VerifyApp = keyof typeof APP_ICONS;

const APPS: Record<VerifyApp, { name: string; domain: string; accent: string }> = {
  muse: { name: 'Muse', domain: 'business.muse.com', accent: '#0064e0' },
  grok: { name: 'Grok Bot', domain: 'business.grokbot.com', accent: '#111' },
  dot: { name: 'Dots', domain: 'business.dots.com', accent: '#2d59ee' },
  duet: { name: 'Duet', domain: 'business.duet.com', accent: '#c96442' },
  instinct: { name: 'Instinct', domain: 'business.instinct.com', accent: '#231f20' },
  yourapp: { name: 'Your app', domain: 'business.yourapp.com', accent: '#111' },
};

const SHEET_IN = { duration: 0.45, ease: [0.3, 0.7, 0.2, 1] } as const;
const MS = { check: 1500, verified: 900 } as const;

type Stage = 'form' | 'checking' | 'verified';

function Page({ details, app, onVerified }: { details: Verification; app: VerifyApp; onVerified: () => void }) {
  const [stage, setStage] = useState<Stage>('form');
  const verified = useRef(onVerified);
  verified.current = onVerified;
  const { name, accent } = APPS[app];

  useEffect(() => {
    if (stage === 'form') return;
    const t = window.setTimeout(() => (stage === 'checking' ? setStage('verified') : verified.current()), stage === 'checking' ? MS.check : MS.verified);
    return () => window.clearTimeout(t);
  }, [stage]);

  const rows: [string, string][] = [
    ['Legal name', details.company],
    ['Business type', details.entity],
    ['Tax ID (EIN)', details.taxId],
    ['Address', details.address],
    ['Owner', `${details.owner}, 100%`],
  ];

  return (
    <div className={styles.page} style={{ '--verify-accent': accent } as CSSProperties}>
      <AnimatePresence mode="wait" initial={false}>
        {stage === 'form' ? (
          <motion.div key="form" className={styles.form} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <div className={styles.body}>
              <img className={styles.appTile} src={APP_ICONS[app]} alt="" width={48} height={48} />
              <h2 className={styles.title}>Verify {details.company}</h2>
              <p className={styles.sub}>{name} checks these against public business records before the account opens.</p>
              <dl className={styles.fields}>
                {rows.map(([label, value]) => (
                  <div key={label} className={styles.field}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.foot}>
              <p className={styles.legal}>By submitting, you confirm you can act for {details.company} and that these details are correct.</p>
              <button type="button" className={styles.primary} onClick={() => setStage('checking')}>
                Submit
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="status" className={styles.status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <span className={styles.badge} data-done={stage === 'verified' || undefined}>
              {stage === 'verified' ? <IconCheckmark1 size={28} /> : <span className={styles.spinner} />}
            </span>
            <strong className={styles.statusTitle}>{stage === 'verified' ? 'Verified' : `Verifying ${details.company}…`}</strong>
            <span className={styles.statusSub}>{stage === 'verified' ? 'Taking you back to the chat' : 'Checking public business records'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The verification page over the chat while an approval waits on it; × closes it and leaves the approval open. */
export function BusinessVerify({ details, app, onVerified, onClose }: { details: Verification | null; app: VerifyApp; onVerified: () => void; onClose: () => void }) {
  const [shown, setShown] = useState(details);
  if (details && details !== shown) setShown(details);
  return (
    <AppSheet open={!!details} present={SHEET_IN} dim={0.25} className={styles.panel} onDismiss={onClose}>
      <WebSheet domain={APPS[app].domain} onClose={onClose}>
        {shown && <Page key={shown.company} details={shown} app={app} onVerified={onVerified} />}
      </WebSheet>
    </AppSheet>
  );
}
