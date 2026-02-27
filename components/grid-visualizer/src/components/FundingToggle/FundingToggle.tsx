'use client';

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Switch } from '@lightsparkdev/origin';
import styles from './FundingToggle.module.scss';

interface FundingToggleProps {
  fundingModel: 'jit' | 'pre-funded';
  jitEligible: boolean;
  isInternal: boolean;
  onToggle: () => void;
  instantRails: string[];
}

export function FundingToggle({ fundingModel, jitEligible, isInternal, onToggle, instantRails }: FundingToggleProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const rowRef = useRef<HTMLButtonElement>(null);

  const showTooltip = useCallback(() => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const padding = 12;
    const centerX = rect.left + rect.width / 2;
    const maxX = window.innerWidth - tooltipWidth / 2 - padding;
    const minX = tooltipWidth / 2 + padding;
    const x = Math.min(Math.max(centerX, minX), maxX);
    setTooltip({ x, y: rect.top });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const railsText = instantRails.length > 0 ? instantRails.join(', ') : null;

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {isInternal ? (
          <motion.div
            key="internal"
            className={styles.rowStatic}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className={styles.labelGroup}>
              <span className={styles.label}>Funded from balance</span>
              <span className={styles.railsHint}>Grid internal account</span>
            </div>
          </motion.div>
        ) : !jitEligible ? (
          <motion.div
            key="prefunded"
            className={styles.rowStatic}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className={styles.labelGroup}>
              <span className={styles.label}>Pre-funded</span>
              <span className={styles.railsHint}>Instant rails not available</span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="jit"
            ref={rowRef}
            className={styles.row}
            onClick={onToggle}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className={styles.labelGroup}>
              <span className={styles.label}>Just-in-time funding</span>
              {railsText && <span className={styles.railsHint}>via {railsText}</span>}
            </div>
            <div className={styles.switchWrapper}>
              <Switch
                size="sm"
                checked={fundingModel === 'jit'}
                readOnly
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {tooltip && (
            <div
              className={styles.tooltipAnchor}
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <motion.div
                className={styles.tooltip}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                Funds are pulled in real-time when payment is initiated — no need to pre-fund your Grid account.
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
