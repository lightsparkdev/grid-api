// Marketplace live activity: empty skeleton→reveal, then rows land from a
// crypto top-up (pink? no — network logo), a send (initials avatar), and a
// bank deposit (pink cash circle).
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

// Sign in via the flow jump, then close the page → empty home.
await page.getByText('Deposit', { exact: true }).first().click();
await page.waitForTimeout(3000);
const phone = page.locator('[class*="AppShell_screen__"]').first();
await phone.locator('[class*="AddMoneyPage_backBtn__"]').first().click();
await page.waitForTimeout(400);

// Empty state: skeletons first, message after the reveal beat.
check('skeletons up', (await phone.locator('[class*="ActivityList_skeletonRow__"]').count()) === 4);
await page.waitForTimeout(1800);
check('empty message revealed', await phone.getByText('No activity yet').count() > 0);
await phone.locator('[class*="HomeBlocks_root__"]').first().evaluate((el) => {
  el.querySelector('[class*="HomeBlocks_body__"]').scrollTo(0, 600);
});
await page.screenshot({ path: '/tmp/mk-act-empty.png', clip: { x: 560, y: 60, width: 480, height: 900 } });

// Crypto top-up → network-logo row.
await phone.getByText('Deposit', { exact: true }).first().click();
await page.waitForTimeout(1200);
await phone.getByText('Crypto wallet', { exact: true }).first().click();
await page.waitForTimeout(900);
await phone
  .locator('[class*="AddMoneyPage_cryptoRow__"]')
  .filter({ hasText: 'Spark' })
  .locator('button')
  .first()
  .click();
await page.waitForTimeout(4200); // dismiss + toast + row insert
check('crypto row landed', await phone.getByText('Added from Spark wallet').count() > 0);

// Send to a bank recipient → initials avatar row. Add recipient via bank path.
await phone.locator('button[aria-label="Send"]').first().click();
await page.waitForTimeout(800);
await phone.locator('[class*="SendReceiveSheet_actionBtn__"]', { hasText: 'Send' }).first().click();
await page.waitForTimeout(1200);
await phone.locator('[class*="AddMoneyPage_headerPill__"]').first().click();
await page.waitForTimeout(900);
await phone.getByText('Bank account', { exact: true }).first().click();
await page.waitForTimeout(1400);
await phone.locator('[class*="AddBankSheet_row__"]', { hasText: 'Mexico' }).first().click();
await page.waitForTimeout(900);
await phone.getByText('Add bank account', { exact: true }).first().click();
await page.waitForTimeout(2200); // save + sheet down + rise
for (const key of ['2', '0']) {
  await phone.locator(`button[aria-label="${key}"]`).first().click();
  await page.waitForTimeout(120);
}
await phone.locator('[class*="AddMoneyPage_amountCta__"]', { hasText: 'Continue' }).first().click();
await page.waitForTimeout(1600);
await phone.locator('[class*="AddMoneyPage_amountCta__"]', { hasText: 'Confirm send' }).first().click();
await page.waitForTimeout(4500); // Face ID + dismiss + insert
const sendRow = phone.locator('[class*="ActivityList_row__"]').filter({ hasText: 'Sent to' });
check('send row landed', (await sendRow.count()) > 0);
check(
  'send row has initials avatar',
  (await sendRow.first().locator('[class*="ActivityList_tile__"]').textContent())?.trim().length === 2,
);

// Bank deposit → pink cash circle.
await phone.getByText('Deposit', { exact: true }).first().click();
await page.waitForTimeout(1200);
await phone.getByText('Bank account', { exact: true }).first().click();
await page.waitForTimeout(1200);
await phone.locator('[class*="AddMoneyPage_row__"]').first().click();
await page.waitForTimeout(800);
for (const key of ['5', '0']) {
  await phone.locator(`button[aria-label="${key}"]`).first().click();
  await page.waitForTimeout(120);
}
await phone.locator('[class*="AddMoneyPage_amountCta__"]', { hasText: 'Continue' }).first().click();
await page.waitForTimeout(1600);
await phone.locator('[class*="AddMoneyPage_amountCta__"]', { hasText: 'Confirm deposit' }).first().click();
await page.waitForTimeout(4500);
const cashRow = phone.locator('[class*="ActivityList_row__"]').filter({ hasText: 'Added to balance' });
check('bank deposit row landed', (await cashRow.count()) > 0);
check(
  'cash row has pink dollar tile',
  (await cashRow.first().locator('[class*="ActivityList_tileCash__"]').count()) > 0,
);

// Screenshot the populated list.
await phone.locator('[class*="HomeBlocks_root__"]').first().evaluate((el) => {
  el.querySelector('[class*="HomeBlocks_body__"]').scrollTo(0, 900);
});
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/mk-act-rows.png', clip: { x: 560, y: 60, width: 480, height: 900 } });

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);
