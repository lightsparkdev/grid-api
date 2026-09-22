#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.STATEMENTS_URL ?? 'http://127.0.0.1:4003';
const operations = [
  'getCustomerById',
  'listCustomerInternalAccounts',
  'listTransactions',
];
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());

async function openPage(width, height, reducedMotion = 'no-preference') {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion,
    colorScheme: 'light',
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  // The PDF prints from its own iframe realm, which a patch on this realm never
  // reaches. Patch the frame's print as it attaches and read what it was given.
  await page.addInitScript(() => {
    window.__prints = [];
    window.print = () => {
      window.__prints.push({ title: document.title, text: document.body?.innerText ?? '', fromFrame: false });
    };
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLIFrameElement) || !node.contentWindow) continue;
          node.contentWindow.print = () => {
            window.__prints.push({
              title: node.contentDocument?.title ?? '',
              text: node.contentDocument?.body?.innerText ?? '',
              fromFrame: true,
            });
          };
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto(`${baseUrl}/?theme=light`, { waitUntil: 'domcontentloaded' });
  return { context, page, errors };
}

async function watchOperationOrder(page) {
  await page.evaluate((names) => {
    window.__operationOrder = [];
    const seen = new Set();
    const panel = document.querySelector('[class*="apiCol"]');
    window.__operationObserver?.disconnect();
    window.__operationObserver = new MutationObserver(() => {
      for (const name of names) {
        if (!seen.has(name) && panel?.textContent?.includes(name)) {
          seen.add(name);
          window.__operationOrder.push(name);
        }
      }
    });
    window.__operationObserver.observe(panel, { childList: true, subtree: true });
  }, operations);
}

async function expectReload(page, account) {
  await watchOperationOrder(page);
  const started = Date.now();
  await page.getByRole('radio', { name: account }).click();
  await page.waitForFunction(
    () => !document.querySelector('[class*="apiCol"]')?.textContent?.includes('listTransactions'),
  );
  await page.getByRole('status', { name: 'Loading statement' }).waitFor();
  await page.getByText('listTransactions').waitFor();
  const elapsed = Date.now() - started;
  assert(elapsed >= 500, `loading ended before 500 ms: ${elapsed}`);
  assert(elapsed < 1600, `loading and staged calls exceeded browser tolerance: ${elapsed}`);
  assert.deepEqual(await page.evaluate(() => window.__operationOrder), operations);
  await page.evaluate(() => window.__operationObserver?.disconnect());
}

const primary = await openPage(1800, 1100);
const { page } = primary;
await page.getByRole('status', { name: 'Loading statement' }).waitFor();
await page.getByText('listTransactions').waitFor();
await page.getByRole('button', { name: 'Export' }).waitFor();
assert.equal(
  await page.getByRole('radiogroup', { name: 'Preview device' }).evaluate((element) =>
    element.closest('header')?.textContent?.includes('Statement preview'),
  ),
  true,
  'the device toggle must be in the statement preview header',
);
const appPreview = page.locator(
  '[class*="StatementPanel_stage"] > [data-preview-shell="mobile"]',
);
assert.equal(await appPreview.getByText('September statement').count(), 1);

const header = appPreview.locator('[class*="StatementScreen_hero"]');
assert.equal(await header.getByText('09/01/2026 – 09/30/2026').count(), 0);
const headerStyle = await header.evaluate((element) => {
  const style = getComputedStyle(element);
  const title = getComputedStyle(element.querySelector('h1'));
  return {
    paddingLeft: style.paddingLeft,
    paddingRight: style.paddingRight,
    borderBottomWidth: style.borderBottomWidth,
    titleSize: title.fontSize,
    titleLineHeight: title.lineHeight,
  };
});
assert.deepEqual(headerStyle, {
  paddingLeft: '24px',
  paddingRight: '24px',
  borderBottomWidth: '0px',
  titleSize: '20px',
  titleLineHeight: '25px',
});

const company = page.getByLabel('Company name');
await company.fill('Aurora live');
assert.equal(await page.getByText('listTransactions').count(), 1);

