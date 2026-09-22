import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const cardsUrl = process.env.CARDS_URL ?? 'http://127.0.0.1:4002';
const statementsUrl = process.env.STATEMENTS_URL ?? 'http://127.0.0.1:4003';
const label = process.env.AUDIT_LABEL ?? 'current';
const phase = process.env.AUDIT_PHASE ?? 'after';
const output = new URL(`../.artifacts/visual-audit/${label}/`, import.meta.url);
const cases = [
  { name: '1280-light', width: 1280, height: 1000, theme: 'light' },
  { name: '1280-dark', width: 1280, height: 1000, theme: 'dark' },
  { name: '1680-light', width: 1680, height: 1050, theme: 'light' },
  { name: '1680-dark', width: 1680, height: 1050, theme: 'dark' },
  { name: '1920-light', width: 1920, height: 1080, theme: 'light' },
  { name: '1920-dark', width: 1920, height: 1080, theme: 'dark' },
  { name: '2560-light', width: 2560, height: 1200, theme: 'light' },
  { name: '2560-dark', width: 2560, height: 1200, theme: 'dark' },
  { name: 'stacked-light', width: 1440, height: 1100, theme: 'light' },
  { name: 'stacked-dark', width: 1440, height: 1100, theme: 'dark' },
  {
    name: 'mobile-light',
    width: 390,
    height: 844,
    theme: 'light',
    mobile: true,
  },
  { name: 'mobile-dark', width: 390, height: 844, theme: 'dark', mobile: true },
];

await mkdir(output, { recursive: true });
if (process.env.BEFORE_SCREENSHOT) {
  await copyFile(process.env.BEFORE_SCREENSHOT, new URL('before-broken-export.png', output));
}
const browser = await chromium.launch();
const evidence = [];

