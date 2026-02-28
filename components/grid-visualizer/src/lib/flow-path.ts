import type { CurrencySelection } from './code-generator';
import { currencies } from '@/data/currencies';

export type ActionColor = 'fiat' | 'btc' | 'stable';

export interface ActionCard {
  text: string;
  color: ActionColor;
  gradientFrom?: ActionColor;
}

export interface FlowNode {
  id: string;
  type: 'endpoint' | 'switch';
  label: string;
  sublabel?: string;
  flag?: string;
  cryptoIcon?: string;
  isInternal: boolean;
  actionCards: ActionCard[];
}

export interface ConnectorLabel {
  text: string;
}

export interface FlowPath {
  nodes: FlowNode[];
  connectorLabels: ConnectorLabel[];
}

function getCountryName(countryCode?: string): string {
  const map: Record<string, string> = {
    us: 'US', eu: 'EU', gb: 'UK', br: 'BR', mx: 'MX', ng: 'NG',
    ca: 'CA', sg: 'SG', in: 'IN', ph: 'PH', sn: 'SN', cm: 'CM',
    gh: 'GH', ke: 'KE', za: 'ZA', bw: 'BW', tz: 'TZ', ug: 'UG',
    mw: 'MW', zm: 'ZM', cn: 'CN', hk: 'HK', id: 'ID', kr: 'KR',
    my: 'MY', th: 'TH', vn: 'VN', lk: 'LK', cr: 'CR', cd: 'CD',
  };
  return countryCode ? map[countryCode] || countryCode.toUpperCase() : '';
}

const STABLES = new Set(['USDC', 'USDT', 'USDB']);

function colorForCurrency(code: string, type: 'fiat' | 'crypto'): ActionColor {
  if (type === 'fiat') return 'fiat';
  if (STABLES.has(code)) return 'stable';
  return 'btc';
}

function getRailLabel(sel: CurrencySelection): string {
  if (sel.type === 'crypto' && sel.network) return sel.network;
  return sel.accountLabel;
}

function getEndpointLabel(sel: CurrencySelection): string {
  if (sel.isInternal) {
    return `Grid ${sel.code} Account`;
  }
  if (sel.type === 'fiat') {
    return `${getCountryName(sel.countryCode)} Bank Account`;
  }
  return sel.network ? `${sel.network} Wallet` : `${sel.name} Wallet`;
}

function getEndpointSublabel(sel: CurrencySelection): string {
  return sel.isInternal ? 'Internal account' : 'External account';
}

