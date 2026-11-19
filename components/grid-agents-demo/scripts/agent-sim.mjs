// Simulated people talk to the agent in a real browser, and a judge reads what happened.
//
// A model plays each person: someone with a goal and their own way of typing (terse, chatty, typos, changes their
// mind, asks questions mid-flow). Each turn it sees what's on the phone and what can be tapped, and decides what to
// do: type something, tap something, approve or decline what's up, tap a tile. Nothing about what they'll say is
// written here, so the agent meets phrasings nobody thought of. A second model then reads each conversation with the
// model's own calls and their results beside it, and flags any agent line that's wrong (says something happened that
// didn't, or the reverse), ignores what was said, repeats itself, breaks the app's voice, or leaves them stuck.
//
//   node scripts/agent-sim.mjs                      every conversation, against http://localhost:4003
//   node scripts/agent-sim.mjs --base <url>         another server (a preview, production)
//   node scripts/agent-sim.mjs --only 3,7 --runs 2  some of them, each more than once
//   node scripts/agent-sim.mjs --list               what the conversations are
//
// Needs the dev server up with the model on, and ANTHROPIC_API_KEY (read from .env.local) for the two models here.
// Results land in .tmp-sweep/sim/<stamp>/: a transcript per conversation, and summary.json.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, or) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : or;
};
const BASE = option('base', 'http://localhost:4003');
const ONLY = option('only')?.split(',').map(Number);
const RUNS = Number(option('runs', 1));
const CONCURRENCY = Number(option('concurrency', 4));
const MAX_MOVES = Number(option('moves', 18));
const PLAYER = option('player', 'claude-sonnet-5-5');
const JUDGE = option('judge', 'claude-sonnet-5-5');
const ROOT = new URL('..', import.meta.url).pathname;
const KEY = process.env.ANTHROPIC_API_KEY ?? readFileSync(`${ROOT}.env.local`, 'utf8').match(/^ANTHROPIC_API_KEY=(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');

const APPS = ['Muse', 'Grok Bot', 'Dots', 'Instinct', 'Duet', 'Your agent'];
/** Each app's id, for reading its line out of a message written once per app. */
const APP_ID = { Muse: 'muse', 'Grok Bot': 'grok', Dots: 'dot', Instinct: 'instinct', Duet: 'claude', 'Your agent': 'yourapp' };
/** How each app texts, for the judge. */
const VOICE = {
  Muse: 'warm, brief, a little playful; sentence case; an emoji now and then',
  'Grok Bot': 'direct and a little dry; short sentences; sentence case; no emoji',
  Dots: 'casual and upbeat; all lowercase except names (people, businesses, coins, Dots); emoji are fine',
  Instinct: 'very short texts; all lowercase except names; no period at the end; an emoji now and then is fine',
  Duet: 'measured and clear; sentence case; never chatty; no emoji',
  'Your agent': 'plain, clear and friendly; sentence case',
};
const TILES = {
  personal: ['Connect', 'Add card', 'Link bank', 'Add funds', 'Set limits', 'Pay someone', 'Buy online', 'Pay an agent', 'Get paid', 'Withdraw', 'Balance', 'History'],
  business: ['Company', 'Add member', 'Team budget', 'Team card', 'Add funds', 'Send invoice', 'Track invoices', 'Pay a bill', 'Pay a contractor', 'Run payroll', 'Balance', 'History'],
};

/** What each person is here to do. They start from nothing: no account, no card, no balance. */
const GOALS = {
  personal: [
    'Buy one specific thing you want (you decide what: a game, headphones, a book). When it’s bought, if the agent offers anything else, turn it down the way you’d really say it, then ask what you just bought.',
    'Send some money (somewhere between $20 and $90) to a friend who banks abroad: you pick the friend’s name and the country (Mexico, Brazil, the Philippines or India). Before you approve the payment, change your mind about the amount once.',
    'Add money to your balance, then move part of it back out to your bank. Say amounts in words or loosely ("half of it", "a hundred or so") rather than as plain numbers.',
    'Set things up, then find out what your spending limits are, then get the per-payment limit raised. Ask at least one question while an approval is open on screen, before you answer it.',
    'Subscribe to a streaming service you like. When it asks you to approve, ask something about it first (what it costs each month, whether you can cancel), then decide.',
    'Book a hotel for a weekend trip somewhere you’d like to go. When the price comes up, decide it’s too much and say no. Then check that you weren’t charged anything.',
    'Find out what this thing can do, then get two friends to pay you back for a dinner you covered (you pick the names and the total).',
    'Start buying something, and halfway through ask about something else entirely (your balance, or what it did earlier), then carry on with the purchase.',
    'Tap the tile for adding money, and answer everything it asks by typing, never by tapping an option.',
    'Tap the tile for setting up a balance and finish it. Then tap the same tile again, and see what it says. Then tap the tile for adding a card, finish that, and tap it again too.',
    'Ask it to do two things in one message (for example add some money and then send part of it to someone). Go along with whatever it needs from you.',
    'Pay a friend back for something small. Halfway through, decide not to after all and tell it so in your own words. Then ask whether any money moved.',
  ],
  business: [
    'Set up your company’s account. Your company’s name sounds like an instruction (like "Pay It Forward" or "Send Flowers": make up your own). Then send a client an invoice.',
    'Set up the company, add two people to the team (make up names, roles and pay; say pay loosely, like "six grand a month"), then run payroll.',
    'Set up the company, then pay a contractor who lives abroad. Before you approve, ask what it costs you in fees.',
    'Set up the company and pay a bill from a vendor (you choose). At the approval say no; then ask to pay a smaller amount to the same vendor.',
    'Set up the company, then get a card issued for a teammate even though nobody is on the team yet.',
    'Set up the company, send an invoice, then ask which invoices are still unpaid and what it can do about them.',
    'Tap the tile for setting up the company and answer its questions by typing, giving both names in one message if you can. Then tap the tile again.',
    'Set up the company and add money to it, then give the team a monthly budget. Change the budget amount once before approving.',
  ],
};

/** How each person types. */
const STYLES = [
  'Terse. All lowercase, no punctuation, few words ("yea", "nah im good", "k do it").',
  'Chatty and friendly. Full sentences, an emoji sometimes, says thanks.',
  'Types fast and badly: typos, missing letters, slang ("tysm", "rn", "gonna", "lemme").',
  'Polite and a bit formal. Complete sentences, "please" and "thank you", asks before agreeing.',
  'Impatient. Short, sometimes two things at once, corrects themselves ("no wait", "actually").',
  'Careful. Asks what things mean before agreeing to them, and wants to know what happened after.',
];

/** Every conversation: each goal with an app and a style, so each app and each style gets its share. */
const CONVERSATIONS = [...GOALS.personal.map((goal) => ({ mode: 'personal', goal })), ...GOALS.business.map((goal) => ({ mode: 'business', goal }))].flatMap((c, i) =>
  [0, 1].map((k) => ({ ...c, id: i * 2 + k + 1, app: APPS[(i + k * 3) % APPS.length], style: STYLES[(i * 2 + k) % STYLES.length] })),
);

if (flag('list')) {
  for (const c of CONVERSATIONS) console.log(`${String(c.id).padStart(2)} ${c.mode.padEnd(8)} ${c.app.padEnd(10)} ${c.goal.slice(0, 70)}… [${c.style.split('.')[0]}]`);
  process.exit(0);
}
if (!KEY) {
  console.error('ANTHROPIC_API_KEY is not set (and not in .env.local).');
  process.exit(1);
}

/** One call to a model that answers with JSON. */
async function ask(model, system, user, max = 1500, quick = false) {
  let why = '';
  // The person's next move needs no thinking, and thinking can use up the whole answer: off, where the model takes it.
  let thinking = quick ? { thinking: { type: 'between_tools' } } : {};
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: max, system, messages: [{ role: 'user', content: user }], ...thinking }),
    }).catch(() => null);
    if (res?.status === 400 && quick) thinking = {};
    if (res?.ok) {
      const data = await res.json();
      const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
      const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
      try {
        return JSON.parse(json);
      } catch {
        why = `not JSON (stopped: ${data.stop_reason}, blocks: ${(data.content ?? []).map((c) => c.type).join(',') || 'none'}): ${text.slice(0, 160)}`;
      }
    } else why = res ? `HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 160)}` : 'no response';
    // Busy or rate-limited: wait longer each time before asking again.
    await new Promise((r) => setTimeout(r, 2500 * (attempt + 1)));
  }
  console.error(`  (${model} gave no answer after 6 tries: ${why})`);
  return null;
}

