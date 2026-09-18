import { describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, PERIODS, buildStatement } from './fixtures';
import { buildStatementHtml, statementExportFilename } from './export';

describe('statement export', () => {
  it('uses one extension for PDF and HTML filenames', () => {
    const statement = buildStatement('consumer', DEFAULT_BRAND, PERIODS[1]);
    expect(statementExportFilename(statement, 'pdf')).toBe(
      'aurora-statement-2026-08.pdf',
    );
    expect(statementExportFilename(statement, 'html')).toBe(
      'aurora-statement-2026-08.html',
    );
  });

  it('builds one self-contained HTML document with an embedded logo', async () => {
    const source = document.createElement('article');
    source.style.background = '#ffffff';
    source.innerHTML =
      '<header><img alt="Logo" src="data:image/png;base64,AAAA"><strong>Monthly statement</strong></header><p>Legal statement copy</p>';

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
  });
});
