# Lightspark Agent Accounts Playground

Interactive demo of Agent Accounts, embedded in the Grid docs at
`docs.lightspark.com/agent-accounts/demo`. Forked from `components/grid-cards-demo` (the Cards
playground) and shares its chrome, design system, and embed contract:

- Next.js 14 + React 18 + TypeScript, SCSS modules
- `@lightsparkdev/origin` design tokens and text-style mixins
- `@central-icons-react` (round-outlined, radius-3, stroke-1.5) for chrome icons
- `motion` for transitions
- Config panel, glass phone stage, and API panel laid out identically to the cards demo

A visitor picks an agent app (Muse, Grok Bot, Dots, Instinct, Duet, or a plain "Your agent")
and a flow: Connect, Add funds, Set limits, Pay someone, Buy online, Pay an agent, Get paid, Withdraw,
Balance, or History. The flow's tile sends its first line as the visitor's message and starts the
flow; the visitor then makes every choice in the chat (Approve or Decline, quick replies, Face ID),
by tapping or by typing. A model runs the conversation: it reads everything the visitor types and
writes every line the agent says. The composer grows with the text, up to five lines. The API panel
shows each agent tool call with the Grid calls behind it, plus the platform's own calls and webhooks.

All six apps share one conversation and one account. Switching apps mid-flow keeps the thread: its
cards and approvals redraw in the new app's design, and the agent's lines, earlier ones included,
show in the new app's voice. The model writes each line once per app, so the wording for every app
is already saved with the line.

## Develop

```bash
npm install --ignore-scripts
npx patch-package    # applies patches/, as the Vercel build does
npm run dev          # fixed port: http://localhost:4003
# embed/theme preview:
#   http://localhost:4003/?embed=true&theme=light&nav=48
#   http://localhost:4003/?embed=true&theme=dark&nav=48
```

The port is pinned to 4003 (4000 is the wallet demo, 4002 the cards demo) so the docs page can
embed the local app while you preview the docs with `make mint`. The docs page targets
`localhost:4003` when served locally.

### The model

The model runs the conversation, one step at a time. Each step posts the conversation so far to
`src/app/api/agent/route.ts`, which calls Claude Haiku through the adapter in `src/lib/llm/`, and
the model answers with tool calls.

- **What the model does.** It reads every message, writes every line the agent says in the app's
  voice, and picks each step: a tool that does one thing in the app, a reply, or an answer to what's
  open on screen.
- **What the app does.** A tool plays one of the flows in `flows.ts` for its screens and Grid calls.
  The flow's own lines aren't shown: they reach the model as plain notes. The flow stops and reports
  the moment it needs the visitor (an approval, options, an amount, a name), so everything that
  happened is in the record before anything else is said.
