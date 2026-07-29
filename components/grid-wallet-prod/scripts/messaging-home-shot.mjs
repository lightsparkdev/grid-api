/* Quick home-only shot after tweaks. Usage: node scripts/messaging-home-shot.mjs [dark] */
import { chromium } from 'playwright';

const dark = process.argv.includes('dark');
const tag = dark ? 'dark' : 'light';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(`http://localhost:4000/${dark ? '?theme=dark' : ''}`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(1500);
const sidebar = page.getByRole('complementary');
await sidebar.getByText('Messaging', { exact: true }).click();
await page.waitForTimeout(1000);
await sidebar.getByText('Deposit', { exact: true }).click();
await page.waitForTimeout(2600);
// Close the deposit sheet so the home shows.
const close = page.getByRole('button', { name: 'Close' }).last();
if (await close.isVisible().catch(() => false)) await close.click();
await page.waitForTimeout(1200);
const box = await page.locator('[class*=phone]').first().boundingBox();
await page.screenshot({ path: `/tmp/msg-home-${tag}.png`, clip: box });
console.log('done', tag);
await browser.close();
