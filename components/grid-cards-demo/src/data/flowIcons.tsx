import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import { IconEyeOpen } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconEyeOpen';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { IconSnowFlakes } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSnowFlakes';
import { IconLimit } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLimit';
import { IconArrowUndoUp } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowUndoUp';
import { IconCircleX } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCircleX';
import { ACTIONS, type ActionId } from './actions';

export type FlowIconCmp = typeof IconCreditCardAdd;

/** Shared with FlowPicker + API feed section dividers. All render on
 *  `--icon-primary`; there is no per-flow color. */
export const FLOW_ICONS: Record<ActionId, FlowIconCmp> = {
  card: IconCreditCardAdd,
  tap: IconNfc1,
  reveal: IconEyeOpen,
  wallet: IconWallet1,
  freeze: IconSnowFlakes,
  limits: IconLimit,
  refund: IconArrowUndoUp,
  close: IconCircleX,
};

export function actionIdForLabel(label: string): ActionId | undefined {
  return ACTIONS.find((action) => action.label === label)?.id;
}

export function flowIconForLabel(label: string): { Icon: FlowIconCmp } | null {
  const id = actionIdForLabel(label);
  if (!id) return null;
  return { Icon: FLOW_ICONS[id] };
}
