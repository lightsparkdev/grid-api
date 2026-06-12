// Captures a burst of frames around the notification's swoop entrance.
// Usage: node scripts/webkit-lens-swoop.mjs <webkit|chromium> <out-prefix>
import { webkit, chromium } from 'playwright';

const engine = process.argv[2] === 'chromium' ? chromium : webkit;
const prefix = process.argv[3] ?? `/tmp/swoop-${process.argv[2] ?? 'webkit'}`;

const browser = await engine.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});
await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.getByText('swag', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText('Email', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText('Continue with email', { exact: true }).first().click();
await page.waitForTimeout(600);

// The phone screen region only (keeps the burst shots small).
const phone = await page.locator('main').boundingBox();
const clip = { x: 1000, y: 50, width: 560, height: 400 };

await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
const t0 = Date.now();
for (const ms of [1450, 1600, 1750, 1950]) {
  const wait = t0 + ms - Date.now();
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `${prefix}-${ms}.png`, clip });
}
console.log('ok', prefix, phone ? '' : '(no main bbox)');
await browser.close();