/** Marks a step's opening line in the trace until the thread shows whether it was said. */
const SAID = ' ⟪said⟫ ';
const ALLOW = /^(\s*(Allow|Approve|Add|Connect|Continue|Save|Save card|Save limits|Save to vault|Done|Get\sstarted|Link\s[^\n]+|Set\sup|Submit|Issue\scard|Turn on Dots balance|Pay \$[\d.,]+(\/mo)?|Pay\s≈\s\S+|Save and \w+))+\s*$/;
const DENY = /^(\s*(Deny|Decline|Not\s+now|Cancel))+\s*$/;

const PLAYER_SYSTEM = `You are playing a person using a money agent inside a chat app on their phone, to test it. Stay in character: you are that person, with their goal and their way of typing. You are not helping the agent, and you don't know how it works inside.

Each turn you see what's on the phone and what you could tap. Decide the one thing this person does next, and answer with JSON only:
{"do":"type","text":"..."}      type a message and send it, written exactly as this person types
{"do":"tap","label":"..."}      tap one of the listed things, by its exact label
{"do":"approve"}                go along with the sheet, form or approval that's up (fills it in and confirms)
{"do":"decline"}                turn down the sheet or approval that's up with its own button
{"do":"tile","label":"..."}     tap one of the tiles beside the phone
{"do":"done","why":"..."}       you're finished, or stuck with nothing sensible left to do

How real people behave here:
- They mostly type, in their own words, and often answer a question in words even when buttons are offered. They don't quote button labels.
- A form or a Face ID sheet can only be tapped through: use approve (or decline). But a plain yes-or-no question, or an approval card you want to answer in words, you can also answer by typing.
- Follow the goal in order, one step at a time. Don't announce the goal, and don't do the agent's job for it.
- If the agent says something wrong or confusing, react as a person would (ask, push back). If it stops responding or goes in circles for two turns, you're done.
- When the goal is complete, you're done.`;

