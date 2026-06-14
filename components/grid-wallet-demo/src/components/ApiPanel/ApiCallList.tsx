'use client';

// hmr-probe
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import clsx from 'clsx';
import { Badge } from '@lightsparkdev/origin/badge';
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare6';
import type { ApiCall } from '@/data/flow';
import {
  formatCurlString,
  formatResponseString,
  highlightCurl,
  highlightJson,
  stepTitle,
} from '@/lib/apiCodeFormat';
import { formatAbsoluteTime, formatRelativeTime } from '@/lib/formatRelativeTime';
import { groupApiEntries } from '@/lib/groupApiEntries';
import { useNowTick } from '@/hooks/useNowTick';
import { easeOutSnappy, motionTransition } from '@/lib/easing';
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

function methodBadgeVariant(method: ApiCall['method']): 'blue' | 'green' {
  return method === 'GET' ? 'green' : 'blue';
}

const TAB_INSET_PX = 8;

function CodeTabs({
  tab,
  onTabChange,
}: {
  tab: CodeTab;
  onTabChange: (tab: CodeTab) => void;
}) {
  const tabGroupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<HTMLButtonElement>(null);
  const responseRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const activeEl = tab === 'request' ? requestRef.current : responseRef.current;
    const group = tabGroupRef.current;
    if (!activeEl || !group) return;

    setIndicator({
      left: activeEl.offsetLeft + TAB_INSET_PX,
      width: activeEl.offsetWidth - TAB_INSET_PX * 2,
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
    <div className={styles.tabGroup} ref={tabGroupRef} role="tablist" aria-label="Request or response">
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
        Request
      </button>
      <button
        ref={responseRef}
        type="button"
        role="tab"
        aria-selected={tab === 'response'}
        className={clsx(styles.tab, tab === 'response' && styles.tabActive)}
        onClick={() => onTabChange('response')}
      >
        Response
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

function EndpointBlock({
  method,
  path,
}: {
  method: ApiCall['method'];
  path: string;
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
        <Badge variant={methodBadgeVariant(method)}>{method}</Badge>
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

function ApiCallBlock({ entry, now }: { entry: Entry; now: number }) {
  const [tab, setTab] = useState<CodeTab>('request');

  const curl = useMemo(() => formatCurlString(entry), [entry]);
  const response = useMemo(() => formatResponseString(entry), [entry]);
  const copyText = tab === 'request' ? curl : response;

  const highlighted = useMemo(
    () => (tab === 'request' ? highlightCurl(curl, syntaxClasses) : highlightJson(response, syntaxClasses)),
    [tab, curl, response],
  );

  return (
    <div className={styles.callCard}>
      <div className={styles.entryHeader}>
        <span className={styles.entryTitle}>{stepTitle(entry)}</span>
        <FeedTimestamp timestamp={entry.createdAt} now={now} />
      </div>
      <EndpointBlock method={entry.method} path={entry.path} />
      <div className={styles.codeBlock}>
        <div className={styles.codeBlockToolbar}>
          <CodeTabs tab={tab} onTabChange={setTab} />
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
}

// New cards/groups blur-fade in and push the rest down — the app's content
// language, on the snappy-out curve.
const FEED_IN = motionTransition(easeOutSnappy, 0.42);
const FEED_OUT = motionTransition(easeOutSnappy, 0.26);
const FEED_HIDDEN = { opacity: 0, y: -8, filter: 'blur(8px)' };
const FEED_REST = { opacity: 1, y: 0, filter: 'blur(0px)' };

function FeedGroup({ group, now }: { group: EntryGroup; now: number }) {
  return (
    <motion.article
      layout
      className={styles.group}
      initial={FEED_HIDDEN}
      animate={FEED_REST}
      exit={{ ...FEED_HIDDEN, transition: FEED_OUT }}
      transition={FEED_IN}
    >
      <SectionDivider label={group.groupLabel} showFlowIcon />
      <div className={styles.groupEntries}>
        {group.entries.map((entry) => (
          <motion.div
            layout
            key={entry.key}
            className={styles.feedEntry}
            initial={FEED_HIDDEN}
            animate={FEED_REST}
            transition={FEED_IN}
          >
            <ApiCallBlock entry={entry} now={now} />
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

export function ApiCallList({ entries }: ApiCallListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = useNowTick();
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
        <AnimatePresence initial={false}>
          {groups.map((group) => (
            <FeedGroup key={group.groupId} group={group} now={now} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
