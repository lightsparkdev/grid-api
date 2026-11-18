import { useCallback, useEffect, useRef, useState } from 'react';
import { ACTIONS, actionLabel, type ActionId } from '@/data/actions';
import type { AgentEvent } from '@/data/agentEvents';
import { BANK_COUNTRIES, BANK_REACH } from '@/data/bankCountries';
import { activeMode, cleanName, setActiveMode, type Mode } from '@/data/mode';
import type { ToolCall, ToolResult, Turn } from '@/lib/llm/tools';
import type { AgentAsk, Beat, Chip, Message, Params, PayTo, Said, StoredMessage, Verification } from '../conversation';
import { FLOWS, needsSetup, planFor, topicFor, type FlowContext } from '../flows';
import { nextSteps } from '../nextSteps';
import { accountNow, flowOf, newToolMemory, runTool, topicOf } from '../tools/run';
import { describe, describeAsk } from './describe';
import { called, fromApp, settled, typed, windowOf, type Log } from './log';

/*
 * The conversation every app shares, hosted above the apps so switching between them only changes the face.
 *
 * The model runs it. Anything the person says (typed, a tile, a suggestion) goes to the model with the whole record
 * and whatever is open on screen; the model writes every line and picks every step. A step is one of the app's own
 * flows (flows.ts, tools/run.ts), played here for its screens and Grid calls only: its hand-written lines are kept
 * back and handed to the model as plain notes, and it stops and reports the moment it needs the person (an approval,
 * options, an amount, a name). A tap settles what's open at once and the model carries on from what happened; typed
 * text never does anything by itself, except when it is exactly what a tap would send ("yes", an option's label).
 *
 * Without the model (off, over its cap, failing), a tile plays its flow with the flow's own lines, as a script.
 */

/** A tile's jump: put this flow's line in the composer. */
export interface FlowEntry {
  nonce: number;
  flow: ActionId;
  variant: number;
  /** What the jump set up on its own (an account, a top-up in USD cents), for the agent to mention. */
  setup?: { connected: boolean; funded: number };
}

/** The model's next step: the tools it calls, or why the app carries on without it. */
export type StepReply = { calls: ToolCall[] } | { fallback: 'fallback' | 'limited' };

type Decision = 'allow' | 'deny' | { swap: PayTo };
/** What settles something open: a decision, an option, an amount, a name; null when it's closed under them. */
type Given = { decision: Decision } | { option: number; onPage?: boolean } | { amount: number } | { name: string } | null;
type NewMessage = StoredMessage extends infer M ? (M extends StoredMessage ? Omit<M, 'id'> : never) : never;
type Line = { key: string; params?: Params };

/** What the app is waiting on the person for. */
type Wait =
  | { kind: 'approval'; title: string; what: string }
  | { kind: 'choice'; options: string[] }
  | { kind: 'amount'; options: number[]; all?: number }
  | { kind: 'name'; suggestion: string };

/** One of the app's flows being played: by the model (`voiced`), or as a script with its own lines. */
interface Run {
  flow: ActionId | null;
  cancelled: boolean;
  /** The model writes what's said: the flow's own lines are kept back as notes, and each wait is reported. */
  voiced: boolean;
  /** The model's line for as the work starts: said when the flow first shows it's working, dropped if it needs the
   *  person before that (the model then writes the line that leads into what it's waiting on). */
  opening?: string;
  opened: boolean;
  /** Since its last report: the lines it kept back, what it showed, what the person just did, what's worth offering. */
  lines: Line[];
  shown: StoredMessage[];
  did?: string;
  offer?: string;
  /** What was open when it started, which it took the place of. */
  replaced?: string;
  /** A look-up made while something else is open: it shows what it finds and leaves that open. */
  side?: boolean;
  /** What the tool fills in as it goes: its status and facts. */
  result: ToolResult;
  /** The call waiting on its next report; with none, the report goes to the conversation (a tap set it off). */
  taker?: (report: ToolResult) => void;
  /** Whether what it finishes with is worth following with a few next steps. */
  leads: boolean;
  /** The first message it showed, for what a script said. */
  from: number;
}

/** Something open: held back until the line that leads into it is out, then on screen until it's settled. */
interface Open {
  run: Run;
  wait: Wait;
  shown: boolean;
  reveal: () => void;
  settle?: (given: Given) => void;
}

/** A call under way: its result is what happened by the time it next needs the person, or ends. */
interface Started {
  start: () => Promise<ToolResult>;
  /** Its line as it started went out. */
  spoke: () => boolean;
}

interface Heard {
  /** What the thread shows, when it isn't what was meant (a typed "2" for the second suggestion). */
  shown?: string;
  /** The tile or suggestion this came from: the model is told which flow it starts, and without the model it plays. */
  flow?: ActionId;
  variant?: number;
  setup?: FlowEntry['setup'];
}

const MAX_MESSAGES = 200;
/** The most model calls one turn takes before the agent stops and waits. */
const MAX_STEPS = 6;

