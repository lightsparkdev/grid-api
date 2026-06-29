/** Z (social) icon set — central-icons, 2px radius, 2px stroke. */
import { IconGoogle } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconGoogle';
import { IconApple } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconApple';
import { IconEmail1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconEmail1';
import { IconCall } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCall';
import { IconPasskeys } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconPasskeys';
import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconArrowLeft';
import { IconChevronLeftMedium } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconChevronLeftMedium';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCrossMedium';
import { IconCircleQuestionmark } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCircleQuestionmark';
import { IconSettingsGear2 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconSettingsGear2';
import { IconEyeSlash } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconEyeSlash';
import { IconInfoSimple } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconInfoSimple';
import { IconArrowInbox } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconArrowInbox';
import { IconArrowOutOfBox } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconArrowOutOfBox';
import { IconPaperPlaneTopRight } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconPaperPlaneTopRight';
import { IconPeopleCircle } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconPeopleCircle';
// Money-home bottom tab bar (Figma 2543:21322).
import { IconHomeOpen } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconHomeOpen';
import { IconMagnifyingGlass2 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconMagnifyingGlass2';
import { IconSparkle2 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconSparkle2';
import { IconBell2 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBell2';
import { IconBubble3 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBubble3';
import { IconDollar } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconDollar';
import { IconDollar as IconDollarFilled } from '@central-icons-react/round-filled-radius-2-stroke-2/IconDollar';
import type { AuthMethod } from '@/data/flow';

export {
  IconGoogle,
  IconApple,
  IconEmail1,
  IconCall,
  IconPasskeys,
  IconArrowLeft,
  IconChevronLeftMedium,
  IconCrossMedium,
  IconCircleQuestionmark,
  IconSettingsGear2,
  IconEyeSlash,
  IconInfoSimple,
  IconArrowInbox,
  IconArrowOutOfBox,
  IconPaperPlaneTopRight,
  IconPeopleCircle,
  IconHomeOpen,
  IconMagnifyingGlass2,
  IconSparkle2,
  IconBell2,
  IconBubble3,
  IconDollar,
  IconDollarFilled,
};

export type SocialIcon = typeof IconEmail1;

/** Auth-method → glyph. The three circle CTAs (Google/Apple/Email), the phone
 *  pill (sms → Call), and the "Login with username" footer (passkey → @). */
export const SOCIAL_AUTH_METHOD_ICONS: Record<AuthMethod, SocialIcon> = {
  oauth: IconGoogle,
  apple: IconApple,
  email_otp: IconEmail1,
  sms: IconCall,
  passkey: IconPasskeys,
};
