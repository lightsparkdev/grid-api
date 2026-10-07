// Render a take without keeping a browser tab in view (a hidden tab stops
// animation frames, and the render waits on them):
//   npm run render -- [take] [--size 1080] [--test]
// Needs the dev server running (npm run dev). Frames land in out/<take>/.
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const take = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--size') ?? `take-${Date.now()}`;
const size = flag('--size');
const test = args.includes('--test');
const url = process.env.REEL_URL ?? 'http://localhost:4010/#/render';

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.on('pageerror', (e) => console.error('[page]', e.message));
await page.goto(url);
await page.waitForFunction(() => window.__reel, null, { timeout: 120000 });
const gpu = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2');
  const ext = gl?.getExtension('WEBGL_debug_renderer_info');
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
});
console.log(`GPU: ${gpu}`);

const t0 = Date.now();
const progress = setInterval(async () => {
  const s = await page.evaluate(() => document.body.innerText.match(/(Warming|Rendering)[^\n]*/)?.[0]).catch(() => null);
  if (s) process.stdout.write(`\r${s}        `);
}, 1000);
try {
  await page.evaluate(
    async ({ take, size, test }) => {
      const r = window.__reel;
      const overrides = size ? { size: Number(size) } : {};
      if (test) return r.render(take, r.testFrom, r.testFrom + r.reel.config.fps);
      return r.renderWith(take, overrides);
    },
    { take, size, test },
  );
} finally {
  clearInterval(progress);
}
console.log(`\nRendered ${take} in ${((Date.now() - t0) / 1000).toFixed(1)} s. Next: npm run encode -- ${take}`);
await browser.close();
