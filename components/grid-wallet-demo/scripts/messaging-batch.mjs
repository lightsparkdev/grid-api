/* ChatsApp batch: every screen/flow of the messaging skin, one theme per run.
   Usage: node scripts/messaging-batch.mjs [dark]
   Writes /tmp/chatsapp-batch/<theme>/NN-name.png (clipped to the phone). */
import { chromium } from 'playwright';
import fs from 'node:fs';

const dark = process.argv.includes('dark');
const theme = dark ? 'dark' : 'light';
const outDir = `/tmp/chatsapp-batch/${theme}`;
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
let n = 0;
async function shot(name, settle = 600) {
  await page.waitForTimeout(settle);
  const box = await phone.boundingBox();
  n += 1;
  const file = `${outDir}/${String(n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file, clip: box });
  console.log('shot', file);
}
async function dismissSheet() {
  // Full-bleed money sheets cover the scrim — use their header X when it's up.
  const close = page.getByRole('button', { name: 'Close' }).last();
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  } else {
    const scrim = page.getByRole('button', { name: 'Dismiss' }).last();
    if (await scrim.isVisible().catch(() => false)) await scrim.click();
  }
  await page.waitForTimeout(900);
}

const sidebar = page.getByRole('complementary');

// ── Auth ────────────────────────────────────────────────────────────────────
await sidebar.getByText('Messaging', { exact: true }).click();
await page.waitForTimeout(1400);
await shot('auth-welcome');

// Email sheet (capture, then back out).
await page.getByRole('button', { name: 'Continue with email' }).click();
await shot('auth-email-sheet', 900);
await page.getByRole('button', { name: 'Close' }).click();
await page.waitForTimeout(900);

// Phone sheet → Next → OTP + notification → tap notification → sign in.
await page.getByRole('button', { name: 'Continue with phone' }).click();
await shot('auth-phone-sheet', 900);
await page.getByRole('button', { name: 'Next' }).click();
await page.waitForTimeout(2400); // code step + the notification swoop
await shot('auth-otp-notification', 0);
await page.getByText('22395').first().click(); // autofill + verify + submit
await page.waitForTimeout(4500); // checkmark beat + sheet dismiss + reveal
await shot('wallet-home-entrance', 1800);

// ── Deposit (full flow: sources → add bank → amount → confirm → Face ID) ───
await page.getByRole('button', { name: 'Add', exact: true }).click();
await shot('deposit-sources', 1000);
await page.getByText('Bank account', { exact: true }).first().click();
await page.waitForTimeout(2000); // skeleton → empty state
await shot('deposit-banks-empty', 0);
await page.getByRole('button', { name: 'Add bank', exact: true }).click();
await shot('deposit-country-picker', 1000);
await page.getByText('Mexico', { exact: true }).first().click();
await shot('deposit-bank-form', 1000);
await page.getByRole('button', { name: 'Add bank account' }).last().click(); // save
await page.waitForTimeout(2000); // saving beat → amount step
for (const d of ['5', '0', '0']) {
  await page.getByRole('button', { name: d, exact: true }).first().click();
  await page.waitForTimeout(120);
}
await shot('deposit-amount', 400);
await page.locator('[class*=ctaWrap] button').first().click(); // Continue
await shot('deposit-confirm', 1200);
await page.locator('[class*=ctaWrap] button').first().click(); // Confirm
await shot('deposit-faceid', 600);
await page.waitForTimeout(2800); // Face ID resolves → toast + activity row
await shot('deposit-toast-home', 0);
await page.waitForTimeout(2500); // let the toast clear

// ── Withdraw / Send / Receive (sidebar jumps — entry screen each) ──────────
await sidebar.getByText('Withdraw', { exact: true }).click();
await shot('withdraw-sheet', 1800);
await dismissSheet();

await sidebar.getByText('Send', { exact: true }).click();
await shot('send-sheet', 1800);
await dismissSheet();

await sidebar.getByText('Receive', { exact: true }).click();
await shot('receive-sheet', 1800);
await dismissSheet();

// ── Card flow ───────────────────────────────────────────────────────────────
await sidebar.getByText('Issue card', { exact: true }).click();
await shot('card-intro', 1800);
await page.getByRole('button', { name: 'Get your free card' }).click();
await shot('card-creating', 700);
await page.waitForTimeout(2600); // brain settles on 'ready'
await shot('card-ready', 0);
await page.getByRole('button', { name: 'Continue' }).click();
await shot('card-home-empty', 1200);

// Tap to pay (system choreography) — reader status, then the charge lands.
await phone.getByRole('button', { name: /Tap to pay/ }).click();
await shot('tap-to-pay-hold', 900);
await page.waitForTimeout(6500); // Face ID beat + done + content back in
await shot('card-home-transaction', 600);

// Close the card flow → back at home with activity.
await page.getByRole('button', { name: 'Close' }).first().click();
await shot('wallet-home-final', 1200);

console.log('batch done:', outDir);
await browser.close();
