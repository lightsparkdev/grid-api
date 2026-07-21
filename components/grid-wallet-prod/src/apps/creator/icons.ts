/** Creator icon set — central-icons, 0px corner radius, 2px stroke. */
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCrossMedium';
import { IconApple } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconApple';
import { IconArrowBottomTop } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconArrowBottomTop';
import { IconArrowDownLeft } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconArrowDownLeft';
import { IconAnalytics } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconAnalytics';
import { IconCreditCard2 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconCreditCard2';
import { IconEmail1 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconEmail1';
import { IconGoogle } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconGoogle';
import { IconGrowth } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconGrowth';
import { IconHeart } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconHeart';
import { IconHomeOpen } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconHomeOpen';
import { IconMinusMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconMinusMedium';
import { IconPeople } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPeople';
import { IconPeople2 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPeople2';
import { IconPhone } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPhone';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPlusMedium';
import { IconSettingsGear2 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconSettingsGear2';
import { IconUserKey } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconUserKey';
import { IconVideoClip } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconVideoClip';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconWallet1';
import { IconWallet1 as IconWallet1Filled } from '@central-icons-react/round-filled-radius-0-stroke-2/IconWallet1';
import type { AuthMethod } from '@/data/flow';

export {
  IconAnalytics,
  IconApple,
  IconArrowBottomTop,
  IconArrowDownLeft,
  IconCreditCard2,
  IconCrossMedium,
  IconEmail1,
  IconGoogle,
  IconGrowth,
  IconHeart,
  IconHomeOpen,
  IconMinusMedium,
  IconPeople,
  IconPeople2,
  IconPhone,
  IconPlusMedium,
  IconSettingsGear2,
  IconUserKey,
  IconVideoClip,
  IconWallet1,
  IconWallet1Filled,
};

export type CreatorIcon = typeof IconEmail1;

export const CREATOR_AUTH_METHOD_ICONS: Record<AuthMethod, CreatorIcon> = {
  oauth: IconGoogle,
  passkey: IconUserKey,
  apple: IconApple,
  email_otp: IconEmail1,
  sms: IconPhone,
};
