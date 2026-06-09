#!/usr/bin/env node
/**
 * Export SF Symbol SVGs from installed Apple SF Pro fonts (macOS).
 *
 * Note: only ~5,572 / 8,302 symbols have PUA codepoints in SF-Pro.woff2.
 * faceid and xmark are NOT unicode-mapped — use SVG paths for those.
 *
 * Prereqs: SF Pro in /Library/Fonts (Apple developer download) + Node.
 * Usage:   node scripts/export-sf-symbols.mjs [symbol...]
 *          node scripts/export-sf-symbols.mjs xmark faceid
 *
 * Writes:
 *   public/refs/symbols/{name}.svg
 *   src/apps/shared/icons/sfSymbolPaths.ts  (when --sync-paths is passed)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const symbols = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const syncPaths = process.argv.includes('--sync-paths');
const names = symbols.length ? symbols : ['xmark', 'faceid'];

/** Per-symbol SF Symbol weight for sf-symbols-svg export (Figma specs). */
const WEIGHT_BY_SYMBOL = {
  xmark: 'semibold',
  faceid: 'bold',
  'arrow.up': 'semibold',
  'arrow.up.arrow.down': 'semibold',
  'play.fill': 'semibold',
};

const outDir = path.join(root, 'public/refs/symbols');
const tmpDir = fs.mkdtempSync(path.join(root, '.tmp-sf-symbols-'));
const iconsFile = path.join(tmpDir, 'icons.txt');
const exportDir = path.join(tmpDir, 'out');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(iconsFile, `${names.join('\n')}\n`);

const weightFlags = [...new Set(names.map((n) => WEIGHT_BY_SYMBOL[n] ?? 'regular'))]
  .flatMap((w) => ['--weight', w])
  .join(' ');

execSync(
  `npx --yes sf-symbols-svg --icons-list "${iconsFile}" --output "${exportDir}" --fonts-dir /Library/Fonts ${weightFlags}`,
  { stdio: 'inherit', cwd: root },
);

for (const name of names) {
  const weight = WEIGHT_BY_SYMBOL[name] ?? 'regular';
  const src =
    weight === 'regular'
      ? path.join(exportDir, `${name}.svg`)
      : path.join(exportDir, `${name}-${weight}.svg`);
  const dest = path.join(outDir, `${name}.svg`);
  if (!fs.existsSync(src)) {
    console.error(`Missing export for "${name}" — is SF Pro installed in /Library/Fonts?`);
    process.exit(1);
  }
  fs.copyFileSync(src, dest);
  console.log('wrote', path.relative(root, dest));
}

if (syncPaths) {
  const entries = names.map((name) => {
    const weight = WEIGHT_BY_SYMBOL[name] ?? 'regular';
    const svgName = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
    const svg = fs.readFileSync(path.join(exportDir, svgName), 'utf8');
    const pathMatch = svg.match(/<path([^>]*)\/>/);
    if (!pathMatch) throw new Error(`Could not parse path for ${name}`);
    const attrs = pathMatch[1];
    const d = attrs.match(/d="([^"]+)"/)?.[1];
    const transform = attrs.match(/transform="([^"]+)"/)?.[1];
    if (!d) throw new Error(`Missing d for ${name}`);
    return { name, d, transform };
  });

  const union = entries.map((e) => `'${e.name}'`).join(' | ');
  const body = entries
    .map(({ name, d, transform }) => {
      const transformLine = transform
        ? `\n    transform:\n      '${transform}',`
        : '';
      const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) ? name : `'${name}'`;
      return `  ${key}: {${transformLine}\n    d: '${d}',\n  },`;
    })
    .join('\n');

  const ts = `/** SF Symbol outlines — generated from system fonts via scripts/export-sf-symbols.mjs */

export type SfSymbolName = ${union};

export interface SfSymbolPath {
  d: string;
  transform?: string;
}

export const SF_SYMBOL_PATHS: Record<SfSymbolName, SfSymbolPath> = {
${body}
};
`;

  const tsPath = path.join(root, 'src/apps/shared/icons/sfSymbolPaths.ts');
  fs.writeFileSync(tsPath, ts);
  console.log('wrote', path.relative(root, tsPath));
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log('Done.');
