import { IconArrowBoxRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowBoxRight';
import { IconPaperPlaneTopRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPaperPlaneTopRight';
import { IconArrowInbox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowInbox';
import { IconQrCode } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconQrCode';
import { IconArrowOutOfBox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowOutOfBox';
import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { IconNfc1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconNfc1';
import { ACTIONS, type ActionId } from './actions';

export type FlowIconCmp = typeof IconArrowBoxRight;

/** Shared with FlowPicker + API feed section dividers. */
export const FLOW_ICONS: Record<ActionId, FlowIconCmp> = {
  create: IconArrowBoxRight,
  add: IconArrowInbox,
  send: IconPaperPlaneTopRight,
  receive: IconQrCode,
  withdraw: IconArrowOutOfBox,
  card: IconCreditCardAdd,
  tap: IconNfc1,
};

/** One palette pair per grid row: greens, sky blues, blues. */
export const FLOW_ICON_COLORS: Record<ActionId, string> = {
  create: '#34C759',
  add: '#34C759',
  withdraw: 'var(--icon-success)',
  send: 'var(--color-sky-500)',
  receive: '#009DE0',
  card: 'var(--color-blue-500)',
  tap: 'var(--icon-info)',
};

export function actionIdForLabel(label: string): ActionId | undefined {
  return ACTIONS.find((action) => action.label === label)?.id;
}

export function flowIconForLabel(label: string): { Icon: FlowIconCmp } | null {
  const id = actionIdForLabel(label);
  if (!id) return null;
  return { Icon: FLOW_ICONS[id] };
}
