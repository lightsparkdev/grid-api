'use client';

import { IconHotDrinkCup } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHotDrinkCup';
import { IconCheeseburger } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheeseburger';
import { IconStore1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconStore1';
import { IconCup } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCup';
import { IconFashion } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconFashion';
import { IconShoppingBag1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconShoppingBag1';
import { IconTag } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconTag';
import { IconSofa } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSofa';
import { IconDeskLamp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconDeskLamp';
import { IconBasket1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBasket1';
import type { WalletListItemData, MerchantCategory } from '@/apps/shared/card';
import styles from './WalletListItem.module.scss';

export type { WalletListItemData };

// Tap-to-pay / transaction merchant icons (radius-3, stroke-1.5). The brain
// supplies only the merchant `category`.
const MERCHANT_ICONS: Record<MerchantCategory, typeof IconHotDrinkCup> = {
  coffee: IconHotDrinkCup,
  'fast-food': IconCheeseburger,
  convenience: IconStore1,
  cafe: IconCup,
  fashion: IconFashion,
  apparel: IconShoppingBag1,
  accessories: IconTag,
  furniture: IconSofa,
  homeware: IconDeskLamp,
  grocery: IconBasket1,
};

export interface WalletListItemProps extends Omit<WalletListItemData, 'id' | 'timestamp'> {
  /** Pre-formatted relative time label, e.g. "Just now". */
  time: string;
}

/**
 * Figma 2143:41027 — one transaction row: a 56px tertiary-fill graphic (24px
 * glyph), a title + two secondary lines, and a right-aligned amount.
 */
export function WalletListItem({ category, title, detail, time, amount }: WalletListItemProps) {
  const MerchantIcon = category ? MERCHANT_ICONS[category] : null;
  return (
    <div className={styles.row}>
      <span className={styles.graphic} aria-hidden>
        {MerchantIcon && <MerchantIcon size={24} />}
      </span>
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.labels}>
            <p className={styles.title}>{title}</p>
            <p className={styles.sub}>{detail}</p>
            <p className={styles.sub}>{time}</p>
          </div>
          <p className={styles.amount}>{amount}</p>
        </div>
      </div>
    </div>
  );
}
