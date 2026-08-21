---
name: writing-style
description: >-
  Style guide for all prose authored in this repo: mintlify docs pages, OpenAPI
  field and endpoint descriptions, changelog entries, READMEs, PR descriptions,
  PR review comments, and commit messages. Read BEFORE drafting, not after.
  Based on the Google developer documentation style guide
  (developers.google.com/style). Triggers: writing or editing any .mdx page,
  schema description, guide, PR description, or review comment.
---

# Writing style

Technical prose in this repo follows the Google developer documentation style
guide, condensed below. The goal is plain, direct writing that does not read
as AI-generated.

Exception: pages under `mintlify/legal/` are verbatim text provided by Legal.
Do not restyle them; change them only as instructed, word for word.

## Sentences

- Active voice. Name who does the action: "Grid retries the payout", not
  "the payout is retried". Passive is fine when the actor is irrelevant
  ("the quote expires after 30 seconds").
- Second person for instructions: "you", not "we" or "the user".
- Present tense: "the webhook fires when the transaction settles", not
  "will fire".
- Condition before instruction: "To receive status updates, register a
  webhook", not "Register a webhook if you want status updates". Same for
  links: "For supported currencies, see X", not "See X for supported
  currencies".
- One idea per sentence. Short sentences, but complete ones. No fragments
  for effect.
- Say it once and stop. Cut any sentence that restates the previous one.

## Words

- Plain words over jargon and buzzwords. Name the actual endpoint, field,
  status, error code, or currency, not "the system" or "the workflow".
- Never "simply", "just", "easy", or "quickly" in instructions.
- No placeholder phrases: "please note", "at this time", "it's worth
  noting", "keep in mind".
- No figurative language, metaphors, or pop-culture references.
- Introduce a term once, then use it consistently. Don't rotate synonyms
  for variety.

## Formatting

- Sentence case for titles and headings.
- Numbered lists only for ordered steps; bullets for everything else. One
  concrete behavior per bullet.
- Serial comma.
- Code font for endpoints, fields, values, and commands. Bold for UI
  elements.
- Link text describes the destination ("see the quote lifecycle"), never
  "click here" or a bare "here".
- Unambiguous dates (2026-08-19 or "August 19, 2026").
- No exclamation marks.
- No em-dashes. Use commas, periods, parentheses, or restructure the
  sentence.

## Content

- Write for a reader who was not in the working session. No shorthand or
  codenames invented while drafting; spell out what happens.
- Don't document unreleased or future behavior. Describe only what the API
  does today.
- Paste real request/response bodies and error payloads in code blocks;
  never paraphrase what the API returns.
- State trade-offs directly: "chose X over Y because Z". No hedging, no
  selling.
- Structure follows the content: add a heading or bullet list only when
  there are genuinely multiple items.
- Lead with the conclusion or the change; background after.
- No summary or conclusion sections that restate the page.

## PR descriptions and review comments

- PR descriptions say what changed and why, in complete sentences, one
  behavior per bullet. The test plan states what was actually run.
- Review comments open with the point ("nit:", "question:") and quote the
  specific line or output. One finding per comment. Frame a suggestion as a
  question when the author may know something you don't.

## De-AI pass (run last, on every draft)

- No AI jargon or grand framing: "first-class", "end-to-end", "robust",
  "seamless", "leverage", "holistic", "comprehensive", "battle-tested".
- No punchy fragments for effect: "No more X.", "The result? Y.", "Simple."
- No "It's not X, it's Y" constructions, rhetorical questions, or triadic
  flourishes ("faster, safer, simpler").
- If a sentence could open a product blog post, rewrite it as a statement
  of fact.
