import type { ReactNode } from 'react';
import { GRID_API_BASE_URL, type ApiCall } from '@/data/flow';

export function formatApiUrl(path: string): string {
  return `${GRID_API_BASE_URL}${path}`;
}

export function stepTitle(entry: ApiCall): string {
  if (entry.title) return entry.title;
  const resource = entry.path.split('?')[0].split('/').filter(Boolean).pop();
  return `${entry.method} ${resource}`;
}

/** The Authorization header a request carries: the platform's API key, the
 *  agent's own token, or none (redeeming a device code). */
function authHeader(entry: ApiCall): string | null {
  const auth = entry.auth ?? 'platform';
  switch (auth) {
    case 'platform':
      return 'Basic $GRID_KEY';
    case 'agent':
      return 'Bearer $AGENT_TOKEN';
    case 'none':
      return null;
    default: {
      const exhaustive: never = auth;
      return exhaustive;
    }
  }
}

export function formatCurlString(entry: ApiCall): string {
  const lines: string[] = [];
  // Inbound webhooks are sent BY Grid TO your endpoint, so `path` is already a
  // full URL and there's no Grid auth header (Grid signs with X-Grid-Signature).
  // Everything else is an outbound call to the Grid API, signed by the
  // platform's key or the agent's token.
  const url = entry.inbound ? entry.path : formatApiUrl(entry.path);
  const headerEntries = Object.entries(entry.headers ?? {});
  const auth = entry.inbound ? null : authHeader(entry);
  if (auth) headerEntries.unshift(['Authorization', auth]);
  const hasBody = !!entry.reqBody;
  // curl defaults `-d` to application/x-www-form-urlencoded; the API wants JSON.
  if (hasBody && !headerEntries.some(([name]) => name.toLowerCase() === 'content-type')) {
    headerEntries.push(['Content-Type', 'application/json']);
  }

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

/* ── Inbound webhooks ─────────────────────────────────────────────────────
   Grid → your endpoint. The payload is the JSON Grid delivered (not a curl
   you would run); the response is the status your endpoint answered with. */

/** The JSON body Grid POSTed to your endpoint. */
export function formatWebhookPayload(entry: ApiCall): string {
  return JSON.stringify(entry.reqBody ?? {}, null, 2);
}

/** What your endpoint answered, e.g. "200 OK". Grid treats any 2xx as
 *  delivered and retries anything else. */
export function formatWebhookResponse(entry: ApiCall): string {
  return entry.status;
}

export function formatResponseString(entry: ApiCall): string {
  return JSON.stringify(entry.resBody ?? {}, null, 2);
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

      const methodMatch = remaining.match(/^(GET|POST|PATCH|PUT|DELETE)\b/);
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

/** An HTTP status line such as "200 OK": the code, then the reason. */
export function highlightStatus(code: string, s: SyntaxClass): ReactNode[] {
  const m = code.match(/^(\d{3})(.*)$/);
  if (!m) return [<span key="s" className={s.default}>{code}</span>];
  return [
    <span key="code" className={s.command}>{m[1]}</span>,
    <span key="reason" className={s.default}>{m[2]}</span>,
  ];
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
