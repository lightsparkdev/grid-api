import { IconArrowInbox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowInbox';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconHistory } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHistory';
import { IconLimit } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLimit';
import { IconPaperPlaneTopRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPaperPlaneTopRight';
import { IconPlugin1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlugin1';
import { IconPlusLarge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusLarge';
import { IconAiBotHead } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconAiBotHead';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { ACTIONS, type ActionId } from './actions';

export type FlowIconCmp = typeof IconPlugin1;

/** Shared with FlowPicker + API feed section dividers. */
export const FLOW_ICONS: Record<ActionId, FlowIconCmp> = {
  connect: IconPlugin1,
  fund: IconPlusLarge,
  limits: IconLimit,
  pay: IconPaperPlaneTopRight,
  buy: IconCreditCard1,
  agent: IconAiBotHead,
  getpaid: IconArrowInbox,
  cashout: IconBank,
  balance: IconWallet1,
  history: IconHistory,
};

/** Green to blue down both grids, in reading order, as in the Global Accounts
 *  playground: its anchors (#34C759, --icon-success, --color-sky-500,
 *  --color-blue-500, --icon-info) with steps between for the extra rows. */
export const FLOW_ICON_COLORS: Record<ActionId, string> = {
  connect: '#34C759',
  fund: '#22B96C',
  limits: 'var(--icon-success)',
  balance: '#0BAB8F',
  pay: '#05AEB8',
  buy: 'var(--color-sky-500)',
  agent: '#00A2EE',
  getpaid: 'var(--color-blue-500)',
  cashout: '#0082ED',
  history: 'var(--icon-info)',
};

function actionIdForLabel(label: string): ActionId | undefined {
  return ACTIONS.find((action) => action.label === label)?.id;
}

export function flowIconForLabel(label: string): { Icon: FlowIconCmp } | null {
  const id = actionIdForLabel(label);
  if (!id) return null;
  return { Icon: FLOW_ICONS[id] };
}
