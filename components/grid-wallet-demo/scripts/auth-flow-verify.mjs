// End-to-end auth sheet verification for BOTH OTP methods (email / phone):
// entry → Continue → sending → code step → notification → autofill (email:
// notification tap, phone: code-cell tap) → staged submit (verifying spinner
// → checkmark → dismiss completes → intro) → sign-in lands. Samples the sheet
// height per frame through the forward and X-back transitions (snap
// detection), and asserts the notification's per-method content (SMS: avatar
// + Messages badge + 2-line clamped body).
//
// OAUTH methods (google / apple) run a different scenario: real provider
// popups can't be automated, so the harness installs the __oauthPopupStub
// test seam (src/lib/auth.ts) and asserts the Airbnb model — tap → phone
// untouched while pending (no busy look), double-tap swallowed, cancel →
// still untouched + re-tappable, resolve → sign-in calls + wallet intro.
//
//   node scripts/auth-flow-verify.mjs [email|phone|google|apple] [chromium|webkit]
import { chromium, webkit } from 'playwright';

const method = process.argv[2] ?? 'phone';
const engineName = process.argv[3] ?? 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;

// Per-method harness knobs: the config checkbox label (compact, 1600px
// viewport), the aurora CTA, the prefill, and the expected notification.
const M = {
  email: {
    checkbox: 'Email',
    cta: 'Continue with email',
    prefill: 'demo@lightspark.com',
    typed: null,
    // Final autofill via the notification tap (phone covers the cell tap).
    finalTrigger: 'capsule',
    notif: {
      icon: 'mail-app-icon',
      badge: null,
      title: 'Aurora',
      bodyPart: 'Your one-time code is 123-456',
      lines: 1,
    },
  },
  phone: {
    checkbox: 'Phone',
    cta: 'Continue with phone',
    prefill: '(415) 555-0132',
    // Live-format check: retype the number digit-by-digit.
    typed: { digits: '4155550199', formatted: '(415) 555-0199', masked: '(•••) •••-0199' },
    // Final autofill via a tap on the code cells (the new trigger).
    finalTrigger: 'cells',
    notif: {
      icon: 'generic-contact',
      badge: 'messages-app-icon',
      title: '22395',
      bodyPart: 'Your Aurora verification code is: 123456',
      lines: 2,
    },
  },
}[method];

const fails = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(label);
};

