import { IconGoogle } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGoogle';
import { IconUserKey } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconUserKey';
import { IconApple } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconApple';
import { IconPhone } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPhone';
import { IconEmail1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEmail1';
import type { AuthMethod } from '@/data/flow';

export type AuthMethodIcon = typeof IconGoogle;

export const AUTH_METHOD_ICONS: Record<AuthMethod, AuthMethodIcon> = {
  oauth: IconGoogle,
  passkey: IconUserKey,
  apple: IconApple,
  email_otp: IconEmail1,
  sms: IconPhone,
};

/** Figma auth screen order. */
export const AUTH_METHOD_ORDER: AuthMethod[] = [
  'passkey',
  'oauth',
  'apple',
  'email_otp',
  'sms',
];
