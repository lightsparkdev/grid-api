// Inspect the email sheet's bottom edge (frost fill vs edge stroke) before
// and after step-height changes. Usage: node scripts/webkit-sheet-bottom.mjs <webkit|chromium>
import { webkit, chromium } from 'playwright';

const engine = process.argv[2] === 'chromium' ? chromium : webkit;
const tag = process.argv[2] === 'chromium' ? 'c' : 'w';

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
await page.waitForTimeout(1200);

const sheet = page.locator('[class*="BottomSheet_sheet__"]').first();
const shot = async (name) => {
  const box = await sheet.boundingBox();
  await page.screenshot({
    path: `/tmp/sheet-${tag}-${name}.png`,
    clip: { x: box.x - 8, y: box.y + box.height - 56, width: box.width + 16, height: 80 },
  });
};

await shot('initial');

// → code step (height change) and back.
await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
await page.waitForTimeout(2500);
await shot('code');
await page.getByRole('button', { name: 'Back' }).first().click();
await page.waitForTimeout(1200);
await shot('back');

console.log('ok');
await browser.close();
