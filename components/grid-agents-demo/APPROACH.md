# Agent Accounts Playground: approach

Design log for the interactive Agent Accounts demo that the docs embed at
`docs.lightspark.com/agent-accounts/demo`. Started 2026-11-04; v2 on 2026-11-05.

Sources: Figma `website-q4-2026` node 124:3873 (the playground), 15:8134 and
15:8564 (pitch deck), the "Agent Accounts. Every way in. Every way out."
diagram, the agent apps built for the website's hero lab, the Lightspark
Agents web app (webdev PR 40175, branch `anita/agents-design`), the MockMuse
SwiftUI app in `bitcoin-2026-meta-muse/GridDemo`, screen captures of Grok Bot
and ChatGPT's dot, Claude Duet's product page (claude.com/product/claude-duet),
and the GoFundMe demo's app switch (`bitcoin-2026-gofundme-web`).

## Start here

**The shape.** Three columns, like the cards playground. Left: pick an agent
app (Select agent) and a flow (Explore flows). Middle: the person's phone,
running that agent's chat. Right: the agent's tool calls with the Grid calls
behind them, and the platform's calls and webhooks, each landing at the beat
of the conversation that causes it. The reader is the platform developer; the
chat is what their user sees; the panel is what their backend and the agent
send.

**Where things live.** See the README's "Where things live".

**How to verify.** `npx tsc --noEmit` (ignore the 3 baseline errors shared
with the cards demo: `cornerShape` ×2, `superellipse`). Dev server on 4003;
`node scripts/flow-sweep.mjs light` (and `dark`, `SWEEP_DENY=1`,
`SWEEP_ENGINE=webkit`) runs every flow in every app; the docs embed is
`make mint` → `/agent-accounts/demo`.

## Decisions

### 2026-11-05: one conversation, re-skinned per app

Like the Global Accounts playground, the state lives above the apps.
`useAgentBrain` runs once in `AgentHost`; the skins only render. Switching
apps mid-flow keeps the thread, the pending ask, and the account, and
crossfades to the new skin. The app picker never locks.

Messages are stored by meaning (`StoredMessage`: a key and params) and turned
into text by each app's voice (`voices/`), so the same thread reads in Muse's
voice in Muse and in dot's lowercase in Dots.

### 2026-11-05: tiles send, the visitor drives

A tile sends its flow's first line as the visitor's message and starts the
flow; the flow then waits on the visitor for every ask, quick reply, and Face
ID. There's no simulated keyboard typing, and the tile doesn't stay
highlighted. Picking another tile mid-flow cancels the run and marks its open
asks and quick replies expired.

The composer is a text area that grows a line at a time, up to five, then
scrolls. Enter sends and Shift+Enter starts a new line. Buttons stay on the
bottom line, as in each app; Muse moves its text to the top and its + and send
to a row underneath, as MockMuse does.

### 2026-11-05: ten flows, and Buy online is the card flow

The flows are Connect, Add funds, Set limits, Send, Buy online, Pay agent,
Receive, Withdraw, Balance, and History. Buy online is the standard way
agents pay merchants today: the agent asks for a single-use virtual Visa scoped
to the order (`request_purchase_card`), and the app's approval UI comes up.
Its second run is a subscription with a recurring card locked to one merchant,
which always asks. A separate "Get a card" flow would repeat it, so there
isn't one. There's no KYC step.

### 2026-11-05: the panel nests Grid calls under the agent's tool calls

Each agent action is a tool call named like Lightspark's MCP tools
(`quote_send`, `execute_send`, `request_purchase_card`, `get_account_overview`,
and so on), with Arguments and Result tabs. The Grid calls it makes sit under
it, behind a "N Lightspark API calls" toggle. Platform calls (create the agent,
change its policy, approve or reject an action) and webhooks stand alone.

### 2026-11-05: the real default policy

A connected agent can spend $1,000 a payment and $2,500 a day, and asks above
$10. Set limits raises the approval threshold to $100, so running it first
turns later payments into ones the agent handles itself. Recurring purchase
cards always ask. The flows and the calls read the same policy, so the chat
and the panel never disagree.

### 2026-11-05: Claude Haiku for free text, behind guardrails

