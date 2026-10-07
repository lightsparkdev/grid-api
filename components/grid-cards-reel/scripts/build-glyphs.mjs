// glyphs.raw.json (geometry from the Figma icon strip, node 2921:13229, in
// each 400 px tile's space) -> glyphs.json: each glyph's parts and its tight
// box, clipped to the tile, measured in Chromium. Run after re-exporting.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '../src/brands');
const raw = JSON.parse(fs.readFileSync(path.join(dir, 'glyphs.raw.json'), 'utf8'));

const parts = (svg) => svg.match(/<g transform="[^"]*">[\s\S]*?<\/g>/g) ?? [];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<svg id="s" xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"></svg>');
const out = {};
for (const [id, svg] of Object.entries(raw)) {
  const list = parts(svg);
  const box = await page.evaluate((inner) => {
    const s = document.getElementById('s');
    s.innerHTML = `<g id="g">${inner}</g>`;
    const b = document.getElementById('g').getBBox();
    const x0 = Math.max(0, b.x);
    const y0 = Math.max(0, b.y);
    const x1 = Math.min(400, b.x + b.width);
    const y1 = Math.min(400, b.y + b.height);
    return [x0, y0, x1 - x0, y1 - y0].map((n) => Math.round(n * 10) / 10);
  }, list.join(''));
  out[id] = { parts: list, box };
}
await browser.close();
fs.writeFileSync(path.join(dir, 'glyphs.json'), JSON.stringify(out, null, 1));
console.log(`wrote ${Object.keys(out).length} glyphs`);
