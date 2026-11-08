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
app (Select agent) and a flow (Account, Payments). Middle: the person's phone,
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

The flows are Connect, Add funds, Set limits, Pay someone, Buy online, Pay an agent,
Get paid, Withdraw, Balance, and History. Buy online is the standard way
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
forced structured reply: a sentence or two, optionally one flow to start with its details, and taps to offer.
The model can start a flow but never approves anything; approvals stay in the
app's UI. The route checks the origin, validates the input (300 characters, 12
turns of history), rate-limits per visitor and per day, and has a kill switch
(`AGENT_MODEL_ENABLED`). The prompt keeps it to the account and declines
coding help, so the key can't be used as a free assistant. Without a key, the
playground answers with canned lines.

Haiku over a larger model: replies are a sentence or two in a fixed voice, and
it keeps the per-turn cost low on a public page.

The model writes each reply once per app, in that app's voice, so switching
apps re-voices its lines the way the scripted ones are (`Said.voices`). The
rules, the six voices and the country list are a fixed block marked for
prompt caching; only where things stand (balance, people saved, which app) is
sent fresh, about 330 tokens a turn against about 3,900 cached.

### 2026-11-06: the agent asks for what it needs, and fills the flows in

Typed requests run the same flows with the visitor's details. The model asks
for one missing thing at a time (who, where they bank, how much) and offers
taps for amounts, countries and choices, never for names. Once it has them it
starts the flow with `params` (`FlowParams` in `flows.ts`); the route keeps
only values that fit (a country in the picker, its own currency or USD). Pay
someone pays anyone in the picker's countries: someone new gets their bank
added once in the app's own sheet, filled in with their country's spec fields
(`recipients.ts`), and is remembered for the visit, so "send her another 20"
goes straight to the quote. The model never asks for bank or card numbers,
and doesn't judge limits (it doesn't know rates): the flow checks the
per-payment limit after converting. Add funds, Withdraw, Set limits and
subscriptions take amounts, limits and a service the same way. One-off
purchases take what the person asked for in their words (`query`); the model
never names a product, brand or price. `products.ts` holds three invented
products for each of about 24 categories, each with a photo; anything else
gets three generated from the request's words, shown in a plain shipping box.
The tile keeps the saved ring light.

Get paid works for anyone: the model passes the payer's name and the amount,
and the invoice number comes from the name. The tile keeps Lucía and her
invoice.

### 2026-11-05: rebuilt 1:1 from the recordings, with no provider in the phone

Grok Bot, Dots, Muse, and Instinct are rebuilt from 13 screen recordings and
21 screenshots. Each transition was studied at 60fps and fitted to a curve
(specs in `refs/<app>/spec.md`, gitignored). The playground is captured the
same way (`.tmp-sweep/capture.mjs`) and compared frame by frame.

- Nothing inside the phone names Lightspark or Grid. Each app calls the money
  its own: Muse balance, Grok Bot balance, Dots balance, Instinct balance, Duet
  balance. Third-party patterns from the recordings (a connect sheet, a web
  checkout, a card vault) keep their layouts and carry the host app's brand.
  Merchants stay third-party because they are the payee.
- The balance card keeps the website's anatomy ("{App} balance", the amount, a
  note), so the playground and the website's hero read as one product. It has
  no buttons: tapping it opens the balance page (2026-11-06).
- Grok Bot: animated eyes in the header and the status row, a status row
  with a shimmer, reactions, a lettered choice card, a product carousel, a
  form card with a native sheet for consent and limits, and an order card
  from Pay through placing to confirmed.
- Dots: markdown bubbles, Seen, an action pill that opens a floating setup
  sheet, and Dots' own checkout sheet for payments.
- Muse: the status subtitle under its name, a Browser card while it works a
  page, entity links, and the stop and send discs.
