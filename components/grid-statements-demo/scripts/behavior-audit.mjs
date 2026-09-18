#!/usr/bin/env node

import assert from 'node:assert/strict';
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

await wide.getByRole('radio', { name: 'Financial app (Aurora)' }).click();
assert.equal(await wide.getByLabel('Company name').inputValue(), 'Aurora');
await wide.getByText('listTransactions').waitFor();
assert.match(await wide.locator('time').first().textContent(), /just now/i);

await wide.getByRole('radio', { name: 'Commercial' }).click();
await wide
  .getByText('Grid data. Platform stores period balances and builds statement rows.')
  .waitFor();

await wide.getByLabel('Period').selectOption('2026-08');
await wide.getByText('listTransactions').waitFor();
const transactionEndpoint = wide.getByRole('group', {
  name: /Copy endpoint \/transactions\?/,
});
assert.match(await transactionEndpoint.getAttribute('aria-label'), /2026-08-01T00%3A00%3A00Z/);

await wide.getByRole('button', { name: 'Download PDF' }).click();
const printedTitle = await wide.evaluate(() => window.__printedTitle);
assert.equal(printedTitle, 'aurora-statement-2026-08.pdf');
assert(!printedTitle.endsWith('.pdf.pdf'));

const stacked = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await stacked.goto(`${baseUrl}/?theme=dark`, { waitUntil: 'networkidle' });
assert.equal(await stacked.locator('html').getAttribute('data-layout'), 'stacked');
assert.equal(await stacked.getByRole('separator', { name: 'Resize columns' }).isVisible(), false);
await stacked.getByText('API calls', { exact: true }).waitFor();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${baseUrl}/?theme=light`, { waitUntil: 'networkidle' });
await mobile.getByRole('button', { name: 'Explore playground' }).click();
await mobile.getByRole('button', { name: 'Configure' }).waitFor();
assert.equal(await mobile.getByRole('radio', { name: 'Narrow' }).getAttribute('aria-checked'), 'true');
await mobile.getByRole('button', { name: 'Configure' }).click();
await mobile.getByLabel('Company name').waitFor();

await browser.close();
console.log(
  JSON.stringify(
    { browserKind, browserVersion, originalApiWidth, resizedApiWidth, printedTitle },
    null,
    2,
  ),
);