const browser = await engine.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// ── OAuth popup scenario (google / apple) ──
if (method === 'google' || method === 'apple') {
  const cta = method === 'google' ? 'Continue with Google' : 'Continue with Apple';
  // Google is the default-enabled method; Apple needs its checkbox on.
  if (method === 'apple') {
    await page.getByText('Apple', { exact: true }).first().click();
    await page.waitForTimeout(400);
  }
  // Install the popup stub: each "popup" parks its resolvers for the harness.
  await page.evaluate(() => {
    window.__popupStubCalls = [];
    window.__oauthPopupStub = (provider) =>
      new Promise((resolve, reject) => {
        window.__popupStubCalls.push({ provider, resolve, reject });
      });
  });
  const stubCalls = () => page.evaluate(() => window.__popupStubCalls.length);
  // The idle auth screen, summarized: no sheet, sleeve at rest, CTA enabled
  // (the popup wait must NOT read as busy — that's the Airbnb model).
  const authState = () =>
    page.evaluate((ctaLabel) => {
      const sleeve = document.querySelector('[class*="AuroraAuthScreen_sleeve__"]');
      const tr = sleeve ? getComputedStyle(sleeve).transform : null;
      const btn = [...document.querySelectorAll('button')].find(
        (b) => b.textContent.trim() === ctaLabel,
      );
      return {
        authScreen: !!document.querySelector('[class*="AuroraAuthScreen_root__"]'),
        sheet: !!document.querySelector('[class*="BottomSheet_sheet__"]'),
        sleeveY: !tr || tr === 'none' ? 0 : Math.round(new DOMMatrixReadOnly(tr).m42),
        ctaDisabled: btn ? btn.disabled : null,
      };
    }, cta);
  const assertIdle = async (label) => {
    const s = await authState();
    check(label, s.authScreen && !s.sheet && s.sleeveY === 0 && s.ctaDisabled === false,
      JSON.stringify(s));
  };

  // The API panel seeds demo entries — compare against the baseline count.
  const oauthCallCount = () => page.getByText('Verify OAuth token').count();
  const baselineCalls = await oauthCallCount();

  await assertIdle('idle before tap');

  // Tap → popup "opens" (stub). Phone must stay exactly as it is.
  await page.getByText(cta, { exact: true }).first().click();
  await page.waitForTimeout(400);
  check('popup opened once', (await stubCalls()) === 1, `${await stubCalls()} calls`);
  await assertIdle('phone untouched while popup pending');

  // Double-tap while pending — swallowed before a second window can open.
  await page.getByText(cta, { exact: true }).first().click();
  await page.waitForTimeout(300);
  check('double-tap swallowed', (await stubCalls()) === 1, `${await stubCalls()} calls`);

  // Cancel (user closes the popup) → nothing happens, still re-tappable.
  await page.evaluate(() => window.__popupStubCalls[0].reject(new Error('cancelled')));
  await page.waitForTimeout(500);
  await assertIdle('idle again after cancel');
  check('no sign-in calls after cancel', (await oauthCallCount()) === baselineCalls);

  // Tap again → a fresh popup; resolve it → staged calls + wallet intro.
  await page.getByText(cta, { exact: true }).first().click();
  await page.waitForTimeout(400);
  check('re-tap opens a new popup', (await stubCalls()) === 2, `${await stubCalls()} calls`);
  await page.evaluate(() => window.__popupStubCalls[1].resolve('fake-oidc-token'));
  // Post-resolve beat is 400ms, then the calls push and the intro starts.
  await page.waitForTimeout(900);
  check('sign-in calls pushed', (await oauthCallCount()) > baselineCalls);
  const introY = (await authState()).sleeveY;
  check('wallet intro playing (sleeve moving)', introY > 2, `sleeveY=${introY}`);
  await page.locator('[class*="AuroraWalletScreen_"]').first()
    .waitFor({ state: 'visible', timeout: 15000 });
  check('sign-in completed (wallet visible)', true);

  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join(', ')}` : '\nALL PASS');
  process.exit(fails.length ? 1 : 0);
}

await page.getByText(M.checkbox, { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText(M.cta, { exact: true }).first().click();
await page.waitForTimeout(1000);

// ── Step 1: entry — prefill + (phone) live formatting ──
const input = page.locator('[class*="AuthSheet_input__"]');
check('entry prefill', (await input.inputValue()) === M.prefill, await input.inputValue());
if (M.typed) {
  await input.fill('');
  await input.pressSequentially(M.typed.digits, { delay: 25 });
  check('live formatting', (await input.inputValue()) === M.typed.formatted, await input.inputValue());
}

// Per-frame height sampler — clicks the labelled button, then rAF-samples the
// sheet height for `windowMs`. Returns {samples, maxJump, range}.
const sampleTransition = (buttonLabel, windowMs) =>
  page.evaluate(async ({ label, windowMs }) => {
    const sheet = document.querySelector('[class*="BottomSheet_sheet__"]');
    const btn = [...document.querySelectorAll('button')].find(
      (b) => b.getAttribute('aria-label') === label || b.textContent.trim() === label,
    );
    const out = [];
    const t0 = performance.now();
    btn.click();
    await new Promise((resolve) => {
      const tick = () => {
        out.push({
          t: Math.round(performance.now() - t0),
          h: Math.round(sheet.getBoundingClientRect().height * 10) / 10,
        });
        if (performance.now() - t0 < windowMs) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    let maxJump = 0;
    let movingFrames = 0;
    for (let i = 1; i < out.length; i++) {
      const d = Math.abs(out[i].h - out[i - 1].h);
      maxJump = Math.max(maxJump, d);
      if (d > 0.5) movingFrames += 1;
    }
    const hs = out.map((s) => s.h);
    return {
      samples: out,
      maxJump,
      movingFrames,
      range: Math.max(...hs) - Math.min(...hs),
    };
  }, { label: buttonLabel, windowMs });

// Eased = the height actually changed, spread across several frames (a snap
// would cover the whole range in 1-2 frames).
const eased = (r) => r.range > 5 && r.movingFrames >= 4 && r.maxJump < r.range * 0.7;

// ── Step 1 → 2 forward (the 600ms sending beat runs first, so the tween
// lands late in the window — 1600ms covers beat + 350ms ease + settle). ──
const fwd = await sampleTransition('Continue', 1600);
console.log(
  `forward: range ${fwd.range}px, max frame jump ${fwd.maxJump}px, ${fwd.movingFrames} moving frames`,
);
check('forward height eases', eased(fwd), `${fwd.samples.length} samples`);
await page.waitForTimeout(600);

// ── Code step copy (masked destination) ──
const sub = page.locator('[class*="AuthSheet_sub__"]');
const subText = await sub.innerText();
if (M.typed) {
  check('masked number in code copy', subText.includes(M.typed.masked), subText.trim());
}

// ── Notification (lands 1s after the code step) ──
await page.waitForTimeout(1400);
const capsule = page.locator('[class*="GlassNotification_capsule__"]');
check('notification shown', await capsule.isVisible());
check('notification icon', await capsule.locator(`img[src*="${M.notif.icon}"]`).count() === 1);
const badgeCount = await capsule.locator(`[class*="GlassNotification_badge__"] img`).count();
check('notification badge', M.notif.badge ? badgeCount === 1 : badgeCount === 0,
  M.notif.badge ?? 'none expected');
const title = await capsule.locator('[class*="GlassNotification_title__"]').innerText();
check('notification title', title === M.notif.title, title);
const bodyEl = capsule.locator('[class*="GlassNotification_body__"]');
check('notification body', (await bodyEl.innerText()).includes(M.notif.bodyPart));
const bodyMetrics = await bodyEl.evaluate((el) => ({
  clamp: getComputedStyle(el).webkitLineClamp,
  height: el.getBoundingClientRect().height,
  scrollH: el.scrollHeight,
  timePad: getComputedStyle(el.closest('[class*="inner"]').querySelector('[class*="time"]'))
    .paddingRight,
}));
// Chromium's standardized line-clamp sizes the box to the clamp point (a few
// px shy of N × 18px line boxes); WebKit's -webkit-box reports the full N
// lines. Accept the band, and for clamped bodies require real truncation.
const expectedH = M.notif.lines * 18;
check(
  `body renders ${M.notif.lines} line(s)`,
  bodyMetrics.height > expectedH - 8 &&
    bodyMetrics.height < expectedH + 4 &&
    (M.notif.lines === 1 ||
      (bodyMetrics.clamp === String(M.notif.lines) && bodyMetrics.scrollH > bodyMetrics.height)),
  `h=${bodyMetrics.height} clamp=${bodyMetrics.clamp} scrollH=${bodyMetrics.scrollH}`,
);
check('time 3px right pad', bodyMetrics.timePad === '3px', bodyMetrics.timePad);
await page.screenshot({ path: `/tmp/auth-${method}-${engineName}-notif.png` });

// ── X-back (code → entry) height choreography, then forward again ──
const back = await sampleTransition('Back', 900);
console.log(
  `back: range ${back.range}px, max frame jump ${back.maxJump}px, ${back.movingFrames} moving frames`,
);
check('back height eases', eased(back), `${back.samples.length} samples`);
await page.waitForTimeout(400);
check('back lands on entry step', await input.isVisible());
await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
await page.waitForTimeout(2000);

// ── Final autofill → staged submit (spinner → checkmark → dismiss → intro) ──
// Timeline from the trigger: digits land 0–125ms (25ms cadence), the staged
// submit starts at ~475ms, verifying spinner 475–975ms, checkmark 975–1475ms,
// onSubmitCode at ~1475ms, BottomSheet exit ~350ms, wallet flip 400ms later.
await capsule.waitFor({ state: 'visible', timeout: 4000 });
if (M.finalTrigger === 'cells') {
  await page.locator('[class*="AuthSheet_codeContainer__"]').click();
} else {
  await capsule.click();
}
await page.waitForTimeout(250);
check('autofill filled 123456',
  (await page.locator('[class*="AuthSheet_codeCell__"]').allInnerTexts()).join('') === '123456');
// Mid-verifying beat (~700ms after trigger) — the notification's 0.25s exit
// tuck has also finished by now.
await page.waitForTimeout(450);
check('trigger dismissed notification', !(await capsule.isVisible()));
check('CTA verifying spinner', await page.locator('[aria-label="Verifying"]').isVisible());
// Mid-checkmark beat (~1200ms) — glyph swapped, sheet still up.
await page.waitForTimeout(500);
check('CTA checkmark', await page.locator('[aria-label="Verified"]').isVisible());
check('sheet still up at checkmark',
  await page.locator('[class*="BottomSheet_sheet__"]').isVisible());
// The dismiss must visibly COMPLETE before the intro: per-frame poll for the
// sheet's unmount (AnimatePresence removes it when the exit ends) vs the
// auth sleeve's first intro movement.
const order = await page.evaluate(async () => {
  const t0 = performance.now();
  let tSheetGone = null;
  let tIntroStart = null;
  await new Promise((resolve) => {
    const tick = () => {
      const now = performance.now() - t0;
      if (tSheetGone === null && !document.querySelector('[class*="BottomSheet_sheet__"]')) {
        tSheetGone = now;
      }
      const sleeve = document.querySelector('[class*="AuroraAuthScreen_sleeve__"]');
      if (tIntroStart === null && sleeve) {
        const tr = getComputedStyle(sleeve).transform;
        if (tr && tr !== 'none' && new DOMMatrixReadOnly(tr).m42 > 2) tIntroStart = now;
      }
      if ((tSheetGone !== null && tIntroStart !== null) || now > 5000) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return { tSheetGone, tIntroStart };
});
console.log(
  `dismiss complete at ${Math.round(order.tSheetGone ?? -1)}ms, intro starts at ${Math.round(order.tIntroStart ?? -1)}ms`,
);
check(
  'sheet fully dismissed before intro',
  order.tSheetGone !== null && order.tIntroStart !== null && order.tSheetGone <= order.tIntroStart,
);
await page.locator('[class*="AuroraWalletScreen_"]').first()
  .waitFor({ state: 'visible', timeout: 15000 });
check('sign-in completed (wallet visible)', true);
await page.waitForTimeout(1500);
await page.screenshot({ path: `/tmp/auth-${method}-${engineName}-wallet.png` });

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILURES: ${fails.join(', ')}` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);
