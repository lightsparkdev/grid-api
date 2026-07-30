'use client';

import { settlementRails } from '@/data/settlement-rails';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import styles from './SettlementSection.module.scss';

interface SettlementSectionProps {
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
}

export function SettlementSection({
  selectedAsset,
  onAssetChange,
}: SettlementSectionProps) {
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
          <span className={styles.dividerLabel}>Bridge via</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Selector group */}
        <div className={styles.selectorGroup}>
          {settlementRails.map((rail) => {
            const isSelected = rail.asset === selectedAsset;
            return (
              <button
                key={rail.asset}
                className={clsx(styles.option, isSelected && styles.optionSelected)}
                onClick={() => onAssetChange(rail.asset)}
                type="button"
              >
                <span className={styles.optionIcon}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rail.icon} alt="" className={styles.optionIconImg} />
                </span>
                <span className={styles.optionContent}>
                  <span className={styles.optionTitle}>{rail.assetName}</span>
                  <span className={styles.optionDesc}>
                    {rail.asset === rail.assetName
                      ? `via ${rail.networkLabel}`
                      : `${rail.asset} via ${rail.networkLabel}`}
                  </span>
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

        <span className={styles.footnote}>
          Grid picks the optimal bridge rail automatically. The API calls
          stay the same.
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
