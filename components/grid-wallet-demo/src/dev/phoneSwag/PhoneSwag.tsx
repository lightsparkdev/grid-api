'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { PhoneProps } from '@/components/Phone';
import styles from './PhoneSwag.module.scss';

const DEVICE_W = 300;
const DEVICE_H = 614;

function useFitScale() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const compute = () => {
      const availW = el.clientWidth - 32;
      const availH = el.clientHeight - 32;
      const s = Math.min(1, availW / DEVICE_W, availH / DEVICE_H);
      setScale(s > 0 ? s : 1);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { wrapRef, scale };
}

function SwagFrame({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className={styles.frame}>
      <span className={styles.frameBadge}>swag</span>
      <h2 className={styles.frameTitle}>{title}</h2>
      {subtitle ? <p className={styles.frameSub}>{subtitle}</p> : null}
    </div>
  );
}

function screenTitle(props: PhoneProps): string {
  if (props.email?.active) return 'Email entry';
  if (props.otp?.active) return 'OTP entry';
  if (props.google?.nonce) return 'Google sign-in';
  if (props.amount?.config) return 'Amount entry';

  switch (props.phone.screen) {
    case 'auth':
      return 'Auth';
    case 'creating':
      return 'Creating account';
    case 'credential':
      return `Credential · ${props.method}`;
    case 'addmoney':
      return 'Add money';
    case 'send':
      return 'Send';
    case 'withdraw':
      return 'Withdraw';
    case 'card-reveal':
      return 'Card reveal';
    case 'tap':
      return props.phone.cardActivated ? 'Tap · done' : 'Tap · hold reader';
    default:
      if (props.wallet.hasCard) return 'Wallet · card';
      if (props.wallet.activity.length > 0) return 'Wallet · activity';
      if (props.wallet.balanceCents > 0) return 'Wallet · funded';
      return 'Wallet · empty';
  }
}

/** Clean-slate phone shell — replace frames as swag designs land. */
export function PhoneSwag(props: PhoneProps) {
  const { wrapRef, scale } = useFitScale();
  const title = screenTitle(props);
  const subtitle = `${props.persona} · ${props.method}`;

  return (
    <div className={styles.deviceWrap} ref={wrapRef}>
      <div className={styles.device} style={{ transform: `scale(${scale})` }}>
        <div className={styles.island} />
        <div className={styles.screen}>
          <div className={styles.statusBar}>
            <span>9:41</span>
          </div>
          <div className={styles.screenBody}>
            <AnimatePresence mode="wait">
              <motion.div
                key={title + props.phone.balance}
                className={styles.screenInner}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <SwagFrame title={title} subtitle={subtitle} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className={styles.homeIndicator}>
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
