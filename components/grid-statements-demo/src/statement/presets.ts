import type { StaticImageData } from 'next/image';
import creatorIcon from '../../public/assets/presets/app-icon-creator.png';
import financeIcon from '../../public/assets/presets/app-icon-finance.png';
import marketplaceIcon from '../../public/assets/presets/app-icon-marketplace.png';
import messagingIcon from '../../public/assets/presets/app-icon-messaging.png';
import ondemandIcon from '../../public/assets/presets/app-icon-ondemand.png';
import socialIcon from '../../public/assets/presets/app-icon-social.png';

export type PresetId =
  | 'finance'
  | 'creator'
  | 'social'
  | 'marketplace'
  | 'ondemand'
  | 'messaging';

export interface StatementPreset {
  id: PresetId;
  companyName: string;
  description: string;
  icon: StaticImageData | string;
}

export const PRESETS: readonly StatementPreset[] = [
  { id: 'finance', companyName: 'Aurora', description: 'Financial app', icon: financeIcon },
  { id: 'creator', companyName: 'Glitch', description: 'Creator platform', icon: creatorIcon },
  { id: 'social', companyName: 'Z', description: 'Social app', icon: socialIcon },
  {
    id: 'marketplace',
    companyName: 'Waterbnb',
    description: 'Travel marketplace',
    icon: marketplaceIcon,
  },
  {
    id: 'ondemand',
    companyName: 'Super',
    description: 'On-demand platform',
    icon: ondemandIcon,
  },
  {
    id: 'messaging',
    companyName: 'ChatsApp',
    description: 'Messaging platform',
    icon: messagingIcon,
  },
] as const;

export function presetIconSrc(preset: StatementPreset): string {
  return typeof preset.icon === 'string' ? preset.icon : preset.icon.src;
}
