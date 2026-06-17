/** Wiggle icon set — central-icons, 0px corner radius, 2px stroke. */
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
import { IconHomeOpen as IconHomeOpenFilled } from '@central-icons-react/round-filled-radius-0-stroke-2/IconHomeOpen';
import { IconPeople } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPeople';
import { IconPhone } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPhone';
import { IconPlusMedium } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconPlusMedium';
import { IconSettingsGear2 } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconSettingsGear2';
import { IconUserKey } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconUserKey';
import { IconVideoClip } from '@central-icons-react/round-outlined-radius-0-stroke-2/IconVideoClip';
import type { AuthMethod } from '@/data/flow';

export {
  IconAnalytics,
  IconApple,
  IconArrowBottomTop,
  IconArrowDownLeft,
  IconCreditCard2,
  IconEmail1,
  IconGoogle,
  IconGrowth,
  IconHeart,
  IconHomeOpen,
  IconHomeOpenFilled,
  IconPeople,
  IconPhone,
  IconPlusMedium,
  IconSettingsGear2,
  IconUserKey,
  IconVideoClip,
};

export type WiggleIcon = typeof IconEmail1;

export const WIGGLE_AUTH_METHOD_ICONS: Record<AuthMethod, WiggleIcon> = {
  oauth: IconGoogle,
  passkey: IconUserKey,
  apple: IconApple,
  email_otp: IconEmail1,
  sms: IconPhone,
};
