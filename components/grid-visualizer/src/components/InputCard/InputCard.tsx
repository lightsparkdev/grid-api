'use client';

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CurrencySelection } from '@/lib/code-generator';
import { cryptoAssets, type CryptoAccountType } from '@/data/crypto';
import { currencies } from '@/data/currencies';
import { IconPlusLarge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusLarge';
import { IconChevronBottom } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronBottom';
import { IconArrowsRepeat } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowsRepeat';
import { IconChevronDownSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronDownSmall';
import { motion, AnimatePresence } from 'motion/react';
import { TextMorph } from 'torph/react';
import styles from './InputCard.module.scss';
import clsx from 'clsx';

interface InputCardProps {
  label: 'Source' | 'Destination';
  selection: CurrencySelection | null;
  region?: string | null;
  onCardClick: () => void;
  onToggleInternal: () => void;
  onNetworkChange?: (acct: CryptoAccountType) => void;
  autoFocus?: boolean;
}

export function CardChevron({ onSwap }: { onSwap?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className={clsx(styles.chevron, onSwap && styles.chevronInteractive)}
      type="button"
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        onSwap?.();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {hovered && onSwap ? (
          <motion.span
            key="swap"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
            style={{ display: 'flex' }}
          >
            <IconArrowsRepeat size={12} />
          </motion.span>
        ) : (
          <motion.span
            key="chevron"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
            style={{ display: 'flex' }}
          >
            <IconChevronBottom size={12} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function getIconSrc(sel: CurrencySelection): string {
  if (sel.type === 'fiat' && sel.countryCode) {
    return `/flags/${sel.countryCode}.svg`;
  }
  return `/crypto/${sel.code.toLowerCase()}.svg`;
}

function getSubtitle(sel: CurrencySelection, region?: string | null): string {
  if (sel.isInternal) {
    return `Grid ${sel.code} account`;
  }
  if (sel.type === 'crypto') {
    if (region) {
      const regionName = REGION_SHORT[region] ?? region;
      return `${sel.accountLabel} · ${regionName}`;
    }
    return sel.accountLabel;
  }
  return `${sel.code} Bank account`;
}

const REGION_SHORT: Record<string, string> = {
  USD: 'US', EUR: 'EU', GBP: 'UK', BRL: 'BR', MXN: 'MX', INR: 'IN',
  NGN: 'NG', CAD: 'CA', PHP: 'PH', SGD: 'SG', XOF: 'West Africa',
  XAF: 'Central Africa', GHS: 'GH', KES: 'KE', ZAR: 'ZA', BWP: 'BW',
  TZS: 'TZ', UGX: 'UG', MWK: 'MW', ZMW: 'ZM', CNY: 'CN', HKD: 'HK',
  IDR: 'ID', KRW: 'KR', MYR: 'MY', THB: 'TH', VND: 'VN', LKR: 'LK',
  CRC: 'CR', CDF: 'CD',
};

function getNetworkOptions(sel: CurrencySelection): CryptoAccountType[] | null {
  if (sel.type !== 'crypto') return null;
  const asset = cryptoAssets.find((a) => a.symbol === sel.code);
  if (!asset || asset.accountTypes.length <= 1) return null;
  return asset.accountTypes;
}

function getFiatRailLabel(sel: CurrencySelection): string | null {
  if (sel.type !== 'fiat') return null;
  const fiat = currencies.find((c) => c.code === sel.code);
  if (!fiat) return null;
  return fiat.instantRails[0] ?? fiat.allRails[0] ?? null;
}

const TOOLTIP_TEXT = {
  external: 'External account outside Grid',
  internal: 'Grid-managed balance account',
};

function AccountTab({
  label,
  isActive,
  onClick,
  tooltipText,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  tooltipText: string;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  const showTooltip = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return (
    <>
      <button
        ref={ref}
        className={isActive ? styles.tabActive : styles.tabInactive}
        onClick={(e) => {
          e.stopPropagation();
          setTooltip(null);
          if (!isActive) onClick();
        }}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        type="button"
        tabIndex={-1}
      >
        <motion.span
          className={isActive ? styles.tabLabelActive : styles.tabLabelInactive}
          animate={{
            color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {label}
        </motion.span>
      </button>

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
                {tooltipText}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function NetworkDropdown({
  selection,
  options,
  onSelect,
}: {
  selection: CurrencySelection;
  options: CryptoAccountType[];
  onSelect: (acct: CryptoAccountType) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((prev) => !prev);
  }, [open]);

  return (
    <div className={styles.railBadgeWrapper}>
      <button
        ref={btnRef}
        className={styles.railBadge}
        onClick={toggle}
        type="button"
        tabIndex={-1}
      >
        <span className={styles.railBadgeLabel}>{selection.network}</span>
        <IconChevronDownSmall size={12} />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Invisible backdrop to close on outside click */}
              <div
                className={styles.networkMenuBackdrop}
                onClick={() => setOpen(false)}
              />
              <motion.div
                className={styles.networkMenuPortal}
                style={{ top: menuPos.top, right: menuPos.right }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                {options.map((acct) => (
                  <button
                    key={acct.type}
                    className={clsx(
                      styles.networkMenuItem,
                      acct.network === selection.network && styles.networkMenuItemActive,
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(acct);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/networks/${acct.network.toLowerCase()}.svg`}
                      alt=""
                      className={styles.networkMenuIcon}
                    />
                    <span>{acct.network}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export function InputCard({
  label,
  selection,
  region,
  onCardClick,
  onToggleInternal,
  onNetworkChange,
  autoFocus,
}: InputCardProps) {
  const isEmpty = !selection;
  const networkOptions = selection ? getNetworkOptions(selection) : null;

  return (
    <motion.div
      className={styles.wrapper}
      layout
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className={clsx(styles.card, !isEmpty && styles.cardFilled)}>
        <button
          className={styles.cardButton}
          onClick={onCardClick}
          type="button"
          autoFocus={autoFocus}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isEmpty ? (
              <motion.div
                key="empty"
                className={styles.container}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              >
                <div className={styles.iconBox}>
                  <IconPlusLarge size={24} />
                </div>
                <div className={styles.content}>
                  <span className={styles.label}>{label}</span>
                  <span className={styles.hint}>Choose currency or asset</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${selection.code}-${selection.isInternal}`}
                className={styles.container}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
              >
                <div className={styles.flagBox}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getIconSrc(selection)}
                    alt={selection.code}
                    className={styles.flagImg}
                  />
                </div>
                <div className={styles.filledContent}>
                  <span className={styles.currencyName}>{selection.name}</span>
                  <span className={styles.currencySubtitle}>
                    <TextMorph>{getSubtitle(selection, region)}</TextMorph>
                  </span>
                </div>
                {/* Network dropdown — inside the flex row, vertically centered with text */}
                {networkOptions && onNetworkChange && (
                  <NetworkDropdown
                    selection={selection}
                    options={networkOptions}
                    onSelect={onNetworkChange}
                  />
                )}
                {/* Static network badge for single-network crypto */}
                {selection.type === 'crypto' && selection.network && !networkOptions && (
                  <div className={styles.railBadgeStatic}>
                    <span className={styles.railBadgeLabel}>{selection.network}</span>
                  </div>
                )}
                {/* Static rail badge for fiat (external only) */}
                {selection.type === 'fiat' && !selection.isInternal && (() => {
                  const rail = getFiatRailLabel(selection);
                  return rail ? (
                    <div className={styles.railBadgeStatic}>
                      <span className={styles.railBadgeLabel}>{rail}</span>
                    </div>
                  ) : null;
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Bottom tabs */}
        <AnimatePresence>
          {!isEmpty && (
            <motion.div
              className={styles.tabs}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className={styles.tabList}>
                <AccountTab
                  label="External"
                  isActive={!selection.isInternal}
                  onClick={onToggleInternal}
                  tooltipText={TOOLTIP_TEXT.external}
                />
                <div className={styles.tabDivider} />
                <AccountTab
                  label="Internal"
                  isActive={selection.isInternal}
                  onClick={onToggleInternal}
                  tooltipText={TOOLTIP_TEXT.internal}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
