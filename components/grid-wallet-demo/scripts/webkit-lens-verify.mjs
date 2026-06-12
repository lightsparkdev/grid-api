// Verification harness for the Safari WebGL notification lens.
// Usage: node scripts/webkit-lens-verify.mjs <webkit|chromium> <out-prefix>
// Captures: full capsule at t0 and t0+1s (liveness diff), TL/BR corner crops,
// a mid-swoop frame, and any console errors.
import { webkit, chromium } from 'playwright';

const engine = process.argv[2] === 'chromium' ? chromium : webkit;
const prefix = process.argv[3] ?? `/tmp/lens-${process.argv[2] ?? 'webkit'}`;

const browser = await engine.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 3,
});
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    errors.push(`[${msg.type()}] ${msg.text()}`);
  }
});
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.getByText('swag', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText('Email', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText('Continue with email', { exact: true }).first().click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: 'Continue', exact: true }).first().click();

// Catch the swoop mid-flight (~1s settle + ~0.25s into the spring).
await page.waitForTimeout(1250);
await page.screenshot({ path: `${prefix}-swoop.png` });
await page.waitForTimeout(2000);

const notif = page.getByRole('button', { name: /one-time code/i }).first();
const box = await notif.boundingBox();
const clip = {
  x: box.x - 12,
  y: box.y - 12,
  width: box.width + 24,
  height: box.height + 24,
};
await page.screenshot({ path: `${prefix}-frame-a.png`, clip });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${prefix}-frame-b.png`, clip });

await page.screenshot({
  path: `${prefix}-tl.png`,
  clip: { x: box.x - 12, y: box.y - 12, width: 80, height: 60 },
});
await page.screenshot({
  path: `${prefix}-br.png`,
  clip: { x: box.x + box.width - 68, y: box.y + box.height - 48, width: 80, height: 60 },
});

console.log('box', JSON.stringify(box));
console.log(errors.length ? `console issues:\n${errors.join('\n')}` : 'console clean');
await browser.close();
