// Burst-capture the email sheet during the back (code → email) transition to
// see whether the height eases or snaps. One engine, one run.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByText('Email', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText('Continue with email', { exact: true }).first().click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
await page.waitForTimeout(2600);

// Sample the sheet's height every ~40ms across the back transition.
const samples = await page.evaluate(async () => {
  const sheet = document.querySelector('[class*="BottomSheet_sheet__"]');
  const back = [...document.querySelectorAll('button')].find(
    (b) => b.getAttribute('aria-label') === 'Back',
  );
  const out = [];
  const t0 = performance.now();
  back.click();
  await new Promise((resolve) => {
    const tick = () => {
      out.push({
        t: Math.round(performance.now() - t0),
        h: Math.round(sheet.getBoundingClientRect().height * 10) / 10,
      });
      if (performance.now() - t0 < 700) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
  return out;
});
console.log(samples.map((s) => `${s.t}ms ${s.h}`).join('\n'));
await browser.close();
