import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import { IconEyeOpen } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeOpen';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconSnowFlakes } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSnowFlakes';
import { IconGauge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconGauge';
import { IconArrowUndoUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUndoUp';
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCrossMedium';
import { ACTIONS, type ActionId } from './actions';

export type FlowIconCmp = typeof IconCreditCardAdd;

/** Shared with FlowPicker + API feed section dividers. */
export const FLOW_ICONS: Record<ActionId, FlowIconCmp> = {
  card: IconCreditCardAdd,
  tap: IconNfc1,
  reveal: IconEyeOpen,
  wallet: IconWallet1,
  freeze: IconSnowFlakes,
  limits: IconGauge,
  refund: IconArrowUndoUp,
  close: IconCrossMedium,
};

/** One palette pair per grid row. */
export const FLOW_ICON_COLORS: Record<ActionId, string> = {
  card: 'var(--color-blue-500)',
  tap: 'var(--icon-info)',
  reveal: '#34C759',
  wallet: '#34C759',
  freeze: 'var(--color-sky-500)',
  limits: '#009DE0',
  refund: 'var(--color-blue-500)',
  close: 'var(--icon-info)',
};

export function actionIdForLabel(label: string): ActionId | undefined {
  return ACTIONS.find((action) => action.label === label)?.id;
}

export function flowIconForLabel(label: string): { Icon: FlowIconCmp } | null {
  const id = actionIdForLabel(label);
  if (!id) return null;
  return { Icon: FLOW_ICONS[id] };
}
