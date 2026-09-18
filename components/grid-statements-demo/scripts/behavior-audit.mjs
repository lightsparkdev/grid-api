#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.STATEMENTS_URL ?? 'http://127.0.0.1:4003';
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });

await page.addInitScript(() => {
  window.print = () => {
    window.__printedTitle = document.title;
  };
});
await page.goto(`${baseUrl}/?theme=light`, { waitUntil: 'networkidle' });

await page.getByText('Statement arrives Oct 1').waitFor();
await page.getByText('Calls appear when the period closes.').waitFor();
assert.equal(await page.getByText('listTransactions').count(), 0);
assert.equal(await page.getByRole('button', { name: 'Share' }).count(), 0);

const company = page.getByLabel('Company name');
await company.fill('Aurora live');
await page.getByText('Aurora live').waitFor();
assert.equal(await page.getByText('listTransactions').count(), 0);

for (const label of [
  'Primary background',
  'Primary text',
  'Secondary background',
  'Secondary text',
]) {
  assert.equal(await page.getByRole('radiogroup', { name: label }).getByRole('radio').count(), 2);
}

await page.getByRole('radio', { name: 'Creator platform (Glitch)' }).click();
const statementSource = page.locator('[class*="exportSource"] article');
await page.waitForFunction(() => {
  const article = document.querySelector('[class*="exportSource"] article');
  return article?.style.getPropertyValue('--statement-secondary-background') === '#f5f0ff';
});
assert.equal(
  await statementSource.evaluate((element) =>
    element.style.getPropertyValue('--statement-secondary-background'),
  ),
  '#f5f0ff',
);
assert.equal(await page.getByText('listTransactions').count(), 0);

const close = page.getByRole('radio', { name: 'Period closes' });
await page.evaluate(() => {
  window.__operationOrder = [];
  const api = document.querySelector('[class*="apiCol"]');
  const seen = new Set();
  const observer = new MutationObserver(() => {
    for (const operation of [
      'getCustomerById',
      'listCustomerInternalAccounts',
      'listTransactions',
    ]) {
      if (!seen.has(operation) && api?.textContent?.includes(operation)) {
        seen.add(operation);
        window.__operationOrder.push(operation);
      }
    }
  });
  observer.observe(api, { childList: true, subtree: true });
  window.__operationObserver = observer;
});
await close.click();
await page.getByText('listTransactions').waitFor();
assert.deepEqual(await page.evaluate(() => window.__operationOrder), [
  'getCustomerById',
  'listCustomerInternalAccounts',
  'listTransactions',
]);
await page.evaluate(() => window.__operationObserver?.disconnect());
await page.getByRole('button', { name: 'Share' }).waitFor();

await page.evaluate(() => {
  window.__apiRemovalCount = 0;
  const api = document.querySelector('[class*="apiCol"]');
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (node.textContent?.includes('listTransactions')) window.__apiRemovalCount += 1;
      }
    }
  });
  observer.observe(api, { childList: true, subtree: true });
  window.__apiRemovalObserver = observer;
});
await company.fill('Glitch edited');
await page.locator('input[type="color"][aria-label="Primary text"]').fill('#202020');
await page.waitForTimeout(250);
assert.equal(await page.evaluate(() => window.__apiRemovalCount), 0);

await page.getByRole('radio', { name: 'Commercial' }).click();
await page.waitForFunction(() => !document.body.textContent?.includes('listTransactions'));
await page.getByText('listTransactions').waitFor();

await page.getByRole('button', { name: 'Share' }).click();
await page.locator('[data-share-ripple]').waitFor();
await page.getByRole('button', { name: 'Save PDF' }).click();
assert.equal(
  await page.evaluate(() => window.__printedTitle),
  'glitch-edited-statement-2026-09',
);

await page.getByRole('button', { name: 'Share' }).click();
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Save HTML' }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), 'glitch-edited-statement-2026-09.html');
const path = await download.path();
assert(path);
const html = await readFile(path, 'utf8');
assert.match(html, /Monthly statement/);
assert.match(html, /data:image\//);
assert.doesNotMatch(html, /https?:|<link|@font-face|srcset=/i);

await page.getByRole('radio', { name: 'Desktop' }).click();
await page.getByText('Commercial account').first().waitFor();
await page.getByRole('radio', { name: 'Mobile' }).click();
const scroll = await page.locator('[class*="StatementScreen_scroller"]').evaluate((element) => ({
  overflowY: getComputedStyle(element).overflowY,
  scrollHeight: element.scrollHeight,
  clientHeight: element.clientHeight,
}));
assert.equal(scroll.overflowY, 'auto');
assert(scroll.scrollHeight > scroll.clientHeight);

await page.getByRole('button', { name: 'Reset' }).click();
await page.getByText('Statement arrives Oct 1').waitFor();
assert.equal(await page.getByText('listTransactions').count(), 0);
assert.equal(await page.getByRole('button', { name: 'Share' }).count(), 0);

const stacked = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
await stacked.goto(`${baseUrl}/?theme=dark`, { waitUntil: 'networkidle' });
assert.equal(await stacked.locator('html').getAttribute('data-layout'), 'stacked');

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${baseUrl}/?theme=light`, { waitUntil: 'networkidle' });
await mobile.getByRole('button', { name: 'Explore playground' }).click();
await mobile.getByText('Statement arrives Oct 1').waitFor();

await page.evaluate(() => window.__apiRemovalObserver?.disconnect());
await browser.close();
console.log(JSON.stringify({ htmlFilename: download.suggestedFilename(), scroll }, null, 2));
