/* Quick smoke: pick the Messaging use case, screenshot auth; jump Deposit,
   screenshot wallet home. Usage: node scripts/messaging-smoke.mjs [dark] */
import { chromium } from 'playwright';

const dark = process.argv.includes('dark');
const url = `http://localhost:4000/${dark ? '?theme=dark' : ''}`;
const tag = dark ? 'dark' : 'light';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[console.error]', m.text());
});
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const sidebar = page.getByRole('complementary');
await sidebar.getByText('Messaging', { exact: true }).click();
await page.waitForTimeout(1400);
await page.screenshot({ path: `/tmp/msg-smoke-auth-${tag}.png` });

// Jump straight into the wallet via a flow jump (passkey won't run headless).
await sidebar.getByText('Deposit', { exact: true }).click();
await page.waitForTimeout(2600);
await page.screenshot({ path: `/tmp/msg-smoke-deposit-${tag}.png` });

console.log('done');
await browser.close();
