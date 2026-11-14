import { IconArrowInbox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowInbox';
import { IconArrowOutOfBox } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowOutOfBox';
import { IconBank } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBank';
import { IconBuildings } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconBuildings';
import { IconChecklist } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChecklist';
import { IconCoin1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCoin1';
import { IconCoins } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCoins';
import { IconCreditCard1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCard1';
import { IconCreditCardAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconCreditCardAdd';
import { IconFileText } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconFileText';
import { IconHistory } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconHistory';
import { IconLimit } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconLimit';
import { IconMoneyHand } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconMoneyHand';
import { IconPaperPlaneTopRight } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPaperPlaneTopRight';
import { IconPeople } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPeople';
import { IconPeopleAdd } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPeopleAdd';
import { IconPeopleIdCard } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPeopleIdCard';
import { IconPlugin1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlugin1';
import { IconPlusLarge } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconPlusLarge';
import { IconAiBotHead } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconAiBotHead';
import { IconReceiptBill } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconReceiptBill';
import { IconWallet1 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconWallet1';
import { ACTIONS, type ActionId } from './actions';

export type FlowIconCmp = typeof IconPlugin1;

/** Shared with FlowPicker + API feed section dividers. */
export const FLOW_ICONS: Record<ActionId, FlowIconCmp> = {
  connect: IconPlugin1,
  card: IconCreditCardAdd,
  bank: IconBank,
  fund: IconPlusLarge,
  limits: IconLimit,
  pay: IconPaperPlaneTopRight,
  crypto: IconCoin1,
  buy: IconCreditCard1,
  agent: IconAiBotHead,
  getpaid: IconArrowInbox,
  cashout: IconArrowOutOfBox,
  balance: IconWallet1,
  history: IconHistory,
  company: IconBuildings,
  teammate: IconPeopleAdd,
  team: IconPeople,
  empcard: IconPeopleIdCard,
  invoice: IconFileText,
  invoices: IconChecklist,
  bill: IconReceiptBill,
  contractor: IconMoneyHand,
  payroll: IconCoins,
};

/** Green to blue down both grids, in reading order, as in the Global Accounts
 *  playground: its anchors (#34C759, --icon-success, --color-sky-500,
 *  --color-blue-500, --icon-info) with steps between for the extra rows.
 *  The business grids follow the same ramp in their own order. */
export const FLOW_ICON_COLORS: Record<ActionId, string> = {
  connect: '#34C759',
  limits: '#2ABD66',
  card: '#22B96C',
  bank: 'var(--icon-success)',
  fund: '#10AE84',
  cashout: '#0BAB8F',
  balance: '#05AEB8',
  history: 'var(--color-sky-500)',
  pay: '#00A2EE',
  crypto: '#0098EE',
  getpaid: 'var(--color-blue-500)',
  buy: '#0082ED',
  agent: 'var(--icon-info)',
  company: '#34C759',
  teammate: '#2ABD66',
  team: '#22B96C',
  empcard: 'var(--icon-success)',
  invoice: '#00A2EE',
  invoices: '#0098EE',
  bill: 'var(--color-blue-500)',
  contractor: '#0082ED',
  payroll: 'var(--icon-info)',
};

function actionIdForLabel(label: string): ActionId | undefined {
  return ACTIONS.find((action) => action.label === label)?.id;
}

export function flowIconForLabel(label: string): { Icon: FlowIconCmp } | null {
  const id = actionIdForLabel(label);
  if (!id) return null;
  return { Icon: FLOW_ICONS[id] };
}
