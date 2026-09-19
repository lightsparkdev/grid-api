'use client';

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconChainLink1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChainLink1';
import { IconImages1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconImages1';
import { IconCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCode';
import { pressable } from '@/lib/sounds';
import type { StatementModel } from '@/statement/types';
import { StatementPreview } from '@/components/StatementPreview/StatementPreview';
import styles from './ShareSheet.module.scss';

interface ShareSheetProps {
  open: boolean;
  statement: StatementModel;
  previewMode: 'mobile' | 'desktop';
  onCopyLink: () => void;
  onSavePdf: () => void;
  onSaveHtml: () => void;
}

export function ShareSheet({
  open,
  statement,
  previewMode,
  onCopyLink,
  onSavePdf,
  onSaveHtml,
}: ShareSheetProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const actions = [
    { label: 'Copy link', Icon: IconChainLink1, onClick: onCopyLink },
    { label: 'Save PDF', Icon: IconImages1, onClick: onSavePdf },
    { label: 'Save HTML', Icon: IconCode, onClick: onSaveHtml },
  ] as const;

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          className={styles.panel}
          aria-label="Share statement"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98, filter: 'blur(8px)' }}
          transition={reduceMotion ? { duration: 0.01 } : { duration: 0.44, ease: [0.19, 1, 0.22, 1] }}
        >
          <span className={styles.ripple} data-share-ripple aria-hidden />
          <div className={styles.preview}>
            <StatementPreview mode={previewMode} phase="ready" statement={statement} />
          </div>
          <div className={styles.actions}>
            {actions.map(({ label, Icon, onClick }) => (
              <button key={label} type="button" {...pressable({ onClick })}>
                <Icon size={24} aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
