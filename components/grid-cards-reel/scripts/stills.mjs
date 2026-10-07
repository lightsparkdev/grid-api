// Write every brand's stills and Figma SVGs (see src/pages/Stills.tsx):
//   npm run stills [-- id,id]
// Needs the dev server running (npm run dev).
import { chromium } from 'playwright';

const only = process.argv[2];
const base = process.env.REEL_URL ?? 'http://localhost:4010/';
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('[page]', e.message));
await page.goto(`${base}#/stills${only ? `?only=${only}` : ''}`);
const t0 = Date.now();
const timer = setInterval(async () => {
  const last = await page.evaluate(() => document.querySelector('pre')?.textContent?.split('\n').filter(Boolean).pop()).catch(() => null);
  if (last) process.stdout.write(`\r${last.slice(0, 70).padEnd(70)}`);
}, 1000);
try {
  await page.waitForFunction(() => window.__stillsDone || window.__stillsError, null, { timeout: 30 * 60 * 1000, polling: 500 });
  const err = await page.evaluate(() => window.__stillsError);
  if (err) throw new Error(err);
} finally {
  clearInterval(timer);
}
const log = await page.evaluate(() => document.querySelector('pre')?.textContent ?? '');
console.log(`\n${log}\nDone in ${((Date.now() - t0) / 1000).toFixed(0)} s: out/stills, out/figma`);
await browser.close();
