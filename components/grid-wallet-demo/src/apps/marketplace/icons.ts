/** Marketplace icon set — central-icons, radius 3 (large), 1.5px stroke (the
 *  skin's icon voice). The active wallet tab alone bumps to the 2px-stroke
 *  variant of the same glyph (see MarketplaceTabBar). */
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowLeft';
import { IconChevronLeftMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronLeftMedium';
import { IconChevronRightMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronRightMedium';
import { IconChevronDownMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronDownMedium';
// Deposit page source list.
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCash } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCash';
// Crypto deposit list (copy / QR actions). QR only ships in the radius-1 set —
// the glyph reads identically at this size.
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare6';
import { IconCheckmark2Small } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCheckmark2Small';
import { IconQrCode } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconQrCode';
// Add-bank sheet (country search).
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMagnifyingGlass';
import { IconGoogle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGoogle';
import { IconApple } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconApple';
import { IconPasskeys } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPasskeys';
import { IconLoadingCircle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLoadingCircle';
import { IconSettingsGear2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSettingsGear2';
// 2px stroke: sits alone in a pill on the balance card — the 1.5px weight
// reads thin next to the labeled pills.
import { IconPaperPlaneTopRight } from '@central-icons-react/round-outlined-radius-3-stroke-2/IconPaperPlaneTopRight';
// Tab bar (Figma 2610:11833).
import { IconBookmark } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBookmark';
import { IconCalendar2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCalendar2';
import { IconLayoutAlignTop } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLayoutAlignTop';
import { IconBubbleWide } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBubbleWide';
import { IconWallet2 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet2';
// The active wallet tab: same glyph, 2px stroke.
import { IconWallet2 as IconWallet2Bold } from '@central-icons-react/round-outlined-radius-3-stroke-2/IconWallet2';

export {
  IconCrossMedium,
  IconArrowLeft,
  IconChevronLeftMedium,
  IconChevronRightMedium,
  IconChevronDownMedium,
  IconBank,
  IconCash,
  IconSquareBehindSquare6,
  IconCheckmark2Small,
  IconQrCode,
  IconMagnifyingGlass,
  IconGoogle,
  IconApple,
  IconPasskeys,
  IconLoadingCircle,
  IconSettingsGear2,
  IconPaperPlaneTopRight,
  IconBookmark,
  IconCalendar2,
  IconLayoutAlignTop,
  IconBubbleWide,
  IconWallet2,
  IconWallet2Bold,
};

export type MarketplaceIcon = typeof IconWallet2;
