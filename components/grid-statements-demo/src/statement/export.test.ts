import { describe, expect, it } from 'vitest';
import { DEFAULT_BRAND, STATEMENT_PERIOD, buildStatement } from './fixtures';
import { buildStatementHtml, statementExportFilename } from './export';

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
  });
});
