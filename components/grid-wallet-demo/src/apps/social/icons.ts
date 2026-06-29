/** Z (social) icon set — central-icons, 2px radius, 2px stroke. */
import { IconGoogle } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconGoogle';
import { IconApple } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconApple';
import { IconEmail1 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconEmail1';
import { IconCall } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCall';
import { IconAt } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconAt';
import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconArrowLeft';
import { IconCircleQuestionmark } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconCircleQuestionmark';
import { IconSettingsGear2 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconSettingsGear2';
import { IconEyeSlash } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconEyeSlash';
import { IconInfoSimple } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconInfoSimple';
import { IconArrowInbox } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconArrowInbox';
import { IconSend } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconSend';
import { IconQrCode } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconQrCode';
import { IconChevronRightSmall } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconChevronRightSmall';
import { IconHome } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconHome';
import { IconHome as IconHomeFilled } from '@central-icons-react/round-filled-radius-2-stroke-2/IconHome';
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconMagnifyingGlass';
import { IconBell } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBell';
import { IconBubble2 } from '@central-icons-react/round-outlined-radius-2-stroke-2/IconBubble2';
import type { AuthMethod } from '@/data/flow';

export {
  IconGoogle,
  IconApple,
  IconEmail1,
  IconCall,
  IconAt,
  IconArrowLeft,
  IconCircleQuestionmark,
  IconSettingsGear2,
  IconEyeSlash,
  IconInfoSimple,
  IconArrowInbox,
  IconSend,
  IconQrCode,
  IconChevronRightSmall,
  IconHome,
  IconHomeFilled,
  IconMagnifyingGlass,
  IconBell,
  IconBubble2,
};

export type SocialIcon = typeof IconEmail1;

/** Auth-method → glyph. The three circle CTAs (Google/Apple/Email), the phone
 *  pill (sms → Call), and the "Login with username" footer (passkey → @). */
export const SOCIAL_AUTH_METHOD_ICONS: Record<AuthMethod, SocialIcon> = {
  oauth: IconGoogle,
  apple: IconApple,
  email_otp: IconEmail1,
  sms: IconCall,
  passkey: IconAt,
};
