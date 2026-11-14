// Runs every flow on every connector in a real browser: clicks the tile (which
// sends its line), then answers each approval (Approve, or Decline with
// SWEEP_DENY=1) and picks the first chip, until the flow settles. It opens what
// each app opens first (Grok's form sheet, Dots' pills, Instinct's vault links),
// replies by text where the app takes text (Instinct: the drafted Yes, or "no"),
// and opens and closes the sub-agent sheet once per flow. Reports how
// long each took, how many tool calls, Grid calls and webhooks it logged, and
// any console errors. Screenshots of each flow's end state land in
// .tmp-sweep/ (gitignored).
//
//   node scripts/flow-sweep.mjs [theme] [base]
//   (theme light|dark, default dark; base default http://localhost:4003;
//    the dev server must be up)
//   SWEEP_ENGINE=webkit runs it in WebKit (Safari's engine);
//   SWEEP_CONNECTORS="Muse,Dots" limits it to those connectors;
//   SWEEP_DENY=1 declines every approval instead;
//   SWEEP_FLOWS="Add funds" limits the flows; SWEEP_PICK=1 picks the second chip (Add funds' bank);
//   SWEEP_MODE=business runs the business account's flows instead;
//   SWEEP_GALLERY=1 also saves each card and approval a flow left in the chat, to .tmp-sweep/gallery/.

import { mkdirSync } from 'node:fs';
import { chromium, webkit } from 'playwright';

