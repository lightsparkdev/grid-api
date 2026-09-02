#!/usr/bin/env node
// Vendors the circular country flags used by the bank picker into
// public/assets/flags/<cc>.svg, so the demo is self-contained (no runtime CDN).
// Source: HatScripts/circle-flags (https://github.com/HatScripts/circle-flags).
// Codes are read from bankCountries.ts so this never drifts from the list.
//   npm run fetch:flags

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(scriptDir, '../src/data/bankCountries.ts'), 'utf8');
const codes = [...new Set([...src.matchAll(/code:\s*'([a-z]{2})'/g)].map((m) => m[1]))];

const outDir = resolve(scriptDir, '../public/assets/flags');
mkdirSync(outDir, { recursive: true });

const BASE = 'https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags';
let ok = 0;
const failed = [];
for (const cc of codes) {
  try {
    const res = await fetch(`${BASE}/${cc}.svg`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svg = await res.text();
    if (!svg.includes('<svg')) throw new Error('not an SVG');
    writeFileSync(join(outDir, `${cc}.svg`), svg);
    ok += 1;
  } catch (e) {
    failed.push(`${cc}: ${e.message}`);
  }
}

console.log(`Downloaded ${ok}/${codes.length} circle-flags -> ${outDir}`);
if (failed.length) {
  console.error('Failed:', failed);
  process.exit(1);
}