Anything the visitor types goes to
`/api/agent`. It calls Claude Haiku through an adapter (`src/lib/llm/`) with a
forced structured reply: up to 3 sentences, and optionally one flow to start.
The model can start a flow but never approves anything; approvals stay in the
app's UI. The route checks the origin, validates the input (300 characters, 8
turns of history), rate-limits per visitor and per day, and has a kill switch
(`AGENT_MODEL_ENABLED`). The prompt keeps it to the account and declines
coding help, so the key can't be used as a free assistant. Without a key, the
playground answers with canned lines.

Haiku over a larger model: replies are a sentence or two in a fixed voice, and
it keeps the per-turn cost low on a public page.

### 2026-11-05: each app draws its own approval

- Muse: Meta Pay's order sheet, ported from MockMuse with its measurements:
  the Optimistic AI face, the avatar loops (idle, working, the still while it
  needs approval), joined bubble runs, dashed choices, and the sheet's
  settle-in.
- Grok Bot and Dots: matched to screen captures of the apps.
- Instinct: it lives in iMessage and has no app, so the thread is your 1:1
  iMessage with Instinct. An approval arrives as a rich link; tapping it plays
  the iOS app switch (ported frame by frame from the GoFundMe demo) into an
  approval page on app.instinct.com in Safari, with "◀ Messages" under the
  clock. Once answered, Safari switches back and Instinct reacts to your
  message.
- Claude Duet: the spend card ("Expires in 10 min", Approve or Not now, then
  Paid) and the mascot, ported from the product page's PhoneMock. It morphs
  between idle, thinking, working, connecting, and waiting on you.

### 2026-11-05: the chat chrome frosts, it doesn't refract

Header buttons, composers, and tab bars are glass over the live thread. A
displacement lens can only bend a static copy of what's behind it, and Safari
renders that copy empty (see the liquid-glass README and the parked
`pat/scroll-refraction-experiment`). So the chrome frosts the thread with
`backdrop-filter` and keeps the glass buttons' specular rim. Short threads
start under each app's header and fill down; long ones stay pinned to the
composer and fade out under the header.

### 2026-11-04: fork the cards playground, not the wallet demo

Cards is newer on every shared shell file, renders webhooks as webhooks
(`WEBHOOK agent-action`, Payload and Response tabs), and supports PATCH, which
Set limits needs. The card stage, designer, and share feature are gone; the
phone is always up, so `DotGridCanvas` keeps its default `phoneVisible`.

### 2026-11-04: light and dark for every app

Muse's dark mode is from the Figma frame (black screen, `#2c2c2e` bubbles and
rows, `#1c1c1e` card, `#98989f` secondary text, white glyphs). The other apps
take their products' own dark themes. Single-color glyphs are CSS masks in the
skin's ink so they follow the theme without a second asset.

### 2026-11-04: calls are provisional and live in one file

`src/data/agentApiCalls.ts` follows the agent spec on main as of 2026-11-04.
The conversation emits semantic events (`src/data/agentEvents.ts`); only that
file turns them into tool calls, paths, and bodies. When the Agent Accounts
docs land, rewrite that file and nothing else.

Ahead of the spec: Send and Withdraw quote to bank accounts on local
rails (PIX, RTP), as the Figma's panel shows. Pay agent uses a real
destination: the merchant agent's Embedded Wallet on the same platform.

### 2026-11-05: the same layout breakpoint as the cards playground

Three columns start at 1600px, as in the cards demo, so both playgrounds
stack and un-stack at the same docs widths. This replaces a 1280px
breakpoint chosen to match the Figma's three columns at 1392.

### Superseded

- 2026-11-04, "the hero lab's agent chats, driven on demand": the scripted
  keyboard typing and per-app scripts gave way to the shared brain and voices.
- 2026-11-04, "the policy decides who approves" at a $25 threshold: now the
  real default policy above.
- 2026-11-04, "scripted now, a model later": the model is in.

## What is faked and what is real-shaped

Faked: the flows, merchants, amounts, exchange rates, deposit addresses, and
timing; the merchant agent's offer; Face ID; the app.instinct.com page.

Real-shaped: every request body, response body, and webhook envelope follows
the agent schemas on main, except the bank payout destinations noted above.

## Open items

- The model needs `ANTHROPIC_API_KEY` and `AGENT_MODEL_ENABLED=true` in the
  Vercel project before free text goes live.
- The Optimistic AI font is Meta's; confirm the license before shipping it
  publicly.
- The OG image is a capture of the playground; swap in designed art.
