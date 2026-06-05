'use client';

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
  stepDescription,
  stepTitle,
} from '@/lib/apiCodeFormat';
import { motionTransition } from '@/lib/easing';
import type { Entry } from './types';
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
}: {
  text: string;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      type="button"
      className={styles.copyBtn}
      onClick={handleCopy}
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
  const [copied, setCopied] = useState(false);

  const copyPath = useCallback(async () => {
    await navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
      className={clsx(styles.endpointBlock, copied && styles.endpointBlockCopied)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label={copied ? 'Copied endpoint' : `Copy endpoint ${path}`}
    >
      <div className={styles.endpointScroll}>
        <Badge variant={methodBadgeVariant(method)}>{method}</Badge>
        <span className={styles.path}>{path}</span>
      </div>
      <div className={styles.endpointFade} aria-hidden />
      <span className={styles.endpointCopy} aria-hidden>
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
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <IconSquareBehindSquare6 size={16} />
        )}
      </span>
    </div>
  );
}

function ApiCallBlock({ entry }: { entry: Entry }) {
  const [tab, setTab] = useState<CodeTab>('request');

  const curl = useMemo(() => formatCurlString(entry), [entry]);
  const response = useMemo(() => formatResponseString(entry), [entry]);
  const copyText = tab === 'request' ? curl : response;

  const highlighted = useMemo(
    () => (tab === 'request' ? highlightCurl(curl, syntaxClasses) : highlightJson(response, syntaxClasses)),
    [tab, curl, response],
  );

  return (
    <div className={clsx(styles.callCard, entry.fresh && styles.callCardFresh)}>
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

export function ApiCallList({ entries }: ApiCallListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className={styles.list} ref={scrollRef}>
      <div className={styles.steps}>
        <AnimatePresence initial={false}>
          {entries.map((entry, i) => (
            <motion.div
              key={entry.key}
              className={styles.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className={styles.stepHeader}>
                <span className={clsx(styles.stepBadge, entry.fresh && styles.stepBadgeFresh)}>
                  <span>{i + 1}</span>
                </span>
                <div className={styles.stepLabels}>
                  <span className={styles.stepTitle}>{stepTitle(entry)}</span>
                  {stepDescription(entry) ? (
                    <span className={styles.stepDescription}>{stepDescription(entry)}</span>
                  ) : null}
                </div>
              </div>
              <div className={styles.stepContent}>
                <div className={styles.stepLineCol}>
                  {i < entries.length - 1 && <div className={styles.stepLine} />}
                </div>
                <div className={styles.stepCodeCol}>
                  <ApiCallBlock entry={entry} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
