# Agent Accounts Playground: approach

Design log for the interactive Agent Accounts demo that the docs embed at
`docs.lightspark.com/agent-accounts/demo`. Started 2026-11-04.

Sources: Figma `website-q4-2026` node 124:3873 (the playground), 15:8134 and
15:8564 (pitch deck: "Money is following people into apps and agents" and
"The next payment network will be built by agents with their own accounts"),
the "Agent Accounts. Every way in. Every way out." diagram, and the agent apps
built for the website's hero lab (`components/hero-lab/agents/` on
`explore/hero-concepts` in the website repo).

## Start here

**The shape.** Three columns, like the cards playground. Left: pick an agent
app (Select connector) and run a flow (Explore flows). Middle: the person's
phone, always up, running that agent's chat. Right: the Grid calls and
webhooks, each landing at the beat of the conversation that causes it. The
reader is the platform developer; the chat is what their user sees; the panel
is what their backend and the agent send.

**Where things live.** See the README's "Where things live".

**How to verify.** `npx tsc --noEmit` (ignore the 3 baseline errors shared
with the cards demo: `cornerShape` ×2, `superellipse`). Dev server on 4003;
`node scripts/flow-sweep.mjs dark` (and `light`) runs every flow on every
connector; the docs embed is `make mint` → `/agent-accounts/demo`.

## Decisions

### 2026-11-04: fork the cards playground, not the wallet demo

Cards is newer on every shared shell file, renders webhooks as webhooks
(`WEBHOOK agent-action`, Payload and Response tabs), and supports PATCH, which
Set limits needs. The card stage, designer, and share feature are gone; the
phone is always up, so `DotGridCanvas` keeps its default `phoneVisible`.

### 2026-11-04: the hero lab's agent chats, driven on demand

The website's hero lab has five scripted chats (Muse, Grok, Dot, Instinct,
Claude Duet) that loop as a hero animation. The playground keeps their frame,
keyboard, Face ID, and each brand's look, and replaces the loop with
`useAgentChat`: a flow plays once when its tile is picked, in the same thread,
so flows read as one running conversation. The hero lab's turn-taking gate is
not needed with one phone.

The chats name their apps as the Figma does (Muse, Grok, dot, Instinct,
Claude); the hero lab used stand-in names (Nova, Pilot).

### 2026-11-04: one ask shape, drawn per skin

Every flow can ask for approval in every app, so asks are one type
(`AgentAsk`): Muse draws it as Meta Pay's order sheet (Figma 87:259), Grok as
its payout row, Claude as its spend card, and dot, Instinct, and Your app as
the shared approval card. Notes and chips work the same way. The shared parts
read each skin's `--part-*` tokens, so they match the app they're in.

### 2026-11-04: light and dark for every app

Muse's dark mode is from the Figma frame (black screen, `#2c2c2e` bubbles and
rows, `#1c1c1e` card, `#98989f` secondary text, white glyphs). The other apps
take their products' own dark themes. Single-color glyphs are CSS masks in the
skin's ink so they follow the theme without a second asset.

### 2026-11-04: the policy decides who approves

Connect installs the agent with a $25 approval threshold. Pay someone, Buy
online, and Pay an agent check their amount against it: above it, the action
waits (`PENDING_APPROVAL`, the `AGENT_ACTION.PENDING_APPROVAL` webhook, an
approval in the app, `POST /agents/{agentId}/actions/{actionId}/approve`);
under it, the agent acts alone (`APPROVED` with the transaction attached). Set
limits raises the threshold, so running it first turns later payments into
ones the agent handles itself. The scripts read the same policy as the calls,
so the chat and the panel never disagree.

### 2026-11-04: calls are provisional and live in one file

`src/data/agentApiCalls.ts` follows the agent spec on main as of 2026-11-04.
The conversation emits semantic events (`src/data/agentEvents.ts`); only that
file turns them into paths and bodies. When the Agent Accounts docs land,
rewrite that file and nothing else.

Ahead of the spec: Pay someone quotes to a bank account on a local rail (PIX,
SPEI, SEPA Instant, UPI), as the Figma's panel shows. Today
`POST /agents/me/quotes` pays only embedded wallets, Spark accounts, chain
addresses, and Lightning invoices. Pay an agent uses a real destination: the
merchant agent's Embedded Wallet on the same platform.

### 2026-11-04: scripted now, a model later

`ChatBrain` (`src/lib/chatBrain.ts`) is the seam: given the connector, flow,
policy, and (later) what the visitor typed, it yields the chat's steps and the
Grid events in order. `scriptedBrain` plays the scripts. A model-backed brain
belongs behind `src/app/api/agent/route.ts`, which returns 501 until then.

### 2026-11-04: three columns at the docs' 1392

`LAYOUT_WIDE_PX` is 1280, not the cards demo's 1600: the Figma is three
columns at 1392 (a 1440 screen, docs sidebar collapsed), and without a card
stage the phone fit-scales into the middle column.

## What is faked and what is real-shaped

Faked: the conversations, merchants, amounts, exchange rates, deposit
addresses, and timing; the merchant agent's offer; Face ID.

Real-shaped: every request body, response body, and webhook envelope follows
the agent schemas on main (`Agent`, `AgentCreateResponse`,
`AgentDeviceCodeRedeemResponse`, `AgentPolicyUpdateRequest`,
`AgentDepositCreateRequest`, `AgentDeposit`, `AgentQuoteRequest`, `AgentQuote`,
`AgentAction`, `AgentCardCreateRequest`, `AgentCard`, `CardRevealResponse`,
`AgentActionWebhook`), except the bank payout destination noted above.

## Open items

- The rest of the Agent Accounts diagram has no tile yet: a standing scoped
  Visa card, sweeping to local banks and mobile wallets, and getting paid in
  stablecoins or BTC.
- The OG image is a capture of the playground; swap in designed art.
- Free text in the composer once a model brain exists.