export function buildFlowPath(
  source: CurrencySelection,
  destination: CurrencySelection,
  sourceRegion?: string | null,
  destRegion?: string | null,
): FlowPath {
  const nodes: FlowNode[] = [];

  const sendColor = colorForCurrency(source.code, source.type);
  const receiveColor = colorForCurrency(destination.code, destination.type);

  // Source endpoint
  nodes.push({
    id: 'source',
    type: 'endpoint',
    label: getEndpointLabel(source),
    sublabel: getEndpointSublabel(source),
    flag: source.type === 'fiat' ? source.countryCode : undefined,
    cryptoIcon: source.type === 'crypto' ? `/crypto/${source.code.toLowerCase()}.svg` : undefined,
    isInternal: source.isInternal,
    actionCards: [{
      text: source.isInternal
        ? `Debit ${source.code} balance`
        : `Fund via ${source.accountLabel}`,
      color: sendColor,
    }],
  });

  // Resolve region info for crypto endpoints
  const srcRegionCode = source.type === 'crypto' && sourceRegion ? sourceRegion : null;
  const srcRegionCC = srcRegionCode
    ? currencies.find((c) => c.code === srcRegionCode)?.countryCode
    : undefined;
  const dstRegionCode = destination.type === 'crypto' && destRegion ? destRegion : null;
  const dstRegionCC = dstRegionCode
    ? currencies.find((c) => c.code === dstRegionCode)?.countryCode
    : undefined;

  // Determine the effective fiat code on each side (from currency or region)
  const srcFiat = source.type === 'fiat' ? source.code : srcRegionCode;
  const srcFiatCC = source.type === 'fiat' ? source.countryCode : srcRegionCC;
  const dstFiat = destination.type === 'fiat' ? destination.code : dstRegionCode;
  const dstFiatCC = destination.type === 'fiat' ? destination.countryCode : dstRegionCC;

  // Two switches needed when the fiat sides differ (cross-currency bridge via BTC/Lightning)
  const needsTwoSwitches =
    source.code !== destination.code &&
    srcFiat != null &&
    dstFiat != null &&
    srcFiat !== dstFiat;

  if (needsTwoSwitches) {
    // Source-side switch
    const sourceConvertAction: ActionCard = source.code === 'BTC'
      ? { text: 'Accept BTC deposit', color: 'btc' }
      : {
          text: `Convert ${source.code} to BTC`,
          color: 'btc',
          gradientFrom: sendColor,
        };

    nodes.push({
      id: 'switch1',
      type: 'switch',
      label: `${srcFiat} Grid Switch`,
      flag: srcFiatCC,
      isInternal: true,
      actionCards: [
        sourceConvertAction,
        {
          text: 'Send BTC via Lightning',
          color: 'btc',
        },
      ],
    });

    // Destination-side switch
    const destConvertAction: ActionCard = destination.code === 'BTC'
      ? { text: 'Deliver BTC to wallet', color: 'btc' }
      : {
          text: `Convert BTC to ${destination.code}`,
          color: receiveColor,
          gradientFrom: 'btc',
        };

    const destDeliverAction: ActionCard | null =
      destination.code === 'BTC'
        ? null // BTC delivery is already covered above
        : {
            text: destination.isInternal
              ? `Credit ${destination.code} balance`
              : `Deliver via ${destination.accountLabel}`,
            color: receiveColor,
          };

    nodes.push({
      id: 'switch2',
      type: 'switch',
      label: `${dstFiat} Grid Switch`,
      flag: dstFiatCC,
      isInternal: true,
      actionCards: destDeliverAction
        ? [destConvertAction, destDeliverAction]
        : [destConvertAction],
    });
  } else if (source.code !== destination.code) {
    // Single switch — same fiat region on both sides, or one side is fiat
    let switchLabel: string;
    let switchFlag: string | undefined;

    if (srcFiat) {
      switchLabel = `${srcFiat} Grid Switch`;
      switchFlag = srcFiatCC;
    } else if (dstFiat) {
      switchLabel = `${dstFiat} Grid Switch`;
      switchFlag = dstFiatCC;
    } else {
      switchLabel = 'Grid Switch';
    }

    const actions: ActionCard[] = [];
    actions.push({
      text: `Convert ${source.code} to ${destination.code}`,
      color: receiveColor,
      gradientFrom: sendColor,
    });
    if (!destination.isInternal) {
      actions.push({
        text: `Deliver via ${destination.accountLabel}`,
        color: receiveColor,
      });
    }

    nodes.push({
      id: 'switch1',
      type: 'switch',
      label: switchLabel,
      flag: switchFlag,
      isInternal: true,
      actionCards: actions,
    });
  }

  // Destination endpoint
  nodes.push({
    id: 'dest',
    type: 'endpoint',
    label: getEndpointLabel(destination),
    sublabel: getEndpointSublabel(destination),
    flag: destination.type === 'fiat' ? destination.countryCode : undefined,
    cryptoIcon: destination.type === 'crypto' ? `/crypto/${destination.code.toLowerCase()}.svg` : undefined,
    isInternal: destination.isInternal,
    actionCards: [{
      text: destination.isInternal
        ? `Credit ${destination.code} balance`
        : `Receive ${destination.code}`,
      color: receiveColor,
    }],
  });

  // Build connector labels
  const connectorLabels: ConnectorLabel[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];
    let text: string;

    if (curr.type === 'endpoint' && !curr.isInternal && next.type === 'switch') {
      const srcFiatData = source.type === 'fiat' ? currencies.find((c) => c.code === source.code) : null;
      const srcRail = srcFiatData
        ? (srcFiatData.instantRails[0] ?? srcFiatData.allRails[0] ?? source.accountLabel)
        : (source.network ?? source.accountLabel);
      text = `Funds in via ${srcRail}`;
    } else if (curr.type === 'switch' && next.type === 'endpoint' && !next.isInternal) {
      const dstFiatData = destination.type === 'fiat' ? currencies.find((c) => c.code === destination.code) : null;
      const dstRail = dstFiatData
        ? (dstFiatData.instantRails[0] ?? dstFiatData.allRails[0] ?? destination.accountLabel)
        : (destination.network ?? destination.accountLabel);
      text = `Funds out via ${dstRail}`;
    } else if (curr.type === 'switch' && next.type === 'switch') {
      // Switch → switch: Lightning bridge (always real-time)
      text = 'Real-time via Lightning Network';
    } else if (curr.type === 'endpoint' && curr.isInternal && next.type === 'switch') {
      text = `From Grid ${source.code} balance`;
    } else if (curr.type === 'switch' && next.type === 'endpoint' && next.isInternal) {
      text = `To Grid ${destination.code} balance`;
    } else if (curr.type === 'endpoint' && next.type === 'endpoint') {
      // Direct transfer (same currency, no switch)
      text = `${source.code} transfer`;
    } else {
      text = 'Transfer';
    }

    connectorLabels.push({ text });
  }

  return { nodes, connectorLabels };
}
