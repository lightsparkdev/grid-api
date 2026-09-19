#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const statementsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cardsRoot = resolve(statementsRoot, '../grid-cards-demo');
const walletRoot = resolve(statementsRoot, '../grid-wallet-demo');

const copiedPaths = [
  'next.config.mjs',
  'public/fonts',
  'src/app/fonts',
  'src/app/globals.scss',
  'src/app/layout.tsx',
  'src/app/page.module.scss',
  'src/apps/shared/typography',
  'src/components/ApiPanel',
  'src/components/ColumnResizeHandle',
  'src/components/liquid-glass/squircle.ts',
  'src/components/GridWordmark.tsx',
  'src/components/PanelHeader',
  'src/components/PlaygroundIntro',
  'src/components/SectionDivider',
  'src/components/ThemeSync.tsx',
  'src/components/Tooltip',
  'src/data/actions.ts',
  'src/data/flow.ts',
  'src/data/flowIcons.tsx',
  'src/hooks/useColumnResize.ts',
  'src/hooks/useNowTick.ts',
  'src/hooks/useTheme.ts',
  'src/hooks/useThemeMode.ts',
  'src/lib/apiCodeFormat.tsx',
  'src/lib/easing.ts',
  'src/lib/formatRelativeTime.ts',
  'src/lib/groupApiEntries.ts',
  'src/lib/layout.ts',
  'src/styles/breakpoints.scss',
];

const exceptions = new Map([
  [
    'src/app/page.module.scss',
    (source) =>
      `${source}
@media print {
  .layout,
  .stackCol,
  .appCol {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .configCol,
  .apiCol,
  .exploreBtn,
  .backPill,
  .exploreFade {
    display: none !important;
  }
}
`,
  ],
  [
    'src/components/PlaygroundIntro/PlaygroundIntro.tsx',
    (source) =>
      source
        .replace('>Cards</', '>Statements</')
        .replace(
          'Issue a Visa debit card and watch the exact API calls fire as you go',
          'Build a periodic statement and watch the exact API calls fire as you go',
        ),
  ],
  [
    'src/components/ApiPanel/ApiPanel.tsx',
    (source) =>
      source.replace(
        'title="API calls"',
        'title="Calls the app makes to render this screen."',
      ),
  ],
  [
    'src/components/ApiPanel/ApiPanelEmpty.tsx',
    (source) =>
      source
        .replace(
          'const [coverVisible, setCoverVisible] = useState(reduceMotion === true);\n  const [contentVisible, setContentVisible] = useState(reduceMotion === true);',
          'const [coverVisible, setCoverVisible] = useState(false);\n  const [contentVisible, setContentVisible] = useState(false);',
        )
        .replace(
          'if (reduceMotion) return;',
          'if (reduceMotion) {\n      setCoverVisible(true);\n      setContentVisible(true);\n      return;\n    }',
        )
        .replace(
          'initial={reduceMotion ? false : hiddenMessage}',
          'initial={hiddenMessage}',
        )
        .replace(
          '<p className={styles.title}>No API calls yet</p>\n            <p className={styles.description}>\n              Run a flow in the app and each request will appear here.\n            </p>',
          '<p className={styles.title}>Calls appear after the statement loads.</p>',
        ),
  ],
  [
    'src/app/layout.tsx',
    (source) =>
      source
        .replace("const TITLE = 'Lightspark Cards — Playground';", "const TITLE = 'Grid Statements - Playground';")
        .replace(
          "'Issue a branded Visa debit card and watch the API calls fire as you go.';",
          "'Build a periodic statement and inspect the Grid API data behind it.';",
        )
        .replace('https://grid-cards-demo.vercel.app', 'https://grid-statements-demo.vercel.app')
        .replace("    images: [{ url: '/og-cards-playground.webp', width: 2400, height: 1260 }],\n", '')
        .replace("    images: ['/og-cards-playground.webp'],\n", ''),
  ],
]);

async function filesAt(root, path) {
  const absolute = resolve(root, path);
  const entries = await readdir(absolute, { withFileTypes: true }).catch(() => null);
  if (!entries) return [path];
  const nested = await Promise.all(
    entries.map((entry) => filesAt(root, `${path}/${entry.name}`)),
  );
  return nested.flat();
}

const files = (await Promise.all(copiedPaths.map((path) => filesAt(cardsRoot, path)))).flat().sort();
const walletFiles = await filesAt(walletRoot, 'src/apps/shared/AppShell');
const adaptedWalletFiles = new Set([
  'src/apps/shared/AppShell/AppShell.tsx',
  'src/apps/shared/AppShell/usePhoneFitScale.ts',
]);
const failures = [];

for (const path of files) {
  const cards = await readFile(resolve(cardsRoot, path));
  const statements = await readFile(resolve(statementsRoot, path));
  const transform = exceptions.get(path);
  const expected = transform ? Buffer.from(transform(cards.toString('utf8'))) : cards;
  if (!expected.equals(statements)) failures.push(path);
  console.log(`${transform ? 'EXCEPTION' : 'IDENTICAL'}\t${relative(cardsRoot, resolve(cardsRoot, path))}`);
}

for (const path of walletFiles) {
  const wallet = await readFile(resolve(walletRoot, path));
  const statements = await readFile(resolve(statementsRoot, path));
  if (adaptedWalletFiles.has(path)) {
    console.log(`WALLET_ADAPTED\t${path}`);
    continue;
  }
  if (!wallet.equals(statements)) failures.push(path);
  console.log(`WALLET_IDENTICAL\t${path}`);
}

const adaptedShell = await readFile(
  resolve(statementsRoot, 'src/apps/shared/AppShell/AppShell.tsx'),
  'utf8',
);
const adaptedScale = await readFile(
  resolve(statementsRoot, 'src/apps/shared/AppShell/usePhoneFitScale.ts'),
  'utf8',
);
for (const exact of [
  'outerWidth: 922',
  'outerHeight: 658',
  'screenWidth: 890',
  'screenHeight: 626',
  'screenRadius: 54',
]) {
  if (!adaptedScale.includes(exact)) failures.push(`missing ${exact}`);
}
if (!adaptedShell.includes("device === 'phone' ? (")) {
  failures.push('Duo must not render the phone status bar');
}

const copiedShareHashes = new Map([
  ['src/components/ShareSheet/StageShareButton.tsx', '664c9b04f808d2b5fd59ce2da6fdbf98d31b272cdd7a1a0729c8e99aa33a51ff'],
]);
for (const [path, expected] of copiedShareHashes) {
  const bytes = await readFile(resolve(statementsRoot, path));
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) failures.push(path);
  console.log(`CARDS_39BADDFD_IDENTICAL\t${path}`);
}

const adaptedShare = await readFile(
  resolve(statementsRoot, 'src/components/ShareSheet/StageShareButton.module.scss'),
  'utf8',
);
for (const exact of ['height: 44px', 'position: fixed', 'bottom: 84px']) {
  if (!adaptedShare.includes(exact)) failures.push(`missing share control ${exact}`);
}
console.log('CARDS_39BADDFD_ADAPTED\tsrc/components/ShareSheet/StageShareButton.module.scss');

if (failures.length > 0) {
  throw new Error(`Chrome parity failed for: ${failures.join(', ')}`);
}
