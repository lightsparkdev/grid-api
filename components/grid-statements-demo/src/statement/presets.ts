import type { StaticImageData } from 'next/image';
import creatorIcon from '../../public/assets/presets/app-icon-creator.png';
import financeIcon from '../../public/assets/presets/app-icon-finance.png';
import marketplaceIcon from '../../public/assets/presets/app-icon-marketplace.png';
import messagingIcon from '../../public/assets/presets/app-icon-messaging.png';
import ondemandIcon from '../../public/assets/presets/app-icon-ondemand.png';
import socialIcon from '../../public/assets/presets/app-icon-social.png';
import type { HexColor, StatementBrandColors } from './types';

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
  colors: StatementBrandColors;
}

export const PRESETS: readonly StatementPreset[] = [
  {
    id: 'finance',
    companyName: 'Aurora',
    description: 'Financial app',
    icon: financeIcon,
    colors: {
      primaryBackground: '#ffffff',
      primaryText: '#1a1a1a',
      secondaryText: '#4f5960',
    },
  },
  {
    id: 'creator',
    companyName: 'Glitch',
    description: 'Creator platform',
    icon: creatorIcon,
    colors: {
      primaryBackground: '#ffffff',
      primaryText: '#1a1a1a',
      secondaryText: '#5b426f',
    },
  },
  {
    id: 'social',
    companyName: 'Z',
    description: 'Social app',
    icon: socialIcon,
    colors: {
      primaryBackground: '#ffffff',
      primaryText: '#0f1419',
      secondaryText: '#536471',
    },
  },
  {
    id: 'marketplace',
    companyName: 'Waterbnb',
    description: 'Travel marketplace',
    icon: marketplaceIcon,
    colors: {
      primaryBackground: '#ffffff',
      primaryText: '#222222',
      secondaryText: '#6a4a50',
    },
  },
  {
    id: 'ondemand',
    companyName: 'Super',
    description: 'On-demand platform',
    icon: ondemandIcon,
    colors: {
      primaryBackground: '#ffffff',
      primaryText: '#000000',
      secondaryText: '#4b4b4b',
    },
  },
  {
    id: 'messaging',
    companyName: 'ChatsApp',
    description: 'Messaging platform',
    icon: messagingIcon,
    colors: {
      primaryBackground: '#ffffff',
      primaryText: '#111b21',
      secondaryText: '#496157',
    },
  },
] as const;

export function presetIconSrc(preset: StatementPreset): string {
  return typeof preset.icon === 'string' ? preset.icon : preset.icon.src;
}

const NEUTRAL_COLORS: StatementBrandColors = {
  primaryBackground: '#f7f7f6',
  primaryText: '#656565',
  secondaryText: '#1a1a1a',
};

export function colorSwatchesForPreset(
  preset: StatementPreset,
  key: keyof StatementBrandColors,
): readonly [HexColor, HexColor] {
  const presetColor = preset.colors[key];
  const neutral = NEUTRAL_COLORS[key];
  if (presetColor !== neutral) return [presetColor, neutral];
  return [
    presetColor,
    key.endsWith('Background') ? '#ffffff' : '#1a1a1a',
  ];
}
