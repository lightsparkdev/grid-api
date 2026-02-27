'use client';

import { useMemo, useCallback, useRef } from 'react';
import { Command } from '@lightsparkdev/origin';
import type { CommandItem, CommandGroup } from '@lightsparkdev/origin';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { currencies } from '@/data/currencies';
import styles from './RegionPicker.module.scss';

const REGION_NAMES: Record<string, string> = {
  USD: 'United States',
  EUR: 'European Union',
  GBP: 'United Kingdom',
  BRL: 'Brazil',
  MXN: 'Mexico',
  INR: 'India',
  NGN: 'Nigeria',
  CAD: 'Canada',
  PHP: 'Philippines',
  SGD: 'Singapore',
  XOF: 'West Africa',
  XAF: 'Central Africa',
  GHS: 'Ghana',
  KES: 'Kenya',
  ZAR: 'South Africa',
  BWP: 'Botswana',
  TZS: 'Tanzania',
  UGX: 'Uganda',
  MWK: 'Malawi',
  ZMW: 'Zambia',
  CNY: 'China',
  HKD: 'Hong Kong',
  IDR: 'Indonesia',
  KRW: 'South Korea',
  MYR: 'Malaysia',
  THB: 'Thailand',
  VND: 'Vietnam',
  LKR: 'Sri Lanka',
  CRC: 'Costa Rica',
  CDF: 'DR Congo',
};

interface RegionPickerProps {
  open: boolean;
  cryptoCode?: string;
  onClose: () => void;
  onSelect: (regionFiatCode: string) => void;
}

function buildRegionItems(
  onSelect: (code: string) => void,
  groupLabel: string,
): CommandGroup[] {
  const items: CommandItem[] = currencies.map((c) => ({
    id: c.code,
    label: REGION_NAMES[c.code] ?? c.name,
    keywords: [c.code, c.name, REGION_NAMES[c.code] ?? '', c.countryCode],
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/flags/${c.countryCode}.svg`}
        alt=""
        className={styles.flag}
      />
    ),
    onSelect: () => onSelect(c.code),
  }));

  return [{ label: groupLabel, items }];
}

export function RegionPicker({
  open,
  cryptoCode,
  onClose,
  onSelect,
}: RegionPickerProps) {
  const handleSelect = useCallback(
    (code: string) => {
      onSelect(code);
    },
    [onSelect],
  );

  const groupLabel = cryptoCode ? `Where's your ${cryptoCode}?` : 'Select your region';

  const groups = useMemo(
    () => buildRegionItems(handleSelect, groupLabel),
    [handleSelect, groupLabel],
  );

  const frozenGroupsRef = useRef(groups);
  if (open) {
    frozenGroupsRef.current = groups;
  }

  const renderItem = useMemo(
    () => (item: CommandItem) => (
      <div className={styles.itemRow}>
        <div className={styles.itemLeading}>
          {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
          <span className={styles.itemName}>{item.label}</span>
        </div>
      </div>
    ),
    [],
  );

  return (
    <Command.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      items={frozenGroupsRef.current}
      placeholder="Search countries..."
      renderItem={renderItem}
      inputIcon={<IconMagnifyingGlass size={16} />}
      label={cryptoCode ? `Where's your ${cryptoCode}?` : 'Where are you based?'}
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
