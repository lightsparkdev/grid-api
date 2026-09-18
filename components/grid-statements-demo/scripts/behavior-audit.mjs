#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.STATEMENTS_URL ?? 'http://127.0.0.1:4003';
let browserKind = 'Google Chrome';
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => {
  browserKind = 'Playwright Chromium';
  return chromium.launch();
});
const browserVersion = browser.version();

const wide = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
await wide.addInitScript(() => {
  window.print = () => {
    window.__printedTitle = document.title;
  };
});
await wide.goto(`${baseUrl}/?theme=light`, { waitUntil: 'networkidle' });
await wide.getByText('listTransactions').waitFor();

const refiresAfter = async (action) => {
  await action();
  await wide.waitForFunction(
    () => !document.body.textContent?.includes('listTransactions'),
  );
  await wide.getByText('listTransactions').waitFor();
};

const originalApiWidth = await wide.locator('[class*="apiCol"]').evaluate(
  (element) => element.getBoundingClientRect().width,
);
const handle = wide.getByRole('separator', { name: 'Resize columns' });
const handleBox = await handle.boundingBox();
assert(handleBox, 'The wide layout must show the column resize handle.');
await wide.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + 100);
await wide.mouse.down();
await wide.mouse.move(handleBox.x - 100, handleBox.y + 100, { steps: 8 });
await wide.mouse.up();
const resizedApiWidth = await wide.locator('[class*="apiCol"]').evaluate(
  (element) => element.getBoundingClientRect().width,
);
assert(
  resizedApiWidth > originalApiWidth + 70,
  `Dragging left must widen the API column. Measured ${originalApiWidth}px → ${resizedApiWidth}px.`,
);

await refiresAfter(() =>
  wide.getByRole('radio', { name: 'Financial app (Aurora)' }).click(),
);
assert.equal(await wide.getByLabel('Company name').inputValue(), 'Aurora');
await wide.getByText('just now').first().waitFor();

await wide.evaluate(() => {
  window.__apiRemovalCount = 0;
  const api = document.querySelector('[class*="apiCol"]');
  if (!api) return;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (node.textContent?.includes('listTransactions')) {
          window.__apiRemovalCount += 1;
        }
      }
    }
  });
  observer.observe(api, { childList: true, subtree: true });
  window.__apiRemovalObserver = observer;
});
await wide.getByLabel('Company name').fill('Aurora edited');
await wide.waitForTimeout(400);
assert.equal(await wide.evaluate(() => window.__apiRemovalCount), 0);
assert.equal(await wide.getByText('listTransactions').count(), 1);

await refiresAfter(() => wide.getByRole('radio', { name: 'Commercial' }).click());
await wide
  .getByText('Grid data. Platform stores period balances and builds statement rows.')
  .waitFor();

await refiresAfter(() => wide.getByLabel('Period').selectOption('2026-08'));
const transactionEndpoint = wide.getByRole('group', {
  name: /Copy endpoint \/transactions\?/,
});
assert.match(await transactionEndpoint.getAttribute('aria-label'), /2026-08-01T00%3A00%3A00Z/);

await wide.getByRole('button', { name: 'Export' }).click();
await wide.getByRole('button', { name: 'PDF', exact: true }).click();
const printedTitle = await wide.evaluate(() => window.__printedTitle);
assert.equal(printedTitle, 'aurora-edited-statement-2026-08.pdf');
assert(!printedTitle.endsWith('.pdf.pdf'));

await wide.getByRole('button', { name: 'Export' }).click();
const downloadPromise = wide.waitForEvent('download');
await wide.getByRole('button', { name: 'HTML', exact: true }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), 'aurora-edited-statement-2026-08.html');
const downloadPath = await download.path();
assert(downloadPath);
const exportedHtml = await readFile(downloadPath, 'utf8');
assert.match(exportedHtml, /Monthly statement/);
assert.match(exportedHtml, /data:image\//);
assert.doesNotMatch(exportedHtml, /https?:|<link|@font-face|srcset=/i);

assert.equal(await wide.locator('[data-device="mail"]').count(), 1);
await wide.getByRole('radio', { name: 'iPhone Duo' }).click();
assert.equal(await wide.locator('[data-device="duo"]').count(), 1);
await wide.getByRole('button', { name: /Open August statement attachment/ }).click();
await wide.getByRole('region', { name: 'Statement document viewer' }).waitFor();
const scrollState = await wide.locator('[class*="documentScroller"]').evaluate((element) => ({
  overflowY: getComputedStyle(element).overflowY,
  scrollHeight: element.scrollHeight,
  clientHeight: element.clientHeight,
}));
assert.equal(scrollState.overflowY, 'auto');
assert(scrollState.scrollHeight > scrollState.clientHeight);

const stacked = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await stacked.goto(`${baseUrl}/?theme=dark`, { waitUntil: 'networkidle' });
assert.equal(await stacked.locator('html').getAttribute('data-layout'), 'stacked');
assert.equal(await stacked.getByRole('separator', { name: 'Resize columns' }).isVisible(), false);
await stacked.getByText('API calls', { exact: true }).waitFor();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${baseUrl}/?theme=light`, { waitUntil: 'networkidle' });
await mobile.getByRole('button', { name: 'Explore playground' }).click();
await mobile.getByRole('button', { name: 'Configure' }).waitFor();
assert.equal(
  await mobile
    .getByRole('radio', { name: 'iPhone', exact: true })
    .getAttribute('aria-checked'),
  'true',
);
await mobile.getByRole('button', { name: 'Configure' }).click();
await mobile.getByLabel('Company name').waitFor();

await browser.close();
console.log(
  JSON.stringify(
    {
      browserKind,
      browserVersion,
      originalApiWidth,
      resizedApiWidth,
      printedTitle,
      htmlFilename: download.suggestedFilename(),
      scrollState,
    },
    null,
    2,
  ),
);