/** Under the greeting: things to try, so it's clear you can just type. A tap sends one as the person's own message, so each is in their words. */
const STARTERS: Record<Mode, Chip[]> = {
  personal: [
    { label: 'Set up a balance', flow: 'connect', detail: 'Spend from it, within limits you set' },
    { label: 'Add a card', flow: 'card', detail: 'Save it once, I’ll pay when you ask' },
    { label: 'Send money to friends (US and abroad)', detail: `To banks in ${BANK_REACH} countries` },
    { label: 'What can you do?', detail: 'A quick tour of what I can handle' },
  ],
  business: [
    { label: 'Set up my company', flow: 'company', detail: 'A business account with US bank details' },
    { label: 'Send an invoice', flow: 'invoice', detail: 'Paid by bank transfer, matched for you' },
    { label: 'Run payroll', flow: 'payroll', detail: 'Pay the team in one approved run' },
    { label: 'What can you do?', detail: 'A quick tour of what I can handle for the business' },
  ],
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

/** Asks that set something up for later (a balance, a saved card, a linked bank): a no to one stops the shortcuts. */
const SETUP_ASKS = new Set<string>(['connect', 'vault', 'bank']);
/** Tools that only look something up on the way to something else: nothing to follow them with. */
const LOOKUPS = new Set<string>(['search', 'quote_payment']);
/** Tools that look something up and wait on nothing: asked for while something is open, that stays open. */
const BESIDE = new Set<string>(['quote_payment', 'show_account']);

/* Typed replies that are exactly what a tap would send. There's nothing in them to read, so they settle what's open
   at once, as the tap would; anything else typed goes to the model. */
const BARE_YES = /^\s*(y|yes|yeah|yep|yup|k|kk|ok|okay|sure|approve|approved)\s*[.!]*\s*$/i;
const BARE_NO = /^\s*(n|no|nope|nah)\s*[.!]*\s*$/i;
const BARE_AMOUNT = /^\s*\$?\s*(\d[\d,]*(?:\.\d{1,2})?)\s*$/;

/** Which option a reply is exactly: its label, or its number; -1 for neither. */
function exactOption(text: string, labels: string[]) {
  const t = text.trim().toLowerCase();
  const n = Number.parseInt(t, 10);
  if (String(n) === t && n >= 1 && n <= labels.length) return n - 1;
  return labels.findIndex((l) => l.toLowerCase() === t);
}

/**
 * What a typed reply settles when it's exactly a tap. A flow playing as a script has no model to read anything else,
 * so there a typed name is the name.
 */
function tapFor(text: string, wait: Wait, voiced: boolean): Given {
  switch (wait.kind) {
    case 'approval':
      return BARE_YES.test(text) ? { decision: 'allow' } : BARE_NO.test(text) ? { decision: 'deny' } : null;
    case 'choice': {
      const i = exactOption(text, wait.options);
      return i >= 0 ? { option: i } : null;
    }
    case 'amount': {
      const m = BARE_AMOUNT.exec(text);
      const amount = m ? Number(m[1].replace(/,/g, '')) : 0;
      return amount > 0 ? { amount } : null;
    }
    case 'name': {
      if (exactOption(text, [wait.suggestion]) === 0) return { name: wait.suggestion };
      const name = voiced ? '' : cleanName(text);
      return name ? { name } : null;
    }
    default: {
      const exhaustive: never = wait;
      return exhaustive;
    }
  }
}

/** What's open, as the model reads it: under "On screen", and as a result's `waiting`. */
function waitText(wait: Wait): string {
  switch (wait.kind) {
    case 'approval':
      return `an approval to tap, ${wait.what}`;
    case 'choice':
      return `options to pick from: ${wait.options.map((o, i) => `${i + 1}. ${o}`).join('  ')}`;
    case 'amount':
      return `an amount in USD to give${wait.options.length ? ` (taps for ${wait.options.map(usd).join(', ')}, or they type any amount)` : ' (they type it)'}${wait.all ? `; all of it is ${usd(wait.all)}` : ''}`;
    case 'name':
      return `a name to give: they type one, or tap the suggestion “${wait.suggestion}”`;
    default: {
      const exhaustive: never = wait;
      return exhaustive;
    }
  }
}

/** What was open, in a few words, when something else takes its place. */
const waitLabel = (wait: Wait) => (wait.kind === 'approval' ? `the approval “${wait.title}”` : wait.kind === 'choice' ? 'the options' : wait.kind === 'amount' ? 'the amount question' : 'the name question');

/** A suggested reply as a chip: a country gets its flag. */
function chipOf(label: string): Chip {
  const country = BANK_COUNTRIES.find((c) => c.name.toLowerCase() === label.trim().toLowerCase());
  return country ? { label: country.name, flag: country.code } : { label };
}

const positive = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined);
const decided = (given: Given): Decision | null => (given && 'decision' in given ? given.decision : null);

