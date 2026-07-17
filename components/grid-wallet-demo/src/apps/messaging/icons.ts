/** ChatsApp icon set — central icons, WhatsApp voice: radius 2, 2px stroke
 *  (matches the home Figma's icon names 1:1). One set app-wide; the tab bar's
 *  SF Symbols live in sfSymbols.tsx (they're OS glyphs, not this set). */
// Home action grid (Figma 2640:19597 — the two 4-column rows).
import { IconArrowUpRight } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconArrowUpRight';
import { IconArrowDownLeft } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconArrowDownLeft';
import { IconQrCode } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconQrCode';
import { IconPlusLarge } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconPlusLarge';
import { IconReceiptBill } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconReceiptBill';
import { IconCreditCard2 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCreditCard2';
import { IconBank } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBank';
import { IconPiggyBank } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconPiggyBank';
// Activity rows — the WhatsApp delivered double-check.
import { IconDoupleCheckmark1Small } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconDoupleCheckmark1Small';
// The app logo glyph (welcome header, card face).
import { IconBubbleAnnotation3 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBubbleAnnotation3';
// Card flow chrome + value props.
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCrossMedium';
import { IconDotGrid1x3Horizontal } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconDotGrid1x3Horizontal';
import { IconNfc1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconNfc1';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconLoadingCircle';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconWallet1';
import { IconBanknote1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBanknote1';
// Recipient avatars — the WhatsApp generic-contact bust (filled, not stroked).
import { IconPeople } from '@central-icons-react/round-filled-radius-2-stroke-2/IconPeople';

export {
  IconArrowUpRight,
  IconArrowDownLeft,
  IconQrCode,
  IconPlusLarge,
  IconReceiptBill,
  IconCreditCard2,
  IconBank,
  IconPiggyBank,
  IconDoupleCheckmark1Small,
  IconBubbleAnnotation3,
  IconCrossMedium,
  IconDotGrid1x3Horizontal,
  IconNfc1,
  IconLoadingCircle,
  IconWallet1,
  IconBanknote1,
  IconPeople,
};

export type MessagingIcon = typeof IconArrowUpRight;
