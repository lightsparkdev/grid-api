'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import clsx from 'clsx';
import type { ApiCall } from '@/data/flow';
import { IconConsole } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconConsole';
import type { Entry } from '@/components/ApiPanel/types';
import { formatApiUrl } from '@/lib/apiCodeFormat';
import styles from './ApiSteps.module.scss';

export type { Entry };

export default function ApiSteps({ entries }: { entries: Entry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            <IconConsole size={18} />
          </span>
          <span className={styles.headerTitle}>API calls</span>
        </span>
        <span className={styles.headerHint}>
          {entries.length} request{entries.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className={styles.content} ref={scrollRef}>
        {entries.length === 0 ? (
          <div className={styles.empty}>
            Pick a sign-in method and run actions on the app — the exact Grid API calls appear here
            as they fire.
          </div>
        ) : (
          <div className={styles.steps}>
            <AnimatePresence initial={false}>
              {entries.map((e, i) => (
                <motion.div
                  key={e.key}
                  className={styles.step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <div className={styles.stepHeader}>
                    <span className={clsx(styles.stepBadge, e.fresh && styles.stepBadgeFresh)}>
                      <span>{i + 1}</span>
                    </span>
                    <span className={styles.stepTitle}>{e.note ?? requestTitle(e)}</span>
                  </div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepLineCol}>
                      {i < entries.length - 1 && <div className={styles.stepLine} />}
                    </div>
                    <div className={styles.stepCodeCol}>
                      <div className={clsx(styles.codeBlock, e.fresh && styles.codeBlockFresh)}>
                        <div className={styles.codeBlockHeader}>
                          <span className={styles.codeBlockDesc}>
                            {e.method} · {e.status}
                          </span>
                        </div>
                        <div className={styles.codeBlockContent}>
                          <pre className={styles.codePre}>{renderCurl(e)}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function requestTitle(e: ApiCall) {
  const resource = e.path.split('?')[0].split('/').filter(Boolean).pop();
  return `${e.method} ${resource}`;
}

/* GitHub-style highlighted curl, matching grid-visualizer's CodePanel. */
function renderCurl(e: ApiCall): React.ReactNode {
  const lines: React.ReactNode[] = [];
  const body = e.reqBody;
  const headerEntries = Object.entries(e.headers ?? {});
  const hasExtraHeaders = headerEntries.length > 0;
  const hasBody = !!body;
  const cont = hasExtraHeaders || hasBody ? <span className={styles.syntaxDefault}> \</span> : null;
  lines.push(
    <span key="cmd">
      <span className={styles.syntaxCommand}>curl</span>
      <span className={styles.syntaxFlag}> -X {e.method}</span>{' '}
      <span className={styles.syntaxString}>&quot;{formatApiUrl(e.path)}&quot;</span>
      {cont}
      {'\n'}
    </span>,
  );
  lines.push(
    <span key="auth">
      <span className={styles.syntaxFlag}>  -H</span>{' '}
      <span className={styles.syntaxString}>&quot;Authorization: Basic $GRID_KEY&quot;</span>
      {hasExtraHeaders || hasBody ? <span className={styles.syntaxDefault}> \</span> : null}
      {'\n'}
    </span>,
  );
  headerEntries.forEach(([name, value], i) => {
    const needsCont = i < headerEntries.length - 1 || hasBody;
    lines.push(
      <span key={`header-${name}`}>
        <span className={styles.syntaxFlag}>  -H</span>{' '}
        <span className={styles.syntaxString}>&quot;{name}: {value}&quot;</span>
        {needsCont ? <span className={styles.syntaxDefault}> \</span> : null}
        {'\n'}
      </span>,
    );
  });
  if (hasBody) {
    lines.push(
      <span key="data">
        <span className={styles.syntaxFlag}>  -d</span>{' '}
        <span className={styles.syntaxDefault}>&apos;</span>
        {renderJson(body, 1)}
        <span className={styles.syntaxDefault}>&apos;</span>
      </span>,
    );
  }
  return lines;
}

function renderJson(obj: Record<string, unknown>, indent: number): React.ReactNode {
  const pad = '  '.repeat(indent);
  const padEnd = '  '.repeat(indent - 1);
  const keys = Object.keys(obj);
  return (
    <>
      {'{\n'}
      {keys.map((k, i) => {
        const v = obj[k];
        const comma = i < keys.length - 1 ? ',' : '';
        return (
          <span key={k}>
            {pad}
            <span className={styles.syntaxFlag}>&quot;{k}&quot;</span>
            <span className={styles.syntaxDefault}>: </span>
            {renderVal(v, indent)}
            <span className={styles.syntaxDefault}>{comma}</span>
            {'\n'}
          </span>
        );
      })}
      {padEnd}
      {'}'}
    </>
  );
}

function renderVal(v: unknown, indent: number): React.ReactNode {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return renderJson(v as Record<string, unknown>, indent + 1);
  }
  if (typeof v === 'string') return <span className={styles.syntaxString}>&quot;{v}&quot;</span>;
  return <span className={styles.syntaxCommand}>{String(v)}</span>;
}