export function useAgentBrain({
  entry,
  context,
  onEvent,
  onActiveFlow,
  onRun,
  onCompleted,
  onDeclined,
  reply,
  render,
  plain,
  readsFor = 0,
  typesFor = 0,
  mode = 'personal',
}: {
  entry?: FlowEntry;
  context: () => Omit<FlowContext, 'variant'>;
  onEvent: (event: AgentEvent) => void;
  /** The flow in the composer or playing, or null at rest. */
  onActiveFlow?: (flow: ActionId | null) => void;
  /** A flow starts playing: its Grid calls group under it from here. */
  onRun?: (flow: ActionId) => void;
  onCompleted?: (flow: ActionId) => void;
  /** They said no to setting something up (a balance, a card, a bank). */
  onDeclined?: () => void;
  /** The model's next step, for the conversation so far and what's open on screen (behind /api/agent). */
  reply: (turns: Turn[], open?: string) => Promise<StepReply>;
  /** These messages as the app on screen draws them, for telling the model what the person is looking at. */
  render: (messages: StoredMessage[]) => Message[];
  /** A flow's own line as a plain fact, for the model to say in its own words. */
  plain: (key: string, params?: Params) => string;
  /** How long the agent takes to read each of your messages before it reacts, types or carries on (ms). */
  readsFor?: number;
  /** The least time its typing bubble shows before a reply, however fast the model answers (ms). */
  typesFor?: number;
  /** The account this conversation is on: its greeting and the things it offers first. */
  mode?: Mode;
}) {
  const [messages, setMessages] = useState<StoredMessage[]>(() => [
    { id: 0, kind: 'stamp', text: 'Today' },
    { id: 1, kind: 'them', said: { key: mode === 'business' ? 'greeting.business' : 'greeting' }, typing: false },
    { id: 2, kind: 'chips', chips: STARTERS[mode], picked: null },
  ]);
  // The clock is the visitor's, so it lands after hydration.
  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages((all) => all.map((m) => (m.id === 0 && m.kind === 'stamp' ? { ...m, text: `Today ${time}` } : m)));
  }, []);
  const [composer, setComposer] = useState('');
  const [running, setRunning] = useState<ActionId | null>(null);
  const [busy, setBusyState] = useState(false);
  const busyRef = useRef(false);
  const setBusy = useCallback((b: boolean) => {
    busyRef.current = b;
    setBusyState(b);
  }, []);
  const nextId = useRef(3);
  /** The flow playing or waiting on the person, if any: one at a time. */
  const runRef = useRef<Run | null>(null);
  /** What it's waiting on. */
  const openRef = useRef<Open | null>(null);
  const authRef = useRef<(() => void) | null>(null);
  /** The business verification page, while an approval waits on it: true once submitted, false if it's closed. */
  const verifyRef = useRef<((submitted: boolean) => void) | null>(null);
  const [verifying, setVerifying] = useState<Verification | null>(null);
  const [awaitingAmount, setAwaitingAmount] = useState(false);
  const [awaitingName, setAwaitingName] = useState(false);
  /** The person's own words settled what's open (typed, or the model read them): the thread already has them. */
  const inWords = useRef(false);
  /** The record of the conversation, as the model reads it. */
  const log = useRef<Log>([]);
  /** Something is in the record the model hasn't answered yet. */
  const owed = useRef(false);
  /** Bumped by anything that overtakes a turn in flight (a tap, a tile): its answer is dropped when it lands. */
  const turnSeq = useRef(0);
  /** Turns take place one after another. */
  const turns = useRef<Promise<void>>(Promise.resolve());
  const alive = useRef(true);
  /** The typing bubble the model's next line lands in. */
  const typing = useRef<number | null>(null);
  /** Lines a flow kept back for the model that it hasn't said yet: without it, the flow says them itself. */
  const unsaid = useRef<Line[]>([]);
  /** Why the model last couldn't answer, for what a script says to something typed. */
  const without = useRef<'fallback' | 'limited'>('fallback');
  /** What the person last asked for, and whether they've answered something since (Dots quotes the request then). */
  const request = useRef<{ text: string; answered: boolean }>({ text: '', answered: false });
  /** The flow the panel's calls are grouped under since the person last spoke. */
  const grouped = useRef<ActionId | null>(null);
  const memory = useRef(newToolMemory());
  const messagesRef = useRef<StoredMessage[]>([]);
  /** Suggested replies under the agent's last answer: a tap sends one as if typed. */
  const suggested = useRef<{ id: number; chips: Chip[] } | null>({ id: 2, chips: STARTERS[mode] });

  const cb = useRef({ context, onEvent, onActiveFlow, onRun, onCompleted, onDeclined, reply, render, plain, readsFor, typesFor });
  cb.current = { context, onEvent, onActiveFlow, onRun, onCompleted, onDeclined, reply, render, plain, readsFor, typesFor };
  messagesRef.current = messages;

  /** Runs once the agent has read what you just sent. */
  const afterReading = (f: () => void) => {
    if (cb.current.readsFor > 0) setTimeout(f, cb.current.readsFor);
    else f();
  };

  const push = useCallback((m: NewMessage) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { ...m, id } as StoredMessage].slice(-MAX_MESSAGES));
    return id;
  }, []);
  const patch = useCallback((id: number, f: (m: StoredMessage) => StoredMessage) => {
    setMessages((list) => list.map((m) => (m.id === id ? f(m) : m)));
  }, []);
  /** Suggestions go stale once the person says anything else. */
  const dropSuggestions = useCallback(
    (picked?: number) => {
      const s = suggested.current;
      if (!s) return;
      suggested.current = null;
      patch(s.id, (m) => (m.kind === 'chips' ? (picked === undefined ? { ...m, expired: true } : { ...m, picked }) : m));
    },
    [patch],
  );

  /** The agent's status leaves once it has something to say or show. */
  const clearWork = useCallback(() => {
    setMessages((list) => (list.some((m) => m.kind === 'work') ? list.filter((m) => m.kind !== 'work') : list));
  }, []);
  /** The model is working out what to say. */
  const startTyping = useCallback(() => {
    if (typing.current === null) typing.current = push({ kind: 'them', said: { text: '' }, typing: true });
  }, [push]);
  const stopTyping = useCallback(() => {
    const id = typing.current;
    if (id === null) return;
    typing.current = null;
    setMessages((list) => list.filter((m) => m.id !== id));
  }, []);
  /** Something for the thread. The app showing it means the model isn't mid-thought: its typing bubble goes. */
  const show = useCallback(
    (m: NewMessage) => {
      stopTyping();
      clearWork();
      return push(m);
    },
    [stopTyping, clearWork, push],
  );
  /** A line the model wrote, in the typing bubble if one is up. */
  const say = useCallback(
    async (text: string) => {
      const said: Said = { text };
      const replyTo = request.current.answered ? request.current.text : undefined;
      request.current.answered = false;
      const id = typing.current;
      if (id !== null) {
        typing.current = null;
        clearWork();
        patch(id, (m) => (m.kind === 'them' ? { ...m, said, typing: false, replyTo } : m));
        await sleep(700);
        return;
      }
      const fresh = show({ kind: 'them', said, typing: true, replyTo });
      await sleep(700);
      patch(fresh, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
      await sleep(500);
    },
    [show, patch, clearWork],
  );

  /** Builds what comes next against this conversation's own account. The stores a flow reads (saved recipients, the
   *  linked bank) follow the account on screen, and this conversation may have been switched away from mid-run. */
  const own = useCallback(
    <T,>(build: () => T): T => {
      const shown = activeMode();
      setActiveMode(mode);
      try {
        return build();
      } finally {
        setActiveMode(shown);
      }
    },
    [mode],
  );

  /** An approval as the app on screen draws it, before it's shown. */
  const askOf = (key: string, params?: Params): AgentAsk | null => {
    const [m] = cb.current.render([{ id: -1, kind: 'ask', key, params, state: 'open' }]);
    return m?.kind === 'ask' ? m.ask : null;
  };

  /* ── The model's side: a turn, a step at a time ───────────────────── */

  /** Something the model hasn't answered is in the record: it takes a turn, after any turn already under way. */
  const takeTurn = (opts: { tile?: Heard; read?: boolean } = {}) => {
    owed.current = true;
    turns.current = turns.current.then(() => turn(opts)).catch(() => undefined);
  };

  /**
   * A flow's report on what happened since its last one, and what it now waits on or how it ended. A call waiting on
   * it takes it as its result; otherwise a tap set it off, so it goes in the record and the model takes a turn.
   */
  const report = (run: Run, extra: ToolResult) => {
    const c = cb.current;
    const notes = run.lines.map((l) => c.plain(l.key, l.params)).filter(Boolean);
    const shown = describe(c.render(run.shown));
    const out: ToolResult = {
      ...(run.did && { they: run.did }),
      ...(run.replaced && { replaced: `${run.replaced} closed when you called this: this took its place` }),
      ...run.result,
      ...(notes.length && { notes }),
      ...(shown.length && { shown }),
      ...(run.offer && { could_offer: run.offer }),
      ...extra,
      account: accountNow(c.context().account()),
    };
    unsaid.current = [...unsaid.current, ...run.lines];
    run.lines = [];
    run.shown = [];
    run.did = undefined;
    run.offer = undefined;
    run.replaced = undefined;
    const taker = run.taker;
    run.taker = undefined;
    if (taker) return taker(out);
    fromApp(log.current, out);
    // Nothing new to tell them: what's waiting goes straight on screen.
    if (out.waiting && !notes.length) return reveal();
    takeTurn();
  };

  /** What the app was holding back goes on screen, now the line that leads into it is out. */
  const reveal = () => {
    const open = openRef.current;
    if (open && !open.shown) open.reveal();
  };

  /**
   * Something only the person can do. Played for the model, it's reported first and held back until the model's line
   * leading into it is out; then (or straight away, in a script) `put` shows it and it's open until settled.
   */
  const hold = async (run: Run, wait: Wait, put: () => void): Promise<Open | null> => {
    // A look-up beside something open never opens anything of its own.
    if (run.side) return null;
    const open: Open = { run, wait, shown: false, reveal: () => undefined };
    openRef.current = open;
    run.opening = undefined;
    if (run.voiced) {
      await new Promise<void>((resolve) => {
        open.reveal = resolve;
        report(run, { waiting: waitText(wait) });
      });
      if (run.cancelled) return null;
    }
    open.shown = true;
    put();
    setBusy(false);
    return open;
  };
  const given = (open: Open) => new Promise<Given>((resolve) => (open.settle = resolve));
  const close = (open: Open) => {
    open.settle = undefined;
    if (openRef.current === open) openRef.current = null;
  };

  const play = useCallback(
    async (beats: Beat[], run: Run): Promise<boolean> => {
      /** Something the app shows, noted for the model when it's the one talking. */
      const put = (m: NewMessage) => {
        const id = show(m);
        if (run.voiced) run.shown.push({ ...m, id } as StoredMessage);
        return id;
      };
      for (let i = 0; i < beats.length; i++) {
        const b = beats[i];
        if (run.cancelled) return false;
        // The flow is about to show it's working: the model's line for that goes out first.
        if (run.opening && ('work' in b || 'products' in b || 'subagent' in b || 'card' in b || 'meta' in b)) {
          const line = run.opening;
          run.opening = undefined;
          run.opened = true;
          await say(line);
          if (run.cancelled) return false;
        }
        if ('work' in b) {
          stopTyping();
          setMessages((list) => {
            const rest = list.filter((m) => m.kind !== 'work');
            return [...rest, { id: nextId.current++, kind: 'work', key: b.work, params: b.params } as StoredMessage].slice(-MAX_MESSAGES);
          });
          await sleep(b.ms);
        } else if ('products' in b) {
          put({ kind: 'products', key: b.products, params: b.params });
          await sleep(1200);
        } else if ('subagent' in b) {
          const id = show({ kind: 'subagent', key: b.subagent, params: b.params, done: false });
          await sleep(b.ms);
          if (run.cancelled) return false;
          patch(id, (m) => (m.kind === 'subagent' ? { ...m, done: true } : m));
          if (run.voiced) run.shown.push({ id, kind: 'subagent', key: b.subagent, params: b.params, done: true });
          await sleep(500);
        } else if ('react' in b) {
          // A reaction is the script's own touch; the model speaks for itself.
          if (run.voiced) continue;
          setMessages((list) => {
            const last = [...list].reverse().find((m) => m.kind === 'me');
            return last ? list.map((m) => (m === last ? { ...m, react: b.react } : m)) : list;
          });
          await sleep(400);
        } else if ('meta' in b) {
          put({ kind: 'meta', key: b.meta, params: b.params });
          await sleep(500);
        } else if ('divider' in b) {
          show({ kind: 'divider', text: b.divider });
        } else if ('say' in b) {
          // The model writes what's said: the flow's line is kept back as a note for it.
          if (run.voiced && !b.sender) {
            run.lines.push({ key: b.say, params: b.params });
            continue;
          }
          // Lines that carry this one on join it in one bubble.
          const parts = [{ key: b.say, params: b.params }];
          for (let next = beats[i + 1]; next && 'say' in next && next.join; next = beats[i + 1]) {
            parts.push({ key: next.say, params: next.params });
            i += 1;
          }
          const said = parts.length > 1 ? { parts } : parts[0];
          const replyTo = request.current.answered ? request.current.text : undefined;
          request.current.answered = false;
          const id = put({ kind: 'them', said, sender: b.sender, typing: true, replyTo });
          await sleep(700);
          if (run.cancelled) return false;
          patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
          await sleep(900);
        } else if ('card' in b) {
          put({ kind: 'card', key: b.card, params: b.params });
          await sleep(1000);
        } else if ('emit' in b) {
          cb.current.onEvent(b.emit);
        } else if ('pause' in b) {
          await sleep(b.pause);
        } else if ('when' in b) {
          if (!(await play(own(b.when), run))) return false;
        } else if ('ask' in b) {
          const ask = askOf(b.ask, b.params);
          const title = ask?.title ?? b.ask;
          let id = -1;
          const open = await hold(run, { kind: 'approval', title, what: ask ? describeAsk(ask) : `“${title}”` }, () => {
            id = show({ kind: 'ask', key: b.ask, params: b.params, state: 'open' });
          });
          if (!open) return false;
          let answer = await given(open);
          // Approved, it opens the verification page first; closed without submitting, the approval waits again.
          while (decided(answer) === 'allow' && b.verify && !run.cancelled) {
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'pressing' } : m));
            setVerifying(b.verify);
            const submitted = await new Promise<boolean>((r) => (verifyRef.current = r));
            verifyRef.current = null;
            setVerifying(null);
            if (submitted) break;
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'open' } : m));
            answer = await given(open);
          }
          close(open);
          inWords.current = false;
          const decision = decided(answer);
          if (!decision || run.cancelled) return false;
          setBusy(true);
          // Paying another way: this checkout goes, and the flow comes back with one for the new way.
          if (typeof decision === 'object') {
            setMessages((list) => list.filter((m) => m.id !== id));
            const swap = decision.swap;
            run.did = `switched “${title}” to pay ${swap === 'card' ? 'with their card' : swap === 'topup' ? 'from the balance after adding to it' : 'from the balance'}`;
            if (b.swap && !(await play(own(() => b.swap!(swap)), run))) return false;
            continue;
          }
          if (decision === 'deny') {
            // A real no (a tile tapped over the sheet or a reset isn't one) stops the shortcuts setting things up.
            if (SETUP_ASKS.has(b.ask)) cb.current.onDeclined?.();
            run.did = `declined “${title}”`;
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'denied' } : m));
            await sleep(500);
            await play(b.deny, run);
            // A no ends the flow: nothing after it plays.
            return false;
          }
          run.did = `approved “${title}”`;
          patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'pressing' } : m));
          await sleep(160);
          if (b.faceId) {
            patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'authing' } : m));
            await Promise.race([new Promise<void>((r) => (authRef.current = r)), sleep(4500)]);
            authRef.current = null;
            if (run.cancelled) return false;
          }
          patch(id, (m) => (m.kind === 'ask' ? { ...m, state: 'done' } : m));
          await sleep(600);
          if (!(await play(b.allow, run))) return false;
        } else if ('chips' in b) {
          let id = -1;
          const labels = b.chips.map((c) => c.label);
          const open = await hold(run, { kind: 'choice', options: labels }, () => {
            id = show({ kind: 'chips', chips: b.chips, picked: null });
          });
          if (!open) return false;
          const answer = await given(open);
          close(open);
          if (!answer || !('option' in answer) || run.cancelled) return false;
          const picked = answer.option;
          setBusy(true);
          patch(id, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
          if (b.reply && !inWords.current && !answer.onPage) {
            push({ kind: 'me', text: labels[picked] });
            request.current.answered = true;
          }
          inWords.current = false;
          run.did = `picked “${labels[picked]}”`;
          await sleep(600);
          if (!(await play(own(() => [...(answer.onPage && b.onPage ? b.onPage(picked) : []), ...b.then(picked)]), run))) return false;
        } else if ('amount' in b) {
          const offered = b.options ?? [];
          // A script offers Other, and asks for one in its own words; with the model, they just type it.
          const labels = [...offered.map(usd), ...(run.voiced || !offered.length ? [] : ['Other'])];
          let chipsId: number | null = null;
          const open = await hold(run, { kind: 'amount', options: offered, all: b.all ? b.all / 100 : undefined }, () => {
            setAwaitingAmount(true);
            chipsId = labels.length ? show({ kind: 'chips', chips: labels.map((label) => ({ label })), picked: null }) : null;
          });
          if (!open) return false;
          let amount = 0;
          while (!amount && !run.cancelled) {
            const answer = await given(open);
            if (!answer) break;
            if ('amount' in answer) amount = answer.amount;
            if (!('option' in answer)) continue;
            const picked = answer.option;
            if (chipsId !== null) patch(chipsId, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
            if (!inWords.current) push({ kind: 'me', text: labels[picked] ?? '' });
            if (picked < offered.length) amount = offered[picked];
            else void play([{ pause: 500 }, { say: 'amount.other' }], run).then(() => setBusy(false));
          }
          close(open);
          setAwaitingAmount(false);
          if (chipsId !== null) patch(chipsId, (m) => (m.kind === 'chips' && m.picked === null ? { ...m, expired: true } : m));
          if (!amount || run.cancelled) return false;
          inWords.current = false;
          request.current.answered = true;
          setBusy(true);
          run.did = `gave the amount ${usd(amount)}`;
          await sleep(500);
          if (!(await play(own(() => b.then(amount)), run))) return false;
        } else if ('name' in b) {
          const labels = run.voiced ? [b.suggestion] : [b.suggestion, 'Type my own'];
          let chipsId = -1;
          const open = await hold(run, { kind: 'name', suggestion: b.suggestion }, () => {
            setAwaitingName(true);
            chipsId = show({ kind: 'chips', chips: labels.map((label) => ({ label })), picked: null });
          });
          if (!open) return false;
          let name = '';
          while (!name && !run.cancelled) {
            const answer = await given(open);
            if (!answer) break;
            if ('name' in answer) {
              name = answer.name;
              // Typed, the thread already has it; the model read it out of what they said.
              continue;
            }
            if (!('option' in answer)) continue;
            const picked = answer.option;
            patch(chipsId, (m) => (m.kind === 'chips' ? { ...m, picked } : m));
            if (!inWords.current) push({ kind: 'me', text: labels[picked] ?? '' });
            if (picked === 0) name = b.suggestion;
            else void play([{ pause: 500 }, { say: b.other }], run).then(() => setBusy(false));
          }
          close(open);
          setAwaitingName(false);
          patch(chipsId, (m) => (m.kind === 'chips' && m.picked === null ? { ...m, expired: true } : m));
          if (!name || run.cancelled) return false;
          inWords.current = false;
          request.current.answered = true;
          setBusy(true);
          run.did = `gave the name “${name}”`;
          await sleep(500);
          if (!(await play(own(() => b.named(name)), run))) return false;
        }
      }
      return !run.cancelled;
    },
    // The helpers it calls read only refs, so the one made on first render is as good as any.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [push, patch, show, own, setBusy, stopTyping, say],
  );

  /** Whatever is playing or open gives way: open asks and chips expire. Says what was open, if anything was. */
  const dismiss = useCallback((): string | undefined => {
    const run = runRef.current;
    const open = openRef.current;
    const was = open?.shown ? waitLabel(open.wait) : undefined;
    if (!run) return was;
    run.cancelled = true;
    runRef.current = null;
    openRef.current = null;
    open?.reveal();
    open?.settle?.(null);
    authRef.current?.();
    verifyRef.current?.(false);
    authRef.current = verifyRef.current = null;
    inWords.current = false;
    setVerifying(null);
    setAwaitingAmount(false);
    setAwaitingName(false);
    setMessages((list) =>
      list
        .filter((m) => m.kind !== 'work')
        .map((m) => {
          if (m.kind === 'ask' && (m.state === 'open' || m.state === 'pressing' || m.state === 'authing')) return { ...m, state: 'expired' };
          if (m.kind === 'chips' && m.picked === null) return { ...m, expired: true };
          // A script's line caught mid-typing lands; the model's own typing bubble is its turn's to clear.
          if (m.kind === 'them' && m.typing && !('text' in m.said && !m.said.text)) return { ...m, typing: false };
          return m;
        }),
    );
    setRunning(null);
    return was;
  }, []);

  /** Somewhere to go once a script finishes: a few flows that follow, unless something else has begun. */
  const offerNext = useCallback(
    async (flow: ActionId) => {
      const ctx = cb.current.context();
      const chips = nextSteps(flow, ctx.mode ?? 'personal', ctx.account());
      if (!chips.length) return;
      await sleep(700);
      if (runRef.current || busyRef.current) return;
      dropSuggestions();
      push({ kind: 'them', said: { key: 'next.ask' }, typing: false });
      await sleep(350);
      if (runRef.current || busyRef.current) return;
      suggested.current = { id: push({ kind: 'chips', chips, picked: null }), chips };
    },
    [push, dropSuggestions],
  );

  /** A flow starts playing. It reports as it goes when the model is talking; a script just plays through. */
  const launch = useCallback(
    (run: Run, beats: Beat[]) => {
      runRef.current = run;
      setRunning(run.flow);
      setBusy(true);
      void play(beats, run).then((finished) => {
        if (run.cancelled) return;
        if (runRef.current === run) runRef.current = null;
        clearWork();
        setRunning(null);
        if (finished && run.flow) cb.current.onCompleted?.(run.flow);
        if (run.voiced) {
          const next = finished && run.flow && run.leads ? nextSteps(run.flow, mode, cb.current.context().account()).map((c) => c.label) : [];
          return report(run, finished ? { finished: true, ...(next.length && { could_suggest: next }) } : { finished: false, note: 'it stopped here: they said no' });
        }
        // A script said its own lines: the record gets them, so the model knows where things stand when it's back.
        const said = cb.current
          .render(messagesRef.current.filter((m) => m.id >= run.from))
          .flatMap((m) => (m.kind === 'them' && m.text ? [m.text] : []))
          .join(' ')
          .slice(0, 900);
        fromApp(log.current, { note: 'the app played this flow with its own lines, without you', ...(run.flow && { flow: run.flow }), said, finished, account: accountNow(cb.current.context().account()) });
        setBusy(false);
        if (finished && run.flow) void offerNext(run.flow);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [play, clearWork, offerNext, mode, setBusy],
  );

  const newRun = (flow: ActionId | null, voiced: boolean): Run => ({ flow, cancelled: false, voiced, opened: false, lines: [], shown: [], result: {}, leads: false, from: nextId.current });

  /** The panel groups a flow's Grid calls under it, and Duet labels the run, the first time it comes up since they spoke. */
  const group = (flow: ActionId | null, topic: () => string) => {
    if (!flow || flow === grouped.current) return;
    grouped.current = flow;
    cb.current.onRun?.(flow);
    const text = topic();
    if (!text) return;
    const eyebrow: StoredMessage = { id: nextId.current++, kind: 'eyebrow', flow, text };
    const at = typing.current;
    setMessages((list) => (at !== null ? list.flatMap((m) => (m.id === at ? [eyebrow, m] : [m])) : [...list, eyebrow]));
  };

  /** A tile's flow as a script, with its own lines: what plays when the model can't. */
  const playScript = (heard: Heard) => {
    const flow = heard.flow!;
    const ctx: FlowContext = { ...cb.current.context(), variant: heard.variant ?? 0 };
    // Still missing what it needs (a card-only account and a flow that holds money): it asks, as the chat would.
    const beats = own(() => (needsSetup(flow, ctx.account()) ? planFor(flow, ctx) : FLOWS[flow](ctx)));
    // A shortcut that set things up on its own says so, right after it reacts.
    const setup = heard.setup;
    if (setup && (setup.connected || setup.funded > 0)) {
      const note: Beat = { say: 'setup.auto', params: { connected: setup.connected ? 1 : 0, funded: setup.funded } };
      beats.splice(beats[0] && 'react' in beats[0] ? 1 : 0, 0, note);
    }
    group(flow, () => own(() => topicFor(flow, ctx)));
    launch(newRun(flow, false), beats);
  };

  /**
   * The model can't answer (off, over its cap, failing). What a flow kept back for it, the flow says itself and
   * carries on as a script; a tile plays its flow; anything else gets the app's stock line.
   */
  const carryOnWithout = async (why: 'fallback' | 'limited', tile?: Heard) => {
    without.current = why;
    const lines = unsaid.current;
    unsaid.current = [];
    const run = runRef.current;
    if (run) run.voiced = false;
    if (lines.length) {
      const id = show({ kind: 'them', said: lines.length > 1 ? { parts: lines } : lines[0], typing: true });
      await sleep(700);
      patch(id, (m) => (m.kind === 'them' ? { ...m, typing: false } : m));
      await sleep(400);
      fromApp(log.current, { note: 'you were unavailable, so the app said this itself', said: lines.map((l) => cb.current.plain(l.key, l.params)) });
    } else if (tile?.flow) {
      return playScript(tile);
    } else {
      const key = why === 'fallback' && mode === 'business' ? 'fallback.business' : why;
      show({ kind: 'them', said: { key }, typing: false });
      fromApp(log.current, { note: 'you were unavailable, so the app said this itself', said: cb.current.plain(key) });
    }
    reveal();
    if (!runRef.current || openRef.current?.shown) setBusy(false);
  };

  /** What's open, for the model: on screen and waiting, or held back until its line is out. */
  const openText = () => {
    const open = openRef.current;
    if (!open) return undefined;
    return open.shown ? `open and waiting on them: ${waitText(open.wait)}` : `about to appear once your line is out (they can’t see it yet, so there’s nothing to answer): ${waitText(open.wait)}`;
  };

  /** The model answers what's open from what the person typed: it settles as a tap would, and the flow reports on. */
  const answerOpen = (call: ToolCall): { error: ToolResult } | Started => {
    const open = openRef.current;
    if (!open?.shown || !open.settle) return { error: { error: 'nothing_open', fix: 'nothing is waiting on screen: do what they asked with another tool, or reply' } };
    const i = call.input;
    const option = typeof i.option === 'number' && Number.isInteger(i.option) ? i.option - 1 : -1;
    let answer: Given = null;
    switch (open.wait.kind) {
      case 'approval':
        answer = i.decision === 'approve' ? { decision: 'allow' } : i.decision === 'decline' ? { decision: 'deny' } : null;
        break;
      case 'choice':
        answer = option >= 0 && option < open.wait.options.length ? { option } : null;
        break;
      case 'amount': {
        const amount = positive(i.amount_usd) ?? open.wait.options[option];
        answer = amount ? { amount: Math.round(amount * 100) / 100 } : null;
        break;
      }
      case 'name': {
        const name = (typeof i.name === 'string' && cleanName(i.name)) || (option === 0 ? open.wait.suggestion : '');
        answer = name ? { name } : null;
        break;
      }
      default: {
        const exhaustive: never = open.wait;
        return exhaustive;
      }
    }
    if (!answer) return { error: { error: 'not_an_answer', open: waitText(open.wait), fix: 'give what it asks for, or reply instead' } };
    const run = open.run;
    return {
      spoke: () => false,
      start: () => {
        // Closed meanwhile (a tap got there first): nothing left to answer.
        if (openRef.current !== open || !open.settle) return Promise.resolve({ status: 'already_settled', note: 'they tapped it themselves just now' });
        inWords.current = true;
        // A script doesn't report: it carries on with its own lines.
        if (!run.voiced) {
          open.settle(answer);
          return Promise.resolve({ status: 'answered', note: 'the app carries on with its own lines' });
        }
        const next = new Promise<ToolResult>((resolve) => (run.taker = resolve));
        open.settle(answer);
        return next;
      },
    };
  };

  /**
   * One of the app's steps, checked and started for the model. An error before anything shows; otherwise whatever was
   * open gives way, and the step plays until it needs the person or ends, which is its result.
   */
  const prepare = (call: ToolCall, next?: ToolCall): { error: ToolResult } | Started => {
    const run = newRun(flowOf(call), true);
    run.leads = !LOOKUPS.has(call.name);
    const ctx: FlowContext = { ...cb.current.context(), variant: 0, offer: (what) => (run.offer = what) };
    const out = own(() => runTool({ ctx, memory: memory.current, next }, call));
    if ('error' in out) return out;
    run.result = out.result;
    run.opening = call.input.say;
    // A look-up while something is open (what's the fee? what's my balance?) shows what it finds and leaves it open.
    if (BESIDE.has(call.name) && openRef.current?.shown) {
      run.side = true;
      return {
        spoke: () => run.opened,
        start: (): Promise<ToolResult> => {
          const found = new Promise<ToolResult>((resolve) => (run.taker = resolve));
          void play(out.beats, run).then((finished) => report(run, { finished, note: 'what was open is still open' }));
          return found;
        },
      };
    }
    const closed = dismiss();
    if (closed) run.replaced = closed;
    group(run.flow, () => own(() => topicOf(call, ctx)));
    return {
      spoke: () => run.opened,
      start: (): Promise<ToolResult> => {
        if (!out.beats.length) return Promise.resolve({ ...out.result, finished: true, account: accountNow(cb.current.context().account()) });
        const first = new Promise<ToolResult>((resolve) => (run.taker = resolve));
        launch(run, out.beats);
        return first;
      },
    };
  };

  /**
   * The model's turn. Each step it calls tools; they're carried out in order and what happened goes back, until it
   * ends the turn (a reply, or nothing more to say) or the app has to wait on the person. An answer that lands after
   * something overtook the turn (a tap, a tile) is dropped: the record has moved on, and the next turn reads it.
   */
  const turn = async ({ tile, read }: { tile?: Heard; read?: boolean }) => {
    if (!alive.current || !owed.current) return;
    const seq = turnSeq.current;
    const overtaken = () => seq !== turnSeq.current || !alive.current;
    const c = cb.current;
    setBusy(true);
    if (read && c.readsFor > 0) await sleep(c.readsFor);
    if (overtaken()) return;
    startTyping();
    let chips: Chip[] = [];
    let ended = false;
    for (let step = 0; step < MAX_STEPS && !ended; step++) {
      owed.current = false;
      const [answer] = await Promise.all([c.reply(windowOf(log.current), openText()), step === 0 ? sleep(c.typesFor) : undefined]);
      if (overtaken()) return;
      if ('fallback' in answer) {
        stopTyping();
        return carryOnWithout(answer.fallback, tile);
      }
      const { calls } = answer;
      called(log.current, calls);
      /** Why the calls after one that stopped the step didn't run. */
      let stopped = '';
      for (let i = 0; i < calls.length; i++) {
        const call = calls[i];
        if (stopped) {
          settled(log.current, call.id, { status: 'not_run', note: stopped });
          continue;
        }
        if (overtaken()) break;
        if (call.name === 'wait' || call.name === 'reply' || call.name === 'offer_choices') {
          if (call.name !== 'wait' && call.input.say) await say(call.input.say);
          const options = call.name === 'offer_choices' ? call.input.options : call.input.suggestions;
          chips = Array.isArray(options) ? options.filter((o): o is string => typeof o === 'string').map(chipOf) : [];
          settled(log.current, call.id, { status: 'shown' });
          ended = true;
          stopped = 'the turn ended before this';
          continue;
        }
        const started = call.name === 'answer' ? answerOpen(call) : prepare(call, calls[i + 1]);
        if ('error' in started) {
          settled(log.current, call.id, started.error, true);
          stopped = 'an earlier call in this step failed';
          continue;
        }
        const result = await started.start();
        settled(log.current, call.id, result);
        if (result.waiting) {
          stopped = 'an earlier call in this step is waiting on them: call this again once they’ve acted, if it’s still wanted';
          // Its line as it started leads into this, and there's nothing new to tell them: it goes straight on screen.
          if (started.spoke() && !result.notes) ended = true;
        } else if (result.finished === false) {
          stopped = 'an earlier call in this step stopped: they said no';
        }
      }
      if (overtaken()) return;
      if (!ended) startTyping();
    }
    stopTyping();
    clearWork();
    unsaid.current = [];
    reveal();
    if (chips.length && !openRef.current) {
      await sleep(350);
      if (overtaken()) return;
      const id = push({ kind: 'chips', chips, picked: null });
      suggested.current = { id, chips };
    }
    if (!overtaken()) setBusy(false);
  };

  /* ── The person's side ────────────────────────────────────────────── */

  /** What the app tells the model about a tile or a suggestion that starts a flow. */
  const tileNote = (heard: Heard): Record<string, unknown> => {
    const flow = heard.flow!;
    const setup = heard.setup;
    const did = setup && [setup.connected && 'set up their account', setup.funded > 0 && `added ${usd(setup.funded / 100)} to it`].filter(Boolean).join(' and ');
    return {
      they: `tapped “${actionLabel(flow)}”, which starts a flow of the app’s`,
      start_with: `start_flow ${JSON.stringify({ flow, ...(heard.variant ? { variant: heard.variant } : {}) })}`,
      ...(did && { skipped_ahead: `so the flow can play, the app ${did} on its own just now: tell them so in a few words as you start` }),
    };
  };

  /** Something the person said: into the thread and the record, and the model takes a turn. */
  const hear = (meant: string, heard: Heard = {}) => {
    const text = heard.shown ?? meant;
    push({ kind: 'me', text, ...(meant !== text ? { meant } : {}) });
    request.current = { text, answered: false };
    grouped.current = null;
    typed(log.current, meant);
    if (heard.flow) fromApp(log.current, tileNote(heard));
    takeTurn({ tile: heard.flow ? heard : undefined, read: true });
  };

  /** A tap (or its exact words) settles what's open, ahead of any turn in flight. */
  const settle = (answer: NonNullable<Given>): boolean => {
    const open = openRef.current;
    if (!open?.shown || !open.settle) return false;
    turnSeq.current += 1;
    stopTyping();
    open.settle(answer);
    return true;
  };

  // A tile's jump, applied once: whatever was playing gives way, and the tile's line goes out as the visitor's message.
  const lastNonce = useRef(0);
  useEffect(() => {
    if (!entry || entry.nonce === lastNonce.current) return;
    lastNonce.current = entry.nonce;
    const def = ACTIONS.find((a) => a.id === entry.flow)!;
    turnSeq.current += 1;
    stopTyping();
    unsaid.current = [];
    const closed = dismiss();
    if (closed) fromApp(log.current, { note: `they had ${closed} open, which closed: they tapped a tile instead` });
    dropSuggestions();
    hear(def.prompts[entry.variant % def.prompts.length], { flow: entry.flow, variant: entry.variant, setup: entry.setup });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  /** A control in the thread (the balance card's Add money) asks as the visitor would, with its tile's line. */
  const prompt = useCallback(
    (flow: ActionId) => {
      if (runRef.current || busyRef.current) return;
      dropSuggestions();
      hear(ACTIONS.find((a) => a.id === flow)!.prompts[0], { flow });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dropSuggestions],
  );

  const activeFlow = running;
  useEffect(() => {
    cb.current.onActiveFlow?.(activeFlow);
  }, [activeFlow]);

  const send = useCallback(() => {
    const text = composer.trim();
    if (!text) return;
    const open = openRef.current?.shown && openRef.current.settle ? openRef.current : null;
    if (open) {
      // Exactly what a tap would send: it settles what's open, as the tap would.
      const tap = tapFor(text, open.wait, open.run.voiced);
      if (tap) {
        setComposer('');
        push({ kind: 'me', text });
        inWords.current = true;
        afterReading(() => {
          if (openRef.current === open) settle(tap);
          else inWords.current = false;
        });
        return;
      }
      // A script has no model to read anything else: it says so, and what's open stays open.
      if (!open.run.voiced) {
        setComposer('');
        push({ kind: 'me', text });
        show({ kind: 'them', said: { key: without.current === 'limited' ? 'limited' : mode === 'business' ? 'fallback.business' : 'fallback' }, typing: false });
        return;
      }
    }
    if (busyRef.current) return;
    setComposer('');
    // A typed number picks a suggestion (Instinct lists them as a numbered text).
    const s = suggested.current;
    const n = Number.parseInt(text, 10);
    const i = !open && s && String(n) === text && n >= 1 && n <= s.chips.length ? n - 1 : -1;
    dropSuggestions(i >= 0 ? i : undefined);
    if (i >= 0) hear(s!.chips[i].label, { shown: text, flow: s!.chips[i].flow });
    else hear(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composer, push, show, dropSuggestions, mode]);

  /** The visitor's tap on the open ask's primary button. */
  const allow = useCallback(() => void (openRef.current?.wait.kind === 'approval' && settle({ decision: 'allow' })), []);
  const deny = useCallback(() => void (openRef.current?.wait.kind === 'approval' && settle({ decision: 'deny' })), []);
  /** The checkout's Pay with switched to another way to pay. */
  const swap = useCallback((to: PayTo) => void (openRef.current?.wait.kind === 'approval' && settle({ decision: { swap: to } })), []);
  /** A choice tapped: a chip, or (`onPage`) an option on a page the app opened. */
  const pick = useCallback(
    (i: number, onPage?: boolean) => {
      const open = openRef.current;
      if (open?.shown && open.wait.kind !== 'approval') return void settle({ option: i, onPage });
      const s = suggested.current;
      if (!s || runRef.current || busyRef.current || !s.chips[i]) return;
      setComposer((c) => (s.chips.some((chip) => chip.label === c) ? '' : c));
      dropSuggestions(i);
      hear(s.chips[i].label, { flow: s.chips[i].flow });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dropSuggestions],
  );
  /** Face ID finished its scan and checkmark. */
  const authed = useCallback(() => authRef.current?.(), []);
  /** The verification page submitted, or closed. */
  const verified = useCallback(() => verifyRef.current?.(true), []);
  const verifyClosed = useCallback(() => verifyRef.current?.(false), []);
  /** The account as it stands, for the balance page. */
  const account = useCallback(() => cb.current.context().account(), []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      dismiss();
    };
  }, [dismiss]);

  const authing = messages.some((m) => m.kind === 'ask' && m.state === 'authing');
  const asking = messages.some((m) => m.kind === 'ask' && (m.state === 'open' || m.state === 'pressing' || m.state === 'authing'));
  const answering = messages.some((m) => (m.kind === 'ask' && m.state === 'open') || (m.kind === 'chips' && m.picked === null && !m.expired));

  return {
    messages,
    composer,
    setComposer,
    send,
    canSend: composer.trim().length > 0 && (answering || awaitingAmount || awaitingName || !busy),
    /** A flow is waiting on a typed dollar amount ("How much?"). */
    awaitingAmount,
    /** A flow is waiting on a typed name (the company, the owner). */
    awaitingName,
    /** The account this conversation is on. */
    mode,
    busy,
    allow,
    deny,
    swap,
    pick,
    prompt,
    authed,
    /** The business verification page to show, while an approval waits on it. */
    verifying,
    verified,
    verifyClosed,
    authing,
    asking,
    activeFlow,
    account,
  };
}

export type AgentBrain = ReturnType<typeof useAgentBrain>;
