// Activity empty-state Deposit CTA: reveals with the message, opens the flow.
import { chromium } from 'playwright';

const fails = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(label);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByText('Marketplace', { exact: true }).first().click();
await page.waitForTimeout(600);
await page.getByText('Sign in', { exact: true }).first().click();
await page.waitForTimeout(4500);
const phone = page.locator('[class*="AppShell_screen__"]').first();
await phone.locator('[class*="HomeBlocks_body__"]').first().evaluate((el) => el.scrollTo(0, 900));
await page.waitForTimeout(2200); // reveal beat

const cta = phone.locator('[class*="ActivityList_emptyMessage__"] button', { hasText: 'Deposit' });
check('CTA revealed in empty state', (await cta.count()) > 0);
await page.screenshot({ path: '/tmp/mk-empty-cta.png', clip: { x: 560, y: 400, width: 480, height: 560 } });
await cta.first().click();
await page.waitForTimeout(1200);
check('CTA opens deposit flow', await phone.locator('h1', { hasText: 'Deposit' }).count() > 0);

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);
