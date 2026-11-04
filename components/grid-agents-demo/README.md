# Lightspark Agent Accounts Playground

Interactive demo of Agent Accounts, embedded in the Grid docs at
`docs.lightspark.com/agent-accounts/demo`. Forked from `components/grid-cards-demo` (the Cards
playground) and shares its chrome, design system, and embed contract:

- Next.js 14 + React 18 + TypeScript, SCSS modules
- `@lightsparkdev/origin` design tokens and text-style mixins
- `@central-icons-react` (round-outlined, radius-3, stroke-1.5) for chrome icons
- `motion` for transitions
- Config panel, glass phone stage, and API panel laid out identically to the cards demo

A visitor picks an agent app (Muse, Grok Bot, Dots, Instinct, Claude Duet, or a plain "Your app")
and runs flows in its chat: Connect, Fund, Set limits, Pay someone, Buy online, Pay an agent. The
API panel shows the Grid calls and webhooks behind each beat of the conversation: the platform's
own calls (create the agent, change its policy, approve an action) and the agent's calls with its
own token (`/agents/me/*`).

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

Flow sweep: with the dev server up, `node scripts/flow-sweep.mjs [dark|light]` runs every flow on
every connector in headless Chromium, prints what each logged, fails on console errors, and saves
end-state screenshots to `.tmp-sweep/`.

## Where things live

- `src/apps/agents/` — the agent apps on the phone. `useAgentChat` plays a flow's steps in the
  thread (typing on the keyboard, the agent's replies, approvals with Face ID, chips) and fires each
  Grid event at its beat. `ChatFrame` is the frame every app shares; `parts.tsx` holds the note,
  chip, and approval cards a skin draws when it has no design of its own, themed by each skin's
  `--part-*` tokens. Each skin (`muse/`, `grok/`, `dot/`, `instinct/`, `claude/`, `yourapp/`) is
  light and dark.
- `src/data/agentScripts.ts` — the conversations: one persona per connector, six flows each, built
  from shared templates. Scripts read the agent's policy, so an amount over the approval threshold
  asks the person and one under it doesn't.
- `src/data/agentEvents.ts` — what a conversation asks Grid to do, in its own terms.
- `src/data/agentApiCalls.ts` — every path, request, response, and webhook the panel shows, built
  from those events. Provisional: rewrite it when the Agent Accounts docs land; nothing else names
  an endpoint.
- `src/lib/chatBrain.ts` — where a flow's steps come from. `scriptedBrain` plays the scripts; a
  model-backed brain behind `src/app/api/agent/route.ts` (501 today) streams the same steps.
- `src/hooks/useAgentsDemoLogic.ts` — playground state: the connector, the running flow, the
  agent's session (ids, policy, the held action), the API log, reset.
- Docs embed: `mintlify/agent-accounts/demo.mdx`,
  `mintlify/snippets/agent-accounts/agents-demo-embed.mdx`.

## Deploy

Deploy to Vercel as its own project, `grid-agents-demo`. `vercel.json` sets an `ignoreCommand` so a
commit only triggers a build if it touches this directory. The docs page iframes the deployed URL
(`https://grid-agents-demo.vercel.app`). If the URL differs, update
`mintlify/snippets/agent-accounts/agents-demo-embed.mdx`.

## Embed contract

- `?embed=true` sets `data-embed`.
- `?theme=light|dark` sets the initial theme.
- `?nav=<px>` passes the docs sidebar width so the API column paints at its real default.
- Parent and iframe exchange `theme-sync`, `theme-request`, `nav-sync`, and `nav-request`
  over `postMessage`. Same contract as the cards and wallet demos.

## Scope

Scripted conversations. It does not call a live sandbox or a model yet.

## Chrome files shared with the cards demo

These match `components/grid-cards-demo` so fixes port with `cp`: `src/app/page.module.scss`,
`src/components/{PanelHeader,ColumnResizeHandle,DotGridCanvas,SectionDivider,liquid-glass,glass-gl,ApiPanel}`,
`src/components/ThemeSync.tsx`, `src/hooks/{useTheme,useThemeMode,useColumnResize}.ts`,
`src/lib/{groupApiEntries.ts,easing.ts,sounds.ts}`, `src/apps/shared/{AppShell,FaceIdAuth,glass,icons}`.

Deliberate differences: `$breakpoint-layout-wide` / `LAYOUT_WIDE_PX` is 1280 here (1600 in cards),
so the 1392px docs embed with the sidebar collapsed is three columns as in the Figma;
`src/lib/apiCodeFormat.tsx` signs agent calls with `Bearer $AGENT_TOKEN` (`ApiCall.auth`) and has no
synthesized response stubs; the theme key is `grid-agents-theme`.
