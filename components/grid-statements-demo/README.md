# Grid Statements Playground

This demo builds consumer and commercial periodic statements. Grid supplies the customer,
account, and transaction data. The platform generates and stores each statement.

The playgrounds live in the repository's `components` directory. Cards forked Global Accounts
by copying its shared chrome. Statements re-forks the Cards modules to keep the same contract.

## Develop

```bash
npm install --ignore-scripts
npm run dev
```

The development server uses `http://localhost:4003`. Cards uses port 4002. Global Accounts uses
port 4000. These fixed ports let the docs embed each local app while you run `make mint`.

Use these URLs to test the embed theme:

```text
http://localhost:4003/?embed=true&theme=light
http://localhost:4003/?embed=true&theme=dark
```

## Keep the shared chrome equal

Run the parity check after you copy a Cards chrome change:

```bash
npm run check:chrome
```

The script compares every copied file by bytes. It permits only these product exceptions:

- `next.config.mjs` drops the Cards share-domain redirect. Statements has no share domain.
- `src/components/PlaygroundIntro/PlaygroundIntro.tsx` uses Statements product copy.
- `src/app/layout.tsx` uses Statements metadata and the Statements production URL, and drops the
  card-face asset preloads. The pre-paint embed, theme, layout, and navigation script stays equal.
- `src/app/page.module.scss` adds print-only rules that remove the playground chrome.
- `src/apps/shared/AppShell/AppShell.tsx` and `usePhoneFitScale.ts` accept a device preset.
  The status bar styles, status icons, status clock, and squircle path stay equal to Cards.
  The parity check protects the required device preset code from a direct copy.

Port shared fixes with `cp` from `components/grid-cards-demo` to the same path under
`components/grid-statements-demo`. Do not rewrite or approximate shared chrome.

## Deploy

Deploy to Vercel as the `grid-statements-demo` project. `vercel.json` sets an `ignoreCommand` so a
commit only triggers a build if it touches this directory. The docs page iframes the production
URL (`https://grid-statements-demo.vercel.app`). Mintlify preview branches iframe
`https://grid-statements-demo-git-<branch>-lightspark-team.vercel.app`. If a URL differs, update
`mintlify/snippets/cards/statements-demo-embed.mdx`. The docs page is
`mintlify/cards/statements.mdx` at `/cards/statements`.

Vercel limits a host label to 63 characters, so branch names for this project must be 22
characters or fewer (`grid-statements-demo-git-` and `-lightspark-team` use 41).

## Embed contract

- `?embed=true` sets `data-embed`.
- `?theme=light|dark` sets the initial theme.
- `?nav=<px>` supplies the docs sidebar width.
- The parent and iframe exchange `theme-sync`, `theme-request`, `nav-sync`, and `nav-request`.

## Data contract

`src/statement/types.ts` defines the statement model. `src/statement/fixtures.ts` derives rendered
rows and balances. `src/statement/api.ts` derives the API request and response samples from the
same activities.

The consumer sample includes an error-resolution notice and terminal location. The commercial
sample omits them.
