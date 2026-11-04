import { ACTIONS, type ActionId } from './actions';

/** The Figma's flow glyphs: colored strokes that read on both themes. */
const FLOW_ICON_SRC: Record<ActionId, string> = {
  connect: '/assets/flows/connect.svg',
  fund: '/assets/flows/fund.svg',
  limits: '/assets/flows/set-limits.svg',
  pay: '/assets/flows/pay-someone.svg',
  buy: '/assets/flows/buy-online.svg',
  agent: '/assets/flows/pay-an-agent.svg',
};

export type FlowIconCmp = (props: { size?: number }) => JSX.Element;

/** The 20px glyph sits in a 24px slot, as in the Figma. */
function flowIcon(id: ActionId): FlowIconCmp {
  const src = FLOW_ICON_SRC[id];
  function FlowIcon({ size = 24 }: { size?: number }) {
    const glyph = Math.round((size * 20) / 24);
    return (
      <span style={{ display: 'grid', placeItems: 'center', width: size, height: size }}>
        <img src={src} alt="" width={glyph} height={glyph} draggable={false} />
      </span>
    );
  }
  return FlowIcon;
}

/** Shared with FlowPicker and the API feed's section dividers. */
export const FLOW_ICONS: Record<ActionId, FlowIconCmp> = {
  connect: flowIcon('connect'),
  fund: flowIcon('fund'),
  limits: flowIcon('limits'),
  pay: flowIcon('pay'),
  buy: flowIcon('buy'),
  agent: flowIcon('agent'),
};

export function actionIdForLabel(label: string): ActionId | undefined {
  return ACTIONS.find((action) => action.label === label)?.id;
}

export function flowIconForLabel(label: string): { Icon: FlowIconCmp } | null {
  const id = actionIdForLabel(label);
  if (!id) return null;
  return { Icon: FLOW_ICONS[id] };
}
