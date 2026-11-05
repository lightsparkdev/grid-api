# Lightspark Agent Accounts Playground

Interactive demo of Agent Accounts, embedded in the Grid docs at
`docs.lightspark.com/agent-accounts/demo`. Forked from `components/grid-cards-demo` (the Cards
playground) and shares its chrome, design system, and embed contract:

- Next.js 14 + React 18 + TypeScript, SCSS modules
- `@lightsparkdev/origin` design tokens and text-style mixins
- `@central-icons-react` (round-outlined, radius-3, stroke-1.5) for chrome icons
- `motion` for transitions
- Config panel, glass phone stage, and API panel laid out identically to the cards demo

A visitor picks an agent app (Muse, Grok Bot, Dots, Instinct, Claude Duet, or a plain "Your agent")
and a flow: Connect, Add funds, Set limits, Pay someone, Buy online, Pay an agent, Get paid, Withdraw,
Balance, or History. The flow's tile sends its first line as the visitor's message; the visitor
then makes every choice in the chat (Approve or Decline, quick replies, Face ID). Anything they
type goes to a small model with guardrails. The composer grows with the text, up to five lines. The API panel shows each agent tool call with the Grid
calls behind it, plus the platform's own calls and webhooks.

All six apps share one conversation and one account. Switching apps mid-flow re-renders the same
thread, in the new app's voice and with its own approval UI.

## Develop

```bash
npm install --ignore-scripts
npm run dev          # fixed port: http://localhost:4003
# embed/theme preview:
#   http://localhost:4003/?embed=true&theme=light&nav=48
#   http://localhost:4003/?embed=true&theme=dark&nav=48
```

The port is pinned to 4003 (4000 is the wallet demo, 4002 the cards demo) so the docs page can
embed the local app while you preview the docs with `make mint`. The docs page targets
`localhost:4003` when served locally.

### The model

Free text in the composer posts to `src/app/api/agent/route.ts`, which calls Claude Haiku through
the adapter in `src/lib/llm/`. Without the variables below, the route returns a fallback and the
agent answers with a canned line, so the playground works without a key.

| Variable | Default | What it does |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | unset | The model's key. Keep it in `.env.local` (gitignored) or the Vercel project. |
| `AGENT_MODEL_ENABLED` | unset | Must be `true` for the route to call the model. Set it to anything else to turn the model off. |
| `AGENT_MODEL` | `claude-haiku-4-5` | The Anthropic model ID. |
| `AGENT_RATE_LIMIT` | `20` | Model turns per visitor every 10 minutes. |
| `AGENT_DAILY_CAP` | `2000` | Model turns per day across all visitors. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | unset | Upstash Redis for the limits. Without them, the limits are per server instance, in memory. |

The route rejects requests from other origins, caps the input at 300 characters, keeps the last 8
turns, forces a structured reply (a short answer plus an optional flow to start), and its prompt
declines anything that isn't about the account, including coding help.

### Flow sweep

With the dev server up, `node scripts/flow-sweep.mjs [light|dark]` runs every flow in every app in
headless Chromium. It clicks each tile and answers each ask the way the app takes it: Grok's form
sheet (Continue, then Done), Dots' pills and sheets, Instinct's vault links into Safari, and
Instinct's text replies (it sends the drafted Yes, or "no" when declining). It picks the first quick
reply, opens and closes the sub-agent sheet once per flow, fails on console errors or a flow that
doesn't settle in 60 seconds, and saves end-state screenshots to `.tmp-sweep/`.

- `SWEEP_DENY=1` declines every ask instead.
- `SWEEP_ENGINE=webkit` runs WebKit.
- `SWEEP_CONNECTORS="Muse,Instinct"` limits the apps.

## Where things live

- `src/apps/agents/brain/useAgentBrain.ts`: the one conversation. It plays a flow's beats (lines,
  cards, asks, quick replies, work statuses, products, reactions, sub-agents, pauses), waits on the
  visitor's decisions, fires each Grid event at its beat, and cancels cleanly when another tile is
  picked. An open ask or choice also takes a typed reply: "yes" approves, an option's number or
  label picks it.
