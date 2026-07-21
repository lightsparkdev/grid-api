// Reproduce the Safari notification-corner mismatch in WebKit and screenshot
// it for inspection. Usage: node scripts/webkit-notif-shot.mjs [out.png]
import { webkit } from 'playwright';

const OUT = process.argv[2] ?? '/tmp/webkit-notif.png';

const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByText('Email', { exact: true }).first().click();
await page.waitForTimeout(800);

// The aurora auth screen renders inside the phone. Start the email flow.
await page.getByText('Continue with email', { exact: true }).first().click();
await page.waitForTimeout(600);

// Email step's Continue (prefilled address) → sending beat → code step.
await page.getByRole('button', { name: 'Continue', exact: true }).first().click();

// Notification swoops in 1s after the code step lands; let it settle.
await page.waitForTimeout(3200);

// Clip to the notification capsule (plus margin for the corners/shadow).
const notif = page.getByRole('button', { name: /one-time code/i }).first();
let clip = null;
try {
  const box = await notif.boundingBox();
  if (box) {
    clip = {
      x: Math.max(0, box.x - 24),
      y: Math.max(0, box.y - 24),
      width: box.width + 48,
      height: box.height + 48,
    };
  }
} catch {
  // fall through to full-page shot
}

await page.screenshot({ path: OUT, ...(clip ? { clip } : {}) });
console.log('wrote', OUT, clip ? `clip=${JSON.stringify(clip)}` : '(full page)');
await browser.close();
