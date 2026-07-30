// Probe which style on the tint overlay causes WebKit's corner mismatch.
// Usage: node scripts/webkit-notif-probe.mjs <none|noBackdrop|noClip|radius>
import { webkit } from 'playwright';

const variant = process.argv[2] ?? 'none';

const browser = await webkit.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 3,
});
await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByText('Email', { exact: true }).first().click();
await page.waitForTimeout(800);
await page.getByText('Continue with email', { exact: true }).first().click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: 'Continue', exact: true }).first().click();
await page.waitForTimeout(3200);

const result = await page.evaluate((variant) => {
  // The tint overlay: the absolutely-positioned div with a backdrop-filter
  // inside the notification button.
  const btn = [...document.querySelectorAll('button')].find((b) =>
    /one-time code/i.test(b.textContent ?? ''),
  );
  if (!btn) return 'no button';
  const tint = [...btn.querySelectorAll('div')].find(
    (d) => d.style.backdropFilter || d.style.webkitBackdropFilter,
  );
  if (!tint) return 'no tint el';
  // hide the shadow for a clean read
  for (const el of btn.querySelectorAll('[class*="shadowBlob"]')) el.style.display = 'none';
  if (variant === 'noBackdrop') {
    tint.style.backdropFilter = 'none';
    tint.style.webkitBackdropFilter = 'none';
  } else if (variant === 'noClip') {
    tint.style.clipPath = 'none';
    tint.style.webkitClipPath = 'none';
  } else if (variant === 'radius') {
    tint.style.borderRadius = '28.8px';
  } else if (variant === 'hideTint') {
    tint.style.display = 'none';
  } else if (variant === 'hideLens') {
    const lens = [...btn.querySelectorAll('div')].find((d) =>
      (d.style.filter ?? '').startsWith('url('),
    );
    if (lens) lens.style.display = 'none';
  } else if (variant === 'hideBrightness') {
    const bright = [...btn.querySelectorAll('div')].find(
      (d) => d.style.mixBlendMode === 'soft-light',
    );
    if (bright) bright.style.display = 'none';
    else return 'no brightness el';
  } else if (variant === 'flatBackdrop') {
    // Replace the filter's source content with a plain sharp gradient: if the
    // lens then renders, the screen-copy subtree is what WebKit refuses.
    const lens = [...btn.querySelectorAll('div')].find((d) =>
      (d.style.filter ?? '').startsWith('url('),
    );
    if (!lens) return 'no lens el';
    lens.innerHTML =
      '<div style="position:absolute;inset:-48px;background:repeating-linear-gradient(45deg,#ff8800 0 14px,#0066ff 14px 28px)"></div>';
  } else if (variant === 'underRed') {
    // If the dark rim is ALPHA HOLES in the displaced output, a red layer
    // under the glass will tint the ring red.
    btn.style.background = 'red';
  } else if (variant === 'paint') {
    // Solid debug fills: tint RED, output-clip wrapper LIME — whichever shape
    // each one's clip actually renders is then unambiguous.
    tint.style.background = 'rgba(255,0,0,0.85)';
    tint.style.backdropFilter = 'none';
    tint.style.webkitBackdropFilter = 'none';
    const out = [...btn.querySelectorAll('div')].find(
      (d) => d.style.isolation === 'isolate',
    );
    if (out) out.style.background = 'rgba(0,255,0,0.85)';
    else return 'no outputClip el';
  }
  return {
    clipPath: tint.style.clipPath ? 'path(...)' : tint.style.clipPath,
    backdrop: tint.style.webkitBackdropFilter || tint.style.backdropFilter,
    borderRadius: tint.style.borderRadius,
    computedClip: getComputedStyle(tint).clipPath.slice(0, 24),
  };
}, variant);
console.log(JSON.stringify(result));

await page.waitForTimeout(400);
const notif = page.getByRole('button', { name: /one-time code/i }).first();
const box = await notif.boundingBox();
await page.screenshot({
  path: `/tmp/probe-${variant}-br.png`,
  clip: { x: box.x + box.width - 68, y: box.y + box.height - 48, width: 80, height: 60 },
});
console.log('wrote', `/tmp/probe-${variant}-br.png`);
await browser.close();
