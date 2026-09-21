import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const cardsUrl = process.env.CARDS_URL ?? 'http://127.0.0.1:4002';
const statementsUrl = process.env.STATEMENTS_URL ?? 'http://127.0.0.1:4003';
const label = process.env.AUDIT_LABEL ?? 'current';
const output = new URL(`../.artifacts/visual-audit/${label}/`, import.meta.url);
const cases = [
  { name: '1280-light', width: 1280, height: 1000, theme: 'light' },
  { name: '1280-dark', width: 1280, height: 1000, theme: 'dark' },
  { name: '1680-light', width: 1680, height: 1050, theme: 'light' },
  { name: '1680-dark', width: 1680, height: 1050, theme: 'dark' },
  { name: '2560-light', width: 2560, height: 1200, theme: 'light' },
  { name: '2560-dark', width: 2560, height: 1200, theme: 'dark' },
  { name: 'stacked-light', width: 1440, height: 1100, theme: 'light' },
  { name: 'stacked-dark', width: 1440, height: 1100, theme: 'dark' },
  { name: 'mobile-light', width: 390, height: 844, theme: 'light', mobile: true },
  { name: 'mobile-dark', width: 390, height: 844, theme: 'dark', mobile: true },
];

await mkdir(output, { recursive: true });
if (process.env.BEFORE_SCREENSHOT) {
  await copyFile(
    process.env.BEFORE_SCREENSHOT,
    new URL('before-broken-export.png', output),
  );
}
const browser = await chromium.launch();
const evidence = [];

for (const auditCase of cases) {
  for (const app of [
    { name: 'cards', url: cardsUrl },
    { name: 'statements', url: statementsUrl },
  ]) {
    const context = await browser.newContext({
      viewport: { width: auditCase.width, height: auditCase.height },
      colorScheme: auditCase.theme,
      reducedMotion: 'reduce',
      // The render server runs on UTC. A browser time zone behind UTC gives a
      // different calendar date, so clock or locale text that matches only on
      // one machine fails here instead of in production.
      timezoneId: 'America/Los_Angeles',
      locale: 'en-US',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(`${app.url}/?theme=${auditCase.theme}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const baseName = `${app.name}-${auditCase.name}`;
    await page.screenshot({ path: new URL(`${baseName}.png`, output).pathname, fullPage: true });
    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height),
          background: style.backgroundColor,
          borderColor: style.borderColor,
          fontFamily: style.fontFamily,
        };
      };
      return {
        theme: document.documentElement.dataset.theme,
        layout: document.documentElement.dataset.layout,
        configure: rect('.configure-panel, [class*="ConfigurePanel_panel"]'),
        center: rect('.statement-panel, [class*="appCol"]'),
        api: rect('.api-column, [class*="apiCol"]'),
        header: rect('.panel-header, [class*="PanelHeader_header"]'),
        shell: rect('[class*="AppShell_frame"]'),
        deviceToggle: rect('[role="radiogroup"][aria-label="Preview device"]'),
        stage: rect('[class*="StatementPanel_stage"]'),
        liquidGlassFilters: document.querySelectorAll(
          '[class*="DeviceToggle_glass"] filter',
        ).length,
        secondaryBackgroundControl: Array.from(
          document.querySelectorAll('span'),
        ).some((element) => element.textContent === 'Secondary background'),
        body: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight,
        },
      };
    });
    const entry = { app: app.name, case: auditCase.name, metrics, errors };
    evidence.push(entry);

    if (app.name === 'statements' && !auditCase.mobile) {
      await page.getByText('listTransactions').waitFor({ state: 'attached' });
      entry.metrics.mobileBrandLogo = await page
        .locator('[class*="StatementScreen_logo"] img')
        .evaluate((element) => {
          const box = element.getBoundingClientRect();
          return {
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
        });
      await page.screenshot({
        path: new URL(`${baseName}-statement.png`, output).pathname,
        fullPage: true,
      });
      await page.getByRole('radio', { name: 'Desktop' }).click();
      await page.getByText('September statement').first().waitFor();
      entry.metrics.desktopFrame = await page
        .locator('[class*="StatementPreview_desktopApp"]')
        .evaluate((element) => {
          const box = element.getBoundingClientRect();
          return {
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
        });
      await page.screenshot({
        path: new URL(`${baseName}-desktop.png`, output).pathname,
        fullPage: true,
      });
      await page.getByRole('button', { name: 'Share' }).click();
      const sheet = page.getByRole('region', { name: 'Share statement' });
      await sheet.waitFor();
      entry.metrics.shareSheet = await sheet.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return {
          width: Math.round(box.width),
          height: Math.round(box.height),
          fitsViewport:
            box.left >= 0 &&
            box.top >= 0 &&
            box.right <= window.innerWidth &&
            box.bottom <= window.innerHeight,
        };
      });
      await page.screenshot({
        path: new URL(`${baseName}-share.png`, output).pathname,
        fullPage: true,
      });
      await page.keyboard.press('Escape');
      await sheet.waitFor({ state: 'detached' });
      entry.metrics.escapeDismisses = true;
      entry.metrics.backdropLeftBehind =
        (await page.locator('[class*="ShareSheet_backdrop"]').count()) > 0;
    }

    if (auditCase.mobile) {
      if (app.name === 'statements') {
        await page.getByText('listTransactions').waitFor({ state: 'attached' });
      }
      const explore = page.getByRole('button', { name: 'Explore playground' });
      if (await explore.count()) {
        await explore.click();
        await page.waitForTimeout(700);
        await page.screenshot({
          path: new URL(`${baseName}-playground.png`, output).pathname,
          fullPage: true,
        });
        if (app.name === 'statements') {
          entry.metrics.mobileBrandLogo = await page
            .locator('[class*="StatementScreen_logo"] img')
            .evaluate((element) => {
              const box = element.getBoundingClientRect();
              return {
                width: Math.round(box.width),
                height: Math.round(box.height),
              };
            });
          await page.screenshot({
            path: new URL(`${baseName}-playground-statement.png`, output).pathname,
            fullPage: true,
          });
        }
      }
    }
    await context.close();
  }
}

await browser.close();
await writeFile(new URL('metrics.json', output), `${JSON.stringify(evidence, null, 2)}\n`);
const statementErrors = evidence
  .filter((entry) => entry.app === 'statements')
  .flatMap((entry) => entry.errors);
if (statementErrors.length > 0) {
  throw new Error(`Statements console errors: ${statementErrors.join('\n')}`);
}
console.log(output.pathname);
