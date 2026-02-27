'use client';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { Command } from '@lightsparkdev/origin';
import type { CommandItem, CommandGroup } from '@lightsparkdev/origin';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { currencies } from '@/data/currencies';
import { cryptoAssets } from '@/data/crypto';
import type { CurrencySelection } from '@/lib/code-generator';
import styles from './CurrencyPicker.module.scss';

interface CurrencyPickerProps {
  open: boolean;
  target: 'send' | 'receive' | null;
  onClose: () => void;
  onSelect: (sel: CurrencySelection) => void;
  excludeCode?: string;
}

const POPULAR_CODES = ['USD', 'BTC', 'USDC', 'EUR', 'GBP', 'MXN', 'NGN'];

function getIconSrc(type: 'fiat' | 'crypto', code: string, countryCode?: string): string {
  if (type === 'fiat' && countryCode) {
    return `/flags/${countryCode}.svg`;
  }
  return `/crypto/${code.toLowerCase()}.svg`;
}

function lookupSelection(id: string): CurrencySelection | null {
  const fiat = currencies.find((c) => c.code === id);
  if (fiat) {
    return {
      code: fiat.code,
      type: 'fiat',
      name: fiat.name,
      accountType: fiat.accountType,
      accountLabel: fiat.accountLabel,
      countryCode: fiat.countryCode,
      isInternal: false,
      jitEligible: fiat.instantRails.length > 0,
      examplePerson: fiat.examplePerson,
    };
  }
  const crypto = cryptoAssets.find((a) => a.symbol === id);
  if (crypto) {
    const acct = crypto.accountTypes[0];
    return {
      code: crypto.symbol,
      type: 'crypto',
      name: crypto.name,
      accountType: acct.type,
      accountLabel: acct.label,
      network: acct.network,
      isInternal: false,
      jitEligible: true,
      examplePerson: crypto.examplePerson,
    };
  }
  return null;
}

function getRailsText(sel: CurrencySelection | null): string {
  if (!sel) return '';
  const fiat = currencies.find((c) => c.code === sel.code);
  if (fiat) return fiat.allRails.join(', ');
  const crypto = cryptoAssets.find((a) => a.symbol === sel.code);
  if (crypto) return crypto.accountTypes.map((t) => t.network).join(', ');
  return '';
}

function buildFiatItem(
  c: typeof currencies[0],
  onSelect: (sel: CurrencySelection) => void,
): CommandItem {
  return {
    id: c.code,
    label: c.name,
    keywords: [c.code, c.accountType, ...c.allRails],
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={getIconSrc('fiat', c.code, c.countryCode)}
        alt=""
        className={styles.flag}
      />
    ),
    shortcut: <span className={styles.badge}>{c.code}</span>,
    onSelect: () => {
      const sel = lookupSelection(c.code);
      if (sel) onSelect(sel);
    },
  };
}

function buildCryptoItem(
  a: typeof cryptoAssets[0],
  onSelect: (sel: CurrencySelection) => void,
): CommandItem {
  const defaultAcct = a.accountTypes[0];
  return {
    id: a.symbol,
    label: a.name,
    keywords: [a.symbol, a.name, ...a.accountTypes.map((t) => t.network)],
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={getIconSrc('crypto', a.symbol)}
        alt=""
        className={styles.flag}
      />
    ),
    shortcut: <span className={styles.badge}>{a.symbol}</span>,
    onSelect: () => {
      onSelect({
        code: a.symbol,
        type: 'crypto',
        name: a.name,
        accountType: defaultAcct.type,
        accountLabel: defaultAcct.label,
        network: defaultAcct.network,
        isInternal: false,
        jitEligible: true,
        examplePerson: a.examplePerson,
      });
    },
  };
}

function buildItems(
  excludeCode: string | undefined,
  onSelect: (sel: CurrencySelection) => void,
): CommandGroup[] {
  const fiatItems = currencies
    .filter((c) => c.code !== excludeCode)
    .map((c) => buildFiatItem(c, onSelect));

  const cryptoItems = cryptoAssets
    .filter((a) => a.symbol !== excludeCode)
    .map((a) => buildCryptoItem(a, onSelect));

  const allItems = [...fiatItems, ...cryptoItems];
  const popularItems = allItems.filter((item) =>
    POPULAR_CODES.includes(item.id),
  );

  const groups: CommandGroup[] = [
    { label: 'Popular', items: popularItems },
    { label: 'Fiat', items: fiatItems },
    { label: 'Crypto', items: cryptoItems },
  ];

  return groups;
}

export function CurrencyPicker({
  open,
  onClose,
  onSelect,
  excludeCode,
}: CurrencyPickerProps) {
  const handleSelect = useCallback(
    (sel: CurrencySelection) => {
      onSelect(sel);
    },
    [onSelect],
  );

  const groups = useMemo(
    () => buildItems(excludeCode, handleSelect),
    [excludeCode, handleSelect],
  );

  const frozenGroupsRef = useRef(groups);
  if (open) {
    frozenGroupsRef.current = groups;
  }

  // On mobile, blur the search input to prevent keyboard from popping up
  useEffect(() => {
    if (!open || typeof window === 'undefined' || window.innerWidth > 767) return;
    requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>('[role="dialog"] input');
      input?.blur();
    });
  }, [open]);

  const renderItem = useMemo(
    () => (item: CommandItem) => {
      const sel = lookupSelection(item.id);
      const railsText = getRailsText(sel);

      return (
        <div className={styles.itemRow}>
          <div className={styles.itemLeading}>
            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
            <div className={styles.itemText}>
              <span className={styles.itemName}>{item.label}</span>
              {railsText && (
                <span className={styles.itemRails}>{railsText}</span>
              )}
            </div>
          </div>
          {item.shortcut}
        </div>
      );
    },
    [],
  );

  return (
    <Command.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      items={frozenGroupsRef.current}
      placeholder="Search currencies or assets..."
      renderItem={renderItem}
      inputIcon={<IconMagnifyingGlass size={16} />}
    >
      <Command.Footer>
        <div className={styles.footerLeft}>
          <div className={styles.footerHint}>
            <span className={styles.footerKeys}>
              <kbd className={styles.kbd}>↑</kbd>
              <kbd className={styles.kbd}>↓</kbd>
            </span>
            <span className={styles.footerLabel}>Navigate</span>
          </div>
        </div>
        <div className={styles.footerRight}>
          <div className={styles.footerHint}>
            <span className={styles.footerLabel}>Select</span>
            <kbd className={styles.kbd}>↵</kbd>
          </div>
          <div className={styles.footerHint}>
            <span className={styles.footerLabel}>Close</span>
            <kbd className={styles.kbd}>Esc</kbd>
          </div>
        </div>
      </Command.Footer>
    </Command.Root>
  );
}
