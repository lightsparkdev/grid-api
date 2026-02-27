'use client';

import { useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TextMorph } from 'torph/react';
import type { CurrencySelection } from '@/lib/code-generator';
import {
  generateSteps,
  formatCurl,
  formatStepJson,
  type ApiStep,
} from '@/lib/code-generator';
import { IconConsole } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconConsole';
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-3-stroke-1.5/IconSquareBehindSquare6';
import styles from './CodePanel.module.scss';

interface CodePanelProps {
  send: CurrencySelection;
  receive: CurrencySelection;
  fundingModel: 'jit' | 'pre-funded';
  audience: 'human' | 'agent';
  onAudienceChange: (audience: 'human' | 'agent') => void;
  expanded: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      className={styles.copyBtn}
      onClick={handleCopy}
      type="button"
      aria-label="Copy code"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className={styles.copyIcon}>
          <IconSquareBehindSquare6 size={16} />
        </span>
      )}
    </button>
  );
}

function highlightCurl(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      // Match leading whitespace
      const wsMatch = remaining.match(/^(\s+)/);
      if (wsMatch) {
        parts.push(<span key={partKey++} className={styles.syntaxDefault}>{wsMatch[1]}</span>);
        remaining = remaining.slice(wsMatch[1].length);
        continue;
      }

      // Match command keyword at start of code
      if (lineIdx === 0 && partKey === 0 && remaining.startsWith('curl')) {
        parts.push(<span key={partKey++} className={styles.syntaxCommand}>curl</span>);
        remaining = remaining.slice(4);
        continue;
      }

      // Match flags like -X, -H, -d
      const flagMatch = remaining.match(/^(-[A-Za-z]+)/);
      if (flagMatch) {
        parts.push(<span key={partKey++} className={styles.syntaxFlag}>{flagMatch[1]}</span>);
        remaining = remaining.slice(flagMatch[1].length);
        continue;
      }

      // Match single-quoted strings
      const sqMatch = remaining.match(/^('[^']*(?:'|$))/);
      if (sqMatch) {
        parts.push(<span key={partKey++} className={styles.syntaxString}>{sqMatch[1]}</span>);
        remaining = remaining.slice(sqMatch[1].length);
        continue;
      }

      // Match HTTP methods
      const methodMatch = remaining.match(/^(GET|POST|PUT|PATCH|DELETE)\b/);
      if (methodMatch) {
        parts.push(<span key={partKey++} className={styles.syntaxFlag}>{methodMatch[1]}</span>);
        remaining = remaining.slice(methodMatch[1].length);
        continue;
      }

      // Match line continuation
      if (remaining.startsWith('\\')) {
        parts.push(<span key={partKey++} className={styles.syntaxDefault}>\</span>);
        remaining = remaining.slice(1);
        continue;
      }

      // Default: consume one character
      parts.push(<span key={partKey++} className={styles.syntaxDefault}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <span key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 ? '\n' : null}
      </span>
    );
  });
}

function highlightJson(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      // Match property keys "key":
      const keyMatch = remaining.match(/^("(?:[^"\\]|\\.)*")(\s*:)/);
      if (keyMatch) {
        parts.push(<span key={partKey++} className={styles.syntaxFlag}>{keyMatch[1]}</span>);
        parts.push(<span key={partKey++} className={styles.syntaxDefault}>{keyMatch[2]}</span>);
        remaining = remaining.slice(keyMatch[0].length);
        continue;
      }

      // Match string values
      const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
      if (strMatch) {
        parts.push(<span key={partKey++} className={styles.syntaxString}>{strMatch[1]}</span>);
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }

      // Match numbers
      const numMatch = remaining.match(/^(\d+)/);
      if (numMatch) {
        parts.push(<span key={partKey++} className={styles.syntaxCommand}>{numMatch[1]}</span>);
        remaining = remaining.slice(numMatch[1].length);
        continue;
      }

      // Default
      parts.push(<span key={partKey++} className={styles.syntaxDefault}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <span key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 ? '\n' : null}
      </span>
    );
  });
}

function CodeBlock({ step, isHuman }: { step: ApiStep; isHuman: boolean }) {
  const code = isHuman ? formatCurl(step) : formatStepJson(step);
  const highlighted = useMemo(
    () => (isHuman ? highlightCurl(code) : highlightJson(code)),
    [code, isHuman],
  );

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeBlockDesc}>{step.description}</span>
        <CopyButton text={code} />
      </div>
      <div className={styles.codeBlockContent}>
        <pre className={styles.codePre}>
          <code>{highlighted}</code>
        </pre>
      </div>
    </div>
  );
}

function CodeStep({
  step,
  isHuman,
  isLast,
}: {
  step: ApiStep;
  isHuman: boolean;
  isLast: boolean;
}) {
  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <div className={styles.stepBadge}>
          <span>{step.step}</span>
        </div>
        <span className={styles.stepTitle}>{step.title}</span>
      </div>
      <div className={styles.stepContent}>
        <div className={styles.stepLineCol}>
          {!isLast && <div className={styles.stepLine} />}
        </div>
        <div className={styles.stepCodeCol}>
          <CodeBlock step={step} isHuman={isHuman} />
        </div>
      </div>
    </div>
  );
}

function CopyAllButton({ steps, isHuman }: { steps: ApiStep[]; isHuman: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = useCallback(async () => {
    const allCode = steps
      .map((s) => (isHuman ? formatCurl(s) : formatStepJson(s)))
      .join('\n\n');
    await navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [steps, isHuman]);

  return (
    <button
      className={styles.copyAllBtn}
      onClick={handleCopyAll}
      type="button"
    >
      <TextMorph>{copied ? 'Copied' : 'Copy all'}</TextMorph>
    </button>
  );
}

export function CodePanel({
  send,
  receive,
  fundingModel,
  audience,
  onAudienceChange,
  expanded,
}: CodePanelProps) {
  const steps = useMemo(
    () => generateSteps(send, receive, fundingModel),
    [send, receive, fundingModel],
  );

  const stepsKey = `${send.code}-${send.accountType}-${send.isInternal}-${receive.code}-${receive.accountType}-${receive.isInternal}-${fundingModel}-${audience}`;
  const isHuman = audience === 'human';

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            <IconConsole size={20} />
          </span>
          <span className={styles.headerTitle}>Code</span>
        </div>
        <div className={styles.headerRight}>
          <CopyAllButton steps={steps} isHuman={isHuman} />

          <div className={styles.audienceToggle}>
            <button
              className={`${styles.audienceTab} ${isHuman ? styles.audienceTabActive : ''}`}
              onClick={() => onAudienceChange('human')}
              type="button"
            >
              cURL
            </button>
            <button
              className={`${styles.audienceTab} ${!isHuman ? styles.audienceTabActive : ''}`}
              onClick={() => onAudienceChange('agent')}
              type="button"
            >
              AI agent
            </button>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.content}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={styles.stepsContainer}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepsKey}
                  className={styles.steps}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                >
                  {steps.map((step, i) => (
                    <CodeStep
                      key={`${step.step}-${audience}`}
                      step={step}
                      isHuman={isHuman}
                      isLast={i === steps.length - 1}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
