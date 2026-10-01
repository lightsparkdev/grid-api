// Smoke test for the share panel: drives every flow against a running dev
// server and fails on anything that would have been a regression today.
//
// Usage: node scripts/share-smoke.mjs [chromium|webkit] [url]
//   (default chromium, http://localhost:4002; the dev server must be up)
//
// Fails on: a console error or page error at any step; a 404 under
// /assets/share/; the card's rect off the frame's slot by more than a pixel
// once settled (Template and every hand); a frame during a hand swap with
// no hand painted; an export (template and every hand, light and dark)
// that comes back empty.
import { chromium, webkit } from 'playwright';

const engineName = process.argv[2] === 'webkit' ? 'webkit' : 'chromium';
const base = process.argv[3] ?? 'http://localhost:4002';
const engine = engineName === 'webkit' ? webkit : chromium;

const failures = [];
const fail = (what) => {
  failures.push(what);
  console.log(`  FAIL ${what}`);
};
const ok = (what) => console.log(`  ok   ${what}`);

const browser = await engine.launch(
  engineName === 'chromium'
    ? { channel: 'chrome', args: ['--headless=new', '--use-angle=metal', '--ignore-gpu-blocklist'] }
    : {},
);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });

// Pre-existing noise, not the share's: the phone's SVG filter ids differ
// between server and client.
const KNOWN = [/did not match/, /Failed to load resource: .* 404/];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (KNOWN.some((k) => k.test(m.text()))) return;
  fail(`console error: ${m.text().slice(0, 200)}`);
});
page.on('pageerror', (e) => fail(`page error: ${String(e).slice(0, 200)}`));
page.on('response', (r) => {
  if (r.status() === 404) fail(`404 ${r.url()}`);
});

const rects = () =>
  page.evaluate(() => {
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { l: b.left, t: b.top, w: b.width, h: b.height };
    };
    const hit = document.querySelector('[data-card-hit]');
    const slot = document.querySelector('[data-share-card-slot]');
    return { hit: hit && r(hit), slot: slot && r(slot) };
  });

/** Wait until the card has stopped moving, then check it sits on the slot. */
const expectAligned = async (label) => {
  let last = null;
  for (let i = 0; i < 60; i++) {
    const now = await rects();
    if (last && now.hit && now.slot) {
      const still = Math.abs(now.hit.l - last.hit.l) < 0.05 && Math.abs(now.hit.w - last.hit.w) < 0.05;
      if (still) break;
    }
    last = now;
    await page.waitForTimeout(50);
  }
  const { hit, slot } = await rects();
  if (!hit || !slot) return fail(`${label}: no card or slot`);
  const dw = Math.abs(hit.w - slot.w);
  const dx = Math.abs(hit.l + hit.w / 2 - (slot.l + slot.w / 2));
  const dy = Math.abs(hit.t + hit.h / 2 - (slot.t + slot.h / 2));
  // The slot is grown by the export's overlap; a pixel of slack covers that.
  if (dw > 1.5 || dx > 1 || dy > 1) fail(`${label}: card off slot (dw ${dw.toFixed(2)} dx ${dx.toFixed(2)} dy ${dy.toFixed(2)})`);
  else ok(`${label}: card on slot`);
};

