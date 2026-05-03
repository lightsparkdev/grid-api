# grid-tutorial

A hands-on Claude Code skill that takes a developer from zero to a running Next.js demo on Grid in about 10 minutes — making real sandbox API calls along the way and explaining each step.

The skill scaffolds a small Next.js + TypeScript app into your working directory, walks you through either the **Payouts** flow (cross-border bank/wallet payouts) or the **Global Accounts** flow (embedded-wallet withdrawals), and pauses to explain each API call so you understand *why* not just *what*.

## Install

This skill ships with the [grid-api](https://github.com/lightsparkdev/grid-api) docs repo and is installed with [`npx skills`](https://github.com/vercel-labs/skills). The simplest path:

```bash
# Install globally for Claude Code so it's available in any project
npx skills add lightsparkdev/grid-api --skill grid-tutorial -g -a claude-code
```

If you'd rather have it scoped to a specific project, drop the `-g` flag and run from inside that project's root.

To install both Grid skills (this tutorial + the curl-based [`grid-api`](https://github.com/lightsparkdev/grid-api/tree/main/.claude/skills/grid-api) skill for one-off API calls) at once:

```bash
npx skills add lightsparkdev/grid-api --skill '*' -g -a claude-code
```

## Use

Start Claude Code in any directory and say:

> walk me through Grid

Or any of these:

- `I want to try Grid for the first time`
- `Build me a Grid demo that sends USD to a Mexican CLABE account`
- `Show me how Grid Global Accounts work end-to-end`

The skill takes over from there: asks you which flow to walk through, scaffolds the demo into a directory you choose (default `./grid-demo`), helps you wire up your sandbox credentials, and runs each step interactively.

You'll need a Grid sandbox API token before you start — get one at [app.lightspark.com/grid/dashboard](https://app.lightspark.com/grid/dashboard). The skill walks you through saving it to `~/.grid-credentials` (the same location the [`grid-api`](https://github.com/lightsparkdev/grid-api/tree/main/.claude/skills/grid-api) skill uses).

## What you end up with

A `./grid-demo/` directory containing:

- A Next.js 15 + React 19 app
- `lib/grid.ts` — the only place credentials are read; uses `@lightsparkdev/grid` (or plain `fetch` with HTTP Basic Auth)
- `app/api/*` — one route per Grid endpoint the tutorial touches
- `app/page.tsx` — a stepper UI that drives the API routes from the browser
- A standalone `README.md` so the demo makes sense weeks later when you come back to it

…plus at least one real `Transaction` in your sandbox account that reached `COMPLETED`, and a working mental model of the Grid happy path.

## What's inside the skill

```
grid-tutorial/
├── SKILL.md                          # Workflow + routing + pacing rules
├── references/
│   ├── credentials.md                # Sandbox keys + env layout
│   ├── payouts.md                    # 8-step Payouts walkthrough
│   ├── global-accounts.md            # Embedded-wallet branch
│   ├── account-type-cheatsheet.md    # CLABE / IBAN / UPI / ACH shapes
│   ├── webhooks-followup.md          # Optional webhooks add-on
│   └── troubleshooting.md            # Common failure modes
└── assets/
    └── nextjs-template/              # The scaffold copied into your cwd
```

## Related

- **[grid-api](https://github.com/lightsparkdev/grid-api/tree/main/.claude/skills/grid-api)** — sibling skill for one-off Grid API calls (curl-based). Use this once you've finished the tutorial and want to issue ad-hoc requests.
- **[Building with AI](https://grid.lightspark.com/platform-overview/building-with-ai)** — how the broader Grid + AI tooling fits together (MCP server, llms.txt, etc.).