- Instinct: text only. Besides bubbles, it uses only what iMessage draws
  (tapbacks, data detectors, inline replies, rich links, and images Instinct
  generates). Payments are approved by replying Yes, which it drafts in the
  composer. Consent and limits go through a vault link in Safari.
- Each app's bubble motion is fitted frame by frame to its recordings, and the
  thread follows each kind of growth on its own measured curve (`scroll` on
  ChatFrame). Dots: your bubble lands a little left of its place and slides
  in as the blue fills behind it; Delivered, then Seen; it types after Seen.
  Muse: the thread jumps rather than scrolls, and replies stream in chunks.
  Grok: reactions sit inside your bubble's corner, no pill.
- Instinct's motion is fitted frame by frame to recording 2. Your bubble lifts
  out of the field and swells into place. Delivered swells in as the thread
  makes room, then fades out, and Read and the time fade in. Instinct reacts
  and types only after Read, so the brain waits for it (`readsFor` on the skin).
  Tapbacks grow out of their tail.
- Pay an agent shows a sub-agent row. Its sheet holds the sub-agent's steps
  and the two agents' messages.

### 2026-11-05: any flow from any starting point

The account opens at $0, as the Global Accounts playground's wallet does.
Jumping to a payment (Pay someone, Buy online, Pay an agent, Withdraw) with
less in the balance than it needs tops it up silently first, the same way a
jump already installs the agent. Neither step is logged, but the agent says
what it set up ("I turned on your Muse balance with the default limits and
added $1,250"). The seeded History nets to zero.

Pay an agent books anywhere (2026-11-06). The model only collects the city
and dates (and guests if mentioned); `hotels.ts` supplies the hotel and the
rate: an invented boutique hotel for about 18 popular cities, and for any
other city one generated from its name, so the same city always gets the
same hotel. Prices never come from the model, so the negotiation, approval,
receipt and API calls always add up. The tile keeps Hotel Alma in Lisbon,
June 12 to 14.

Talking over the agent works like a real chat: a message that isn't one of
the open choices drops the choice and gets answered; one that isn't a yes or
a no over an open approval declines it, then gets answered.

Tiles are shortcuts; the chat tells the whole story (2026-11-06). A request
typed or tapped in the chat with no account yet starts with the agent asking
for one (Connect), then a top-up that covers the request in $50 steps, then
the request itself (`planFor` in `flows.ts`). The starter chips lead with
"Set up a balance". Add funds with no amount (the tile, the
balance page's Add money, or "add money" typed) asks how much and waits for a
typed amount ("75", "$1,000", "75 bucks"), then asks where from. Anything else
typed there drops the question and goes to the model. The model offers no
chips for amounts: people type those. Withdraw works the same way ("everything"
means the whole balance) and goes to the person's own bank: the one they
linked, or one they link right then in the app's bank sheet. It never tops up
to cover a withdrawal; asking for more than the balance gets a no.

### 2026-11-05: fund with and store cards

Add funds offers a debit card first, then a bank account, then crypto (USDC
on Base, then Bitcoin over Lightning), the order of the Agent Accounts
diagram. The bank path follows the Global Accounts playground: the first time,
the person links the bank in the app's own consent UI (`POST
/customers/external-accounts`), and each top-up is a quote from that external
account into the wallet that waits for the ACH push (`POST /sandbox/send` in
sandbox). The first time, the card goes into the account's PCI vault, and
each app asks for it its own way: Grok's card sheet with "Securely save to
your Bot's vault", Instinct's Purchase card page in Safari, and a scan in the
Apple Wallet style (Hold Near Card) in the others. After that, top-ups charge
the vaulted card with no prompt. Grid has no vault API yet, so
`card.vault` and `fund.card` log a provisional sketch: `POST
/customers/{id}/vaulted-cards`, then a quote whose source is the vaulted
card. Rewrite them when the API lands.

### 2026-11-06: pay with a saved card, Plaid, and bank top-ups by rail

- A saved card is enough on its own (the "lite account"): Buy online can pay
  with it and leave the balance alone. The agent's purchase card is funded by
  the vaulted card instead of the wallet (`fundingSource`), so the agent still
  never holds the card's number. Provisional until the vault API lands.
- What pays: asked for on the card, the card. With a card saved, Muse and Dots
  go with what covers it and their checkout's Pay with row switches it (the
  card, the balance, or Add money); the other apps ask first. With no card
  and too little in the balance, the agent offers the card instead of a
  top-up.
- Linking your own bank starts with "Where's your bank?". A US bank links
  through Plaid Link, drawn from Muse's recordings in iOS's web sheet with
  Plaid's own font and logo; anywhere else, the app's own form opens on that
  country. Either way the agent keeps it for adding money and withdrawing.
- Adding money from a bank follows the rail: a US bank is pulled over ACH (a
  quote with the external account as source, executed at once); anywhere else
  the person sends it to the details a real-time funded quote issues (CLABE,
  PIX key, IBAN, or a SWIFT wire), as the Global Accounts playground does.
- Card first, balance later: adding a card creates the agent without a
  balance, then offers one. Declined, nothing mentions a balance until the
  person asks for something that holds money (adding money, getting paid,
  paying someone), which asks for it first; tiles do the same rather than
  turning it on silently.
- Asked to find something, the agent recommends one of three and the person
  picks; something they named (the saved ring light) it buys directly.
- One message can ask for several things ("$100 from my card and $100 from
  my bank"); they run in order, and a no anywhere ends the rest.
- Agent runs join on 6.5pt corners for every kind of message, including
  cards, checkouts and one-line bubbles; a bubble is reshaped whenever its
  place in a run changes, not only when it resizes.

### 2026-11-07: fewer Face ID moments, sheets that survive a switch

- Face ID guards money leaving to someone else above the approval limit, and
  limit changes. Turning on the balance, saving a card, linking a bank and
  withdrawing to your own bank don't ask for it: the form or Plaid already
  confirms, and the recordings never show it there.
- Balance cards state the balance only; "left today" read as a second budget.
- A sheet that's up (the balance, a card or bank form, Plaid) stays up when
  the person switches apps and redraws in the new app's look.
- Muse's rows fade up as they arrive and its typing dots follow recording 9.
  The first app on the page used to skip every row's entrance.
- A payment with too little in the balance tops up after the payee and the
  quote, not before: no money moves until the agent knows who it's for, and
  it adds what the quote needs. Setting up a balance on the way to something
  else skips the empty balance card.
- An approval answered with another app's button shows in Instinct as a
  "yes" (or "no") under the ask, since Instinct only takes a text reply.
- Add funds offers a card, a bank, or Crypto. Crypto asks what they're
  sending (USDC, USDT, Bitcoin), then the network, from what Grid's agent
  deposits allow (`AgentDepositNetwork`): USDC on Base, Solana, Ethereum,
  Polygon or Arbitrum; USDT on those and Tron, minus Base; Bitcoin over
  Lightning or Spark. Spark is ahead of that enum, which doesn't list it yet,
  though the rest of the spec does. Anything they already named ("USDT on
  Tron") isn't asked again.
- Send crypto pays out of the balance as Grid's agent quotes allow: USDC or
  USDT to an address on another chain (`CHAIN_ADDRESS`; Base takes USDC only,
  Tron USDT only), a Lightning invoice (`LIGHTNING_INVOICE`), or USDB to a
  Spark address. The address's shape says what it is (`src/data/cryptoSend.ts`):
  an EVM address asks which chain, since the same address works on all of
  them; a fragment, an on-chain Bitcoin address, or an asset the chain can't
  take is said before any setup, and the model's "on it" is held back so it
  doesn't contradict that. Network fees are made up but in proportion.

### 2026-11-06: approve only, bank marks, and a balance page

- Payment approvals show only Approve. The person asked for the payment, so
  there's nothing to decline; saying no in the chat declines it, and the card
  reads Declined. Setup asks (a card, a bank) keep Not now.
- Wherever a bank shows, its mark is the bank's App Store icon (400x400, from
  the iTunes Search API) with the country's flag at the bottom right, or a
  bank glyph with the flag when there's no icon. `scripts/fetch-bank-logos.mjs`
  fetches one for every default and popular bank in `bankCountries.ts` and
  writes `src/data/bankLogos.generated.ts`; a wrong match gets a search term
  in `TERMS` and a rerun with `--only`.
- Product photos are generated in the Apple Store style (a studio render on
  white), cut out to transparent, trimmed, and padded to 800x800 WebP.
- The balance card opens a balance page: the balance with Add money and Move
  to bank, today's spend against the limits, the linked bank and saved card,
  and recent activity, from the live account (`balanceView` in
  `BalancePage.tsx`). Each app lays it out as its own settings, from the
  captures: Muse as Settings and Wallet (IMG_1907, IMG_1911), Grok as Settings
  and Vault (IMG_1919, IMG_1922), Dots as Customize and Scheduled (IMG_1894–
  1896), Duet as Claude's Settings (IMG_1930), and Instinct as its account
  pages on app.instinct.com in Safari (IMG_1926, IMG_1929). Your agent gets a
  plain iOS grouped page. Either action closes the page and asks in the
  thread, as the tiles do.

### 2026-11-05: the thread scrolls

The thread is a scroller. New content grows at its foot and the whole thread
scrolls up together on the measured curve (280ms,
`cubic-bezier(0.28, 0.05, 0.65, 1)`), instead of each row animating its own
position, which let rows overlap mid-move. Scrolled back to read, it stays put
until the visitor returns to the foot. Any step up leaves the foot, however
small (a trackpad moves a few pixels at a time), and a wheel over the header,
tab bar or composer scrolls the thread under them.

### 2026-11-05: the iOS 27 glass rim

The rim is a 0.5pt hairline: dark on the left and right, bright white on the
top and bottom, with a soft white highlight inside. The glass sits a step
grayer than the page so the white reads, as in the captures. One mixin
(`src/styles/_glass-rim.scss`) draws it on every glass surface in the phone.
It replaces the 45-degree baked specular. The values were matched to the
zoomed captures at 3x.

### 2026-11-05: each app draws its own approval

- Muse: its order sheet, ported from MockMuse with its measurements:
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
- Claude Duet: the spend card ("Expires in 10 min", Approve, then Paid) and
  the mascot, ported from the product page's PhoneMock. It morphs
  between idle, thinking, working, connecting, and waiting on you.

### 2026-11-05: the chat chrome frosts, it doesn't refract

Header buttons, composers, and tab bars are glass over the live thread. A
displacement lens can only bend a static copy of what's behind it, and Safari
renders that copy empty (see the liquid-glass README and the parked
`pat/scroll-refraction-experiment`). So the chrome frosts the thread with
`backdrop-filter` and draws the iOS 27 rim on top. Short threads
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

Ahead of the spec: Pay someone and Withdraw quote to bank accounts on local
rails (PIX, RTP), as the Figma's panel shows. Pay an agent uses a real
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

Faked: the flows, merchants, products and their photos, amounts, exchange
rates, deposit addresses, and timing; the merchant agent's offer; Face ID; the
app.instinct.com page.

Real-shaped: every request body, response body, and webhook envelope follows
the agent schemas on main, except the bank payout destinations noted above.

## Open items

- The model needs `ANTHROPIC_API_KEY` and `AGENT_MODEL_ENABLED=true` in the
  Vercel project before free text goes live.
- The Optimistic AI font is Meta's; confirm the license before shipping it
  publicly.
- The bank marks are the banks' App Store icons; confirm with legal before the
  public launch.
- The OG image is a capture of the playground; swap in designed art.
