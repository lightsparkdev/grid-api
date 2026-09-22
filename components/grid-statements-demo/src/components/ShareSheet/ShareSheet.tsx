'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconChainLink1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChainLink1';
import { IconImages1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconImages1';
import { IconCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCode';
import { pressable } from '@/lib/sounds';
import type { StatementModel } from '@/statement/types';
import { StatementPreview } from '@/components/StatementPreview/StatementPreview';
import styles from './ShareSheet.module.scss';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const easeOutQuart = [0.165, 0.84, 0.44, 1] as const;
const easeInQuart = [0.56, 0, 0.835, 0.16] as const;
const PANEL_IN = { duration: 0.7, ease: easeOutQuart };
const PANEL_OUT = { duration: 0.45, ease: easeInQuart };
const PANEL_AWAY = { opacity: 0, scale: 0.9, y: 128, filter: 'blur(48px)' };

interface ShareSheetProps {
  open: boolean;
  statement: StatementModel;
  previewMode: 'mobile' | 'desktop';
  onClose: () => void;
  onCopyLink: () => void;
  onSavePdf: () => void;
  onSaveHtml: () => void;
}

export function ShareSheet({
  open,
  statement,
  previewMode,
  onClose,
  onCopyLink,
  onSavePdf,
  onSaveHtml,
}: ShareSheetProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const actions = [
    { label: 'Copy link', Icon: IconChainLink1, onClick: onCopyLink },
    { label: 'Save PDF', Icon: IconImages1, onClick: onSavePdf },
    { label: 'Save HTML', Icon: IconCode, onClick: onSaveHtml },
  ] as const;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const focusable = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
    const firstFocusable = focusable()[0];
    if (firstFocusable) firstFocusable.focus();
    else panel?.focus();

    const containFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const elements = focusable();
      if (elements.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel?.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', containFocus);
    return () => {
      window.removeEventListener('keydown', containFocus);
      const returnFocus = returnFocusRef.current;
      returnFocusRef.current = null;
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className={styles.backdrop}
            data-share-backdrop
            aria-hidden
            onClick={onClose}
          />
          <motion.section
            ref={panelRef}
            className={styles.panel}
            data-preview-mode={previewMode}
            role="dialog"
            aria-modal="true"
            aria-label="Export statement"
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : PANEL_AWAY}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: PANEL_IN,
                  }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { ...PANEL_AWAY, transition: PANEL_OUT }
            }
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
        </>
      ) : null}
    </AnimatePresence>
  );
}
