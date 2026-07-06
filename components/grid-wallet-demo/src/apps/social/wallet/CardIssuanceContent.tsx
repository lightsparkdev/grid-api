'use client';

import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { IconGlobe } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGlobe';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { PrimaryButton } from '../blocks/PrimaryButton';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { motionTransition } from '@/lib/easing';
import { BRAND } from '../config';
import styles from './CardIssuanceContent.module.scss';

// Single-line value props (one text style — title + description points merged).
const VALUE_PROPS = [
  { Icon: IconGlobe, label: 'Your dollar balance works everywhere' },
  { Icon: IconCreditCard1, label: 'Pay online or in person at any retailer' },
  { Icon: IconWallet1, label: 'Add to Apple Wallet on all your devices' },
];

/** Intro copy + agreement + Create card CTA (bottom-anchored). While `creating`,
 *  the CTA swaps its label for a centered spinner (the only loading signal). */
export function IntroContent({
  onCreate,
  creating = false,
}: {
  onCreate?: () => void;
  creating?: boolean;
}) {
  const reveal = useStaggerReveal();
  return (
    <>
      <div className={styles.section}>
        <motion.div {...reveal(0)} className={styles.titleBlock}>
          <p className={styles.titlePrimary}>Get your free {BRAND} card</p>
          <p className={styles.titleSecondary}>
            Spend your balance in person and online anywhere Visa is accepted
          </p>
        </motion.div>
      </div>
      <motion.div {...reveal(1)} className={clsx(styles.ctaWrap, styles.ctaWrapAboveNote)}>
        {/* Not `disabled` while creating — that washes the pill out; it just
            stops accepting clicks and shows the spinner. */}
        <PrimaryButton onClick={creating ? undefined : onCreate} aria-busy={creating}>
          <span className={styles.ctaSwap}>
            <AnimatePresence initial={false}>
              {creating ? (
                <motion.span
                  key="spinner"
                  className={styles.ctaItem}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={motionTransition(undefined, 0.25)}
                >
                  <span className={styles.spinner} aria-label="Creating card">
                    <IconLoadingCircle size={20} />
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="label"
                  className={styles.ctaItem}
                  initial={false}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={motionTransition(undefined, 0.18)}
                >
                  Create card
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </PrimaryButton>
      </motion.div>
      {/* Disclaimer sits UNDER the CTA. */}
      <motion.p {...reveal(2)} className={styles.agreement}>
        By tapping &ldquo;Create card&rdquo; you accept the{' '}
        <span className={styles.agreementStrong}>Terms of Service</span> &amp;{' '}
        <span className={styles.agreementStrong}>Privacy Policy</span> and{' '}
        <span className={styles.agreementStrong}>Card Holder Agreement</span>
      </motion.p>
    </>
  );
}

/** Ready copy + value props + Continue CTA (bottom-anchored). */
export function ReadyContent({ onContinue }: { onContinue?: () => void }) {
  const reveal = useStaggerReveal();
  return (
    <>
      <div className={styles.section}>
        <motion.div {...reveal(0)} className={styles.titleBlockTight}>
          <p className={styles.titlePrimary}>Meet your new {BRAND} card</p>
          <p className={styles.titleSecondaryEmphasis}>Ready to use</p>
        </motion.div>
        <div className={styles.valuePropList}>
          {VALUE_PROPS.map(({ Icon, label }, i) => (
            <motion.div key={label} {...reveal(i + 1)} className={styles.valueProp}>
              <span className={styles.valuePropIcon}>
                <Icon size={20} />
              </span>
              <p className={styles.valuePropTitle}>{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div {...reveal(VALUE_PROPS.length + 1)} className={styles.ctaWrap}>
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </motion.div>
    </>
  );
}

