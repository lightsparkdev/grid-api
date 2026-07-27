import type { ReactNode } from 'react';
import { GRID_API_BASE_URL, type ApiCall } from '@/data/flow';

export function formatApiUrl(path: string): string {
  return `${GRID_API_BASE_URL}${path}`;
}

export function stepTitle(entry: ApiCall): string {
  if (entry.title) return entry.title;
  const path = entry.path.split('?')[0];
  if (path.includes('/execute')) return 'Execute quote';
  if (path.endsWith('/quotes') && entry.method === 'POST') return 'Create quote';
  if (path.includes('/transactions/')) return 'Get transaction';
  if (path.includes('/challenge')) return 'Start challenge';
  if (path.includes('/verify')) return 'Verify credential';
  const resource = path.split('/').filter(Boolean).pop();
  return `${entry.method} ${resource}`;
}

export function formatCurlString(entry: ApiCall): string {
  const lines: string[] = [];
  // Inbound webhooks are sent BY Grid TO your endpoint, so `path` is already a
  // full URL and there's no Grid auth header (Grid signs with X-Grid-Signature).
  // Everything else is an outbound call to the Grid API with your key.
  const url = entry.inbound ? entry.path : formatApiUrl(entry.path);
  const headerEntries = Object.entries(entry.headers ?? {});
  if (!entry.inbound) headerEntries.unshift(['Authorization', 'Basic $GRID_KEY']);
  const hasBody = !!entry.reqBody;

  lines.push(`curl -X ${entry.method} "${url}"${headerEntries.length || hasBody ? ' \\' : ''}`);

  headerEntries.forEach(([name, value], i) => {
    const cont = i < headerEntries.length - 1 || hasBody ? ' \\' : '';
    lines.push(`  -H "${name}: ${value}"${cont}`);
  });

  if (hasBody) {
    lines.push(`  -d '${JSON.stringify(entry.reqBody, null, 2)}'`);
  }

  return lines.join('\n');
}

/**
 * The Response tab. Every entry in the panel comes from real traffic — a proxy
 * envelope or a delivered webhook — so `resBody` is what Grid actually returned.
 * There is deliberately NO fallback that fabricates a plausible body: this file
 * used to synthesize quotes, transactions and auth sessions for entries without
 * one, which rendered as if the API had said it.
 */
export function formatResponseString(entry: ApiCall): string {
  if (entry.resBody !== undefined) return JSON.stringify(entry.resBody, null, 2);
  return '// No response recorded for this entry.';
}

type SyntaxClass = {
  default: string;
  command: string;
  flag: string;
  string: string;
  /** Per-line wrapper class. Rendered as a BLOCK by the panel, which is what
   *  supplies the line break — so the lines carry no trailing newline. */
  line: string;
};

export function highlightCurl(code: string, s: SyntaxClass): ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      // The line-continuation backslash, glued to the word before it with a
      // NBSP so a wrapped line can't orphan it onto a row of its own. Display
      // only — the copy text comes from formatCurlString, which keeps the space.
      if (/^ \\$/.test(remaining)) {
        parts.push(<span key={partKey++} className={s.default}>{'\u00a0\\'}</span>);
        break;
      }

      const wsMatch = remaining.match(/^(\s+)/);
      if (wsMatch) {
        parts.push(<span key={partKey++} className={s.default}>{wsMatch[1]}</span>);
        remaining = remaining.slice(wsMatch[1].length);
        continue;
      }

      if (lineIdx === 0 && partKey === 0 && remaining.startsWith('curl')) {
        parts.push(<span key={partKey++} className={s.command}>curl</span>);
        remaining = remaining.slice(4);
        continue;
      }

      const flagMatch = remaining.match(/^(-[A-Za-z]+)/);
      if (flagMatch) {
        parts.push(<span key={partKey++} className={s.flag}>{flagMatch[1]}</span>);
        remaining = remaining.slice(flagMatch[1].length);
        continue;
      }

      const sqMatch = remaining.match(/^('[^']*(?:'|$))/);
      if (sqMatch) {
        parts.push(<span key={partKey++} className={s.string}>{sqMatch[1]}</span>);
        remaining = remaining.slice(sqMatch[1].length);
        continue;
      }

      const dqMatch = remaining.match(/^("[^"]*")/);
      if (dqMatch) {
        parts.push(<span key={partKey++} className={s.string}>{dqMatch[1]}</span>);
        remaining = remaining.slice(dqMatch[1].length);
        continue;
      }

      const methodMatch = remaining.match(/^(GET|POST)\b/);
      if (methodMatch) {
        parts.push(<span key={partKey++} className={s.flag}>{methodMatch[1]}</span>);
        remaining = remaining.slice(methodMatch[1].length);
        continue;
      }

      if (remaining.startsWith('\\')) {
        parts.push(<span key={partKey++} className={s.default}>\</span>);
        remaining = remaining.slice(1);
        continue;
      }

      parts.push(<span key={partKey++} className={s.default}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <span key={lineIdx} className={s.line}>
        {parts}
      </span>
    );
  });
}

export function highlightJson(code: string, s: SyntaxClass): ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      const keyMatch = remaining.match(/^("(?:[^"\\]|\\.)*")(\s*:)/);
      if (keyMatch) {
        parts.push(<span key={partKey++} className={s.flag}>{keyMatch[1]}</span>);
        parts.push(<span key={partKey++} className={s.default}>{keyMatch[2]}</span>);
        remaining = remaining.slice(keyMatch[0].length);
        continue;
      }

      const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
      if (strMatch) {
        parts.push(<span key={partKey++} className={s.string}>{strMatch[1]}</span>);
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }

      const numMatch = remaining.match(/^(\d+)/);
      if (numMatch) {
        parts.push(<span key={partKey++} className={s.command}>{numMatch[1]}</span>);
        remaining = remaining.slice(numMatch[1].length);
        continue;
      }

      parts.push(<span key={partKey++} className={s.default}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <span key={lineIdx} className={s.line}>
        {parts}
      </span>
    );
  });
}
