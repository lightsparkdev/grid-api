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
//   SWEEP_DENY=1 declines every approval instead.

import { mkdirSync } from 'node:fs';
import { chromium, webkit } from 'playwright';

const theme = process.argv[2] ?? 'dark';
const base = process.argv[3] ?? 'http://localhost:4003';
const engineName = process.env.SWEEP_ENGINE === 'webkit' ? 'webkit' : 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;
const deny = process.env.SWEEP_DENY === '1';
const out = new URL('../.tmp-sweep/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const ALL_CONNECTORS = ['Muse', 'Bot', 'Dots', 'Instinct', 'Duet', 'Your agent'];
const CONNECTORS = process.env.SWEEP_CONNECTORS
  ? ALL_CONNECTORS.filter((c) => process.env.SWEEP_CONNECTORS.split(',').includes(c))
  : ALL_CONNECTORS;
const FLOWS = ['Connect', 'Add funds', 'Set limits', 'Pay someone', 'Buy online', 'Pay an agent', 'Get paid', 'Withdraw', 'Balance', 'History'];
const ALLOW = /^(\s*(Allow|Approve|Connect|Continue|Save|Save card|Save limits|Save to vault|Done|Turn on Dots balance|Pay \$[\d.,]+(\/mo)?))+\s*$/;
const DENY = /^(\s*(Deny|Decline|Not\s+now|Cancel))+\s*$/;

const browser = await engine.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${base}/?embed=true&theme=${theme}&nav=48`, { waitUntil: 'networkidle' });
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
      // Instinct takes text: send the drafted reply, or turn it down.
      if (connector === 'Instinct') {
        const field = page.locator('[data-screen-body] textarea:not([aria-hidden])').first();
        const draft = await field.inputValue().catch(() => '');
        if (draft) {
          if (deny && draft === 'Yes') await field.fill('no');
          await field.press('Enter').catch(() => {});
          answered += 1;
          await page.waitForTimeout(600);
          continue;
        }
      }
      // Declining from a sheet whose only way out is its back button (the card intro).
      const back = page.locator('[data-screen-body] [role="dialog"] button[aria-label="Back"]:visible').last();
      if (deny && (await back.count())) {
        await back.click({ timeout: 1000 }).catch(() => {});
        answered += 1;
        continue;
      }
      const ask = page.locator('[data-screen-body] button:enabled:visible', { hasText: deny ? DENY : ALLOW }).last();
      if (await ask.count()) {
        await ask.click({ timeout: 1000 }).catch(() => {});
        answered += 1;
        continue;
      }
      const opener = page.locator('[data-screen-body] [data-opens-sheet]:enabled:visible').last();
      if (await opener.count()) {
        await opener.click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(800);
        continue;
      }
      // Instinct's vault links open Safari.
      const link = page.locator('[data-screen-body] [data-open-link]:enabled:visible').last();
      if (await link.count()) {
        await link.click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(1200);
        continue;
      }
      const chip = page.locator('[data-screen-body] button:enabled:is([class*="chip"], [class*="choice"], [data-chip])').first();
      if (await chip.count()) {
        await chip.click({ timeout: 1000 }).catch(() => {});
        answered += 1;
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
    const file = `${out}${connector.replace(/\s/g, '-').toLowerCase()}-${flow.replace(/\s/g, '-').toLowerCase()}-${theme}-${engineName}${deny ? '-deny' : ''}.png`;
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
