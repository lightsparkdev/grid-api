'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TextMorph } from 'torph/react';
import clsx from 'clsx';
import { Badge } from '@lightsparkdev/origin/badge';
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare6';
import type { ApiCall } from '@/data/flow';
import {
  formatCurlString,
  formatResponseString,
  formatWebhookPayload,
  formatWebhookResponse,
  highlightCurl,
  highlightJson,
  highlightStatus,
  stepTitle,
} from '@/lib/apiCodeFormat';
import { formatAbsoluteTime, formatRelativeTime } from '@/lib/formatRelativeTime';
import { groupApiEntries } from '@/lib/groupApiEntries';
import { useNowTick } from '@/hooks/useNowTick';
import { cubicBezierCss, easeOutSnappy, easeOutSwift, motionTransition } from '@/lib/easing';
import { SectionDivider } from '@/components/SectionDivider/SectionDivider';
import type { Entry, EntryGroup } from './types';
import styles from './ApiCallList.module.scss';

type CodeTab = 'request' | 'response';

const syntaxClasses = {
  default: styles.syntaxDefault,
  command: styles.syntaxCommand,
  flag: styles.syntaxFlag,
  string: styles.syntaxString,
};

/** Method colours as the API reference shows them (Mintlify's defaults):
 *  GET green, POST blue, PATCH orange (yellow is the nearest the Badge has),
 *  DELETE red. Webhooks take the reference's blue WEBHOOK pill. */
function methodBadgeVariant(method: ApiCall['method']): 'blue' | 'green' | 'yellow' | 'red' {
  switch (method) {
    case 'GET':
      return 'green';
    case 'POST':
      return 'blue';
    case 'PATCH':
      return 'yellow';
    case 'DELETE':
      return 'red';
    default: {
      const never: never = method;
      throw new Error(`Unknown method ${String(never)}`);
    }
  }
}

/** Tab labels: what you send / what comes back for a call you make; the
 *  payload Grid delivered / what your endpoint answered for a webhook. */
const CALL_TAB_LABELS: Record<CodeTab, string> = { request: 'Request', response: 'Response' };
const WEBHOOK_TAB_LABELS: Record<CodeTab, string> = { request: 'Payload', response: 'Response' };

function CodeTabs({
  tab,
  labels,
  onTabChange,
}: {
  tab: CodeTab;
  labels: Record<CodeTab, string>;
  onTabChange: (tab: CodeTab) => void;
}) {
  const tabGroupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<HTMLButtonElement>(null);
  const responseRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const activeEl = tab === 'request' ? requestRef.current : responseRef.current;
    if (!activeEl) return;

    setIndicator({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
    });
  }, [tab]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const group = tabGroupRef.current;
    if (!group) return;

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(group);
    return () => observer.disconnect();
  }, [updateIndicator]);

  return (
    <div
      className={clsx(styles.tabGroup, tab === 'request' && styles.tabGroupLeadingActive)}
      ref={tabGroupRef}
      role="tablist"
      aria-label="Request or response"
    >
      <motion.span
        className={styles.tabIndicator}
        aria-hidden
        initial={false}
        animate={indicator}
        transition={motionTransition()}
      />
      <button
        ref={requestRef}
        type="button"
        role="tab"
        aria-selected={tab === 'request'}
        className={clsx(styles.tab, tab === 'request' && styles.tabActive)}
        onClick={() => onTabChange('request')}
      >
        {labels.request}
      </button>
      <button
        ref={responseRef}
        type="button"
        role="tab"
        aria-selected={tab === 'response'}
        className={clsx(styles.tab, tab === 'response' && styles.tabActive)}
        onClick={() => onTabChange('response')}
      >
        {labels.response}
      </button>
    </div>
  );
}

function CopyButton({
  text,
  ariaLabel = 'Copy code',
  className,
  stopPropagation,
}: {
  text: string;
  ariaLabel?: string;
  className?: string;
  stopPropagation?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (stopPropagation) event.stopPropagation();
      void handleCopy();
    },
    [handleCopy, stopPropagation],
  );

  return (
    <button
      type="button"
      className={clsx(styles.copyBtn, className)}
      onClick={handleClick}
      aria-label={copied ? 'Copied' : ariaLabel}
    >
      {copied ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <IconSquareBehindSquare6 size={16} />
      )}
    </button>
  );
}

