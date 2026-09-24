import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from './fixtures';
import {
  PRINT_FALLBACK_MS,
  buildStatementHtml,
  printStatementHtml,
  statementExportFilename,
} from './export';

afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll('iframe[title="Statement PDF"]').forEach((frame) => frame.remove());
});

describe('statement export', () => {
  it('uses one extension for PDF and HTML filenames', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, STATEMENT_PERIOD);
    expect(statementExportFilename(statement, 'pdf')).toBe(
      'aurora-september-statement.pdf',
    );
    expect(statementExportFilename(statement, 'html')).toBe(
      'aurora-september-statement.html',
    );
  });

  it('builds one self-contained HTML document with an embedded logo', async () => {
    const source = document.createElement('article');
    source.style.background = '#ffffff';
    source.innerHTML =
      '<header><img alt="Logo" src="data:image/png;base64,AAAA"><strong>September statement</strong></header><p>Legal statement copy</p>';

    const html = await buildStatementHtml(source, 'Aurora statement');
    const parsed = new DOMParser().parseFromString(html, 'text/html');

    expect(parsed.querySelector('article')?.textContent).toContain(
      'Legal statement copy',
    );
    expect(parsed.querySelector('img')?.getAttribute('src')).toBe(
      'data:image/png;base64,AAAA',
    );
    expect(html).not.toMatch(/https?:|<link|@font-face|srcset=/i);
    expect(parsed.querySelector('article')?.getAttribute('style')).toContain(
      'font-family: Arial, Helvetica, sans-serif',
    );
    expect(parsed.title).toBe('Aurora statement');
    expect(html).toContain('@page{size:auto;margin:0}');
    expect(html).toContain('body{box-sizing:border-box;margin:0;padding:12mm');
  });

  it('keeps the print iframe until its window emits afterprint', async () => {
    vi.useFakeTimers();
    const observer = mockPrintFrame();
    const source = document.createElement('article');
    source.innerHTML = '<p>Legal statement copy</p>';

    await printStatementHtml(source, 'aurora-september-statement');
    observer.disconnect();

    const frame = document.querySelector<HTMLIFrameElement>(
      'iframe[title="Statement PDF"]',
    );
    expect(frame).not.toBeNull();
    expect(frame?.contentDocument?.title).toBe('aurora-september-statement');
    vi.advanceTimersByTime(PRINT_FALLBACK_MS - 1);
    expect(frame?.isConnected).toBe(true);

    const target = frame?.contentWindow;
    expect(target).not.toBeNull();
    const afterprint = target?.document.createEvent('Event');
    afterprint?.initEvent('afterprint', false, false);
    if (afterprint) target?.dispatchEvent(afterprint);
    expect(frame?.isConnected).toBe(false);
  });

  it('removes an abandoned print iframe after five minutes', async () => {
    vi.useFakeTimers();
    const observer = mockPrintFrame();
    const source = document.createElement('article');

    await printStatementHtml(source, 'aurora-september-statement');
    observer.disconnect();
    const frame = document.querySelector<HTMLIFrameElement>(
      'iframe[title="Statement PDF"]',
    );
    expect(frame?.isConnected).toBe(true);

    vi.advanceTimersByTime(PRINT_FALLBACK_MS);
    expect(frame?.isConnected).toBe(false);
  });
});

function mockPrintFrame(): MutationObserver {
  const observer = new MutationObserver(() => {
    const frame = document.querySelector<HTMLIFrameElement>(
      'iframe[title="Statement PDF"]',
    );
    if (!frame?.contentWindow) return;
    frame.contentWindow.focus = vi.fn();
    frame.contentWindow.print = vi.fn();
  });
  observer.observe(document.body, { childList: true });
  return observer;
}
