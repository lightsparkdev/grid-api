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

- `src/components/PlaygroundIntro/PlaygroundIntro.tsx` uses Statements product copy.
- `src/app/layout.tsx` uses Statements metadata and the Statements production URL. The pre-paint
  embed, theme, layout, and navigation script stays equal.

Port shared fixes with `cp` from `components/grid-cards-demo` to the same path under
`components/grid-statements-demo`. Do not rewrite or approximate shared chrome.

## Deploy

Deploy to Vercel as the `grid-statements-demo` project. `vercel.json` sets an `ignoreCommand` so a
commit only triggers a build if it touches this directory. The docs page iframes the production
URL (`https://grid-statements-demo.vercel.app`). Mintlify preview branches iframe
`https://grid-statements-demo-git-<branch>-lightspark-team.vercel.app`. If a URL differs, update
`mintlify/snippets/global-accounts/statements-demo-embed.mdx`.

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