- **Taps and typing.** A tap settles what's open at once (an approval, an option, a tile), and the
  model carries on from what happened. Anything typed goes to the model, which can answer what's
  open, reply and leave it open, or do something else. Typed text acts by itself only when it's
  exactly what a tap would send ("yes", an option's label, a plain amount).
- **Without the model.** Without the variables below (or over the cap, or on an error), the route
  returns a fallback, and tiles play their flows as scripts with the flows' own lines. The playground
  works without a key.

| Variable | Default | What it does |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | unset | The model's key. Keep it in `.env.local` (gitignored) or the Vercel project. |
| `AGENT_MODEL_ENABLED` | unset | Must be `true` for the route to call the model. Set it to anything else to turn the model off. |
| `AGENT_MODEL` | `claude-haiku-5-5` | The Anthropic model ID. |
| `AGENT_RATE_LIMIT` | `75` | Messages to the model per browser every 10 minutes. The steps that carry them out get six times that. |
| `AGENT_NETWORK_LIMIT` | `3000` | The same, for everyone behind one network address (an office): messages every 10 minutes, and six times that in steps. |
| `AGENT_DAILY_CAP` | `20000` | Model calls per day across all visitors. Every step of a conversation is a call, tiles included: about 13 per conversation. The server logs a warning at 50% and 80% of the cap, and an error when it's reached. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | unset | Upstash Redis for the limits. Without them, the limits are per server instance, in memory. |

The route rejects requests from other origins, caps what the visitor types at 300 characters, and
requires a tool call in every answer. Its prompt declines anything that isn't about the account,
including coding help. The model can't approve anything on its own: it can only answer an approval
that's open on screen, from what the visitor typed.

### Simulated people

With the dev server up and the model on, `node scripts/agent-sim.mjs --base http://localhost:4003`
has a model play 40 people in a real browser. Each has a goal and a way of typing (terse, typos,
changes their mind, asks questions mid-flow), and decides each move from what's on the phone: type,
tap, approve, decline, or tap a tile. A second model reads each conversation beside the agent's own
calls and their results, and flags lines that are false, ignore what was said, repeat themselves,
break the app's voice, or leave the person stuck. Transcripts land in `.tmp-sweep/sim/`.

- `--only 3,7` runs some of them; `--runs 2` runs each more than once; `--list` prints them.
- `AGENT_MODEL=claude-sonnet-5-5 npm run dev` serves a different model, to compare.

`npx tsx --tsconfig tsconfig.json scripts/agent-evals.ts --base http://localhost:4003` checks that
typed requests still start the right action with the right details.

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

- `src/apps/agents/brain/useAgentBrain.ts`: the one conversation. It runs the model's turns, plays
  a flow's beats (cards, asks, quick replies, work statuses, products, sub-agents, pauses), reports
  to the model each time a flow needs the visitor or ends, fires each Grid event at its beat, and
  gives way cleanly when another tile is picked. `brain/log.ts` is the record the model reads;
  `brain/describe.ts` turns what's on screen into text for it.
- `src/apps/agents/tools/run.ts`: the model's tools, each checked against the account and carried
  out with the flows' screens and Grid calls. `src/lib/llm/tools.ts` defines them for the model.
- `src/apps/agents/flows.ts`: the flows as beats. They read the account's policy, so an amount
  over the approval threshold asks the person and one under it doesn't. Any tile works from any
  starting point: `useAgentsDemoLogic` installs the agent and tops up the balance silently when a
  flow needs it.
- `src/apps/agents/conversation.ts`: messages are stored by meaning (a key and params), not text.
- `src/apps/agents/voices/`: how each app says each line and draws each ask. `base.ts` is the
  neutral voice; `apps.ts` holds each app's overrides.
- `src/apps/agents/AgentHost.tsx`: holds the brain above the skins and crossfades skins when the
  app changes.
- `src/apps/agents/<app>/`: the skins. Each one only renders: `muse/`, `grok/` (with the animated
  eyes in `GrokEyes.tsx`), `dot/`, `instinct/` (a text-only thread, with its vault on a web page in
  Safari), `claude/` (Duet, with its procedural mascot), and `yourapp/`. Every skin has light and
  dark.
- `src/apps/agents/ChatFrame.tsx`, `parts.tsx`, `glass.tsx`, `sheet.tsx`: the frame every chat
  shares (with each app's row motion), the parts a skin draws when it has no design of its own (the
  balance card, the sub-agent row and sheet), the frosted glass chrome, and the sheet each app
  styles.
- `src/styles/_glass-rim.scss`: the iOS 27 glass rim every in-phone glass surface uses.
- `src/apps/shared/appSwitch/`: the iOS app switch and Safari toolbar.
- `src/data/agentEvents.ts`: what a conversation asks Grid to do, in its own terms.
- `src/data/agentApiCalls.ts`: every agent tool call, path, request, response, and webhook the panel
  shows, built from those events. Nothing else names an endpoint.
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

The screens, amounts, and API calls are scripted, so a flow logs the same Grid calls every time.
What the agent says is written by the model, so the wording varies from run to run. The model
can't approve anything on its own or change its own limits. Nothing calls a live sandbox.

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
