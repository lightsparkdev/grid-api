'use client';

import { useMemo, useRef, useCallback, useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { CurrencySelection } from '@/lib/code-generator';
import {
  buildFlowPath,
  type FlowNode as FlowNodeType,
  type ActionCard,
  type ActionColor,
  type ConnectorLabel,
} from '@/lib/flow-path';
import { IconArrowRightSquare } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconArrowRightSquare';
import { IconChevronTop } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconChevronTop';
import styles from './FlowPanel.module.scss';
import clsx from 'clsx';

interface FlowPanelProps {
  send: CurrencySelection;
  receive: CurrencySelection;
  sourceRegion?: string | null;
  destRegion?: string | null;
  expanded: boolean;
  onToggle: () => void;
}

const COLOR_BG: Record<ActionColor, string> = {
  fiat: 'rgba(17,169,103,0.1)',
  btc: 'rgba(247,125,38,0.1)',
  stable: 'rgba(0,82,180,0.1)',
};

const COLOR_TEXT: Record<ActionColor, string> = {
  fiat: '#118453',
  btc: '#db610a',
  stable: '#0052b4',
};

const COLOR_STROKE: Record<ActionColor, string> = {
  fiat: '#11a967',
  btc: '#f77d26',
  stable: '#0052b4',
};

interface ConnectorPath {
  d: string;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed: boolean;
}

function offsetRelativeTo(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let cur: HTMLElement | null = el;
  while (cur && cur !== ancestor) {
    x += cur.offsetLeft;
    y += cur.offsetTop;
    cur = cur.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

function measureConnectors(
  inner: HTMLElement,
  nodes: FlowNodeType[],
): ConnectorPath[] {
  if (nodes.length < 2) return [];

  const nodeEls = inner.querySelectorAll<HTMLElement>('[data-flow-node]');
  const result: ConnectorPath[] = [];

  for (let i = 0; i < nodeEls.length - 1; i++) {
    const curr = nodeEls[i];
    const next = nodeEls[i + 1];
    const cards = curr.querySelectorAll<HTMLElement>('[data-action-card]');
    const lastCard = cards[cards.length - 1];
    if (!lastCard) continue;

    // Use offsetLeft/offsetTop — immune to CSS transforms (animation-safe)
    const cardPos = offsetRelativeTo(lastCard, inner);
    const x1 = cardPos.x + lastCard.offsetWidth;
    const y1 = cardPos.y + lastCard.offsetHeight / 2;

    const nextPos = offsetRelativeTo(next, inner);
    const x2 = nextPos.x;
    const y2 = nextPos.y + next.offsetHeight / 2;

    const dx = (x2 - x1) * 0.5;
    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    const lastAction = nodes[i].actionCards[nodes[i].actionCards.length - 1];
    const color = COLOR_STROKE[lastAction.color];

    const sourceIsExternal = nodes[i].type === 'endpoint' && !nodes[i].isInternal;
    const destIsExternal = nodes[i + 1].type === 'endpoint' && !nodes[i + 1].isInternal;
    const dashed = sourceIsExternal || destIsExternal;

    result.push({ d, color, x1, y1, x2, y2, dashed });
  }

  return result;
}

function actionBg(card: ActionCard): string {
  if (card.gradientFrom) {
    return `linear-gradient(90deg, ${COLOR_BG[card.gradientFrom]} 0%, ${COLOR_BG[card.color]} 100%)`;
  }
  return COLOR_BG[card.color];
}

function NodeIcon({ node }: { node: FlowNodeType }) {
  if (node.type === 'switch') {
    return (
      <div className={styles.switchIconWrapper}>
        <div className={styles.switchIconMain}>
          <svg className={styles.gridLogoImg} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.07353 2.79297V5.84232H8.89351V2.79297H13.1721V7.07157H10.1228V8.89156H13.1721V13.1702H8.89351V10.1208H7.07353V13.1702H2.79492V8.89156H5.84427V7.07157H2.79492V2.79297H7.07353ZM10.1228 11.9409H11.9429V10.1208H10.1228V11.9409ZM4.02418 11.9409H5.84427V10.1208H4.02418V11.9409ZM7.07353 8.89156H8.89351V7.07157H7.07353V8.89156ZM10.1228 5.84232H11.9429V4.02222H10.1228V5.84232ZM4.02418 5.84232H5.84427V4.02222H4.02418V5.84232Z" fill="currentColor"/>
          </svg>
        </div>
        {node.flag && (
          <div className={styles.switchIconBadge}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/flags/${node.flag}.svg`} alt="" className={styles.switchBadgeImg} />
          </div>
        )}
      </div>
    );
  }

  if (node.cryptoIcon) {
    return (
      <div className={styles.endpointIcon}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={node.cryptoIcon} alt="" className={styles.endpointIconImg} />
      </div>
    );
  }

  if (node.flag) {
    return (
      <div className={styles.endpointIcon}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/flags/${node.flag}.svg`} alt="" className={styles.endpointIconImg} />
      </div>
    );
  }

  return null;
}

type ShowTooltip = (text: string, x: number, y: number) => void;
type HideTooltip = () => void;
const TooltipCtx = createContext<{ show: ShowTooltip; hide: HideTooltip } | null>(null);

function FlowNodeActionCard({
  card,
  index,
  total,
}: {
  card: ActionCard;
  index: number;
  total: number;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isSingle = total === 1;

  const radiusClass = isSingle
    ? styles.actionCardFull
    : isFirst
      ? styles.actionCardTop
      : isLast
        ? styles.actionCardBottom
        : styles.actionCardMiddle;

  return (
    <div
      data-action-card
      className={clsx(styles.actionCard, radiusClass)}
      style={{
        background: actionBg(card),
        color: COLOR_TEXT[card.gradientFrom ?? card.color],
      }}
    >
      {card.text}
    </div>
  );
}

const SWITCH_TOOLTIP = 'Grid Switch converts currencies and routes payments in real time using Bitcoin and local payment rails';
const EXTERNAL_TOOLTIP = 'External account — a bank account or crypto wallet outside of Grid';
const INTERNAL_TOOLTIP = 'Grid internal account — holds a balance within Grid, enabling instant transfers';

function getNodeTooltip(node: FlowNodeType): string | null {
  if (node.type === 'switch') return SWITCH_TOOLTIP;
  return node.isInternal ? INTERNAL_TOOLTIP : EXTERNAL_TOOLTIP;
}

function FlowNode({
  node,
  index,
}: {
  node: FlowNodeType;
  index: number;
}) {
  const ctx = useContext(TooltipCtx);
  const tip = getNodeTooltip(node);

  const showAbove = useCallback(
    (e: React.MouseEvent) => {
      if (!tip || !ctx) return;
      const rect = e.currentTarget.getBoundingClientRect();
      ctx.show(tip, rect.left + rect.width / 2, rect.top);
    },
    [tip, ctx],
  );

  return (
    <motion.div
      data-flow-node
      className={clsx(
        styles.node,
        tip && styles.nodeInteractive,
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.3 }}
      onMouseEnter={showAbove}
      onMouseLeave={tip ? () => ctx?.hide() : undefined}
      onClick={showAbove}
    >
      <div className={styles.nodeTop}>
        <NodeIcon node={node} />
        <div className={styles.nodeTitleGroup}>
          <span className={styles.nodeTitle}>{node.label}</span>
          {node.sublabel && (
            <span className={styles.nodeSublabel}>{node.sublabel}</span>
          )}
        </div>
      </div>
      <div className={styles.nodeActions}>
        <div className={styles.actionCards}>
          {node.actionCards.map((card, i) => (
            <FlowNodeActionCard
              key={i}
              card={card}
              index={i}
              total={node.actionCards.length}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function FlowPanel({
  send,
  receive,
  sourceRegion,
  destRegion,
  expanded,
  onToggle,
}: FlowPanelProps) {
  const path = useMemo(() => buildFlowPath(send, receive, sourceRegion, destRegion), [send, receive, sourceRegion, destRegion]);
  const pathKey = path.nodes.map((n) => n.id + n.label + n.isInternal + n.actionCards.map((a) => a.text).join(',')).join('|');
  const contentRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const flowInnerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [connectors, setConnectors] = useState<ConnectorPath[]>([]);
  const [scale, setScale] = useState(1);
  const blockFitRef = useRef(false);
  const hasCollapsedRef = useRef(false);
  const fitRef = useRef<(() => void) | null>(null);
  const draggingRef = useRef(false);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [hoveredConnIdx, setHoveredConnIdx] = useState<number | null>(null);

  const tooltipCtx = useMemo(() => ({
    show: (text: string, x: number, y: number) => setTooltip({ text, x, y }),
    hide: () => setTooltip(null),
  }), []);

  if (!expanded) {
    blockFitRef.current = true;
    hasCollapsedRef.current = true;
  } else if (!hasCollapsedRef.current) {
    blockFitRef.current = false;
  }

  useEffect(() => {
    if (!expanded) return;

    const flow = flowRef.current;
    const inner = flowInnerRef.current;
    if (!flow || !inner) return;

    let lastW = 0;
    let lastH = 0;

    const fit = (force = false) => {
      if (blockFitRef.current) return;
      const w = flow.clientWidth;
      const h = flow.clientHeight;
      if (w === 0 || h === 0) return;
      if (!force && w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;

      inner.style.transform = 'none';

      const paths = measureConnectors(inner, path.nodes);
      setConnectors(paths);

      const cs = getComputedStyle(flow);
      const availW = w - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = h - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const naturalW = inner.offsetWidth;
      const naturalH = inner.offsetHeight;

      if (naturalW > 0 && naturalH > 0) {
        const s = Math.min(availW / naturalW, availH / naturalH, 1.25);
        inner.style.transform = `scale(${s})`;
        setScale(s);
      }
    };

    fitRef.current = () => fit(true);
    const ro = new ResizeObserver(() => fit());
    ro.observe(flow);
    return () => {
      ro.disconnect();
      fitRef.current = null;
    };
  }, [path, expanded]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      const startY = e.clientY;
      const startHeight =
        contentRef.current?.getBoundingClientRect().height ?? 240;

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientY - startY;
        const next = Math.max(200, Math.min(window.innerHeight * 0.5, startHeight + delta));
        setHeight(next);
      };

      const onUp = () => {
        draggingRef.current = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [],
  );

  return (
    <div className={styles.panel}>
      <div className={clsx(styles.header, !expanded && styles.headerCollapsed)}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            <IconArrowRightSquare size={20} />
          </span>
          <span className={styles.headerTitle}>Flow</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerHint}>Hover on flow for details</span>
          <button className={styles.collapseBtn} onClick={onToggle} type="button">
            <span className={expanded ? styles.chevronUp : styles.chevronDown}>
              <IconChevronTop size={16} />
            </span>
          </button>
        </div>
      </div>

      <TooltipCtx.Provider value={tooltipCtx}>
        <AnimatePresence>
          {expanded && (
            <motion.div
              ref={contentRef}
              className={styles.content}
              initial={
                hasCollapsedRef.current
                  ? { height: 0, opacity: 0 }
                  : { opacity: 0 }
              }
              animate={{
                height: height ?? '30vh',
                opacity: 1,
                transition: {
                  height: {
                    duration: draggingRef.current ? 0 : hasCollapsedRef.current ? 0.25 : 0,
                    ease: 'easeInOut',
                  },
                  opacity: {
                    duration: 0.2,
                    delay: hasCollapsedRef.current ? 0.15 : 0,
                  },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  opacity: { duration: 0.1, ease: 'easeOut' },
                  height: { duration: 0.2, ease: 'easeInOut' },
                },
              }}
              onAnimationComplete={() => {
                if (expanded) {
                  blockFitRef.current = false;
                  fitRef.current?.();
                }
              }}
            >
              <div ref={flowRef} className={styles.flow}>
                <div
                  key={pathKey}
                  ref={flowInnerRef}
                  className={styles.flowInner}
                >
                  {path.nodes.map((node, i) => (
                    <FlowNode key={node.id} node={node} index={i} />
                  ))}
                  <svg className={styles.connectorOverlay}>
                    {connectors.map((c, i) => {
                      const connLabel = path.connectorLabels[i]?.text ?? 'Transfer';
                      const tipText = c.dashed
                        ? `${connLabel} — dashed line indicates external leg`
                        : connLabel;
                      return (
                      <g
                        key={i}
                        className={clsx(styles.connectorLine, hoveredConnIdx === i && styles.connectorHovered)}
                        style={{
                          animationDelay: `${(i + 1) * 120 + 60}ms`,
                          '--connector-color': c.color,
                        } as React.CSSProperties}
                        onMouseEnter={(e) => {
                          setHoveredConnIdx(i);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ text: tipText, x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => {
                          setHoveredConnIdx(null);
                          setTooltip(null);
                        }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ text: tipText, x: rect.left + rect.width / 2, y: rect.top });
                        }}
                      >
                        <path
                          d={c.d}
                          stroke="transparent"
                          fill="none"
                          strokeWidth={56 / Math.max(scale, 1)}
                          className={styles.connectorHitArea}
                        />
                        <circle cx={c.x1} cy={c.y1} r={3 / Math.max(scale, 1)} fill={c.color} />
                        <path
                          d={c.d}
                          stroke={c.color}
                          fill="none"
                          strokeWidth={1.75 / Math.max(scale, 1)}
                          strokeDasharray={c.dashed ? `${6 / Math.max(scale, 1)} ${4 / Math.max(scale, 1)}` : undefined}
                        />
                        <circle cx={c.x2} cy={c.y2} r={3 / Math.max(scale, 1)} fill={c.color} />
                      </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
              <div
                className={styles.resizeHandle}
                onMouseDown={handleDragStart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipCtx.Provider>

      {createPortal(
        <AnimatePresence>
          {tooltip && (
            <div
              key={`${Math.round(tooltip.x)}-${Math.round(tooltip.y)}`}
              className={styles.flowTooltipAnchor}
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <motion.div
                className={styles.flowTooltip}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {tooltip.text}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