const theme = process.argv[2] ?? 'dark';
const base = process.argv[3] ?? 'http://localhost:4003';
const engineName = process.env.SWEEP_ENGINE === 'webkit' ? 'webkit' : 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;
const deny = process.env.SWEEP_DENY === '1';
/** Which chip to pick where there's a choice (SWEEP_PICK=1 takes Add funds' bank path). */
const pick = Number(process.env.SWEEP_PICK ?? 0);
const out = new URL('../.tmp-sweep/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const ALL_CONNECTORS = ['Muse', 'Grok Bot', 'Dots', 'Instinct', 'Duet', 'Your agent'];
const CONNECTORS = process.env.SWEEP_CONNECTORS
  ? ALL_CONNECTORS.filter((c) => process.env.SWEEP_CONNECTORS.split(',').includes(c))
  : ALL_CONNECTORS;
const business = process.env.SWEEP_MODE === 'business';
const ALL_FLOWS = business
  ? ['Get verified', 'Team budget', 'Team card', 'Add funds', 'Send invoice', 'Track invoices', 'Pay a bill', 'Pay a contractor', 'Run payroll', 'Balance', 'History']
  : ['Connect', 'Add funds', 'Set limits', 'Pay someone', 'Buy online', 'Pay an agent', 'Get paid', 'Withdraw', 'Balance', 'History'];
const FLOWS = process.env.SWEEP_FLOWS ? process.env.SWEEP_FLOWS.split(',') : ALL_FLOWS;
const ALLOW = /^(\s*(Allow|Approve|Connect|Continue|Save|Save card|Save limits|Save to vault|Done|Get\sstarted|Link\s[^\n]+|Set\sup|Issue\scard|Turn on Dots balance|Pay \$[\d.,]+(\/mo)?))+\s*$/;
const DENY = /^(\s*(Deny|Decline|Not\s+now|Cancel))+\s*$/;

const browser = await engine.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${base}/?embed=true&theme=${theme}&nav=48${business ? '&mode=business' : ''}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const tile = (label) => page.locator('aside button', { hasText: new RegExp(`^${label}$`) });
const activeTile = () => page.locator('aside [data-active-flow]');

const rows = [];
for (const connector of CONNECTORS) {
  await page.locator('aside button', { hasText: new RegExp(`^${connector}$`) }).click();
  await page.waitForTimeout(700);
  for (const flow of FLOWS) {
    const before = errors.length;
    // A frozen page blocks evaluate and screenshot forever; say which flow and stop.
    const watchdog = setTimeout(() => {
      console.log(`${connector.padEnd(12)} ${flow.padEnd(13)} HUNG (no response in 120s)`);
      process.exit(1);
    }, 120_000);
    const t0 = Date.now();
    await tile(flow).click();
    await page.waitForTimeout(300);
    let answered = 0;
    let peeked = false;
    /** Openers whose sheet only shows details (an address, an invoice), by label: looked at once, then left alone. */
    const looked = new Set();
    while (Date.now() - t0 < 60_000) {
      await page.waitForTimeout(500);
      if ((await activeTile().count()) === 0) break;
      // The sub-agent sheet: open it once, look, close it.
      const subSheet = page.locator('[data-screen-body] [role="dialog"]', { hasText: 'Agent conversation' });
      if (await subSheet.count()) {
        await subSheet.locator('button', { hasText: /^Done$/ }).click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(500);
        continue;
      }
      const row = page.locator('[data-screen-body] [data-subagent]:visible').last();
      if (!peeked && (await row.count())) {
        peeked = true;
        await row.click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(900);
        continue;
      }
      // Declining from a sheet whose only way out is its back button (the card intro).
      const back = page.locator('[data-screen-body] [role="dialog"] button[aria-label="Back"]:visible').last();
      if (deny && (await back.count())) {
        await back.click({ timeout: 1000 }).catch(() => {});
        answered += 1;
        continue;
      }
      // iOS's "wants to sign in" alert sits over the sheet that raised it: answer the alert, not the sheet.
      const alert = page.locator('[data-screen-body] [role="alertdialog"] button:visible', { hasText: deny ? /^Cancel$/ : /^Continue$/ });
      if ((await alert.count()) && (await alert.first().click({ timeout: 600 }).then(() => true, () => false))) {
        await page.waitForTimeout(800);
        continue;
      }
      // Plaid: the first saved bank, so its Continue turns on.
      const institution = page.locator('[data-screen-body] button[class*="PlaidLink_card"]:visible');
      if (!deny && (await institution.count()) && !(await institution.and(page.locator('[data-picked]')).count()) && (await institution.first().click({ timeout: 600 }).then(() => true, () => false))) {
        continue;
      }
      // Icon-only buttons in a sheet (Duet's check to save) answer by their label.
      const iconAsk = page.locator('[data-screen-body] [role="dialog"]').getByRole('button', { name: deny ? DENY : ALLOW }).and(page.locator(':enabled:visible'));
      const ask = (await page.locator('[data-screen-body] button:enabled:visible', { hasText: deny ? DENY : ALLOW }).count())
        ? page.locator('[data-screen-body] button:enabled:visible', { hasText: deny ? DENY : ALLOW }).last()
        : iconAsk.last();
      if (await ask.count()) {
        // The last match first; one covered by a page on top of it (Instinct's Safari) falls through to the next.
        const all = (await page.locator('[data-screen-body] button:enabled:visible', { hasText: deny ? DENY : ALLOW }).count()) ? page.locator('[data-screen-body] button:enabled:visible', { hasText: deny ? DENY : ALLOW }) : iconAsk;
        for (let k = (await all.count()) - 1; k >= 0; k--) {
          if (await all.nth(k).click({ timeout: 600 }).then(() => true, () => false)) break;
        }
        answered += 1;
        continue;
      }
      // Instinct takes text: send the drafted reply, or turn it down.
      if (connector === 'Instinct') {
        const field = page.locator('[data-screen-body] textarea:not([aria-hidden]):visible').first();
        const draft = await field.inputValue({ timeout: 500 }).catch(() => '');
        if (draft) {
          if (deny && draft === 'Yes') await field.fill('no');
          else if (pick && draft !== 'Yes') await field.fill(String(pick + 1));
          await field.press('Enter').catch(() => {});
          answered += 1;
          await page.waitForTimeout(600);
          continue;
        }
      }
      // Balance and account cards only show the account; everything else that opens a sheet is a step to take.
      const opener = page.locator('[data-screen-body] [data-opens-sheet]:enabled:visible:not([class*="balanceArtifact"], [data-kind="account"])').last();
      const label = (await opener.count()) ? await opener.evaluate((e) => e.innerText.trim() || e.getAttribute('aria-label') || e.className).catch(() => '') : '';
      if (label && !looked.has(label)) {
        await opener.click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(800);
        if (await page.locator('[data-screen-body] button:visible', { hasText: /^Copy/ }).count()) {
          looked.add(label);
          await page.locator('[data-screen-body] [aria-label="Close"]:visible').last().click({ timeout: 1000 }).catch(() => {});
          await page.waitForTimeout(700);
        }
        continue;
      }
      // Instinct's vault links open Safari; its balance link only shows the account.
      const link = page.locator('[data-screen-body] [data-open-link]:enabled:visible').filter({ hasNotText: 'Your balance' }).last();
      if (await link.count()) {
        await link.click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(1200);
        continue;
      }
      const chips = page.locator('[data-screen-body] button:enabled:visible:is([class*="chip"], [class*="choice"], [class*="_reply_"], [class*="_option_"], [data-chip])');
      const chip = (await chips.count()) > pick ? chips.nth(pick) : chips.first();
      if (await chip.count()) {
        await chip.click({ timeout: 1000 }).catch(() => {});
        answered += 1;
      }
    }
    if (process.env.SWEEP_GALLERY) {
      const shelf = `${out}gallery/${business ? 'business-' : ''}${connector.replace(/\s/g, '-').toLowerCase()}${theme === 'dark' ? '-dark' : ''}/`;
      mkdirSync(shelf, { recursive: true });
      const count = await page.locator('[data-screen-body]').first().evaluate((el) => {
        const rows = Array.from(el.querySelectorAll('[data-kind]')).filter((r) => !r.parentElement.closest('[data-kind]'));
        let n = 0;
        for (const r of rows) {
          if (r.dataset.shot || !/^(ask|card)$/.test(r.dataset.kind) || r.getBoundingClientRect().height < 24) continue;
          r.dataset.shot = 'new';
          n += 1;
        }
        return n;
      });
      const fresh = page.locator('[data-screen-body] [data-shot="new"]');
      for (let k = 0; k < count; k++) {
        const row = fresh.nth(0);
        await row.evaluate((r) => r.scrollIntoView({ block: 'center' })).catch(() => {});
        await page.waitForTimeout(250);
        await row.screenshot({ path: `${shelf}${flow.replace(/\s/g, '-').toLowerCase()}-${k + 1}.png` }).catch(() => {});
        await row.evaluate((r) => (r.dataset.shot = 'done')).catch(() => {});
      }
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const calls = await page.evaluate(() => {
      const text = document.querySelector('[class*="ApiPanel_panel"]')?.textContent ?? '';
      return {
        tools: (text.match(/TOOL/g) ?? []).length,
        webhooks: (text.match(/WEBHOOK/g) ?? []).length,
        grid: (text.match(/\b(POST|PATCH|GET)\b/g) ?? []).length,
      };
    });
    const file = `${out}${business ? 'business-' : ''}${connector.replace(/\s/g, '-').toLowerCase()}-${flow.replace(/\s/g, '-').toLowerCase()}-${theme}-${engineName}${deny ? '-deny' : ''}.png`;
    await page.screenshot({ path: file });
    const stuck = Number(secs) >= 60;
    clearTimeout(watchdog);
    rows.push({ connector, flow, secs, answered, ...calls, errors: errors.slice(before), stuck });
    console.log(
      `${connector.padEnd(12)} ${flow.padEnd(13)} ${secs.padStart(5)}s  answered ${answered}  panel: ${calls.tools} tools, ${calls.grid} grid, ${calls.webhooks} webhooks${stuck ? '  STUCK' : ''}${errors.length > before ? `  ERRORS: ${errors.slice(before).join(' | ')}` : ''}`,
    );
  }
  const reset = page.locator('aside button', { hasText: /^Reset$/ });
  if (await reset.count()) await reset.click();
  await page.waitForTimeout(800);
}

await browser.close();
const failed = rows.filter((r) => r.errors.length || r.stuck);
console.log(failed.length ? `\n${failed.length} flow(s) with problems` : '\nAll flows settled with no console errors');
process.exit(failed.length ? 1 : 0);