/** The endpoint line. A call you make: its method and path on the Grid API.
 *  A webhook you receive: the way the API reference lists it — a WEBHOOK
 *  badge and the webhook's name in the spec (`card-status-change`) — so the
 *  row points straight at its reference page. */
function EndpointBlock({
  method,
  path,
  inbound,
}: {
  method: ApiCall['method'];
  path: string;
  inbound?: boolean;
}) {
  const copyPath = useCallback(async () => {
    await navigator.clipboard.writeText(path);
  }, [path]);

  const handleClick = useCallback(() => {
    const selected = window.getSelection()?.toString().trim();
    if (selected) return;
    void copyPath();
  }, [copyPath]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void copyPath();
      }
    },
    [copyPath],
  );

  return (
    <div
      className={styles.endpointBlock}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label={`Copy endpoint ${path}`}
    >
      <div className={styles.endpointScroll}>
        {inbound ? <Badge variant="blue">WEBHOOK</Badge> : <Badge variant={methodBadgeVariant(method)}>{method}</Badge>}
        <span className={styles.path}>{path}</span>
      </div>
      <div className={styles.endpointFade} aria-hidden />
      <div className={styles.endpointCopyBtn}>
        <CopyButton
          text={path}
          ariaLabel={`Copy endpoint ${path}`}
          stopPropagation
        />
      </div>
    </div>
  );
}

function FeedTimestamp({ timestamp, now }: { timestamp: number; now: number }) {
  const relative = formatRelativeTime(timestamp, now);
  const absolute = formatAbsoluteTime(timestamp);

  return (
    <time className={styles.timestamp} dateTime={new Date(timestamp).toISOString()} title={absolute}>
      {relative}
    </time>
  );
}

