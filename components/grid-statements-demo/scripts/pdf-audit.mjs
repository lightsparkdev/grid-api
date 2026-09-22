#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';

const baseUrl = process.env.STATEMENTS_URL ?? 'http://127.0.0.1:4003';
const output = new URL(
  `../.artifacts/visual-audit/${process.env.AUDIT_LABEL ?? 'pdf-audit'}/`,
  import.meta.url,
);
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const context = await browser.newContext({
  viewport: { width: 1680, height: 1050 },
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
await page.addInitScript(() => {
  window.__printArtifact = null;
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof HTMLIFrameElement) || !node.contentWindow) continue;
        node.contentWindow.print = () => {
          window.__printArtifact = {
            html: node.contentDocument?.documentElement.outerHTML ?? '',
            title: node.contentDocument?.title ?? '',
            framePresent: node.isConnected,
          };
        };
      }
    }
  }).observe(document, { childList: true, subtree: true });
});
await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
await page.getByText('listTransactions').waitFor();
await page.getByRole('button', { name: 'Export' }).click();
await page.getByRole('button', { name: 'Save PDF' }).click();
await page.waitForFunction(() => window.__printArtifact !== null);

const artifact = await page.evaluate(() => window.__printArtifact);
assert.equal(artifact.title, 'aurora-september-statement');
assert.equal(artifact.framePresent, true);
assert.match(artifact.html, /@page\{size:auto;margin:0\}/);
assert.match(artifact.html, /padding:12mm/);
const framePresentBeforeAfterprint =
  (await page.locator('iframe[title="Statement PDF"]').count()) === 1;
assert.equal(framePresentBeforeAfterprint, true);
await writeFile(new URL('print-document.html', output), artifact.html);

const pdfPage = await context.newPage();
await pdfPage.setContent(artifact.html, { waitUntil: 'load' });
await pdfPage.pdf({
  path: new URL('actual-export.pdf', output).pathname,
  format: 'Letter',
  displayHeaderFooter: true,
  preferCSSPageSize: true,
  printBackground: true,
});
await pdfPage.close();

await page.locator('iframe[title="Statement PDF"]').evaluate((element) => {
  const target = element.contentWindow;
  if (target) target.dispatchEvent(new target.Event('afterprint'));
});
await page.locator('iframe[title="Statement PDF"]').waitFor({ state: 'detached' });
const frameRemovedAfterAfterprint =
  (await page.locator('iframe[title="Statement PDF"]').count()) === 0;
assert.equal(frameRemovedAfterAfterprint, true);
assert.deepEqual(errors, []);
const webkitBrowser = await webkit.launch();
const webkitContext = await webkitBrowser.newContext({
  viewport: { width: 1680, height: 1050 },
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const webkitPage = await webkitContext.newPage();
const webkitErrors = [];
webkitPage.on('pageerror', (error) => webkitErrors.push(error.message));
webkitPage.on('console', (message) => {
  if (message.type() === 'error') webkitErrors.push(message.text());
});
await webkitPage.addInitScript(() => {
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof HTMLIFrameElement) || !node.contentWindow) continue;
        node.contentWindow.print = () => undefined;
      }
    }
  }).observe(document, { childList: true, subtree: true });
});
await webkitPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
await webkitPage.getByText('listTransactions').waitFor();
await webkitPage.getByRole('button', { name: 'Export' }).click();
await webkitPage.getByRole('button', { name: 'Save PDF' }).click();
const webkitFrame = webkitPage.locator('iframe[title="Statement PDF"]');
await webkitFrame.waitFor();
await webkitFrame.evaluate((element) => {
  const target = element.contentWindow;
  if (target) target.dispatchEvent(new target.Event('afterprint'));
});
await webkitFrame.waitFor({ state: 'detached' });
const webkitFrameRemovedAfterAfterprint = (await webkitFrame.count()) === 0;
assert.equal(webkitFrameRemovedAfterAfterprint, true);
assert.deepEqual(webkitErrors, []);

await writeFile(
  new URL('pdf-audit.json', output),
  `${JSON.stringify({
    browser: browser.version(),
    webkitBrowser: webkitBrowser.version(),
    sourceUrl: baseUrl,
    title: artifact.title,
    framePresentBeforeAfterprint,
    frameRemovedAfterAfterprint,
    webkitFrameRemovedAfterAfterprint,
    errors,
    webkitErrors,
  }, null, 2)}\n`,
);
await webkitContext.close();
await webkitBrowser.close();
await context.close();
await browser.close();
console.log(output.pathname);
