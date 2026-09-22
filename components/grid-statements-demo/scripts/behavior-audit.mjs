#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.STATEMENTS_URL ?? 'http://127.0.0.1:4003';
const operations = ['getCustomerById', 'listCustomerInternalAccounts', 'listTransactions'];
const presetLabels = [
  'Financial app (Aurora)',
  'Creator platform (Glitch)',
  'Social app (Z)',
  'Travel marketplace (Waterbnb)',
  'On-demand platform (Super)',
  'Messaging platform (ChatsApp)',
];
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const previewStyles = await readFile(
  new URL('../src/components/StatementPreview/StatementPreview.module.scss', import.meta.url),
  'utf8',
);
assert.match(
  previewStyles,
  /--statement-sunken:\s*color-mix\(\s*in srgb,\s*var\(--statement-primary-text\) 4%,\s*var\(--statement-primary-background\)\s*\);/,
  'the desktop frame must use the 4% primary-text sunken mix',
);
assert.match(
  previewStyles,
  /--statement-hairline:\s*color-mix\(\s*in srgb,\s*var\(--statement-primary-text\) 10%,\s*transparent\s*\);/,
  'the desktop frame must use the statement hairline source declaration',
);
for (const divider of ['right', 'top', 'bottom']) {
  assert.match(
    previewStyles,
    new RegExp(`border-${divider}:\\s*0\\.5px solid var\\(--statement-hairline\\)`),
    `the desktop frame must use the statement hairline for its ${divider} divider`,
  );
}

function shadowHasVisibleDepth(boxShadow) {
  if (!boxShadow || boxShadow === 'none') return false;
  const colors = [...boxShadow.matchAll(/(?:rgba?|color|oklab)\(([^)]+)\)/g)].map(
    (match) => match[1],
  );
  const hasAlpha = colors.some((value) => {
    const slashAlpha = value.match(/\/\s*([\d.]+)\s*$/);
    if (slashAlpha) return Number.parseFloat(slashAlpha[1]) > 0;
    const parts = value.split(',').map((part) => Number.parseFloat(part.trim()));
    return parts.length === 4 ? parts[3] > 0 : parts.length === 3;
  });
  const blur = [...boxShadow.matchAll(/(-?\d+(?:\.\d+)?)px/g)]
    .map((match) => Number.parseFloat(match[1]))
    .find((value, index, all) => index >= 2 && all.length >= 3);
  return hasAlpha && typeof blur === 'number' && blur > 0;
}

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
      window.__prints.push({
        title: document.title,
        text: document.body?.innerText ?? '',
        fromFrame: false,
      });
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
    window.__operationObserver.observe(panel, {
      childList: true,
      subtree: true,
    });
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