function ApiCallBlock({ entry, now, isNew }: { entry: Entry; now: number; isNew: boolean }) {
  const [tab, setTab] = useState<CodeTab>('request');
  const inbound = Boolean(entry.inbound);

  // A call you make reads as the curl you'd run and the JSON you'd get back.
  // A webhook reads as the JSON Grid delivered (its signature header above
  // it) and the status your endpoint answered with.
  const request = useMemo(() => (inbound ? formatWebhookPayload(entry) : formatCurlString(entry)), [entry, inbound]);
  const response = useMemo(
    () => (inbound ? formatWebhookResponse(entry) : formatResponseString(entry)),
    [entry, inbound],
  );
  const copyText = tab === 'request' ? request : response;
  // The endpoint line names the webhook as the API reference does.
  const endpoint = inbound ? entry.webhook ?? entry.path : entry.path;

  const highlighted = useMemo(() => {
    if (tab === 'request') return inbound ? highlightJson(request, syntaxClasses) : highlightCurl(request, syntaxClasses);
    return inbound ? highlightStatus(response, syntaxClasses) : highlightJson(response, syntaxClasses);
  }, [inbound, tab, request, response]);

  return (
    <div className={styles.callCard}>
      <div className={styles.entryHeader}>
        <span className={styles.entryTitleRow}>
          <TextMorph
            as="span"
            className={styles.titleBullet}
            duration={TITLE_MORPH_MS}
            ease={cubicBezierCss(easeOutSwift)}
            aria-hidden
          >
            {isNew ? '\u2022\u00A0' : ''}
          </TextMorph>
          <span className={styles.entryTitle}>{stepTitle(entry)}</span>
        </span>
        <FeedTimestamp timestamp={entry.createdAt} now={now} />
      </div>
      <EndpointBlock method={entry.method} path={endpoint} inbound={inbound} />
      <div className={styles.codeBlock}>
        <div className={styles.codeBlockToolbar}>
          <CodeTabs tab={tab} labels={inbound ? WEBHOOK_TAB_LABELS : CALL_TAB_LABELS} onTabChange={setTab} />
          <CopyButton text={copyText} />
        </div>
        <div className={styles.codeBlockContent}>
          <pre className={styles.codePre}>
            <code>{highlighted}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

interface ApiCallListProps {
  entries: Entry[];
  /** Keys of calls not yet seen — each gets a "new" dot (stacked layout only). */
  newKeys: Set<string>;
}

// New entries/groups animate their real HEIGHT (0 → auto), so the cards below are
// pushed down by the browser's own reflow — smooth, no FLIP snapshot, no snap. An
// inner layer adds the 16px rise + blur-fade so the content settles up into place.
// Spacing is folded into the box (entries carry padding-bottom; the group header a
// margin-bottom) so a collapsed item reserves zero gap — no "pop" before it grows.
const FEED_IN = motionTransition(easeOutSnappy, 0.42);
const FEED_OUT = motionTransition(easeOutSnappy, 0.26);
const RISE_HIDDEN = { opacity: 0, y: 16, filter: 'blur(8px)' };
const RISE_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };
const EXPAND_HIDDEN = { height: 0 };
const EXPAND_REST = { height: 'auto' as const };
const EXPAND_EXIT = { height: 0, opacity: 0 };
// The "new call" bullet is torph-morphed in/out before the title.
const TITLE_MORPH_MS = 300;

function FeedEntry({ entry, now, isNew }: { entry: Entry; now: number; isNew: boolean }) {
  return (
    <motion.div
      className={styles.feedEntry}
      initial={EXPAND_HIDDEN}
      animate={EXPAND_REST}
      exit={{ ...EXPAND_EXIT, transition: FEED_OUT }}
      transition={FEED_IN}
    >
      <motion.div initial={RISE_HIDDEN} animate={RISE_REST} transition={FEED_IN}>
        <ApiCallBlock entry={entry} now={now} isNew={isNew} />
      </motion.div>
    </motion.div>
  );
}

function FeedGroup({
  group,
  now,
  newKeys,
}: {
  group: EntryGroup;
  now: number;
  newKeys: Set<string>;
}) {
  return (
    <motion.article
      className={styles.group}
      initial={EXPAND_HIDDEN}
      animate={EXPAND_REST}
      exit={{ ...EXPAND_EXIT, transition: FEED_OUT }}
      transition={FEED_IN}
    >
      <motion.div
        className={styles.groupInner}
        initial={RISE_HIDDEN}
        animate={RISE_REST}
        transition={FEED_IN}
      >
        <div className={styles.groupDivider}>
          <SectionDivider label={group.groupLabel} showFlowIcon />
        </div>
        <div className={styles.groupEntries}>
          {/* initial={false}: entries that arrive with a brand-new group don't
              double-animate — the group's own height-expand reveals them. Calls
              added to an existing group expand + rise in one at a time. */}
          <AnimatePresence initial={false}>
            {group.entries.map((entry) => (
              <FeedEntry key={entry.key} entry={entry} now={now} isNew={newKeys.has(entry.key)} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.article>
  );
}

export function ApiCallList({ entries, newKeys }: ApiCallListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Re-sample every second so the live seconds (5s…59s) count up smoothly and a
  // new call never renders the rest against a stale clock. Cheap: the per-call
  // code blocks are memoized, so only the sub-minute rows change text.
  const now = useNowTick(1000);
  // Reverse-chron everywhere: newest group on top, and newest call on top within
  // each group (e.g. Verify OTP above Request OTP).
  const groups = useMemo(
    () =>
      groupApiEntries(entries)
        .map((group) => ({ ...group, entries: [...group.entries].reverse() }))
        .reverse(),
    [entries],
  );

  // New activity lands at the top — keep it in view, but don't yank the user
  // away if they've scrolled down to read an older call.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollTop < 80) el.scrollTo({ top: 0, behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className={styles.list} ref={scrollRef}>
      <div className={styles.feed}>
        {/* initial={false}: the first group rides ApiPanel's skeleton→list
            blur-fade; groups added afterward expand + rise in (real-reflow push
            on the groups below — no snap). */}
        <AnimatePresence initial={false}>
          {groups.map((group) => (
            <FeedGroup key={group.groupId} group={group} now={now} newKeys={newKeys} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