for (const label of [
  'Primary background',
  'Primary text',
  'Secondary text',
]) {
  assert.equal(await page.getByRole('radiogroup', { name: label }).getByRole('radio').count(), 2);
  await page.getByRole('button', { name: label }).click();
  await page.getByRole('dialog', { name: 'Custom color' }).waitFor();
  if (label === 'Primary background') {
    await page
      .locator('input[type="color"][aria-label="Primary background picker"]')
      .fill('#fafafa');
  }
  await page.keyboard.press('Escape');
}

await expectReload(page, 'Commercial');
await expectReload(page, 'Consumer');

const assertCallsRemain = async () => {
  for (const operation of operations) {
    assert.equal(await page.getByText(operation, { exact: true }).count(), 1);
  }
};
await page.getByRole('radio', { name: 'Desktop' }).click();
await page.getByText('Consumer prepaid account').first().waitFor();
await assertCallsRemain();

const desktopScroll = await page
  .locator('[class*="StatementPreview_duoScroller"]')
  .evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return {
      overflowY: getComputedStyle(element).overflowY,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      scrollTop: element.scrollTop,
    };
  });
assert.equal(desktopScroll.overflowY, 'auto');
assert(desktopScroll.scrollHeight > desktopScroll.clientHeight);
assert(desktopScroll.scrollTop > 0);

await page.getByRole('button', { name: 'Export' }).click();
const exportSheet = page.getByRole('dialog', { name: 'Export statement' });
await exportSheet.locator('[data-preview-shell="desktop"]').waitFor();
assert.equal(
  await page.locator('[data-share-backdrop]').evaluate((element) =>
    getComputedStyle(element).backgroundColor,
  ),
  'rgba(0, 0, 0, 0)',
  'the export hit target must leave the shared stage backdrop visible',
);
assert.equal(
  await page.evaluate(() => document.activeElement?.textContent),
  'Copy link',
);
await page.keyboard.press('Shift+Tab');
assert.equal(
  await page.evaluate(() => document.activeElement?.textContent),
  'Save HTML',
);
await page.keyboard.press('Tab');
assert.equal(
  await page.evaluate(() => document.activeElement?.textContent),
  'Copy link',
);
assert.equal(
  await exportSheet.locator('article').evaluate((element) =>
    element.style.getPropertyValue('--statement-primary-background'),
  ),
  '#fafafa',
);
await page.getByRole('button', { name: 'Cancel' }).click();
assert.equal(
  await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
  'Export',
);

await page.getByRole('radio', { name: 'Mobile' }).click();
await company.fill('Live share brand');
await assertCallsRemain();
await page.getByRole('button', { name: 'Export' }).click();
await exportSheet.locator('[data-preview-shell="mobile"]').waitFor();
assert.equal(await exportSheet.getByText('September statement').count(), 1);
await page.getByRole('button', { name: 'Save PDF' }).click();
await page.waitForFunction(() => window.__prints.length === 1);
const printed = (await page.evaluate(() => window.__prints))[0];
assert.equal(printed.title, 'live-share-brand-september-statement');
assert.equal(printed.fromFrame, true, 'the PDF must print an isolated document');
assert.match(printed.text, /September statement/);
assert.match(printed.text, /Total fees for period/);
assert.doesNotMatch(printed.text, /Explore playground|listTransactions|Configure statement/);
const printFrame = page.locator('iframe[title="Statement PDF"]');
assert.equal(await printFrame.count(), 1, 'the print iframe must remain before afterprint');
await printFrame.evaluate((element) => {
  const frame = element;
  const target = frame.contentWindow;
  if (target) target.dispatchEvent(new target.Event('afterprint'));
});
await printFrame.waitFor({ state: 'detached' });