async function statementFrameSignature(frame) {
  return frame.evaluate((element) => {
    const sidebar = element.querySelector('[data-statement-sidebar]');
    const railContent = element.querySelector('[data-statement-rail-content]');
    const railFooter = element.querySelector('[data-statement-rail-footer]');
    const main = element.querySelector('[data-statement-main]');
    const header = element.querySelector('[data-statement-header]');
    const scroll = element.querySelector('[data-statement-scroll]');
    const article = scroll.querySelector('article');
    const chromeSurfaces = [element, sidebar, railContent, railFooter, main, header, scroll];
    const chromeColors = chromeSurfaces.map((surface) => getComputedStyle(surface).backgroundColor);
    const scrollStyle = getComputedStyle(scroll);
    const expectedSunken = scrollStyle.getPropertyValue('--statement-sunken').trim();
    const primaryProbe = document.createElement('div');
    primaryProbe.style.background = scrollStyle
      .getPropertyValue('--statement-primary-background')
      .trim();
    element.appendChild(primaryProbe);
    const resolvedPrimary = getComputedStyle(primaryProbe).backgroundColor;
    primaryProbe.remove();
    const box = (node) => node.getBoundingClientRect();
    const frameBox = box(element);
    const railBox = box(sidebar);
    const zoneHeights = [railContent, railFooter].reduce(
      (total, zone) => total + box(zone).height,
      0,
    );
    return {
      frameDirection: getComputedStyle(element).flexDirection,
      frameChildren: Array.from(element.children, (child) => child.tagName),
      railZones: Array.from(
        sidebar.children,
        (child) =>
          ['rail-content', 'rail-footer'].find((zone) =>
            child.hasAttribute(`data-statement-${zone}`),
          ) ?? child.tagName,
      ),
      railContentChildren: Array.from(railContent.children, (child) => child.tagName),
      railContentText: railContent.textContent,
      mainChildren: Array.from(main.children, (child) => child.tagName),
      headerChildren: Array.from(header.children, (child) => child.tagName),
      headerText: header.textContent,
      footerChildren: Array.from(railFooter.children, (child) => child.tagName),
      footerText: railFooter.textContent,
      desktopTitleCount: Array.from(element.querySelectorAll('article header > strong')).filter(
        (node) => node.textContent?.trim() === 'September statement',
      ).length,
      chromeSurfacesMatch: chromeColors.every((color) => color === chromeColors[0]),
      sunkenToken: expectedSunken,
      sunkenBackground: scrollStyle.backgroundColor,
      sunkenDiffersFromPrimary: scrollStyle.backgroundColor !== resolvedPrimary,
      sunkenMatchesToken: scrollStyle.backgroundColor === expectedSunken || (() => {
        const probe = document.createElement('div');
        probe.style.background = expectedSunken;
        element.appendChild(probe);
        const resolved = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return scrollStyle.backgroundColor === resolved;
      })(),
      documentMatchesPrimary:
        getComputedStyle(article).backgroundColor === resolvedPrimary,
      documentLifted:
        getComputedStyle(article).backgroundColor !== scrollStyle.backgroundColor,
      headerBorderWidth: getComputedStyle(header).borderBottomWidth,
      footerBorderWidth: getComputedStyle(railFooter).borderTopWidth,
      sidebarBorderWidth: getComputedStyle(sidebar).borderRightWidth,
      sidebarWidth: getComputedStyle(sidebar).width,
      railFillsFrame: Math.abs(railBox.height - frameBox.height) < 1,
      zonesFillRail: Math.abs(zoneHeights - railBox.height) < 1,
      footerAtRailBottom: Math.abs(box(railFooter).bottom - railBox.bottom) < 1,
      mainRightOfRail: Math.abs(box(main).x - railBox.right) < 1,
      scrollInsideMain: main.contains(scroll) && scroll !== main,
      documentSurface: scroll.querySelector('article')?.getAttribute('data-surface') ?? null,
    };
  });
}

const primary = await openPage(1800, 1100);
const { page } = primary;
await page.getByText('listTransactions').waitFor();
assert.equal(await page.getByText('Load statement', { exact: true }).count(), 1);
assert.equal(await page.getByText('API calls', { exact: true }).count(), 1);
assert.equal(await page.getByText('No API calls yet', { exact: true }).count(), 0);
assert.equal(
  await page.getByText('The app derives Reg E transfer details and merchant location from transaction data.').count(),
  0,
);
assert.equal(await page.getByText(/Calls the app makes/).count(), 0);
await page.getByRole('button', { name: 'Export' }).waitFor();
assert.equal(
  await page
    .getByRole('radiogroup', { name: 'Preview device' })
    .evaluate((element) => element.closest('header')?.textContent?.includes('Statement preview')),
  true,
  'the device toggle must be in the statement preview header',
);
const appPreview = page.locator('[class*="StatementPanel_stage"] > [data-preview-shell="mobile"]');
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
  borderBottomWidth: '1px',
  titleSize: '20px',
  titleLineHeight: '25px',
});

