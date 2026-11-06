#!/usr/bin/env node
/*
 * Fetches each bank's App Store icon (400x400) for the bank marks, from the
 * banks in src/data/bankCountries.ts: every country's default bank and its
 * popular ones. Writes public/assets/agents/banks/<slug>.png, the list of
 * slugs it found (src/data/bankLogos.generated.ts), and a labeled contact
 * sheet (/tmp/bank-logos-sheet.png) to check matches by eye. A wrong match
 * gets a better search term in TERMS, or a SKIP, and a rerun.
 *
 *   node scripts/fetch-bank-logos.mjs              banks without an icon yet
 *   node scripts/fetch-bank-logos.mjs --only a,b   just these (refetched)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'public/assets/agents/banks');
const LIST = path.join(root, 'src/data/bankLogos.generated.ts');

/** What to search the App Store for, when the bank's name alone finds the wrong app. */
const TERMS = {
  'Banco de Colombia (Bancolombia)': 'Bancolombia',
  'BANQUE MISR': 'Banque Misr',
  'Gcb Bank Ltd': 'GCB Bank',
  'Bank Leumi Le-Israel B.M': 'Leumi',
  'Habib Bank Limited': 'HBL Mobile',
  'Slovenska sporitelna': 'George Slovensko',
  'Ziraat Bankasi': 'Ziraat Mobil',
  'Zagrebacka banka': 'Zaba',
  'Komercni banka': 'KB Klic',
  'Nu México': 'Nu México',
  Chase: 'Chase Mobile',
  'Bank of America': 'Bank of America Mobile Banking',
  'Wells Fargo': 'Wells Fargo Mobile',
  Citibank: 'Citi Mobile',
  Citibanamex: 'Banamex',
  Vietcombank: 'VCB Digibank',
};
/** Banks with no good icon to use: they fall back to the bank glyph. */
const SKIP = new Set([]);

export const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function banks() {
  const src = readFileSync(path.join(root, 'src/data/bankCountries.ts'), 'utf8');
  const body = src.slice(src.indexOf('BANK_COUNTRIES'), src.indexOf('];', src.indexOf('BANK_COUNTRIES')));
  const seen = new Map();
  for (const chunk of body.split(/\{\s*code:/).slice(1)) {
    const code = chunk.match(/^\s*'(\w+)'/)[1];
    const names = [chunk.match(/bankName: '([^']+)'/)[1]];
    const list = chunk.match(/banks: \[([^\]]+)\]/);
    if (list) names.push(...list[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1)));
    for (const n of names) if (!seen.has(slug(n))) seen.set(slug(n), { name: n, code });
  }
  return [...seen].map(([s, b]) => ({ slug: s, ...b }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const words = (s) => s.toLowerCase().split(/[^a-z0-9\u00c0-\u024f]+/).filter((w) => w.length > 2 && !['bank', 'banka', 'banco', 'the', 'ltd', 'limited'].includes(w));

async function search(term, country) {
  const url = `https://itunes.apple.com/search?${new URLSearchParams({ term, country, entity: 'software', limit: '10' })}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.status === 403 || res.status === 429) {
      await sleep(15_000);
      continue;
    }
    if (!res.ok) return [];
    return (await res.json()).results ?? [];
  }
  return [];
}

/** The likeliest app: a Finance app whose name or seller shares a word with the bank's. */
function pick(results, name, term) {
  const want = new Set([...words(name), ...words(term)]);
  const score = (r) => {
    const text = `${r.trackName} ${r.sellerName}`.toLowerCase();
    const hits = [...want].filter((w) => text.includes(w)).length;
    return hits * 10 + (r.primaryGenreName === 'Finance' ? 5 : 0);
  };
  const best = results.map((r) => ({ r, s: score(r) })).sort((a, b) => b.s - a.s)[0];
  return best && best.s >= 10 ? best.r : null;
}

const only = process.argv.includes('--only') ? new Set(process.argv[process.argv.indexOf('--only') + 1].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const all = banks();
const report = [];
for (const b of all) {
  if (only ? !only.has(b.slug) : existsSync(path.join(OUT, `${b.slug}.png`))) continue;
  if (SKIP.has(b.name)) {
    report.push(`skip  ${b.slug}`);
    continue;
  }
  const term = TERMS[b.name] ?? b.name;
  let app = pick(await search(term, b.code), b.name, term);
  if (!app) {
    await sleep(3200);
    app = pick(await search(term, 'us'), b.name, term);
  }
  if (!app) {
    report.push(`miss  ${b.slug}  (${b.name}, ${b.code})`);
  } else {
    const art = (app.artworkUrl512 ?? app.artworkUrl100).replace(/\/\d+x\d+bb\.(jpg|png|webp)$/, '/400x400bb.png');
    const res = await fetch(art);
    writeFileSync(path.join(OUT, `${b.slug}.png`), Buffer.from(await res.arrayBuffer()));
    report.push(`ok    ${b.slug}  ← ${app.trackName} (${app.sellerName})`);
  }
  console.log(report.at(-1));
  await sleep(3200);
}

const found = all.filter((b) => existsSync(path.join(OUT, `${b.slug}.png`))).map((b) => b.slug);
writeFileSync(
  LIST,
  `// Generated by scripts/fetch-bank-logos.mjs. Banks with an App Store icon in public/assets/agents/banks.\nexport const BANK_LOGOS = new Set<string>(${JSON.stringify(found, null, 2)});\n`,
);
execFileSync('magick', [
  'montage',
  '-font',
  '/System/Library/Fonts/Supplemental/Arial.ttf',
  '-pointsize',
  '11',
  ...found.flatMap((s) => ['-label', s, path.join(OUT, `${s}.png`)]),
  '-geometry',
  '120x120+12+12',
  '-tile',
  '9x',
  '/tmp/bank-logos-sheet.png',
]);
console.log(`\n${found.length}/${all.length} logos. Sheet: /tmp/bank-logos-sheet.png`);
