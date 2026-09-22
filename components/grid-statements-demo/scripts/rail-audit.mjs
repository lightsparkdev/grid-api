#!/usr/bin/env node

import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const output = new URL(
  `../.artifacts/visual-audit/${process.env.AUDIT_LABEL ?? 'rail-audit'}/`,
  import.meta.url,
);
const apps = [
  {
    name: 'cards',
    url: process.env.CARDS_URL ?? 'https://grid-cards-demo-lightspark-team.vercel.app',
  },
  {
    name: 'wallet',
    url: process.env.WALLET_URL ?? 'https://grid-wallet-demo-lightspark-team.vercel.app',
  },
  {
    name: 'statements',
    url: process.env.STATEMENTS_URL ?? 'https://grid-statements-demo.vercel.app',
  },
];
const widths = [1440, 1680, 1920];
const source = {
  layoutWide: 1600,
  leftRail: 400,
  apiDefault: 680,
  apiMin: 400,
  minStage: 320,
  railContentPadding: 40,
  railContentMaxWidth: 680,
  railCardWidth: 600,
  railCardPadding: 0,
  railRowPadding: 14,
};

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const browserVersion = browser.version();
const measurements = [];

for (const width of widths) {
  for (const app of apps) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
      reducedMotion: 'reduce',
      locale: 'en-US',
      timezoneId: 'America/Los_Angeles',
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedResponses = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedResponses.push({ status: response.status(), url: response.url() });
      }
    });

    const response = await page.goto(app.url, { waitUntil: 'domcontentloaded' });
    assert.equal(response?.status(), 200, `${app.name} must return HTTP 200`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    });

    const rendered = await page.evaluate(() => {
      const separator = document.querySelector(
        '[role="separator"][aria-label="Resize columns"]',
      );
      if (!(separator instanceof HTMLElement)) {
        throw new Error('Resize separator not found');
      }
      const stage = separator.previousElementSibling;
      const api = separator.nextElementSibling;
      const left =
        document.querySelector('main > div > aside') ??
        document.querySelector('[class*="ConfigurePanel_panel"]');
      const feed = document.querySelector(
        '[class*="ApiCallList_feed"], [class*="ApiPanelSkeleton_feed"]',
      );
      const callCard = document.querySelector(
        '[class*="ApiCallList_callCard"], [class*="ApiPanelSkeleton_callCard"]',
      );
      const measure = (element) => {
        if (!(element instanceof HTMLElement)) return null;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName,
          className: element.className,
          rawWidth: box.width,
          width: Math.round(box.width),
          padding: style.padding,
          maxWidth: style.maxWidth,
        };
      };
      return {
        layout: document.documentElement.dataset.layout,
        leftRail: measure(left),
        stage: measure(stage),
        apiRail: measure(api),
        railContent: measure(feed),
        railCard: measure(callCard),
        bodyWidth: document.body.scrollWidth,
      };
    });
    const expectedLayout = width < source.layoutWide ? 'stacked' : 'wide';
    const expectedStage = width < source.layoutWide
      ? width - source.leftRail
      : width - source.leftRail - source.apiDefault;
    const expectedApi = width < source.layoutWide
      ? width - source.leftRail
      : source.apiDefault;
    assert.equal(rendered.layout, expectedLayout);
    assert.equal(rendered.leftRail?.width, source.leftRail);
    assert.equal(rendered.stage?.width, expectedStage);
    assert.equal(rendered.apiRail?.width, expectedApi);
    assert.equal(rendered.railContent?.width, source.railContentMaxWidth);
    assert.match(
      rendered.railContent?.padding ?? '',
      new RegExp(`(?:^| )${source.railContentPadding}px(?: |$)`),
    );
    assert.equal(rendered.railCard?.width, source.railCardWidth);
    assert.equal(rendered.railCard?.padding, `${source.railCardPadding}px`);
    assert.equal(rendered.bodyWidth, width);
    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedResponses, []);

    await page.screenshot({
      path: new URL(`rails-${app.name}-${width}.png`, output).pathname,
      fullPage: true,
    });
    measurements.push({
      app: app.name,
      url: app.url,
      viewportWidth: width,
      sourceMaxApi: width - source.leftRail - source.minStage,
      rendered,
      consoleErrors,
      pageErrors,
      failedResponses,
    });
    await context.close();
  }
}

await browser.close();
await writeFile(
  new URL('rail-measurements.json', output),
  `${JSON.stringify({ browser: browserVersion, source, measurements }, null, 2)}\n`,
);
console.log(output.pathname);