/** Sample every frame for `ms` after `act`: the hand must be painted on all. */
const expectNoEmptyFrames = async (label, act) => {
  await page.evaluate(() => {
    window.__frames = [];
    const tick = () => {
      const img = document.querySelector('[class*="SharePanel_handLayer"]');
      window.__frames.push(!!img && img.complete && img.naturalWidth > 0);
      if (window.__frames.length < 40) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await act();
  await page.waitForTimeout(700);
  const frames = await page.evaluate(() => window.__frames);
  const empty = frames.filter((f) => !f).length;
  if (empty) fail(`${label}: ${empty}/${frames.length} frames with no hand painted`);
  else ok(`${label}: hand painted on every frame`);
};

const radio = (name) => page.getByRole('radio', { name, exact: true });
const tile = (name) => page.getByRole('button', { name });

console.log(`share smoke on ${engineName} at ${base}`);
await page.goto(`${base}/?theme=light`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.querySelector('[data-card-hit]')?.style.pointerEvents === 'auto', null, {
  timeout: 90000,
});
// The console hook is a development build's; a deployment has none, and the
// direct renders below are skipped there (Save image and Copy link still
// drive the renderer through the panel).
const hook = await page
  .waitForFunction(() => window.__cardExport?.exporter?.ready, null, { timeout: 15000 })
  .then(() => true)
  .catch(() => false);
ok(hook ? 'loaded (dev hook present)' : 'loaded (deployment: no dev hook, direct renders skipped)');

// ── Open ──
await page.getByRole('button', { name: /^share$/i }).click();
await page.waitForTimeout(1500);
await expectAligned('template');

// ── Template ↔ Hand, fast ──
for (let i = 0; i < 3; i++) {
  await radio('Hand').click();
  await page.waitForTimeout(180);
  await radio('Template').click();
  await page.waitForTimeout(180);
}
await radio('Hand').click();
await page.waitForFunction(() => !!document.querySelector('[class*="SharePanel_handLayer"]'), null, { timeout: 15000 });
await page.waitForTimeout(1200);
await expectAligned('hand h1');

// ── Skins ──
for (const n of [2, 3, 4, 5, 1]) {
  await expectNoEmptyFrames(`swap to hand ${n}`, () => radio(`Hand ${n}`).click());
  await expectAligned(`hand h${n}`);
}

// ── Backdrops, including a custom color drag ──
for (const name of ['Dark', 'Gray', 'Brand', 'Light']) {
  const b = radio(name);
  if ((await b.count()) === 0) continue;
  await b.click();
  await page.waitForTimeout(250);
}
ok('backdrops');
await page.getByRole('button', { name: 'Custom color' }).last().click();
await page.waitForTimeout(500);
const field = page.getByRole('slider', { name: 'Saturation and brightness' }).last();
const box = await field.boundingBox();
if (!box) fail('custom color: no field');
else {
  const start = await field.boundingBox();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) {
    await page.mouse.move(box.x + box.width * (0.3 + i * 0.08), box.y + box.height * 0.5, { steps: 2 });
    await page.waitForTimeout(40);
  }
  await page.mouse.up();
  const end = await field.boundingBox();
  if (Math.abs(end.x - start.x) > 0.5 || Math.abs(end.y - start.y) > 0.5) fail('custom color: the field moved during the drag');
  else ok('custom color drag: field held still');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

// ── Back to Template, the Pose row ──
await radio('Template').click();
await page.waitForTimeout(1200);
for (const name of ['Front', 'Turned', 'Back', 'Angled']) {
  await radio(name).click();
  await page.waitForTimeout(500);
}
await expectAligned('template after poses');

// ── Exports ──
const exportOk = hook
  ? await page.evaluate(async () => {
      const out = [];
      const t = await window.__cardExport.render('square', 'light');
      out.push(['template light', t.size]);
      for (const hand of ['h1', 'h2', 'h3', 'h4', 'h5']) {
        for (const bg of ['light', 'dark']) {
          const blob = await window.__cardExport.render('square', bg, 'hand', hand);
          out.push([`${hand} ${bg}`, blob.size]);
        }
      }
      return out;
    })
  : [];
for (const [label, size] of exportOk) {
  if (size > 1000) ok(`export ${label}: ${size} bytes`);
  else fail(`export ${label}: ${size} bytes`);
}

// ── Save image; Save video start and cancel ──
const dl = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
await tile('Save image').click();
const got = await dl;
if (got) ok(`save image: ${await got.suggestedFilename()}`);
else fail('save image: no download');
await page.waitForTimeout(800);
const video = tile('Save video');
if (await video.isDisabled()) ok('save video: unavailable here (no encoder), skipped');
else {
  await video.click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /cancel/i }).click();
  await page.waitForTimeout(1200);
  ok('save video: started and cancelled with the panel');
  await page.getByRole('button', { name: /^share$/i }).click();
  await page.waitForTimeout(1500);
}

// ── Copy link (makes a share locally) ──
await tile('Copy link').click();
await page.waitForFunction(
  () => !/Making link/.test(document.body.innerText),
  null,
  { timeout: 60000 },
);
ok('copy link: the share was made');

// ── A flow dismisses the share ──
await page.getByRole('button', { name: /issue card/i }).first().click();
await page.waitForTimeout(1500);
const shareStillOpen = await page.evaluate(() => {
  const root = document.querySelector('[class*="SharePanel_root"]');
  return root ? root.getAttribute('aria-hidden') !== 'true' : false;
});
if (shareStillOpen) fail('a flow did not dismiss the share');
else ok('a flow dismissed the share');

await browser.close();
console.log(failures.length ? `\n${failures.length} failure(s)` : '\nall clear');
process.exit(failures.length ? 1 : 0);
