// Corner-comparison harness for the glass notification.
// Usage: node scripts/webkit-notif-corner.mjs <webkit|chromium> <out-prefix> [hideShadow]
import { webkit, chromium } from 'playwright';

const engine = process.argv[2] === 'chromium' ? chromium : webkit;
const prefix = process.argv[3] ?? `/tmp/notif-${process.argv[2] ?? 'webkit'}`;
const hideShadow = process.argv.includes('hideShadow');

const browser = await engine.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 3,
});
await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByText('Email', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText('Continue with email', { exact: true }).first().click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
await page.waitForTimeout(3200);

if (hideShadow) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[class*="shadowBlob"]')) {
      el.style.display = 'none';
    }
  });
  await page.waitForTimeout(300);
}

const notif = page.getByRole('button', { name: /one-time code/i }).first();
const box = await notif.boundingBox();
await page.screenshot({
  path: `${prefix}-tl.png`,
  clip: { x: box.x - 12, y: box.y - 12, width: 80, height: 60 },
});
await page.screenshot({
  path: `${prefix}-br.png`,
  clip: { x: box.x + box.width - 68, y: box.y + box.height - 48, width: 80, height: 60 },
});
console.log('ok', prefix);
await browser.close();
