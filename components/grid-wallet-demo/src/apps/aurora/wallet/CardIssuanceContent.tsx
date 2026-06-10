'use client';

import { motion } from 'motion/react';
import { IconGlobe } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGlobe';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { GlassTextButton } from '@/apps/shared/glass';
import { useStaggerReveal } from '@/apps/shared/useStaggerReveal';
import { motionTransition } from '@/lib/easing';
import styles from './CardIssuanceContent.module.scss';

const VALUE_PROPS = [
  {
    Icon: IconGlobe,
    title: 'Works globally',
    sub: 'Your dollar balance works everywhere',
  },
  {
    Icon: IconCreditCard1,
    title: 'Use online or in store',
    sub: 'Pay at any online retailer or in person',
  },
  {
    Icon: IconWallet1,
    title: 'Add your card to Apple Wallet',
    sub: 'Use your Aurora card on all your devices',
  },
];

/** Figma 2219:48658 — intro copy + agreement + Create card CTA (bottom-anchored). */
export function IntroContent({ onCreate }: { onCreate?: () => void }) {
  const reveal = useStaggerReveal();
  return (
    <>
      <div className={styles.section}>
        <motion.div {...reveal(0)} className={styles.titleBlock}>
          <p className={styles.titlePrimary}>Get your free card</p>
          <p className={styles.titleSecondary}>
            Spend your balance in person and online anywhere Visa is accepted
          </p>
        </motion.div>
        <motion.p {...reveal(1)} className={styles.agreement}>
          By tapping &ldquo;Create card&rdquo; you accept the{' '}
          <span className={styles.agreementStrong}>Terms of Service &amp; Privacy Policy</span> and{' '}
          <span className={styles.agreementStrong}>Card Holder Agreement &amp; Privacy Policy</span>
        </motion.p>
      </div>
      <motion.div {...reveal(2)} className={styles.ctaWrap}>
        <GlassTextButton variant="primary" onClick={onCreate}>
          Create card
        </GlassTextButton>
      </motion.div>
    </>
  );
}

/** Figma 2219:48832 — ready copy + value props + Continue CTA (bottom-anchored). */
export function ReadyContent({ onContinue }: { onContinue?: () => void }) {
  const reveal = useStaggerReveal();
  return (
    <>
      <div className={styles.section}>
        <motion.div {...reveal(0)} className={styles.titleBlockTight}>
          <p className={styles.titlePrimary}>Your card is ready to use</p>
          <p className={styles.titleSecondary}>Ready for the world</p>
        </motion.div>
        {VALUE_PROPS.map(({ Icon, title, sub }, i) => (
          <motion.div key={title} {...reveal(i + 1)} className={styles.valueProp}>
            <span className={styles.valuePropIcon}>
              <Icon size={20} />
            </span>
            <div className={styles.valuePropText}>
              <p className={styles.valuePropTitle}>{title}</p>
              <p className={styles.valuePropSub}>{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div {...reveal(VALUE_PROPS.length + 1)} className={styles.ctaWrap}>
        <GlassTextButton variant="primary" onClick={onContinue}>
          Continue
        </GlassTextButton>
      </motion.div>
    </>
  );
}

/** Figma 2219:48913 — "Creating your card..." status with a leading spinner. */
export function CreatingCaption() {
  return (
    <motion.div
      className={styles.creating}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={motionTransition(undefined, 0.3)}
    >
      <span className={styles.spinner} aria-hidden>
        <IconLoadingCircle size={16} />
      </span>
      <span className={styles.creatingText}>Creating your card...</span>
    </motion.div>
  );
}