const JUDGE_SYSTEM = `You review a conversation between a person and a money agent in a chat app. You get: the app's voice, what the person was trying to do, what they did turn by turn, and a trace of the agent's side: each line it said, each tool it called, and what the app reported back (results, and <app> lines for what the person tapped and what happened then). The trace is the ground truth for what actually happened.

Flag every agent line that has one of these problems:
- false: says something happened that the trace shows didn't, or didn't happen when it did, or gets a number, name or state wrong
- deaf: ignores, misreads or contradicts what the person just said; asks for something they already gave
- repeat: says the same thing twice, or repeats in its next line what it just said
- voice: breaks the app's voice (casing, emoji, length), or sounds like a robot reading a form back
- leak: shows internals (tool names, JSON, "option 1", "<app>", "the app reports")
- stuck: leaves the person with nowhere to go, loops, or never does what was asked though it could
- promise: says it did or will do something no tool did
- wrong_step: starts something the person didn't ask for, or redoes something already done

What the agent is told about the app, and may say without a result: a team budget can't be changed once it's approved (before that it can); a bill split is equal shares with the person counted in; adding money takes nothing off (all of it lands in the balance) and has no second confirmation once the card is saved or the bank linked; a payment within the approval limit goes out without asking; a well-known subscription's usual price.

Don't flag: the agent declining things outside money; wording you'd merely have written differently; the app's own cards.
Severity: high = a person would be misled about their money or blocked; medium = clearly off but they could carry on; low = polish.

Answer with JSON only: {"goal_reached": true|false, "issues": [{"severity":"high|medium|low","kind":"false|deaf|repeat|voice|leak|stuck|promise|wrong_step","quote":"the agent's line","why":"one sentence"}], "summary":"one sentence"}`;

