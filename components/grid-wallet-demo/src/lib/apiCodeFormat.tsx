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
  const url = formatApiUrl(entry.path);
  const headerEntries = Object.entries(entry.headers ?? {});
  const hasExtraHeaders = headerEntries.length > 0;
  const hasBody = !!entry.reqBody;

  lines.push(`curl -X ${entry.method} "${url}" \\`);
  lines.push(`  -H "Authorization: Basic $GRID_KEY" \\`);

  headerEntries.forEach(([name, value], i) => {
    const cont = i < headerEntries.length - 1 || hasBody ? ' \\' : '';
    lines.push(`  -H "${name}: ${value}"${cont}`);
  });

  if (hasBody) {
    lines.push(`  -d '${JSON.stringify(entry.reqBody, null, 2)}'`);
  }

  return lines.join('\n');
}

export function stubResponseBody(entry: ApiCall): Record<string, unknown> {
  if (entry.path.includes('/verify')) {
    return {
      sessionSigningKey: '<HPKE sealed key>',
      expiresAt: '2026-06-05T12:15:00Z',
    };
  }
  if (entry.path.endsWith('/quotes') && entry.method === 'POST') {
    return {
      id: 'Quote:019e8f49-3c8f-5246-0000-4d75f9a6d1d1',
      status: 'PENDING',
      payloadToSign: '<base64 payload>',
    };
  }
  if (entry.path.includes('/execute')) {
    return {
      id: 'Transaction:019e8f49-3ca4-b78f-0000-1d3e9a411168',
      status: 'PROCESSING',
    };
  }
  if (entry.path.includes('/transactions/')) {
    return {
      id: 'Transaction:019e8f49-3ca4-b78f-0000-1d3e9a411168',
      status: 'COMPLETED',
    };
  }
  return { status: 'ok' };
}

export function formatResponseString(entry: ApiCall): string {
  return JSON.stringify(stubResponseBody(entry), null, 2);
}

type SyntaxClass = {
  default: string;
  command: string;
  flag: string;
  string: string;
};

export function highlightCurl(code: string, s: SyntaxClass): ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const parts: ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
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
      <span key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 ? '\n' : null}
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
      <span key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 ? '\n' : null}
      </span>
    );
  });
}
