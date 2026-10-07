// How big each brand's art is as SVG, and how many elements it has: the
// Figma build sends each card's layers as code, capped at 50 KB a call.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(process.env.REEL_URL ?? 'http://localhost:4010/#/sheet?only=none');
const sizes = await page.evaluate(async () => {
  const art = await import('/src/brands/art.ts');
  return Object.entries(art)
    .filter(([, f]) => typeof f === 'function')
    .map(([name, f]) => {
      const svg = f();
      return { name, kb: Math.round(svg.length / 102.4) / 10, els: (svg.match(/<(path|rect|circle|ellipse|line)\b/g) ?? []).length, filters: (svg.match(/filter="/g) ?? []).length };
    });
});
console.table(sizes);
await browser.close();