await page.getByRole('radio', { name: 'Desktop' }).click();
for (const presetLabel of presetLabels) {
  await page.getByRole('radio', { name: presetLabel }).click();
  const presetFrame = await statementFrameSignature(page.locator('[data-statement-frame]'));
  assert.equal(presetFrame.sunkenMatchesToken, true, `${presetLabel} sunken token`);
  assert.equal(presetFrame.sunkenDiffersFromPrimary, true, `${presetLabel} sunken contrast`);
  assert.equal(presetFrame.chromeSurfacesMatch, true, `${presetLabel} sunken chrome`);
}
await page.getByRole('radio', { name: 'Financial app (Aurora)' }).click();
await page.getByRole('radio', { name: 'Mobile' }).click();

const company = page.getByLabel('Company name');
await company.fill('Aurora live');
assert.equal(await page.getByText('listTransactions').count(), 1);

for (const label of ['Primary background', 'Primary text', 'Secondary text']) {
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

const directFrame = page.locator('[data-statement-frame]');
const directFrameSignature = await statementFrameSignature(directFrame);
assert.equal(directFrameSignature.sunkenMatchesToken, true);
assert.notEqual(directFrameSignature.sunkenToken, '');
assert.equal(directFrameSignature.documentMatchesPrimary, true);
assert.equal(directFrameSignature.documentLifted, true);
assert.equal(directFrameSignature.documentSurface, 'card');
const {
  sunkenToken: _sunkenToken,
  sunkenBackground: _sunkenBackground,
  sunkenDiffersFromPrimary: _sunkenDiffersFromPrimary,
  sunkenMatchesToken: _sunkenMatchesToken,
  documentMatchesPrimary: _documentMatchesPrimary,
  documentLifted: _documentLifted,
  documentSurface: _documentSurface,
  ...directFrameShape
} = directFrameSignature;
assert.deepEqual(directFrameShape, {
  frameDirection: 'row',
  frameChildren: ['ASIDE', 'DIV'],
  railZones: ['rail-content', 'rail-footer'],
  railContentChildren: [],
  railContentText: '',
  mainChildren: ['DIV', 'DIV'],
  headerChildren: [],
  headerText: '',
  footerChildren: [],
  footerText: '',
  desktopTitleCount: 1,
  chromeSurfacesMatch: true,
  headerBorderWidth: '1px',
  footerBorderWidth: '1px',
  sidebarBorderWidth: '1px',
  sidebarWidth: '176px',
  railFillsFrame: true,
  zonesFillRail: true,
  footerAtRailBottom: true,
  mainRightOfRail: true,
  scrollInsideMain: true,
});

const desktopScroll = await page.locator('[data-statement-scroll]').evaluate((element) => {
  const main = element.closest('[data-statement-main]');
  const frame = element.closest('[data-statement-frame]');
  element.scrollTop = element.scrollHeight;
  return {
    overflowY: getComputedStyle(element).overflowY,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    scrollTop: element.scrollTop,
    mainOverflow: main.scrollHeight - main.clientHeight,
    frameOverflow: frame.scrollHeight - frame.clientHeight,
  };
});
assert.equal(desktopScroll.overflowY, 'auto');
assert(desktopScroll.scrollHeight > desktopScroll.clientHeight);
assert(desktopScroll.scrollTop > 0);
assert.equal(desktopScroll.mainOverflow, 0, 'the main column must not scroll itself');
assert.equal(desktopScroll.frameOverflow, 0, 'the desktop frame must not scroll itself');

await page.getByRole('button', { name: 'Export' }).click();
const exportSheet = page.getByRole('dialog', { name: 'Export statement' });
await exportSheet.locator('[data-preview-shell="desktop"]').waitFor();
const exportFrameSignature = await statementFrameSignature(
  exportSheet.locator('[data-statement-frame]'),
);
assert.deepEqual(
  exportFrameSignature,
  directFrameSignature,
  'Export must reuse the direct desktop statement frame',
);
assert.equal(
  await page
    .locator('[data-share-backdrop]')
    .evaluate((element) => getComputedStyle(element).backgroundColor),
  'rgba(0, 0, 0, 0)',
  'the export hit target must leave the shared stage backdrop visible',
);
assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Copy link');
await page.keyboard.press('Shift+Tab');
assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Save HTML');
await page.keyboard.press('Tab');
assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Copy link');
assert.equal(
  await exportSheet
    .locator('article')
    .evaluate((element) => element.style.getPropertyValue('--statement-primary-background')),
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

const mobileChromeRest = await appPreview.evaluate((root) => {
  const header = root.querySelector('[data-statement-header]');
  const scroll = root.querySelector('[data-statement-scroll]');
  const article = scroll?.querySelector('article');
  const shell = scroll?.closest('[data-screen-body]');
  const elementRect = scroll.getBoundingClientRect();
  const shellRect = shell.getBoundingClientRect();
  const headerStyle = getComputedStyle(header);
  const articleStyle = getComputedStyle(article);
  return {
    articleWidth: Math.round(article.getBoundingClientRect().width),
    scrollerWidth: Math.round(elementRect.width),
    contained: elementRect.top >= shellRect.top - 1 && elementRect.bottom <= shellRect.bottom + 1,
    overflowY: getComputedStyle(scroll).overflowY,
    scrollHeight: scroll.scrollHeight,
    clientHeight: scroll.clientHeight,
    documentSurface: article.getAttribute('data-surface'),
    borderWidth: articleStyle.borderTopWidth,
    borderRadius: articleStyle.borderRadius,
    hairlineWidth: headerStyle.borderBottomWidth,
    restScrolled: header.hasAttribute('data-scrolled'),
    restShadow: headerStyle.boxShadow,
    restTransition: headerStyle.transition,
  };
});
assert.equal(mobileChromeRest.articleWidth, mobileChromeRest.scrollerWidth);
assert.equal(mobileChromeRest.contained, true);
assert.equal(mobileChromeRest.overflowY, 'auto');
assert(mobileChromeRest.scrollHeight > mobileChromeRest.clientHeight);
assert.equal(mobileChromeRest.documentSurface, 'bleed');
assert.equal(mobileChromeRest.borderWidth, '0px');
assert.equal(mobileChromeRest.borderRadius, '0px');
assert.notEqual(mobileChromeRest.hairlineWidth, '0px');
assert.equal(mobileChromeRest.restScrolled, false);
assert.match(mobileChromeRest.restTransition, /box-shadow/);
assert.match(mobileChromeRest.restTransition, /0\.15s|150ms/);

await appPreview.locator('[data-statement-scroll]').evaluate((element) => {
  element.scrollTop = 120;
  element.dispatchEvent(new Event('scroll', { bubbles: true }));
});
await appPreview.locator('[data-statement-header][data-scrolled]').waitFor();
await page.waitForTimeout(180);
const mobileChromeScrolled = await appPreview.locator('[data-statement-header]').evaluate((header) => {
  const style = getComputedStyle(header);
  return {
    scrolled: header.hasAttribute('data-scrolled'),
    shadow: style.boxShadow,
    scrollTop: header.parentElement?.querySelector('[data-statement-scroll]')?.scrollTop ?? 0,
  };
});
assert.equal(mobileChromeScrolled.scrolled, true);
assert(mobileChromeScrolled.scrollTop > 0);
assert.notEqual(mobileChromeScrolled.shadow, mobileChromeRest.restShadow);
assert.equal(shadowHasVisibleDepth(mobileChromeScrolled.shadow), true);

await appPreview.locator('[data-statement-scroll]').evaluate((element) => {
  element.scrollTop = 0;
  element.dispatchEvent(new Event('scroll', { bubbles: true }));
});
await appPreview.locator('[data-statement-header]:not([data-scrolled])').waitFor();
assert.equal(
  await appPreview.locator('[data-statement-header]').evaluate((element) =>
    element.hasAttribute('data-scrolled'),
  ),
  false,
);

const mobileScroll = {
  ...mobileChromeRest,
  scrollTop: mobileChromeScrolled.scrollTop,
  scrolledShadow: mobileChromeScrolled.shadow,
};

const exportSourceCard = await page.locator('[class*="exportSource"] article').evaluate((element) => {
  const style = getComputedStyle(element);
  return {
    surface: element.getAttribute('data-surface'),
    borderWidth: Number.parseFloat(style.borderTopWidth),
    borderRadius: Number.parseFloat(style.borderTopLeftRadius),
  };
});
assert.equal(exportSourceCard.surface, 'card');
assert(exportSourceCard.borderWidth > 0);
assert(exportSourceCard.borderRadius > 0);

await page.getByRole('button', { name: 'Export' }).click();
await exportSheet.locator('[data-preview-shell="mobile"]').waitFor();
const shareMobileShell = exportSheet.locator('[data-preview-shell="mobile"]');
const shareMobile = await shareMobileShell.evaluate((shell) => {
  const header = shell.querySelector('[data-statement-header]');
  const document = shell.querySelector('[data-statement-scroll] article');
  const style = getComputedStyle(document);
  return {
    surface: document?.getAttribute('data-surface') ?? null,
    borderWidth: style.borderTopWidth,
    borderRadius: style.borderRadius,
    hairline: getComputedStyle(header).borderBottomWidth,
  };
});
assert.deepEqual(shareMobile, {
  surface: 'bleed',
  borderWidth: '0px',
  borderRadius: '0px',
  hairline: mobileChromeRest.hairlineWidth,
});
await shareMobileShell.locator('[data-statement-scroll]').evaluate((element) => {
  element.scrollTop = 120;
  element.dispatchEvent(new Event('scroll', { bubbles: true }));
});
await shareMobileShell.locator('[data-statement-header][data-scrolled]').waitFor();
await page.waitForTimeout(180);
const shareMobileShadow = await shareMobileShell
  .locator('[data-statement-header]')
  .evaluate((element) => getComputedStyle(element).boxShadow);
assert.equal(shadowHasVisibleDepth(shareMobileShadow), true);
assert.equal(shareMobileShadow, mobileChromeScrolled.shadow);
await page.keyboard.press('Escape');
await exportSheet.waitFor({ state: 'detached' });

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
  const panel = await audit.page.getByRole('dialog', { name: 'Export statement' }).boundingBox();
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
    const panel = document.querySelector('[aria-label="Export statement"]').getBoundingClientRect();
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

const stacked = await openPage(1440, 1100);
await stacked.page.getByText('listTransactions').waitFor();
const stackedRail = await stacked.page.locator('[class*="apiCol"]').evaluate((panel) => {
  const header = panel.querySelector('header');
  return {
    headerText: header?.textContent?.trim() ?? '',
    headerDisplay: header ? getComputedStyle(header).display : 'none',
  };
});
assert.match(stackedRail.headerText, /^API calls/);
assert.notEqual(stackedRail.headerDisplay, 'none');
assert.equal(await stacked.page.getByText('Load statement', { exact: true }).count(), 1);
assert.equal(await stacked.page.getByText(/Calls the app makes/).count(), 0);
assert.equal(
  await stacked.page.getByText(
    'The app derives Reg E transfer details and merchant location from transaction data.',
  ).count(),
  0,
);
assert.deepEqual(stacked.errors, []);
await stacked.context.close();

const reduced = await openPage(1280, 1000, 'reduce');
await reduced.page.getByText('listTransactions').waitFor();
const reducedMotion = await reduced.page
  .locator('[data-preview-shell="mobile"] [data-statement-header]')
  .evaluate((element) => getComputedStyle(element).transitionDuration);
assert.equal(reducedMotion, '0s');
await reduced.page.getByRole('button', { name: 'Export' }).click();
await reduced.page.getByRole('dialog', { name: 'Export statement' }).waitFor();
assert.deepEqual(reduced.errors, []);

assert.deepEqual(primary.errors, []);
assert.deepEqual(rail.errors, []);
await Promise.all([primary.context.close(), rail.context.close(), reduced.context.close()]);
await browser.close();
console.log(JSON.stringify({ desktopScroll, mobileScroll, bounds }, null, 2));
