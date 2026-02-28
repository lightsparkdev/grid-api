'use client';

import type { SourceFundingMode } from '@/hooks/useFlowBuilder';
import type { CurrencySelection } from '@/lib/code-generator';
import { IconWallet3 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet3';
import { IconZap } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconZap';
import { IconHomeRoof } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHomeRoof';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import styles from './FundingModelSection.module.scss';

interface FundingOption {
  mode: SourceFundingMode;
  icon: React.ComponentType<{ size: number }>;
  title: string;
  description: string;
}

const FIAT_OPTIONS: FundingOption[] = [
  {
    mode: 'external',
    icon: IconWallet3,
    title: 'External',
    description: 'Pull from a registered bank account',
  },
  {
    mode: 'realtime',
    icon: IconZap,
    title: 'Just-in-time',
    description: 'Funded when the payment is initiated',
  },
  {
    mode: 'internal',
    icon: IconHomeRoof,
    title: 'Internal',
    description: 'Pre-funded from your Grid balance',
  },
];

const CRYPTO_OPTIONS: FundingOption[] = [
  {
    mode: 'realtime',
    icon: IconZap,
    title: 'Just-in-time',
    description: 'Funded when the payment is initiated',
  },
  {
    mode: 'internal',
    icon: IconHomeRoof,
    title: 'Internal',
    description: 'Pre-funded from your Grid balance',
  },
];

interface FundingModelSectionProps {
  source: CurrencySelection;
  selectedMode: SourceFundingMode;
  onModeChange: (mode: SourceFundingMode) => void;
}

export function FundingModelSection({
  source,
  selectedMode,
  onModeChange,
}: FundingModelSectionProps) {
  const options = source.type === 'crypto' ? CRYPTO_OPTIONS : FIAT_OPTIONS;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.section}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLabel}>Funding model</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Selector group */}
        <div className={styles.selectorGroup}>
          {options.map((opt) => {
            const isSelected = opt.mode === selectedMode;
            const Icon = opt.icon;
            return (
              <button
                key={opt.mode}
                className={clsx(styles.option, isSelected && styles.optionSelected)}
                onClick={() => onModeChange(opt.mode)}
                type="button"
              >
                <span className={styles.optionIcon}>
                  <Icon size={20} />
                </span>
                <span className={styles.optionContent}>
                  <span className={styles.optionTitle}>{opt.title}</span>
                  <span className={styles.optionDesc}>{opt.description}</span>
                </span>
                {isSelected && (
                  <motion.span
                    className={styles.optionCheck}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <IconCheckmark2Small size={24} />
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