async function desktopFrameMetrics(frame) {
  return frame.evaluate((element) => {
    const frameBox = element.getBoundingClientRect();
    const metric = (selector) => {
      const target = element.querySelector(selector);
      if (!target) return null;
      const box = target.getBoundingClientRect();
      const style = getComputedStyle(target);
      return {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
        xRatio: Number(((box.x - frameBox.x) / frameBox.width).toFixed(4)),
        yRatio: Number(((box.y - frameBox.y) / frameBox.height).toFixed(4)),
        widthRatio: Number((box.width / frameBox.width).toFixed(4)),
        heightRatio: Number((box.height / frameBox.height).toFixed(4)),
        background: style.backgroundColor,
        borderTopWidth: style.borderTopWidth,
        borderBottomWidth: style.borderBottomWidth,
        borderRightWidth: style.borderRightWidth,
      };
    };
    const header = element.querySelector('[data-statement-header]');
    const sidebar = element.querySelector('[data-statement-sidebar]');
    const railContent = element.querySelector('[data-statement-rail-content]');
    const railFooter = element.querySelector('[data-statement-rail-footer]');
    const main = element.querySelector('[data-statement-main]');
    const scroll = element.querySelector('[data-statement-scroll]');
    const article = scroll?.querySelector('article');
    const frameSurfaces = [element, sidebar, railContent, railFooter, main, header];
    const frameColors = frameSurfaces.map((surface) => getComputedStyle(surface).backgroundColor);
    const railBox = sidebar.getBoundingClientRect();
    const zoneHeights = [railContent, railFooter].reduce(
      (total, zone) => total + zone.getBoundingClientRect().height,
      0,
    );
    const scrollStyle = getComputedStyle(scroll);
    const sunkenToken = scrollStyle.getPropertyValue('--statement-sunken').trim();
    const probe = window.document.createElement('div');
    probe.style.background = sunkenToken;
    element.appendChild(probe);
    const resolvedSunken = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const primaryProbe = window.document.createElement('div');
    primaryProbe.style.background = scrollStyle
      .getPropertyValue('--statement-primary-background')
      .trim();
    element.appendChild(primaryProbe);
    const resolvedPrimary = getComputedStyle(primaryProbe).backgroundColor;
    primaryProbe.remove();
    return {
      signature: {
        frameDirection: getComputedStyle(element).flexDirection,
        frameChildren: Array.from(element.children, (child) => child.tagName),
        railZones: Array.from(
          sidebar.children,
          (child) =>
            ['rail-content', 'rail-footer'].find((zone) =>
              child.hasAttribute(`data-statement-${zone}`),
            ) ?? child.tagName,
        ),
        mainChildren: Array.from(main.children, (child) => child.tagName),
        headerChildren: Array.from(header.children, (child) => child.tagName),
        headerText: header.textContent,
        footerChildren: Array.from(railFooter.children, (child) => child.tagName),
        footerText: railFooter.textContent,
        railContentChildren: Array.from(railContent.children, (child) => child.tagName),
        railContentText: railContent.textContent,
        titleCount: Array.from(element.querySelectorAll('article header > strong')).filter(
          (node) => node.textContent?.trim() === 'September statement',
        ).length,
        hasStableScrollTarget: scroll !== null && main.contains(scroll) && scroll !== main,
        documentSurface: article?.getAttribute('data-surface') ?? null,
      },
      frame: {
        width: Math.round(frameBox.width),
        height: Math.round(frameBox.height),
        background: getComputedStyle(element).backgroundColor,
      },
      fit: {
        scale: Number.parseFloat(getComputedStyle(element).getPropertyValue('--fit-scale')),
        railFillsFrame: Math.abs(railBox.height - frameBox.height) < 1,
        zonesFillRail: Math.abs(zoneHeights - railBox.height) < 1,
        footerAtRailBottom: Math.abs(railFooter.getBoundingClientRect().bottom - railBox.bottom) < 1,
        scrollOverflows: scroll.scrollHeight > scroll.clientHeight,
        mainDoesNotScroll: main.scrollHeight - main.clientHeight === 0,
        frameDoesNotScroll: element.scrollHeight - element.clientHeight === 0,
      },
      sunken: {
        token: sunkenToken,
        background: scrollStyle.backgroundColor,
        matchesToken: scrollStyle.backgroundColor === resolvedSunken,
        frameSurfacesMatch: frameColors.every((color) => color === resolvedSunken),
        documentMatchesPrimary:
          getComputedStyle(article).backgroundColor === resolvedPrimary,
        documentLifted:
          getComputedStyle(article).backgroundColor !== scrollStyle.backgroundColor,
      },
      header: metric('[data-statement-header]'),
      sidebar: metric('[data-statement-sidebar]'),
      railContent: metric('[data-statement-rail-content]'),
      railFooter: metric('[data-statement-rail-footer]'),
      main: metric('[data-statement-main]'),
      scroll: metric('[data-statement-scroll]'),
      document: article ? metric('[data-statement-scroll] > article') : null,
    };
  });
}

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
    await page.goto(`${app.url}/?theme=${auditCase.theme}`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const baseName = `${phase}-${app.name}-${auditCase.name}`;
    await page.screenshot({
      path: new URL(`${baseName}.png`, output).pathname,
      fullPage: true,
    });
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
        secondaryBackgroundControl: Array.from(document.querySelectorAll('span')).some(
          (element) => element.textContent === 'Secondary background',
        ),
        body: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight,
        },
      };
    });
    const entry = {
      phase,
      app: app.name,
      case: auditCase.name,
      metrics,
      errors,
    };
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
      entry.metrics.desktopFrame = await desktopFrameMetrics(
        page.locator('[data-statement-frame]'),
      );
      await page.screenshot({
        path: new URL(`${baseName}-desktop.png`, output).pathname,
        fullPage: true,
      });
      await page.getByRole('button', { name: 'Export' }).click();
      const sheet = page.getByRole('dialog', { name: 'Export statement' });
      await sheet.waitFor();
      await page.waitForFunction(() => {
        const panel = document.querySelector('[aria-label="Export statement"]');
        if (!panel) return false;
        const style = getComputedStyle(panel);
        const transform = new DOMMatrixReadOnly(style.transform);
        return (
          Math.abs(transform.a - 1) < 0.001 &&
          Math.abs(transform.d - 1) < 0.001 &&
          Math.abs(transform.m42) < 0.5 &&
          Number.parseFloat(style.opacity) > 0.999 &&
          (style.filter === 'none' || style.filter === 'blur(0px)')
        );
      });
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
      entry.metrics.exportDesktopFrame = await desktopFrameMetrics(
        sheet.locator('[data-statement-frame]'),
      );
      entry.metrics.directExportFrameSignatureMatch =
        JSON.stringify(entry.metrics.desktopFrame.signature) ===
        JSON.stringify(entry.metrics.exportDesktopFrame.signature);
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
          const mobileScroller = page.locator('[data-statement-scroll]');
          const mobileHeader = page.locator('[data-statement-header]');
          const mobileDocument = mobileScroller.locator('article');
          entry.metrics.mobileUnscrolled = await mobileHeader.evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              scrolled: element.hasAttribute('data-scrolled'),
              borderBottomWidth: style.borderBottomWidth,
              boxShadow: style.boxShadow,
              transitionDuration: style.transitionDuration,
            };
          });
          entry.metrics.mobileDocument = await mobileDocument.evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              surface: element.getAttribute('data-surface'),
              borderWidth: style.borderTopWidth,
              borderRadius: style.borderTopLeftRadius,
            };
          });
          await mobileScroller.evaluate((element) => {
            element.scrollTop = 80;
            element.dispatchEvent(new Event('scroll', { bubbles: true }));
          });
          await page.waitForFunction(() =>
            document.querySelector('[data-statement-header]')?.hasAttribute('data-scrolled'),
          );
          entry.metrics.mobileScrolled = await mobileHeader.evaluate((element) => {
            const style = getComputedStyle(element);
            return {
              scrolled: element.hasAttribute('data-scrolled'),
              borderBottomWidth: style.borderBottomWidth,
              boxShadow: style.boxShadow,
            };
          });
          await page.screenshot({
            path: new URL(`${baseName}-playground-statement-scrolled.png`, output).pathname,
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
const desktopFailures = evidence
  .filter((entry) => entry.app === 'statements' && entry.metrics.desktopFrame)
  .flatMap((entry) => {
    const failures = [];
    const { signature, fit, sunken } = entry.metrics.desktopFrame;
    if (signature.frameDirection !== 'row') failures.push('frame direction');
    if (signature.frameChildren.join() !== 'ASIDE,DIV') failures.push('frame children');
    if (signature.railZones.join() !== 'rail-content,rail-footer') {
      failures.push('rail zones');
    }
    if (signature.mainChildren.join() !== 'DIV,DIV') failures.push('main children');
    if (signature.headerChildren.length > 0 || signature.headerText !== '') {
      failures.push('main header must be empty');
    }
    if (signature.footerChildren.length > 0 || signature.footerText !== '') {
      failures.push('rail footer must be empty');
    }
    if (signature.railContentChildren.length > 0 || signature.railContentText !== '') {
      failures.push('rail content must be empty');
    }
    if (signature.titleCount !== 1) failures.push('desktop title count');
    if (signature.hasStableScrollTarget !== true) failures.push('scroll target');
    if (signature.documentSurface !== 'card') failures.push('desktop document surface');
    if (fit.railFillsFrame !== true) failures.push('rail full height');
    if (fit.zonesFillRail !== true) failures.push('rail zone coverage');
    if (fit.footerAtRailBottom !== true) failures.push('footer at rail bottom');
    if (fit.scrollOverflows !== true) failures.push('internal scrolling');
    if (fit.mainDoesNotScroll !== true) failures.push('main column scrolls');
    if (fit.frameDoesNotScroll !== true) failures.push('frame scrolls');
    if (!(fit.scale > 0 && fit.scale <= 1)) failures.push('fit scale');
    if (!sunken?.token) failures.push('sunken token');
    if (sunken?.matchesToken !== true) failures.push('sunken token resolution');
    if (sunken?.frameSurfacesMatch !== true) failures.push('sunken frame surfaces');
    if (sunken?.documentMatchesPrimary !== true) failures.push('document primary surface');
    if (sunken?.documentLifted !== true) failures.push('document surface contrast');
    if (entry.metrics.directExportFrameSignatureMatch !== true) {
      failures.push('direct/export frame mismatch');
    }
    if (entry.metrics.shareSheet?.fitsViewport !== true) failures.push('export viewport fit');
    return failures.map((failure) => `${entry.case}: ${failure}`);
  });
if (desktopFailures.length > 0) {
  throw new Error(`Statements desktop audit failures: ${desktopFailures.join('\n')}`);
}
function shadowHasVisibleDepth(boxShadow) {
  if (!boxShadow || boxShadow === 'none') return false;
  const colors = [...boxShadow.matchAll(/(?:rgba?|color)\(([^)]+)\)/g)].map(
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
const mobileFailures = evidence
  .filter((entry) => entry.app === 'statements' && entry.metrics.mobileDocument)
  .flatMap((entry) => {
    const failures = [];
    const { mobileDocument, mobileScrolled, mobileUnscrolled } = entry.metrics;
    if (mobileDocument.surface !== 'bleed') failures.push('document surface');
    if (mobileDocument.borderWidth !== '0px') failures.push('document border');
    if (mobileDocument.borderRadius !== '0px') failures.push('document radius');
    if (mobileUnscrolled.borderBottomWidth === '0px') failures.push('header hairline');
    if (mobileUnscrolled.scrolled !== false) failures.push('initial scroll state');
    if (mobileUnscrolled.transitionDuration !== '0s') failures.push('reduced motion transition');
    if (mobileScrolled.scrolled !== true) failures.push('scrolled state');
    if (mobileScrolled.boxShadow === mobileUnscrolled.boxShadow) {
      failures.push('scrolled shadow unchanged');
    }
    if (!shadowHasVisibleDepth(mobileScrolled.boxShadow)) {
      failures.push('scrolled shadow depth');
    }
    return failures.map((failure) => `${entry.case}: ${failure}`);
  });
if (mobileFailures.length > 0) {
  throw new Error(`Statements mobile audit failures: ${mobileFailures.join('\n')}`);
}
const fitScaleCases = new Set(
  evidence
    .filter((entry) => entry.app === 'statements' && entry.metrics.desktopFrame)
    .map((entry) => entry.case.replace(/-(?:light|dark)$/, '')),
);
const requiredFitScaleCases = new Set(
  cases.filter((auditCase) => !auditCase.mobile).map((auditCase) => auditCase.name.split('-')[0]),
);
const missingFitScaleCases = [...requiredFitScaleCases].filter((name) => !fitScaleCases.has(name));
if (missingFitScaleCases.length > 0) {
  throw new Error(`Missing desktop fit-scale coverage: ${missingFitScaleCases.join(', ')}`);
}
console.log(output.pathname);
