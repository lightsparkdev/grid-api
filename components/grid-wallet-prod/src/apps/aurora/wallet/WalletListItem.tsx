'use client';

import clsx from 'clsx';
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
import { Flag } from '@/apps/shared/Flag';
import type { WalletListItemData, WalletItemAvatar, MerchantCategory } from '@/apps/shared/wallet';
import styles from './WalletListItem.module.scss';

// The row data shape is the shared brain's contract — re-export it so this skin's
// sibling faces still import it from here; only the rendering below is per-skin.
export type { WalletListItemData, WalletItemAvatar };

// Tap-to-pay / transaction merchant icons — Aurora's variant (radius-3, stroke-1.5).
// The brain supplies only the merchant `category`; the icon style is the skin's.
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
 * Figma 2143:41027 — one activity/transaction row: a 56px tertiary-fill graphic
 * (24px glyph), a title + two secondary lines, and a right-aligned amount.
 * Reusable across the wallet flows.
 */
export function WalletListItem({
  category,
  image,
  imageSquare,
  tileCircle,
  avatar,
  title,
  detail,
  time,
  amount,
}: WalletListItemProps) {
  const MerchantIcon = category ? MERCHANT_ICONS[category] : null;
  return (
    <div className={styles.row}>
      <span
        className={clsx(styles.graphic, (tileCircle || avatar) && styles.graphicCircle)}
        aria-hidden
      >
        {avatar ? (
          <>
            <span className={styles.avatarInitials}>{avatar.initials}</span>
            <span className={styles.avatarFlag}>
              <Flag code={avatar.code} size={16} />
            </span>
          </>
        ) : image ? (
          <img
            className={clsx(styles.graphicImage, imageSquare && styles.graphicImageSquare)}
            src={image}
            alt=""
            draggable={false}
          />
        ) : (
          MerchantIcon && <MerchantIcon size={24} />
        )}
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