await page.getByRole('button', { name: 'Export' }).click();
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Save HTML' }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), 'live-share-brand-september-statement.html');
const downloadPath = await download.path();
assert(downloadPath);
const html = await readFile(downloadPath, 'utf8');
assert.match(html, /September statement/);
assert.match(html, /data:image\//);
assert.doesNotMatch(html, /https?:|<link|@font-face|srcset=/i);

await page.getByRole('button', { name: 'Export' }).click();
await page.getByRole('button', { name: 'Copy link' }).click();
const sharedUrl = await page.evaluate(() => navigator.clipboard.readText());
assert.match(sharedUrl, /variant=consumer/);
assert.match(sharedUrl, /view=mobile/);
assert.match(sharedUrl, /brand=Live\+share\+brand/);
const sharedPage = await primary.context.newPage();
await sharedPage.goto(sharedUrl, { waitUntil: 'domcontentloaded' });
await sharedPage.getByLabel('Company name').waitFor();
await sharedPage.waitForFunction(
  () => document.querySelector('[aria-label="Company name"]')?.value === 'Live share brand',
);
assert.equal(await sharedPage.getByLabel('Company name').inputValue(), 'Live share brand');
assert.equal(
  await sharedPage.getByRole('radio', { name: 'Mobile' }).getAttribute('aria-checked'),
  'true',
);
await sharedPage.close();

for (const dismiss of [
  () => page.keyboard.press('Escape'),
  () => page.locator('[class*="ShareSheet_backdrop"]').click({ position: { x: 4, y: 4 } }),
]) {
  if ((await exportSheet.count()) === 0) {
    await page.getByRole('button', { name: 'Export' }).click();
  }
  await exportSheet.waitFor();
  await dismiss();
  await exportSheet.waitFor({ state: 'detached' });
  assert.equal(
    await page.locator('[class*="ShareSheet_backdrop"]').count(),
    0,
    'a dismissed sheet leaves no blocking layer',
  );
  assert.equal(
    await page.evaluate(() => document.activeElement?.getAttribute('aria-label')),
    'Export',
    'closing the export sheet returns focus to its trigger',
  );
}
await page.getByRole('radio', { name: 'Desktop' }).click();
await page.getByRole('radio', { name: 'Mobile' }).click();

const accountCells = page.getByRole('radiogroup', { name: 'Account type' });
assert.deepEqual(
  await accountCells.getByRole('radio').evaluateAll((radios) =>
    radios.map((radio) => ({
      checked: radio.getAttribute('aria-checked'),
      disabled: radio.hasAttribute('disabled'),
      tabIndex: radio.tabIndex,
    })),
  ),
  [
    { checked: 'true', disabled: false, tabIndex: 0 },
    { checked: 'false', disabled: false, tabIndex: -1 },
  ],
);
await accountCells.getByRole('radio', { name: 'Consumer' }).focus();
await page.keyboard.press('ArrowRight');
await page.getByText('listTransactions').waitFor();
assert.equal(
  await accountCells.getByRole('radio', { name: 'Commercial' }).getAttribute('aria-checked'),
  'true',
);
assert.equal(
  await page.evaluate(() => document.activeElement?.dataset.choice),
  'commercial',
  'focus must follow the selected radio',
);
await expectReload(page, 'Consumer');

const mobileScroll = await appPreview
  .locator('[class*="StatementScreen_scroller"]')
  .evaluate((element) => {
    const article = element.querySelector('article');
    const shell = element.closest('[data-screen-body]');
    const elementRect = element.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    element.scrollTop = 120;
    return {
      articleWidth: Math.round(article.getBoundingClientRect().width),
      scrollerWidth: Math.round(elementRect.width),
      contained:
        elementRect.top >= shellRect.top - 1 &&
        elementRect.bottom <= shellRect.bottom + 1,
      overflowY: getComputedStyle(element).overflowY,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      scrollTop: element.scrollTop,
    };
  });
assert.equal(mobileScroll.articleWidth, mobileScroll.scrollerWidth);
assert.equal(mobileScroll.contained, true);
assert.equal(mobileScroll.overflowY, 'auto');
assert(mobileScroll.scrollHeight > mobileScroll.clientHeight);
assert(mobileScroll.scrollTop > 0);

const rail = await openPage(2560, 1200);
await rail.page.getByText('listTransactions').waitFor();
const api = rail.page.locator('[class*="apiCol"]');
assert.equal(Math.round((await api.boundingBox()).width), 680);
const divider = rail.page.getByRole('separator', { name: 'Resize columns' });
let dividerBox = await divider.boundingBox();
await rail.page.mouse.move(dividerBox.x, dividerBox.y + 20);
await rail.page.mouse.down();
await rail.page.mouse.move(2500, dividerBox.y + 20);
await rail.page.mouse.up();
assert.equal(Math.round((await api.boundingBox()).width), 400);
dividerBox = await divider.boundingBox();
await rail.page.mouse.move(dividerBox.x, dividerBox.y + 20);
await rail.page.mouse.down();
await rail.page.mouse.move(0, dividerBox.y + 20);
await rail.page.mouse.up();
assert.equal(Math.round((await api.boundingBox()).width), 1840);

const bounds = [];
for (const [name, width, height] of [
  ['1280', 1280, 1000],
  ['1680', 1680, 1050],
  ['2560', 2560, 1200],
  ['stacked', 1440, 1100],
  ['mobile', 390, 844],
]) {
  const audit = await openPage(width, height);
  await audit.page.getByText('listTransactions').waitFor({ state: 'attached' });
  if (name === 'mobile') {
    await audit.page.getByRole('button', { name: 'Explore playground' }).click();
  }
  await audit.page.getByRole('button', { name: 'Export' }).waitFor();
  const before = await audit.page.evaluate(() => ({
    width: document.body.scrollWidth,
    height: document.body.scrollHeight,
  }));
  await audit.page.getByRole('button', { name: 'Export' }).click();
  const panel = await audit.page
    .getByRole('dialog', { name: 'Export statement' })
    .boundingBox();
  const pill = await audit.page.getByRole('button', { name: 'Cancel' }).boundingBox();
  const after = await audit.page.evaluate(() => ({
    width: document.body.scrollWidth,
    height: document.body.scrollHeight,
  }));
  assert.deepEqual(after, before);
  assert(panel.width <= (name === 'mobile' ? 440 : 760));
  assert(panel.height <= height - 100);
  assert.equal(Math.round(pill.height), 44);
  assert(panel.x >= 0 && panel.x + panel.width <= width);
  bounds.push({ name, panel, pill, viewport: { width, height } });
  assert.deepEqual(audit.errors, []);
  await audit.context.close();
}

for (const [width, height] of [
  [1680, 700],
  [1440, 700],
  [1280, 700],
]) {
  const short = await openPage(width, height);
  await short.page.getByText('listTransactions').waitFor();
  await short.page.getByRole('radio', { name: 'Desktop' }).click();
  await short.page.getByText('September statement').first().waitFor();
  await short.page.getByRole('button', { name: 'Export' }).click();
  await short.page.getByRole('dialog', { name: 'Export statement' }).waitFor();
  await short.page.waitForFunction(() => {
    const panel = document.querySelector('[aria-label="Export statement"]');
    if (!panel) return false;
    const style = getComputedStyle(panel);
    const transform = new DOMMatrixReadOnly(style.transform);
    return (
      Math.abs(transform.a - 1) < 0.001 &&
      Math.abs(transform.d - 1) < 0.001 &&
      Math.abs(transform.m42) < 0.5 &&
      Number.parseFloat(style.opacity) > 0.999 &&
      style.filter === 'blur(0px)'
    );
  });
  const reach = await short.page.evaluate(() => {
    const panel = document
      .querySelector('[aria-label="Export statement"]')
      .getBoundingClientRect();
    return Array.from(document.querySelectorAll('button'))
      .filter((button) =>
        ['Copy link', 'Save PDF', 'Save HTML'].includes(button.textContent.trim()),
      )
      .map((button) => {
        const box = button.getBoundingClientRect();
        const hit = document.elementFromPoint(
          Math.round(box.x + box.width / 2),
          Math.round(box.y + box.height / 2),
        );
        return {
          label: button.textContent.trim(),
          insidePanel: box.bottom <= panel.bottom + 1 && box.top >= panel.top - 1,
          clickable: hit?.closest('button') === button,
        };
      });
  });
  assert.deepEqual(
    reach,
    ['Copy link', 'Save PDF', 'Save HTML'].map((label) => ({
      label,
      insidePanel: true,
      clickable: true,
    })),
    `desktop export actions must stay reachable at ${width} by ${height}`,
  );
  assert.deepEqual(short.errors, []);
  await short.context.close();
}

const reduced = await openPage(1280, 1000, 'reduce');
await reduced.page.getByText('listTransactions').waitFor();
await reduced.page.getByRole('button', { name: 'Export' }).click();
await reduced.page.getByRole('dialog', { name: 'Export statement' }).waitFor();
assert.deepEqual(reduced.errors, []);

assert.deepEqual(primary.errors, []);
assert.deepEqual(rail.errors, []);
await Promise.all([primary.context.close(), rail.context.close(), reduced.context.close()]);
await browser.close();
console.log(JSON.stringify({ desktopScroll, mobileScroll, bounds }, null, 2));
