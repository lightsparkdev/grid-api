#!/usr/bin/env node

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
          '<p className={styles.title}>Calls appear when the period closes.</p>',
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
  if (!wallet.equals(statements)) failures.push(path);
  console.log(`WALLET_IDENTICAL\t${path}`);
}

if (failures.length > 0) {
  throw new Error(`Chrome parity failed for: ${failures.join(', ')}`);
}
