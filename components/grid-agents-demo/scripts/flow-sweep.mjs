// Runs every flow on every connector in a real browser and reports what each
// one did: how long it took, how many API calls and webhooks it logged, and
// any console errors. Screenshots of each flow's end state land in
// .tmp-sweep/ (gitignored).
//
//   node scripts/flow-sweep.mjs [theme] [base]
//   (theme light|dark, default dark; base default http://localhost:4003;
//    the dev server must be up)
//   SWEEP_ENGINE=webkit runs it in WebKit (Safari's engine);
//   SWEEP_CONNECTORS="Muse,Dots" limits it to those connectors.

import { mkdirSync } from 'node:fs';
import { chromium, webkit } from 'playwright';

const theme = process.argv[2] ?? 'dark';
const base = process.argv[3] ?? 'http://localhost:4003';
const engineName = process.env.SWEEP_ENGINE === 'webkit' ? 'webkit' : 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;
const out = new URL('../.tmp-sweep/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const ALL_CONNECTORS = ['Muse', 'Grok Bot', 'Dots', 'Instinct', 'Claude Duet', 'Your app'];
const CONNECTORS = process.env.SWEEP_CONNECTORS
  ? ALL_CONNECTORS.filter((c) => process.env.SWEEP_CONNECTORS.split(',').includes(c))
  : ALL_CONNECTORS;
const FLOWS = ['Connect', 'Fund', 'Set limits', 'Pay someone', 'Buy online', 'Pay an agent'];
const ANSWERS = ['Allow', 'Approve', 'Connect', 'Save'];

const browser = await engine.launch();
const page = await browser.newPage({ viewport: { width: 1392, height: 788 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${base}/?embed=true&theme=${theme}&nav=48`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const flowTile = (label) => page.locator('aside button', { hasText: new RegExp(`^${label}$`) });

const rows = [];
for (const connector of CONNECTORS) {
  await page.locator('aside button', { hasText: new RegExp(`^${connector}$`) }).click();
  await page.waitForTimeout(800);
  for (const flow of FLOWS) {
    const before = errors.length;
    const t0 = Date.now();
    await flowTile(flow).click();
    let answered = 0;
    // Until the flow's tile is enabled again, answer any open approval.
    while (Date.now() - t0 < 90_000) {
      await page.waitForTimeout(400);
      if (await flowTile(flow).isEnabled()) break;
      // Only the phone's own buttons: the left panel has a Connect tile too.
      // TextMorph renders its label twice (shown, and measured), hence the repeat.
      for (const label of ANSWERS) {
        const btn = page.locator('[data-screen-body] button', { hasText: new RegExp(`^(\\s*${label})+\\s*$`) }).last();
        if ((await btn.count()) && (await btn.isVisible()) && (await btn.isEnabled())) {
          await btn.click({ timeout: 1000 }).catch(() => {});
          answered += 1;
          await page.waitForTimeout(600);
        }
      }
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const calls = await page.evaluate(() => {
      const panel = document.querySelector('[class*="ApiPanel_panel"]') ?? document.body;
      const text = panel.innerText;
      return { webhooks: (text.match(/WEBHOOK/g) ?? []).length, posts: (text.match(/\b(POST|PATCH|GET)\b/g) ?? []).length };
    });
    const file = `${out}${connector.replace(/\s/g, '-').toLowerCase()}-${flow.replace(/\s/g, '-').toLowerCase()}-${theme}-${engineName}.png`;
    await page.screenshot({ path: file });
    rows.push({ connector, flow, secs, answered, ...calls, errors: errors.slice(before) });
    console.log(
      `${connector.padEnd(12)} ${flow.padEnd(13)} ${secs.padStart(5)}s  answered ${answered}  panel: ${calls.posts} req, ${calls.webhooks} webhooks${errors.length > before ? `  ERRORS: ${errors.slice(before).join(' | ')}` : ''}`,
    );
  }
  // Reset between connectors so each starts from a clean log.
  const reset = page.locator('aside button', { hasText: /^Reset$/ });
  if (await reset.count()) await reset.click();
  await page.waitForTimeout(800);
}

await browser.close();
const failed = rows.filter((r) => r.errors.length || Number(r.secs) >= 90);
console.log(failed.length ? `\n${failed.length} flow(s) with problems` : '\nAll flows settled with no console errors');
process.exit(failed.length ? 1 : 0);
