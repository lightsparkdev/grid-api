/* Cross-skin sanity: every built skin still renders its auth screen, and a
   mid-flow skin switch INTO messaging renders sanely (money sheet open). */
import { chromium } from 'playwright';
import fs from 'node:fs';

const outDir = '/tmp/chatsapp-verify';
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const phone = page.locator('[class*=phone]').first();
const sidebar = page.getByRole('complementary');

async function shot(name, settle = 1400) {
  await page.waitForTimeout(settle);
  const box = await phone.boundingBox();
  await page.screenshot({ path: `${outDir}/${name}.png`, clip: box });
  console.log('shot', name);
}

for (const label of ['Fintech', 'Creator', 'Social', 'Marketplace', 'On-demand']) {
  await sidebar.getByText(label, { exact: true }).click();
  await shot(`auth-${label.toLowerCase()}`);
}

// Mid-flow switch: open the deposit sheet on Aurora, then switch to Messaging.
await sidebar.getByText('Fintech', { exact: true }).click();
await page.waitForTimeout(1200);
await sidebar.getByText('Deposit', { exact: true }).click();
await page.waitForTimeout(2600);
await shot('aurora-deposit-open', 400);
await sidebar.getByText('Messaging', { exact: true }).click();
await shot('messaging-after-midflow-switch', 2000);

console.log('verify done:', outDir);
await browser.close();
