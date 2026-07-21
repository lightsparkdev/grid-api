/* Probe the inline auth flow + flat home buttons + glass pill tab bar. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const dark = process.argv.includes('dark');
const tag = dark ? 'dark' : 'light';
const outDir = `/tmp/msg-inline/${tag}`;
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://localhost:4000/${dark ? '?theme=dark' : ''}`, {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(1500);

const phone = page.locator('[class*=phone]').first();
const sidebar = page.getByRole('complementary');
let n = 0;
async function shot(name, settle = 800) {
  await page.waitForTimeout(settle);
  const box = await phone.boundingBox();
  n += 1;
  await page.screenshot({ path: `${outDir}/${String(n).padStart(2, '0')}-${name}.png`, clip: box });
  console.log('shot', name);
}

await sidebar.getByText('Messaging', { exact: true }).click();
await shot('welcome', 1400);

// Phone: entry push → country push → pick → back → OTP push → autofill → home.
await page.getByRole('button', { name: 'Continue with phone' }).click();
await shot('phone-entry', 900);
await phone.getByRole('button', { name: /United States/ }).click();
await shot('country-page', 900);
await phone.getByRole('button', { name: /Brazil/ }).first().click();
await shot('entry-brazil', 900);
// Back to US for the demo corridor.
await phone.getByRole('button', { name: /Brazil/ }).click();
await page.waitForTimeout(800);
await phone.getByRole('button', { name: /United States/ }).first().click();
await page.waitForTimeout(800);
await page.getByRole('button', { name: 'Next' }).click();
await page.waitForTimeout(2400);
await shot('otp-notification', 0);
await page.getByText('22395').first().click();
await page.waitForTimeout(4500);
await shot('wallet-home', 1800);

// Hover a real action + the tab bar zone for the flat buttons + glass pill.
await phone.getByRole('button', { name: 'Scan' }).hover();
await shot('home-hover-dim', 500);

console.log('done:', outDir);
await browser.close();