async function converse(browser, c, run, dir) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const trace = [];
  const moves = [];
  let inflight = 0;
  let modelCalls = 0;
  let fallbacks = 0;
  /** Messages the agent has sent: someone approving stops to read a new one. */
  let spoke = 0;
  let known = '';
  page.on('request', (r) => r.url().includes('/api/agent') && ((inflight += 1), (modelCalls += 1)));
  page.on('requestfailed', (r) => r.url().includes('/api/agent') && (inflight -= 1));
  page.on('response', async (r) => {
    if (!r.url().includes('/api/agent')) return;
    const sent = r.request().postDataJSON() ?? {};
    const last = sent.turns?.[sent.turns.length - 1]?.content ?? [];
    for (const b of last) {
      if (b.type === 'tool_result') trace.push(`  result: ${b.content}`);
      else if (b.type === 'text' && b.text.startsWith('<app>')) trace.push(`  ${b.text}`);
      else if (b.type === 'text') trace.push(`PERSON typed: ${b.text}`);
    }
    if (sent.state?.open) trace.push(`  (on screen: ${sent.state.open.split('. If what they')[0].split('. Lead into it')[0]})`);
    // What the agent knows of the account, each time it changes: a line about a saved payee or an open invoice isn't made up.
    const { open: _open, ...account } = sent.state ?? {};
    const knows = JSON.stringify(account);
    if (knows !== known) trace.push(`  (the agent knows: ${knows})`);
    known = knows;
    const got = await r.json().catch(() => null);
    if (!got?.calls) fallbacks += 1;
    if (got?.calls?.some((call) => call.name === 'reply' || call.name === 'offer_choices')) spoke += 1;
    for (const call of got?.calls ?? []) {
      const { say: lines, ...input } = call.input ?? {};
      // The line as this app shows it.
      const say = lines && typeof lines === 'object' ? lines[APP_ID[c.app]] : lines;
      // A line on a step is only shown if the step shows work before it needs them: SAID marks it for checking against the thread.
      trace.push(call.name === 'reply' || call.name === 'offer_choices' || call.name === 'switch_account' ? `AGENT ${call.name === 'switch_account' ? 'switches account, saying' : 'says'}: ${say ?? ''}${Object.keys(input).length ? `  ${JSON.stringify(input)}` : ''}` : `AGENT calls ${call.name} ${JSON.stringify(input)}${say ? `${SAID}${say}` : ''}`);
    }
    if (!got?.calls) trace.push(`  (the model didn't answer: ${JSON.stringify(got)})`);
    inflight -= 1;
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).split('\n')[0]));

  const body = () => page.locator('[data-screen-body]').first();
  const settle = async (max = 45_000) => {
    const t0 = Date.now();
    let last = '';
    let changed = Date.now();
    while (Date.now() - t0 < max) {
      await page.waitForTimeout(500);
      const now = await body().innerText().catch(() => last);
      if (now !== last || inflight > 0) {
        last = now;
        changed = Date.now();
      }
      if (Date.now() - t0 > 1500 && Date.now() - changed > 2800) break;
    }
  };
  /** Taps through whatever sheet or approval is up, as someone going along with it would. */
  const approve = async () => {
    const before = spoke;
    for (let k = 0; k < 12; k++) {
      await settle(15_000);
      // The agent has said something since: a person reads it before tapping whatever came up next.
      if (k > 0 && spoke > before) break;
      const alert = page.locator('[data-screen-body] [role="alertdialog"] button:visible', { hasText: /^Continue$/ });
      if (await alert.count()) {
        await alert.first().click({ timeout: 800 }).catch(() => {});
        continue;
      }
      const institution = page.locator('[data-screen-body] button[class*="PlaidLink_card"]:visible');
      if ((await institution.count()) && !(await institution.and(page.locator('[data-picked]')).count())) {
        await institution.first().click({ timeout: 800 }).catch(() => {});
        continue;
      }
      const submit = page.getByRole('button', { name: 'Submit', exact: true });
      if (await submit.count()) {
        await submit.last().click({ timeout: 1500 }).catch(() => {});
        continue;
      }
      const byText = page.locator('[data-screen-body] button:enabled:visible', { hasText: ALLOW });
      const all = (await byText.count()) ? byText : page.locator('[data-screen-body] [role="dialog"]').getByRole('button', { name: ALLOW }).and(page.locator(':enabled:visible'));
      let tapped = false;
      for (let i = (await all.count()) - 1; i >= 0 && !tapped; i--) tapped = await all.nth(i).click({ timeout: 700 }).then(() => true, () => false);
      if (tapped) continue;
      // Instinct is answered by text: its reply is drafted in the field, ready to send.
      if (c.app === 'Instinct') {
        const field = page.locator('[data-screen-body] textarea:not([aria-hidden]):visible').first();
        if (await field.inputValue({ timeout: 500 }).catch(() => '')) {
          await field.press('Enter').catch(() => {});
          continue;
        }
      }
      const opener = page.locator('[data-screen-body] [data-opens-sheet]:enabled:visible:not([class*="balanceArtifact"], [data-kind="account"])').last();
      if ((await opener.count()) && !(await page.locator('[data-screen-body] button:visible', { hasText: /^Copy/ }).count())) {
        await opener.click({ timeout: 800 }).catch(() => {});
        continue;
      }
      const link = page.locator('[data-screen-body] [data-open-link]:enabled:visible').filter({ hasNotText: 'Your balance' }).last();
      if (await link.count()) {
        await link.click({ timeout: 1000 }).catch(() => {});
        continue;
      }
      break;
    }
  };
  const decline = async () => {
    const back = page.locator('[data-screen-body] [role="dialog"] button[aria-label="Back"]:visible, [data-screen-body] [role="dialog"] button[aria-label="Close"]:visible').last();
    const all = page.locator('[data-screen-body] button:enabled:visible', { hasText: DENY });
    for (let i = (await all.count()) - 1; i >= 0; i--) if (await all.nth(i).click({ timeout: 700 }).then(() => true, () => false)) return;
    if (await back.count()) await back.click({ timeout: 800 }).catch(() => {});
  };
  /** What could be tapped in the phone right now, by label. */
  const tappable = () =>
    page.evaluate(() => {
      const root = document.querySelector('[data-screen-body]');
      if (!root) return [];
      const labels = [...root.querySelectorAll('button')]
        .filter((b) => !b.disabled && b.offsetParent !== null && b.getClientRects().length)
        .map((b) => (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim())
        .filter((t) => t && t.length <= 60);
      return [...new Set(labels)].slice(-24);
    });

  await page.goto(`${BASE}/?embed=true&theme=light&nav=48&mode=${c.mode}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.locator('aside button', { hasText: new RegExp(`^${c.app}$`) }).first().click();
  await page.waitForTimeout(900);

  const who = `You: ${c.style}\nYour goal: ${c.goal}\nThe app is ${c.app}; you're on your ${c.mode === 'business' ? "business's" : 'own'} account. Tiles beside the phone: ${TILES[c.mode].join(', ')}.`;
  let ended = 'ran out of moves';
  for (let move = 0; move < MAX_MOVES; move++) {
    // What they'd read: the thread's lines, without the bare counters and clock a text field shows.
    const seen = (await body().innerText()).split('\n').map((l) => l.trim()).filter((l) => l && !/^\d{1,3}$/.test(l)).slice(-45).join('\n');
    const can = await tappable();
    const typing = (await page.locator('[data-screen-body] textarea:not([aria-hidden]):visible').count()) > 0;
    const did = moves.length ? `What you've done so far:\n${moves.map((m, i) => `${i + 1}. ${m}`).join('\n')}` : "You haven't done anything yet.";
    const next = await ask(PLAYER, PLAYER_SYSTEM, `${who}\n\n${did}\n\nOn the phone now (latest at the bottom):\n${seen}\n\nYou could tap: ${can.length ? can.map((l) => `"${l}"`).join(', ') : 'nothing'}\n${typing ? 'You can type a message.' : 'There is no message field right now (a sheet is up): tap, approve or decline.'}\n\nWhat does this person do next? JSON only.`, 600, true);
    if (!next || next.do === 'done') {
      ended = next ? `done: ${next.why ?? ''}` : 'the player model gave no answer';
      break;
    }
    if (next.do === 'type' && typeof next.text === 'string') {
      const field = page.locator('[data-screen-body] textarea:not([aria-hidden]):visible').last();
      const ok = await field.fill(next.text.slice(0, 280)).then(() => field.press('Enter')).then(() => true, () => false);
      moves.push(ok ? `typed: ${next.text}` : `tried to type "${next.text}" but there was no field`);
      trace.push(ok ? `PERSON typed (as shown): ${next.text}` : `PERSON couldn't type: no field`);
    } else if (next.do === 'tap' && typeof next.label === 'string') {
      const target = page.locator('[data-screen-body] button:enabled:visible').filter({ hasText: next.label }).last();
      const named = page.locator('[data-screen-body]').getByRole('button', { name: next.label, exact: true }).last();
      const ok = (await target.click({ timeout: 2000 }).then(() => true, () => false)) || (await named.click({ timeout: 1500 }).then(() => true, () => false));
      moves.push(ok ? `tapped: ${next.label}` : `tried to tap "${next.label}" but couldn't`);
      trace.push(`PERSON tapped: ${next.label}${ok ? '' : ' (nothing happened)'}`);
    } else if (next.do === 'approve') {
      trace.push('PERSON goes along with what’s up (taps through it)');
      moves.push('went along with the sheet or approval that was up');
      await approve();
    } else if (next.do === 'decline') {
      trace.push('PERSON declines what’s up with its button');
      moves.push('declined the sheet or approval that was up');
      await decline();
    } else if (next.do === 'tile' && typeof next.label === 'string') {
      const ok = await page.locator('aside button', { hasText: new RegExp(`^${next.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click({ timeout: 2000 }).then(() => true, () => false);
      moves.push(ok ? `tapped the tile: ${next.label}` : `tried the tile "${next.label}" but it isn't there`);
      trace.push(`PERSON tapped the tile: ${next.label}${ok ? '' : ' (no such tile)'}`);
    } else {
      moves.push(`(an unusable move: ${JSON.stringify(next)})`);
    }
    await settle();
  }
  const thread = await body().innerText().catch(() => '');
  // A step's opening line that never reached the thread wasn't said: the trace says so, so it isn't judged.
  const flat = thread.replace(/\s+/g, ' ');
  // The same goes for a message written alongside a call (before its result was in), which the app holds back. A line
  // written twice and shown once was shown the last time: the thread says how many times each line appears.
  const times = (line) => (line ? flat.split(line.replace(/\s+/g, ' ').slice(0, 60)).length - 1 : 0);
  const lineOf = (entry) => {
    const at = entry.indexOf(SAID);
    if (at >= 0) return entry.slice(at + SAID.length);
    const said = entry.match(/^AGENT (?:says|switches account, saying): (.*?)(?:  \{"suggestions".*)?$/);
    return said ? said[1] : null;
  };
  const left = new Map();
  for (const entry of trace) {
    const line = lineOf(entry);
    if (line) left.set(line.slice(0, 60), (left.get(line.slice(0, 60)) ?? 0) + 1);
  }
  for (let i = 0; i < trace.length; i++) {
    const line = lineOf(trace[i]);
    if (line === null) continue;
    const key = line.slice(0, 60);
    const written = left.get(key) ?? 0;
    left.set(key, written - 1);
    // Of the times it was written, the last ones are the ones the thread shows.
    const shown = written <= times(line);
    const at = trace[i].indexOf(SAID);
    if (at >= 0) trace[i] = shown ? `${trace[i].slice(0, at)}, saying: ${line}` : `${trace[i].slice(0, at)} (it wrote an opening line, which wasn't shown)`;
    else if (!shown) trace[i] = `  (the agent wrote a message here that the app held back, so the person never saw it: not to be judged) ${line}`;
  }
  const name = `${String(c.id).padStart(2, '0')}${RUNS > 1 ? `-${run + 1}` : ''}-${c.mode}-${c.app.replace(/\s/g, '-').toLowerCase()}`;
  await body().screenshot({ path: `${dir}${name}.png` }).catch(() => {});
  await context.close();

  const verdict =
    (await ask(
      JUDGE,
      JUDGE_SYSTEM,
      `App: ${c.app} (${c.mode} account). Its voice: ${VOICE[c.app]}.\n\nWhat the person was trying to do: ${c.goal}\nHow they type: ${c.style}\nHow it ended: ${ended}\n\nWhat the person did:\n${moves.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\nThe trace (the agent's lines and calls, with what the app reported):\n${trace.join('\n').slice(0, 60_000)}\n\nThe thread as it ended (what the person sees):\n${thread.slice(-5000)}\n\nJSON only.`,
      6000,
    )) ?? { goal_reached: false, issues: [{ severity: 'low', kind: 'stuck', quote: '', why: 'the judge gave no answer' }], summary: 'not judged' };
  const text = [`#${c.id} ${c.app} · ${c.mode}`, `STYLE: ${c.style}`, `GOAL: ${c.goal}`, `ENDED: ${ended}`, `MODEL CALLS: ${modelCalls}${fallbacks ? ` (${fallbacks} unanswered)` : ''}`, '', '=== MOVES ===', ...moves.map((m, i) => `${i + 1}. ${m}`), '', '=== VERDICT ===', JSON.stringify(verdict, null, 2), '', '=== TRACE ===', ...trace, '', '=== THREAD ===', thread, '', '=== PAGE ERRORS ===', errors.join('\n') || 'none'].join('\n');
  writeFileSync(`${dir}${name}.txt`, text);
  return { id: c.id, name, app: c.app, mode: c.mode, moves: moves.length, modelCalls, fallbacks, errors: errors.length, ended, ...verdict };
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dir = `${ROOT}.tmp-sweep/sim/${option('label', stamp)}/`;
mkdirSync(dir, { recursive: true });
const queue = CONVERSATIONS.filter((c) => !ONLY || ONLY.includes(c.id)).flatMap((c) => Array.from({ length: RUNS }, (_, run) => ({ c, run })));
console.log(`${queue.length} conversations against ${BASE} (player ${PLAYER}, judge ${JUDGE}) → ${dir}`);
const browser = await chromium.launch();
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (next < queue.length) {
      const { c, run } = queue[next++];
      try {
        const r = await converse(browser, c, run, dir);
        results.push(r);
        const high = (r.issues ?? []).filter((i) => i.severity === 'high').length;
        const medium = (r.issues ?? []).filter((i) => i.severity === 'medium').length;
        console.log(`${r.name.padEnd(30)} ${r.goal_reached ? 'reached' : 'NOT reached'} · ${r.moves} moves, ${r.modelCalls} model calls · high ${high}, medium ${medium}, low ${(r.issues ?? []).length - high - medium}${r.fallbacks ? ` · ${r.fallbacks} unanswered` : ''}${r.errors ? ` · ${r.errors} page errors` : ''}`);
      } catch (e) {
        console.log(`#${c.id} ${c.app} failed: ${String(e).split('\n')[0]}`);
        results.push({ id: c.id, app: c.app, mode: c.mode, failed: String(e).split('\n')[0], issues: [] });
      }
    }
  }),
);
await browser.close();
results.sort((a, b) => a.id - b.id);
writeFileSync(`${dir}summary.json`, JSON.stringify(results, null, 2));
const issues = results.flatMap((r) => (r.issues ?? []).map((i) => ({ ...i, in: r.name })));
const count = (f) => issues.filter(f).length;
console.log(`\n${results.filter((r) => r.goal_reached).length}/${results.length} reached their goal · issues: ${count((i) => i.severity === 'high')} high, ${count((i) => i.severity === 'medium')} medium, ${count((i) => i.severity === 'low')} low`);
for (const kind of ['false', 'deaf', 'repeat', 'voice', 'leak', 'stuck', 'promise', 'wrong_step']) if (count((i) => i.kind === kind)) console.log(`  ${kind.padEnd(10)} ${count((i) => i.kind === kind)}`);
for (const i of issues.filter((x) => x.severity === 'high')) console.log(`\n  HIGH [${i.kind}] ${i.in}\n    "${i.quote}"\n    ${i.why}`);
console.log(`\nFull transcripts: ${dir}`);
process.exit(count((i) => i.severity === 'high') ? 1 : 0);
