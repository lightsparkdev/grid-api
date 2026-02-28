'use client';

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CurrencySelection } from '@/lib/code-generator';
import { cryptoAssets, type CryptoAccountType } from '@/data/crypto';
import { currencies } from '@/data/currencies';
import { IconPlusLarge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusLarge';
import { IconChevronBottom } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronBottom';
import { IconArrowsRepeat } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowsRepeat';
import { IconChevronRightSmall } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRightSmall';
import { motion, AnimatePresence } from 'motion/react';
import styles from './InputCard.module.scss';
import clsx from 'clsx';

const REGION_SHORT: Record<string, string> = {
  USD: 'US', EUR: 'EU', GBP: 'UK', BRL: 'BR', MXN: 'MX', INR: 'IN',
  NGN: 'NG', CAD: 'CA', PHP: 'PH', SGD: 'SG', XOF: 'West Africa',
  XAF: 'Central Africa', GHS: 'GH', KES: 'KE', ZAR: 'ZA', BWP: 'BW',
  TZS: 'TZ', UGX: 'UG', MWK: 'MW', ZMW: 'ZM', CNY: 'CN', HKD: 'HK',
  IDR: 'ID', KRW: 'KR', MYR: 'MY', THB: 'TH', VND: 'VN', LKR: 'LK',
  CRC: 'CR', CDF: 'CD',
};

interface InputCardProps {
  label: 'Source' | 'Destination';
  selection: CurrencySelection | null;
  region?: string | null;
  onCardClick: () => void;
  onNetworkChange?: (acct: CryptoAccountType) => void;
  onRegionClick?: () => void;
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

function getFiatRailOptions(sel: CurrencySelection): string[] | null {
  if (sel.type !== 'fiat') return null;
  const fiat = currencies.find((c) => c.code === sel.code);
  if (!fiat || fiat.allRails.length <= 1) return null;
  return fiat.allRails;
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
    <>
      <button
        ref={btnRef}
        className={styles.propertyRow}
        onClick={toggle}
        type="button"
        tabIndex={-1}
      >
        <span className={styles.propertyLabel}>Network</span>
        <span className={styles.propertyValue}>
          <span>{selection.network}</span>
          <span className={styles.propertyChevron}>
            <IconChevronRightSmall size={16} />
          </span>
        </span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <>
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
    </>
  );
}

function RailDropdown({
  selection,
  options,
}: {
  selection: CurrencySelection;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedRail, setSelectedRail] = useState(() => {
    const fiat = currencies.find((c) => c.code === selection.code);
    return fiat?.instantRails[0] ?? fiat?.allRails[0] ?? options[0];
  });
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
    <>
      <button
        ref={btnRef}
        className={styles.propertyRow}
        onClick={toggle}
        type="button"
        tabIndex={-1}
      >
        <span className={styles.propertyLabel}>Rail</span>
        <span className={styles.propertyValue}>
          <span>{selectedRail}</span>
          <span className={styles.propertyChevron}>
            <IconChevronRightSmall size={16} />
          </span>
        </span>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <>
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
                {options.map((rail) => (
                  <button
                    key={rail}
                    className={clsx(
                      styles.networkMenuItem,
                      rail === selectedRail && styles.networkMenuItemActive,
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRail(rail);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    <span>{rail}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export function InputCard({
  label,
  selection,
  region,
  onCardClick,
  onNetworkChange,
  onRegionClick,
  autoFocus,
}: InputCardProps) {
  const isEmpty = !selection;
  const networkOptions = selection ? getNetworkOptions(selection) : null;
  const fiatRail = selection ? getFiatRailLabel(selection) : null;
  const fiatRailOptions = selection ? getFiatRailOptions(selection) : null;

  return (
    <motion.div
      className={styles.wrapper}
      layout
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className={clsx(styles.card, !isEmpty && styles.cardFilled)}>
        {/* Currency header — clickable to open picker */}
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
                key={selection.code}
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
                  <span className={styles.currencyCode}>{selection.code}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Property rows — below the currency header */}
        <AnimatePresence>
          {!isEmpty && (
            <motion.div
              className={styles.propertyRows}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Fiat: Rail row — dropdown when multiple rails available */}
              {selection.type === 'fiat' && fiatRailOptions ? (
                <RailDropdown
                  key={selection.code}
                  selection={selection}
                  options={fiatRailOptions}
                />
              ) : selection.type === 'fiat' && fiatRail ? (
                <div className={clsx(styles.propertyRow, styles.propertyRowStatic)}>
                  <span className={styles.propertyLabel}>Rail</span>
                  <span className={styles.propertyValue}>
                    <span>{fiatRail}</span>
                  </span>
                </div>
              ) : null}

              {/* Crypto: Network row */}
              {selection.type === 'crypto' && networkOptions && onNetworkChange ? (
                <NetworkDropdown
                  selection={selection}
                  options={networkOptions}
                  onSelect={onNetworkChange}
                />
              ) : selection.type === 'crypto' && selection.network ? (
                <div className={clsx(styles.propertyRow, styles.propertyRowStatic)}>
                  <span className={styles.propertyLabel}>Network</span>
                  <span className={styles.propertyValue}>
                    <span>{selection.network}</span>
                  </span>
                </div>
              ) : null}

              {/* Crypto source: Region row */}
              {selection.type === 'crypto' && region !== undefined && region !== null && (
                <button
                  className={styles.propertyRow}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegionClick?.();
                  }}
                  type="button"
                  tabIndex={-1}
                >
                  <span className={styles.propertyLabel}>Region</span>
                  <span className={styles.propertyValue}>
                    <span>{REGION_SHORT[region] ?? region}</span>
                    <span className={styles.propertyChevron}>
                      <IconChevronRightSmall size={16} />
                    </span>
                  </span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
