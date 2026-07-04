import { chromium } from 'playwright';

const theme = process.argv[2] === 'dark' ? 'dark' : 'light';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:4000/?theme=${theme}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const rail = page.getByRole('complementary');
const phone = page.locator('[class*=phone]').first();
const shot = (name) => phone.screenshot({ path: `/tmp/mk-figma/${name}-${theme}.png` });

// Z notification (email circle → sheet entry → submit → code + notification).
await rail.getByText('Social', { exact: true }).first().click();
await page.waitForTimeout(2500);
await page.getByRole('button', { name: 'Continue with Email' }).click();
await page.waitForTimeout(800);
await page.locator('button[class*=AuthSheet_cta]').first().click();
await page.waitForTimeout(2700);
await shot('n-2-social');

await browser.close();
console.log('done');