- `src/apps/agents/flows.ts`: the ten flows as beats. They read the account's policy, so an amount
  over the approval threshold asks the person and one under it doesn't.
- `src/apps/agents/conversation.ts`: messages are stored by meaning (a key and params), not text.
- `src/apps/agents/voices/`: how each app says each line and draws each ask. `base.ts` is the
  neutral voice; `apps.ts` holds each app's overrides.
- `src/apps/agents/AgentHost.tsx`: holds the brain above the skins and crossfades skins when the
  app changes.
- `src/apps/agents/<app>/`: the skins. Each one only renders: `muse/` (recording 9 over the MockMuse
  port), `grok/` (with the animated eyes in `GrokEyes.tsx`), `dot/`, `instinct/` (text-only
  iMessage, with its vault on app.instinct.com in Safari), `claude/` (with the procedural mascot
  from Claude Duet's product page), and `yourapp/`. Every skin has light and dark.
- `src/apps/agents/ChatFrame.tsx`, `parts.tsx`, `glass.tsx`, `sheet.tsx`: the frame every chat
  shares (with each app's row motion), the parts a skin draws when it has no design of its own (the
  balance card, the sub-agent row and sheet), the frosted glass chrome, and the sheet each app
  styles.
- `src/styles/_glass-rim.scss`: the iOS 27 glass rim every in-phone glass surface uses.
- `src/apps/shared/appSwitch/`: the iOS app switch and Safari toolbar, ported from the GoFundMe
  demo.
- `src/data/agentEvents.ts`: what a conversation asks Grid to do, in its own terms.
- `src/data/agentApiCalls.ts`: every agent tool call, path, request, response, and webhook the panel
  shows, built from those events. Provisional: rewrite it when the Agent Accounts docs land;
  nothing else names an endpoint.
- `src/lib/llm/`: the model adapter, prompt, and limits.
- `src/hooks/useAgentsDemoLogic.ts`: playground state: the app, the active flow, the agent's session
  and ledger, the API log, reset.
- Docs embed: `mintlify/agent-accounts/demo.mdx`,
  `mintlify/snippets/agent-accounts/agents-demo-embed.mdx`.

## Deploy

Deploy to Vercel as its own project, `grid-agents-demo`. `vercel.json` sets an `ignoreCommand` so a
commit only triggers a build if it touches this directory. The docs page iframes the deployed URL
(`https://grid-agents-demo.vercel.app`). If the URL differs, update
`mintlify/snippets/agent-accounts/agents-demo-embed.mdx`. Set the model variables above in the
Vercel project to turn on free text.

## Embed contract

- `?embed=true` sets `data-embed`.
- `?theme=light|dark` sets the initial theme.
- `?nav=<px>` passes the docs sidebar width so the API column paints at its real default.
- Parent and iframe exchange `theme-sync`, `theme-request`, `nav-sync`, and `nav-request`
  over `postMessage`. Same contract as the cards and wallet demos.

## Scope

The flows, amounts, and API calls are scripted. The model answers free text and can start a flow,
but it never approves anything or changes the account. Nothing calls a live sandbox.

## Chrome files shared with the cards demo

These match `components/grid-cards-demo` so fixes port with `cp`: `src/app/page.module.scss`,
`src/components/{PanelHeader,ColumnResizeHandle,DotGridCanvas,SectionDivider,liquid-glass,glass-gl}`,
`src/components/ThemeSync.tsx`, `src/hooks/{useTheme,useThemeMode,useColumnResize}.ts`,
`src/lib/{groupApiEntries.ts,easing.ts,sounds.ts,layout.ts}`, `src/styles/breakpoints.scss`, `src/apps/shared/{FaceIdAuth,glass,icons}`.

Deliberate differences:

- `src/lib/apiCodeFormat.tsx` signs agent calls with `Bearer $AGENT_TOKEN` (`ApiCall.auth`) and has
  no synthesized response stubs.
- `src/components/ApiPanel/` nests Grid calls under agent tool calls (`Entry.tool`, `Entry.parent`).
- `src/apps/shared/AppShell/` uses `useId` for its SVG ids, and the status bar lifts its time when an
  app shows a back-to-app breadcrumb.
- The theme key is `grid-agents-theme`.
