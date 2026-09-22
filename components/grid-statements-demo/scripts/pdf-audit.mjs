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
await writeFile(new URL('actual-export.html', output), artifact.html);

const pdfPage = await context.newPage();
await pdfPage.setContent(artifact.html, { waitUntil: 'load' });
await pdfPage.emulateMedia({ media: 'print' });
await pdfPage.evaluate(() => document.fonts.ready);
const printMetrics = await pdfPage.evaluate(() => {
  const article = document.querySelector('article');
  const masthead = article?.querySelector('header');
  const title = masthead?.querySelector('strong');
  const footer = article?.querySelector('footer');
  const values = Array.from(document.querySelectorAll('[data-amount-value]'));
  if (!article || !masthead || !title || !footer) {
    throw new Error('Missing printable statement structure');
  }
  const titleBox = title.getBoundingClientRect();
  const amountColumnBox = values[0]?.parentElement?.getBoundingClientRect();
  if (!amountColumnBox) throw new Error('Missing printable amount column');
  const parseRgb = (value) =>
    value
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number) ?? [];
  const luminance = (value) => {
    const channels = parseRgb(value).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const contrast = (foreground, background) => {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  };
  return {
    footerHairlines: document.querySelectorAll('[data-footer-hairline]').length,
    titleRightDelta:
      Math.round((amountColumnBox.right - titleBox.right) * 100) / 100,
    legalContrast: contrast(
      getComputedStyle(footer).color,
      getComputedStyle(article).backgroundColor,
    ),
    flags: values
      .map((value) => {
        const flag = value.nextElementSibling;
        if (!(flag instanceof HTMLElement)) return null;
        const valueBox = value.getBoundingClientRect();
        const flagBox = flag.getBoundingClientRect();
        const style = getComputedStyle(flag);
        return {
          gap: Math.round((flagBox.left - valueBox.right) * 100) / 100,
          raisedBy: Math.round((valueBox.top - flagBox.top) * 100) / 100,
          position: style.position,
          verticalAlign: style.verticalAlign,
          fontVariantNumeric: style.fontVariantNumeric,
        };
      })
      .filter(Boolean),
  };
});
assert.equal(printMetrics.footerHairlines, 2);
assert.equal(printMetrics.titleRightDelta, 0);
assert(printMetrics.legalContrast >= 4.5);
assert.deepEqual(
  printMetrics.flags,
  printMetrics.flags.map((flag) => ({
    gap: 2,
    raisedBy: flag.raisedBy,
    position: 'static',
    verticalAlign: 'super',
    fontVariantNumeric: 'tabular-nums',
  })),
);
assert(printMetrics.flags.every((flag) => flag.raisedBy > 0));
await pdfPage.screenshot({
  path: new URL('print-document.png', output).pathname,
  fullPage: true,
});
await pdfPage.screenshot({
  path: new URL('actual-export-html.png', output).pathname,
  fullPage: true,
});
await pdfPage.pdf({
  path: new URL('actual-export.pdf', output).pathname,
  format: 'Letter',
  displayHeaderFooter: false,
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

await page.keyboard.press('Escape');
await page.getByRole('dialog', { name: 'Export statement' }).waitFor({ state: 'detached' });
await page.getByRole('radio', { name: 'Commercial' }).click();
await page.getByText('In case of errors or questions').waitFor({ state: 'detached' });
await page.screenshot({
  path: new URL('commercial-screen.png', output).pathname,
  fullPage: true,
});
await page.evaluate(() => {
  window.__printArtifact = null;
});
await page.getByRole('button', { name: 'Export' }).click();
await page.getByRole('button', { name: 'Save PDF' }).click();
await page.waitForFunction(() => window.__printArtifact !== null);
const commercialArtifact = await page.evaluate(() => window.__printArtifact);
assert.equal(commercialArtifact.framePresent, true);
await writeFile(new URL('commercial-export.html', output), commercialArtifact.html);

const commercialPdfPage = await context.newPage();
await commercialPdfPage.setContent(commercialArtifact.html, { waitUntil: 'load' });
await commercialPdfPage.emulateMedia({ media: 'print' });
await commercialPdfPage.evaluate(() => document.fonts.ready);
const commercialMetrics = await commercialPdfPage.evaluate(() => ({
  footerHairlines: document.querySelectorAll('[data-footer-hairline]').length,
  hasRegENotice: document.body.textContent?.includes(
    'In case of errors or questions about your electronic transfers',
  ),
}));
assert.equal(commercialMetrics.footerHairlines, 1);
assert.equal(commercialMetrics.hasRegENotice, false);
await commercialPdfPage.screenshot({
  path: new URL('commercial-export-html.png', output).pathname,
  fullPage: true,
});
await commercialPdfPage.pdf({
  path: new URL('commercial-export.pdf', output).pathname,
  format: 'Letter',
  displayHeaderFooter: false,
  preferCSSPageSize: true,
  printBackground: true,
});
await commercialPdfPage.close();
await page.locator('iframe[title="Statement PDF"]').evaluate((element) => {
  const target = element.contentWindow;
  if (target) target.dispatchEvent(new target.Event('afterprint'));
});
await page.locator('iframe[title="Statement PDF"]').waitFor({ state: 'detached' });

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
    printMetrics,
    commercialMetrics,
    errors,
    webkitErrors,
  }, null, 2)}\n`,
);
await webkitContext.close();
await webkitBrowser.close();
await context.close();
await browser.close();
console.log(output.pathname);
