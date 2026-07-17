/* Probe the feedback fixes: circle flags, timestamp-only activity, hover dim. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const outDir = '/tmp/msg-fixes';
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const phone = page.locator('[class*=phone]').first();
const sidebar = page.getByRole('complementary');
async function shot(name, settle = 800) {
  await page.waitForTimeout(settle);
  const box = await phone.boundingBox();
  await page.screenshot({ path: `${outDir}/${name}.png`, clip: box });
  console.log('shot', name);
}

await sidebar.getByText('Messaging', { exact: true }).click();
await page.waitForTimeout(1000);

// Deposit flow → country picker + amount/confirm (flags + green CTA check).
await sidebar.getByText('Deposit', { exact: true }).click();
await page.waitForTimeout(2600);
await page.getByText('Bank account', { exact: true }).first().click();
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Add bank', exact: true }).click();
await shot('country-picker', 1000);
await page.getByText('Mexico', { exact: true }).first().click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add bank account' }).last().click();
await page.waitForTimeout(2000);
for (const d of ['5', '0', '0']) {
  await page.getByRole('button', { name: d, exact: true }).first().click();
  await page.waitForTimeout(100);
}
await shot('amount-flag-row', 400);
await page.locator('[class*=ctaWrap] button').first().click();
await shot('confirm-flag-row', 1200);
await page.locator('[class*=ctaWrap] button').first().click();
await page.waitForTimeout(3000); // Face ID → toast → activity row lands
await page.waitForTimeout(2500); // toast clears

// Home: full-bleed flag row + timestamp-only status.
await shot('home-activity', 400);

// Hover the action grid (over Scan) — no-ops should dim.
await phone.getByRole('button', { name: 'Scan' }).hover();
await shot('home-actions-hover', 600);

console.log('done');
await browser.close();
